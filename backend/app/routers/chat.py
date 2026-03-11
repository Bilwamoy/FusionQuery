import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ChatMessage, User, Project, ProjectFile
from app.schemas import ChatMessageCreate, ChatMessageOut, ChatResponse
from app.auth import get_current_user
from app.config import get_settings

router = APIRouter(prefix="/chat", tags=["chat"])
settings = get_settings()

# ─── Mock AI Responses ────────────────────────────────────────────────────────
MOCK_AI_RESPONSES = {
    "explain": [
        "Based on your uploaded documents, here's a clear explanation:\n\n**Key Concepts:**\n- The system processes your query through multiple stages of analysis\n- Context from your documents is retrieved and ranked by relevance\n- The response is grounded in the specific sources you've uploaded\n\nThis approach ensures accuracy and traceability back to your original materials.",
        "Let me break this down step by step based on your knowledge base:\n\n1. **First**, the relevant sections are identified across all uploaded files\n2. **Then**, the most pertinent information is extracted and organized\n3. **Finally**, a coherent explanation is assembled from these grounded sources\n\nAll answers are backed by your uploaded documents.",
    ],
    "research": [
        "**Deep Research Analysis:**\n\nAfter scanning across your uploaded documents, here are the key findings:\n\n**Primary Sources:**\n- Multiple corroborating references found across uploaded files\n- Cross-document analysis reveals consistent patterns\n- Temporal analysis shows evolution of the concept\n\n**Research Gaps Identified:**\n- Further investigation recommended in areas not covered by current uploads\n\n*Confidence: High (92%) — grounded in uploaded knowledge base*",
    ],
    "quiz": [
        "**Quiz Generated from Your Documents:**\n\n**Q1:** What is the primary mechanism described in your uploaded materials?\na) Option A\nb) Option B ✓\nc) Option C\nd) Option D\n\n**Q2:** According to the sources, which approach is recommended?\na) Approach 1\nb) Approach 2 ✓\nc) Approach 3\nd) None of the above\n\n*Score tracking enabled. Good luck!*",
    ],
    "diagram": [
        "**Diagram Generation Request Received**\n\nI've analyzed your knowledge base and prepared a structured diagram. Here's the textual representation:\n\n```\n[Input] → [Processing Layer] → [Output]\n    ↓              ↓\n[Storage]    [Analysis]\n```\n\nOpen the Whiteboard and use **Generate with AI** to render this as an interactive visual diagram with positioned nodes and connecting edges.",
    ],
}

MOCK_SOURCES = [
    ["research_paper.pdf", "notes.docx"],
    ["lecture_slides.pdf"],
    ["textbook.pdf", "summary.txt"],
    [],
]


def get_mock_response(content: str, mode: str, files: list) -> tuple[str, list, float]:
    responses = MOCK_AI_RESPONSES.get(mode, MOCK_AI_RESPONSES["explain"])
    response_text = random.choice(responses)
    sources = random.choice(MOCK_SOURCES) if files else []
    # Use actual file names if available
    if files and sources:
        sources = [f.original_name for f in files[:len(sources)]]
    confidence = round(random.uniform(0.82, 0.97), 2) * 100
    return response_text, sources, confidence


@router.post("/message", response_model=ChatResponse)
def send_message(
    data: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify project access
    project = db.query(Project).filter(Project.id == data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Save user message
    user_msg = ChatMessage(
        project_id=data.project_id,
        user_id=current_user.id,
        role="user",
        content=data.content,
        mode=data.mode or "explain",
    )
    db.add(user_msg)
    db.flush()

    # Generate AI response
    files = db.query(ProjectFile).filter(ProjectFile.project_id == data.project_id).all()
    ai_text, sources, confidence = get_mock_response(data.content, data.mode or "explain", files)

    ai_msg = ChatMessage(
        project_id=data.project_id,
        user_id=None,
        role="assistant",
        content=ai_text,
        sources=sources,
        confidence=confidence,
        mode=data.mode or "explain",
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(user_msg)
    db.refresh(ai_msg)

    return ChatResponse(
        user_message=ChatMessageOut.model_validate(user_msg),
        ai_message=ChatMessageOut.model_validate(ai_msg),
    )


@router.get("/history/{project_id}", response_model=List[ChatMessageOut])
def get_history(
    project_id: str,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.project_id == project_id)
        .order_by(ChatMessage.created_at.asc())
        .limit(limit)
        .all()
    )
    return [ChatMessageOut.model_validate(m) for m in messages]


@router.delete("/history/{project_id}", status_code=204)
def clear_history(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id, Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.query(ChatMessage).filter(ChatMessage.project_id == project_id).delete()
    db.commit()
