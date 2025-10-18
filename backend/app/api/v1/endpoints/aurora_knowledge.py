"""
Aurora Knowledge Base Management API
Complete knowledge management with semantic search
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

from app.db.session import get_db
from app.services.aurora_mind import get_aurora_mind

router = APIRouter()


class KnowledgeCreateRequest(BaseModel):
    category: str = Field(..., description="Knowledge category")
    content: str = Field(..., description="Knowledge content")
    metadata: Optional[Dict] = Field(None, description="Additional metadata")


class KnowledgeResponse(BaseModel):
    id: str
    category: str
    content: str
    metadata: Optional[Dict]
    created_at: datetime


class KnowledgeSearchRequest(BaseModel):
    query: str = Field(..., description="Search query")
    category: Optional[str] = Field(None, description="Filter by category")
    top_k: int = Field(5, description="Number of results")
    threshold: float = Field(0.5, description="Minimum similarity")


class KnowledgeSearchResult(BaseModel):
    id: str
    category: str
    content: str
    similarity: float
    metadata: Optional[Dict]


@router.post("/knowledge", response_model=KnowledgeResponse)
async def create_knowledge(
    request: KnowledgeCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Add knowledge to Aurora's knowledge base
    
    Creates semantic embedding and stores in pgvector
    """
    aurora_mind = get_aurora_mind()
    
    knowledge_id = await aurora_mind.store_knowledge(
        db=db,
        category=request.category,
        content=request.content,
        metadata=request.metadata
    )
    
    return KnowledgeResponse(
        id=knowledge_id,
        category=request.category,
        content=request.content,
        metadata=request.metadata,
        created_at=datetime.utcnow()
    )


@router.post("/knowledge/search", response_model=List[KnowledgeSearchResult])
async def search_knowledge(
    request: KnowledgeSearchRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Search knowledge base using semantic similarity
    
    Uses pgvector for efficient vector search
    """
    aurora_mind = get_aurora_mind()
    
    results = await aurora_mind.retrieve_relevant(
        db=db,
        query=request.query,
        category=request.category,
        top_k=request.top_k,
        similarity_threshold=request.threshold
    )
    
    return [
        KnowledgeSearchResult(
            id=result["id"],
            category=result["category"],
            content=result["content"],
            similarity=result["similarity"],
            metadata=result.get("metadata")
        )
        for result in results
    ]


@router.get("/knowledge/stats")
async def get_knowledge_stats(db: AsyncSession = Depends(get_db)):
    """Get knowledge base statistics"""
    aurora_mind = get_aurora_mind()
    stats = await aurora_mind.get_knowledge_stats(db)
    return stats


@router.delete("/knowledge/{knowledge_id}")
async def delete_knowledge(
    knowledge_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete knowledge from knowledge base"""
    aurora_mind = get_aurora_mind()
    success = await aurora_mind.delete_knowledge(db, knowledge_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Knowledge not found")
    
    return {"message": "Knowledge deleted successfully"}
