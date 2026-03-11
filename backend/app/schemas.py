from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr


# ─── Auth ───────────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    provider: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Project ─────────────────────────────────────────────
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#7c3aed"
    emoji: Optional[str] = "📁"


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    emoji: Optional[str] = None
    is_public: Optional[bool] = None


class ProjectMemberOut(BaseModel):
    user: UserOut
    role: str
    joined_at: datetime

    class Config:
        from_attributes = True


class ProjectOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    color: str
    emoji: str
    is_public: bool
    owner_id: str
    created_at: datetime
    updated_at: datetime
    file_count: int = 0
    member_count: int = 0

    class Config:
        from_attributes = True


class ProjectDetail(ProjectOut):
    members: List[ProjectMemberOut] = []
    files: List["FileOut"] = []


# ─── Files ───────────────────────────────────────────────
class FileOut(BaseModel):
    id: str
    project_id: str
    original_name: str
    file_type: str
    file_size: int
    is_processed: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Chat ────────────────────────────────────────────────
class ChatMessageCreate(BaseModel):
    project_id: str
    content: str
    mode: Optional[str] = "explain"


class ChatMessageOut(BaseModel):
    id: str
    project_id: str
    role: str
    content: str
    sources: List[Any] = []
    confidence: Optional[float] = None
    mode: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    user_message: ChatMessageOut
    ai_message: ChatMessageOut


# ─── Whiteboard ──────────────────────────────────────────
class WhiteboardUpdate(BaseModel):
    canvas_data: dict
    thumbnail: Optional[str] = None


class WhiteboardOut(BaseModel):
    id: str
    project_id: str
    canvas_data: dict
    thumbnail: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── Gallery ─────────────────────────────────────────────
class GenerateRequest(BaseModel):
    project_id: str
    output_type: str  # pdf | ppt | notes | quiz
    title: str
    content: Optional[str] = None


class GalleryItemOut(BaseModel):
    id: str
    project_id: str
    output_type: str
    title: str
    file_size: int
    item_metadata: dict = {}
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Share ───────────────────────────────────────────────
class ShareCreate(BaseModel):
    resource_type: str = "project"  # project | whiteboard
    permission: str = "view"  # view | edit
    expires_in_days: Optional[int] = None


class ShareLinkOut(BaseModel):
    token: str
    share_url: str
    resource_type: str
    permission: str
    expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Update forward refs
TokenResponse.model_rebuild()
ProjectDetail.model_rebuild()
