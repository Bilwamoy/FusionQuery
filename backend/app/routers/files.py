import os
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ProjectFile, User, Project
from app.schemas import FileOut
from app.auth import get_current_user
from app.config import get_settings

router = APIRouter(prefix="/files", tags=["files"])
settings = get_settings()

ALLOWED_TYPES = {
    "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain", "image/jpeg", "image/png", "image/gif", "image/webp",
    "audio/mpeg", "audio/wav", "audio/mp4", "video/mp4",
    "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv"
}


@router.post("/upload/{project_id}", response_model=FileOut, status_code=201)
async def upload_file(
    project_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check project access
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or access denied")

    # Validate file size
    max_bytes = settings.max_file_size_mb * 1024 * 1024
    content = await file.read()
    if len(content) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File too large. Max size: {settings.max_file_size_mb}MB")

    # Create project upload dir
    project_dir = os.path.join(settings.upload_dir, project_id)
    os.makedirs(project_dir, exist_ok=True)

    # Save file with unique name
    import uuid
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename or "file")[1]
    stored_name = f"{file_id}{ext}"
    file_path = os.path.join(project_dir, stored_name)
    
    with open(file_path, "wb") as f:
        f.write(content)

    # Save to DB
    db_file = ProjectFile(
        id=file_id,
        project_id=project_id,
        filename=stored_name,
        original_name=file.filename or stored_name,
        file_path=file_path,
        file_type=file.content_type or "application/octet-stream",
        file_size=len(content),
        is_processed=True,  # Mark as processed (mock processing)
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    return FileOut.model_validate(db_file)


@router.get("/{project_id}", response_model=List[FileOut])
def list_files(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    files = db.query(ProjectFile).filter(ProjectFile.project_id == project_id).all()
    return [FileOut.model_validate(f) for f in files]


@router.get("/download/{file_id}")
def download_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_file = db.query(ProjectFile).filter(ProjectFile.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    if not os.path.exists(db_file.file_path):
        raise HTTPException(status_code=404, detail="File not found on storage")
    
    return FileResponse(
        path=db_file.file_path,
        filename=db_file.original_name,
        media_type=db_file.file_type
    )


@router.delete("/{file_id}", status_code=204)
def delete_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_file = db.query(ProjectFile).filter(ProjectFile.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check ownership
    project = db.query(Project).filter(Project.id == db_file.project_id).first()
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if os.path.exists(db_file.file_path):
        os.remove(db_file.file_path)
    
    db.delete(db_file)
    db.commit()
