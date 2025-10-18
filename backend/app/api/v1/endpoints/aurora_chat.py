"""
Aurora Chat API Endpoint
Complete conversational AI with affective embeddings and RAG
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
import uuid

from app.db.session import get_db
from app.models.aurora import AuroraConversation, AuroraMessage
from app.services.aurora_core import get_aurora_core, AuroraResponse
from app.services.aurora_sense import get_aurora_sense, AffectiveVector
from app.services.aurora_mind import get_aurora_mind
from sqlalchemy import select

router = APIRouter()


class ChatMessageRequest(BaseModel):
    message: str = Field(..., description="User message")
    conversation_id: Optional[str] = Field(None, description="Existing conversation ID")
    customer_id: Optional[str] = Field(None, description="Customer ID")
    language: str = Field("en", description="Language code (en/pt/es)")
    channel: str = Field("web", description="Communication channel (web/whatsapp/facebook)")


class ChatMessageResponse(BaseModel):
    conversation_id: str
    message: str
    affective_state: List[float]
    confidence: float
    timestamp: datetime


class ConversationHistory(BaseModel):
    conversation_id: str
    messages: List[Dict]
    affective_progression: List[List[float]]


@router.post("/chat", response_model=ChatMessageResponse)
async def chat_with_aurora(
    request: ChatMessageRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Chat with Aurora IA
    
    Complete implementation with:
    - Affective state tracking in ℝ³
    - RAG (Retrieval-Augmented Generation)
    - Multi-language support
    - Conversation memory
    """
    aurora_core = get_aurora_core()
    aurora_sense = get_aurora_sense()
    
    # Get or create conversation
    conversation_id = request.conversation_id
    
    if conversation_id:
        # Load existing conversation
        stmt = select(AuroraConversation).where(
            AuroraConversation.id == uuid.UUID(conversation_id)
        )
        result = await db.execute(stmt)
        conversation = result.scalar_one_or_none()
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Get current affective state
        current_state = AffectiveVector(
            conversation.affective_state[0] if conversation.affective_state else 0.5,
            conversation.affective_state[1] if conversation.affective_state else 0.5,
            conversation.affective_state[2] if conversation.affective_state else 0.5
        )
    else:
        # Create new conversation
        initial_state = AffectiveVector(0.5, 0.5, 0.5)  # Neutral state
        conversation = AuroraConversation(
            customer_id=uuid.UUID(request.customer_id) if request.customer_id else None,
            channel=request.channel,
            language=request.language,
            affective_state=initial_state.to_list(),
            context={},
            is_active=True
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
        
        conversation_id = str(conversation.id)
        current_state = initial_state
    
    # Store user message
    user_emotion = aurora_sense.detect_emotion(request.message, request.language)
    user_message = AuroraMessage(
        conversation_id=conversation.id,
        role="user",
        content=request.message,
        affective_embedding=user_emotion.to_list(),
        confidence=0.95,
        meta_data={"channel": request.channel}
    )
    db.add(user_message)
    
    # Generate Aurora's response
    conversation_context = conversation.context or {}
    response: AuroraResponse = await aurora_core.generate_response(
        user_message=request.message,
        conversation_context=conversation_context,
        user_history=None,
        language=request.language
    )
    
    # Update conversation's affective state
    new_state = aurora_core.update_affective_state(
        current_state=current_state,
        user_message=request.message,
        language=request.language
    )
    
    conversation.affective_state = new_state.to_list()
    conversation.updated_at = datetime.utcnow()
    
    # Store Aurora's message
    aurora_message = AuroraMessage(
        conversation_id=conversation.id,
        role="assistant",
        content=response.text,
        affective_embedding=response.affective_state.to_list(),
        confidence=response.confidence,
        meta_data={
            "reasoning": response.reasoning,
            "sources": response.sources
        }
    )
    db.add(aurora_message)
    
    await db.commit()
    
    return ChatMessageResponse(
        conversation_id=conversation_id,
        message=response.text,
        affective_state=response.affective_state.to_list(),
        confidence=response.confidence,
        timestamp=datetime.utcnow()
    )


@router.get("/conversations/{conversation_id}/history", response_model=ConversationHistory)
async def get_conversation_history(
    conversation_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get conversation history with affective progression"""
    # Load conversation
    stmt = select(AuroraConversation).where(
        AuroraConversation.id == uuid.UUID(conversation_id)
    )
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Load messages
    msg_stmt = select(AuroraMessage).where(
        AuroraMessage.conversation_id == conversation.id
    ).order_by(AuroraMessage.created_at)
    msg_result = await db.execute(msg_stmt)
    messages = msg_result.scalars().all()
    
    # Build response
    message_list = []
    affective_progression = []
    
    for msg in messages:
        message_list.append({
            "role": msg.role,
            "content": msg.content,
            "affective_embedding": msg.affective_embedding,
            "confidence": msg.confidence,
            "timestamp": msg.created_at.isoformat()
        })
        if msg.affective_embedding:
            affective_progression.append(msg.affective_embedding)
    
    return ConversationHistory(
        conversation_id=conversation_id,
        messages=message_list,
        affective_progression=affective_progression
    )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db)
):
    """End/delete a conversation"""
    stmt = select(AuroraConversation).where(
        AuroraConversation.id == uuid.UUID(conversation_id)
    )
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation.is_active = False
    await db.commit()
    
    return {"message": "Conversation ended successfully"}
