import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Project, ProjectMember, User, ShareLink
from app.schemas import ProjectCreate, ProjectUpdate, ProjectOut, ProjectDetail, ShareCreate, ShareLinkOut
from app.auth import get_current_user
from app.config import get_settings

router = APIRouter(prefix="/projects", tags=["projects"])
settings = get_settings()


@router.get("/", response_model=List[ProjectOut])
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Projects where user is owner or member
    owned = db.query(Project).filter(Project.owner_id == current_user.id).all()
    member_project_ids = [
        m.project_id for m in db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()
    ]
    member_projects = db.query(Project).filter(Project.id.in_(member_project_ids)).all()
    
    all_projects = {p.id: p for p in owned + member_projects}
    result = []
    for p in all_projects.values():
        out = ProjectOut.model_validate(p)
        out.file_count = len(p.files)
        out.member_count = len(p.members) + 1  # +1 for owner
        result.append(out)
    
    return sorted(result, key=lambda x: x.created_at, reverse=True)


@router.post("/", response_model=ProjectOut, status_code=201)
def create_project(
    data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = Project(
        owner_id=current_user.id,
        name=data.name,
        description=data.description,
        color=data.color or "#7c3aed",
        emoji=data.emoji or "📁",
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    
    out = ProjectOut.model_validate(project)
    out.file_count = 0
    out.member_count = 1
    return out


@router.get("/{project_id}", response_model=ProjectDetail)
def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = _get_project_with_access(project_id, current_user, db)
    
    from app.schemas import FileOut, ProjectMemberOut, UserOut
    out = ProjectDetail.model_validate(project)
    out.file_count = len(project.files)
    out.member_count = len(project.members) + 1
    return out


@router.put("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: str,
    data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = _get_project_owner_only(project_id, current_user, db)
    
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    
    out = ProjectOut.model_validate(project)
    out.file_count = len(project.files)
    out.member_count = len(project.members) + 1
    return out


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = _get_project_owner_only(project_id, current_user, db)
    db.delete(project)
    db.commit()


@router.post("/{project_id}/share", response_model=ShareLinkOut)
def create_share_link(
    project_id: str,
    data: ShareCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _get_project_with_access(project_id, current_user, db)
    
    expires_at = None
    if data.expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=data.expires_in_days)
    
    token = str(uuid.uuid4()).replace("-", "")
    link = ShareLink(
        project_id=project_id,
        token=token,
        resource_type=data.resource_type,
        permission=data.permission,
        created_by=current_user.id,
        expires_at=expires_at,
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    
    return ShareLinkOut(
        token=token,
        share_url=f"{settings.frontend_url}/shared/{token}",
        resource_type=link.resource_type,
        permission=link.permission,
        expires_at=expires_at,
        created_at=link.created_at,
    )


@router.get("/{project_id}/share-links", response_model=List[ShareLinkOut])
def list_share_links(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _get_project_with_access(project_id, current_user, db)
    links = db.query(ShareLink).filter(ShareLink.project_id == project_id).all()
    return [
        ShareLinkOut(
            token=l.token,
            share_url=f"{settings.frontend_url}/shared/{l.token}",
            resource_type=l.resource_type,
            permission=l.permission,
            expires_at=l.expires_at,
            created_at=l.created_at,
        ) for l in links
    ]


@router.get("/shared/{token}")
def access_shared(token: str, db: Session = Depends(get_db)):
    link = db.query(ShareLink).filter(ShareLink.token == token).first()
    if not link:
        raise HTTPException(status_code=404, detail="Share link not found")
    if link.expires_at and link.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Share link has expired")
    
    project = db.query(Project).filter(Project.id == link.project_id).first()
    out = ProjectOut.model_validate(project)
    out.file_count = len(project.files)
    out.member_count = len(project.members) + 1
    return {
        "project": out,
        "permission": link.permission,
        "resource_type": link.resource_type,
    }


# ─── Helpers ─────────────────────────────────────────────────────────────────
def _get_project_with_access(project_id: str, user: User, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    is_owner = project.owner_id == user.id
    is_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user.id
    ).first()
    
    if not is_owner and not is_member and not project.is_public:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return project


def _get_project_owner_only(project_id: str, user: User, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Only the project owner can do this")
    return project
