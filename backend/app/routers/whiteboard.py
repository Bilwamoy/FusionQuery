from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import WhiteboardState, User, Project
from app.schemas import WhiteboardUpdate, WhiteboardOut
from app.auth import get_current_user

router = APIRouter(prefix="/whiteboard", tags=["whiteboard"])


@router.get("/{project_id}", response_model=WhiteboardOut)
def get_whiteboard(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = _check_access(project_id, current_user, db)
    
    board = db.query(WhiteboardState).filter(WhiteboardState.project_id == project_id).first()
    if not board:
        # Create empty whiteboard
        board = WhiteboardState(project_id=project_id, canvas_data={})
        db.add(board)
        db.commit()
        db.refresh(board)
    
    return WhiteboardOut.model_validate(board)


@router.put("/{project_id}", response_model=WhiteboardOut)
def save_whiteboard(
    project_id: str,
    data: WhiteboardUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _check_access(project_id, current_user, db)
    
    board = db.query(WhiteboardState).filter(WhiteboardState.project_id == project_id).first()
    if not board:
        board = WhiteboardState(
            project_id=project_id,
            canvas_data=data.canvas_data,
            thumbnail=data.thumbnail,
        )
        db.add(board)
    else:
        board.canvas_data = data.canvas_data
        if data.thumbnail:
            board.thumbnail = data.thumbnail
    
    db.commit()
    db.refresh(board)
    return WhiteboardOut.model_validate(board)


@router.delete("/{project_id}", status_code=204)
def clear_whiteboard(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id, Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=403, detail="Access denied")
    
    board = db.query(WhiteboardState).filter(WhiteboardState.project_id == project_id).first()
    if board:
        board.canvas_data = {}
        board.thumbnail = None
        db.commit()


def _check_access(project_id: str, user: User, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != user.id:
        from app.models import ProjectMember
        member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id
        ).first()
        if not member:
            raise HTTPException(status_code=403, detail="Access denied")
    return project
