import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, Text,
    Float, ForeignKey, JSON, Enum
)
from sqlalchemy.orm import relationship
from app.database import Base
import enum


def generate_uuid():
    return str(uuid.uuid4())


class UserProvider(str, enum.Enum):
    local = "local"
    google = "google"
    github = "github"


class ProjectRole(str, enum.Enum):
    owner = "owner"
    editor = "editor"
    viewer = "viewer"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    provider = Column(Enum(UserProvider), default=UserProvider.local)
    hashed_password = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    projects_owned = relationship("Project", back_populates="owner", cascade="all, delete")
    memberships = relationship("ProjectMember", back_populates="user", cascade="all, delete")
    messages = relationship("ChatMessage", back_populates="user", cascade="all, delete")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=generate_uuid)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String, default="#7c3aed")
    emoji = Column(String, default="📁")
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="projects_owned")
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete")
    files = relationship("ProjectFile", back_populates="project", cascade="all, delete")
    messages = relationship("ChatMessage", back_populates="project", cascade="all, delete")
    whiteboard = relationship("WhiteboardState", back_populates="project", uselist=False, cascade="all, delete")
    gallery_items = relationship("GalleryItem", back_populates="project", cascade="all, delete")
    share_links = relationship("ShareLink", back_populates="project", cascade="all, delete")


class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    role = Column(Enum(ProjectRole), default=ProjectRole.viewer)
    joined_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="memberships")


class ProjectFile(Base):
    __tablename__ = "project_files"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    filename = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, default=0)
    is_processed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="files")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    role = Column(String, nullable=False)  # user | assistant
    content = Column(Text, nullable=False)
    sources = Column(JSON, default=list)
    confidence = Column(Float, nullable=True)
    mode = Column(String, default="explain")
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="messages")
    user = relationship("User", back_populates="messages")


class WhiteboardState(Base):
    __tablename__ = "whiteboard_states"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), unique=True, nullable=False)
    canvas_data = Column(JSON, default=dict)
    thumbnail = Column(Text, nullable=True)  # base64 thumbnail
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="whiteboard")


class GalleryItem(Base):
    __tablename__ = "gallery_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    output_type = Column(String, nullable=False)  # pdf | ppt | notes | quiz
    title = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    file_size = Column(Integer, default=0)
    item_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="gallery_items")



class ShareLink(Base):
    __tablename__ = "share_links"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    resource_type = Column(String, default="project")  # project | whiteboard
    permission = Column(String, default="view")  # view | edit
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="share_links")
