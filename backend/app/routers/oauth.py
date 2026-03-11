import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserProvider
from app.schemas import TokenResponse, UserOut
from app.auth import create_access_token
from app.config import get_settings

router = APIRouter(prefix="/auth", tags=["oauth"])
settings = get_settings()

# ─── Google OAuth ────────────────────────────────────────────────────────────

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


@router.get("/google/login")
def google_login():
    """Redirect the user to Google's consent screen."""
    if not settings.google_client_id:
        raise HTTPException(status_code=501, detail="Google OAuth not configured")

    redirect_uri = f"{settings.backend_url}/api/auth/google/callback"
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    url = f"{GOOGLE_AUTH_URL}?{'&'.join(f'{k}={v}' for k, v in params.items())}"
    return RedirectResponse(url)


@router.get("/google/callback")
def google_callback(code: str, db: Session = Depends(get_db)):
    """Exchange the Google auth code for user info, upsert user, return JWT."""
    redirect_uri = f"{settings.backend_url}/api/auth/google/callback"

    # Exchange code for tokens
    with httpx.Client() as client:
        token_resp = client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        if token_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange code with Google")
        tokens = token_resp.json()

        # Fetch user info
        userinfo_resp = client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        if userinfo_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch Google user info")
        info = userinfo_resp.json()

    # Upsert user
    user = db.query(User).filter(User.email == info["email"]).first()
    if user:
        user.name = info.get("name", user.name)
        user.avatar_url = info.get("picture", user.avatar_url)
        if user.provider == UserProvider.local:
            user.provider = UserProvider.google
    else:
        user = User(
            email=info["email"],
            name=info.get("name", info["email"]),
            avatar_url=info.get("picture"),
            provider=UserProvider.google,
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id})

    # Redirect to frontend with token
    return RedirectResponse(
        f"{settings.frontend_url}/auth/callback?token={token}&user_id={user.id}"
    )


# ─── GitHub OAuth ────────────────────────────────────────────────────────────

GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAILS_URL = "https://api.github.com/user/emails"


@router.get("/github/login")
def github_login():
    """Redirect the user to GitHub's authorization page."""
    if not settings.github_client_id:
        raise HTTPException(status_code=501, detail="GitHub OAuth not configured")

    redirect_uri = f"{settings.backend_url}/api/auth/github/callback"
    params = {
        "client_id": settings.github_client_id,
        "redirect_uri": redirect_uri,
        "scope": "read:user user:email",
    }
    url = f"{GITHUB_AUTH_URL}?{'&'.join(f'{k}={v}' for k, v in params.items())}"
    return RedirectResponse(url)


@router.get("/github/callback")
def github_callback(code: str, db: Session = Depends(get_db)):
    """Exchange the GitHub auth code for user info, upsert user, return JWT."""
    redirect_uri = f"{settings.backend_url}/api/auth/github/callback"

    with httpx.Client() as client:
        # Exchange code for access token
        token_resp = client.post(
            GITHUB_TOKEN_URL,
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": redirect_uri,
            },
            headers={"Accept": "application/json"},
        )
        if token_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange code with GitHub")
        tokens = token_resp.json()
        access_token = tokens.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="GitHub did not return an access token")

        auth_headers = {"Authorization": f"Bearer {access_token}"}

        # Fetch user profile
        user_resp = client.get(GITHUB_USER_URL, headers=auth_headers)
        if user_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch GitHub user info")
        profile = user_resp.json()

        # Get primary email (may be private)
        email = profile.get("email")
        if not email:
            emails_resp = client.get(GITHUB_EMAILS_URL, headers=auth_headers)
            if emails_resp.status_code == 200:
                for e in emails_resp.json():
                    if e.get("primary") and e.get("verified"):
                        email = e["email"]
                        break

        if not email:
            raise HTTPException(status_code=400, detail="Could not retrieve email from GitHub")

    # Upsert user
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.name = profile.get("name") or profile.get("login") or user.name
        user.avatar_url = profile.get("avatar_url", user.avatar_url)
        if user.provider == UserProvider.local:
            user.provider = UserProvider.github
    else:
        user = User(
            email=email,
            name=profile.get("name") or profile.get("login") or email,
            avatar_url=profile.get("avatar_url"),
            provider=UserProvider.github,
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id})

    # Redirect to frontend with token
    return RedirectResponse(
        f"{settings.frontend_url}/auth/callback?token={token}&user_id={user.id}"
    )
