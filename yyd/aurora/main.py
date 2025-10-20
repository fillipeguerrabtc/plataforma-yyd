"""
Aurora IA - Multilingual AI Concierge for Yes, You Deserve!
Powered by OpenAI GPT-4 + Affective Mathematics in ℝ³
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from datetime import datetime
import json
from webhooks import router as webhooks_router

app = FastAPI(
    title="Aurora IA",
    description="Multilingual AI Concierge with Affective Mathematics",
    version="1.0.0"
)

# CORS middleware for communication with Next.js apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include webhooks router
app.include_router(webhooks_router)

# Request/Response Models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    customer_id: Optional[str] = None
    language: str = "en"
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    message: str
    language: str
    affective_state: Optional[Dict[str, float]] = None
    suggested_actions: List[str] = []
    requires_human_handoff: bool = False

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str
    services: Dict[str, bool]

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for monitoring"""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.utcnow().isoformat(),
        services={
            "openai": bool(os.getenv("OPENAI_API_KEY")),
            "database": True,  # TODO: Check actual DB connection
            "embeddings": False,  # TODO: Implement pgvector check
        }
    )

# Main chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process chat message with Aurora IA - NEW RAG + 7-Layer Memory System
    
    Features:
    - 7-layer memory hierarchy (SC/WM/EM/SM/AM/TM/PM)
    - RAG with pgvector semantic search
    - Hybrid scoring (λ₁=0.4 affective + λ₂=0.35 semantic + λ₃=0.25 utility)
    - Progressive autonomy (ChatGPT used LESS as KB grows)
    - Affective state analysis (ℝ³ mathematics)
    - Human handoff detection
    """
    try:
        from affective_mathematics import AffectiveAnalyzer
        from rag import decision_engine
        from memory import MemoryManager
        import uuid
        
        # Generate session ID if not provided
        session_id = request.context.get('session_id', str(uuid.uuid4())) if request.context else str(uuid.uuid4())
        conversation_id = request.context.get('conversation_id', str(uuid.uuid4())) if request.context else str(uuid.uuid4())
        
        # Extract latest user message
        user_message = request.messages[-1].content if request.messages else ""
        
        # Analyze affective state using ℝ³ mathematics
        analyzer = AffectiveAnalyzer()
        customer_state = analyzer.analyze_text(user_message, request.language)
        emotional_dict = customer_state.to_dict()
        
        # Store in memory layers
        memory_manager = MemoryManager()
        memory_manager.store_conversation_snapshot(
            session_id=session_id,
            conversation_id=conversation_id,
            customer_id=request.customer_id,
            messages=[{"role": msg.role, "content": msg.content} for msg in request.messages],
            emotional_state=emotional_dict
        )
        
        # Build conversation context from working memory
        conversation_context = {
            "session_id": session_id,
            "conversation_id": conversation_id,
            "intent": request.context.get('intent') if request.context else None,
            "message_count": len(request.messages)
        }
        
        # Generate response using RAG + autonomous decision engine
        response_data = await decision_engine.generate_response(
            query=user_message,
            emotional_state=emotional_dict,
            conversation_context=conversation_context,
            locale=request.language,
            messages=[{"role": msg.role, "content": msg.content} for msg in request.messages]
        )
        
        # Detect handoff conditions
        requires_handoff = False
        handoff_reason = None
        
        # Rule 1: Very negative emotion (valence < -0.6)
        if emotional_dict.get('valence', 0) < -0.6:
            requires_handoff = True
            handoff_reason = "negative_emotion"
        
        # Rule 2: Low confidence in response
        elif response_data.get('confidence', 1.0) < 0.5:
            requires_handoff = True
            handoff_reason = "low_confidence"
        
        # Rule 3: Explicit request for human
        elif any(keyword in user_message.lower() for keyword in ['speak to human', 'talk to person', 'real person', 'falar com humano', 'pessoa real', 'hablar con humano']):
            requires_handoff = True
            handoff_reason = "explicit_request"
        
        # Suggested actions based on source
        suggested_actions = []
        if response_data['source'] == 'knowledge_base':
            suggested_actions.append("explore_tours")
        elif requires_handoff:
            suggested_actions.append("handoff_to_human")
        else:
            suggested_actions.append("continue_conversation")
        
        return ChatResponse(
            message=response_data['message'],
            language=request.language,
            affective_state=emotional_dict,
            suggested_actions=suggested_actions,
            requires_human_handoff=requires_handoff
        )
    except Exception as e:
        print(f"❌ Chat endpoint error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Affective state endpoint
@app.post("/affective-state")
async def calculate_affective_state(text: str, language: str = "en"):
    """
    Calculate affective state in ℝ³ space (Valence, Arousal, Dominance)
    Based on whitepaper mathematics - FULLY IMPLEMENTED
    """
    from affective_mathematics import AffectiveAnalyzer
    
    analyzer = AffectiveAnalyzer()
    state = analyzer.analyze_text(text, language)
    emotion = analyzer.classify_emotion(state)
    
    return {
        "text": text,
        "language": language,
        "state": state.to_dict(),
        "emotion": emotion,
        "magnitude": state.magnitude(),
    }

# Embeddings endpoint
@app.post("/embeddings")
async def generate_embeddings(texts: List[str]):
    """Generate vector embeddings using OpenAI"""
    try:
        from rag import EmbeddingGenerator
        
        generator = EmbeddingGenerator()
        embeddings = await generator.batch_generate(texts)
        
        return {
            "embeddings": embeddings,
            "model": "text-embedding-3-small",
            "count": len(embeddings)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding error: {str(e)}")

# Semantic search endpoint
@app.post("/search")
async def semantic_search(query: str, locale: str = "en", category: Optional[str] = None, limit: int = 5):
    """Search knowledge base using vector similarity"""
    try:
        from rag import RAGRetriever
        
        retriever = RAGRetriever()
        results = await retriever.search(query, locale=locale, category=category, top_k=limit)
        
        return {
            "query": query,
            "locale": locale,
            "category": category,
            "results": [
                {
                    "id": r.id,
                    "content": r.content,
                    "similarity": r.similarity,
                    "confidence": r.confidence,
                    "category": r.category
                }
                for r in results
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

# API for backoffice integration
class LeadCreate(BaseModel):
    customer_id: Optional[str] = None
    conversation_id: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    channel: str
    channel_id: Optional[str] = None
    interest: Optional[str] = None
    emotional_state: Optional[Dict] = None
    notes: Optional[str] = None

class HandoffCreate(BaseModel):
    conversation_id: str
    lead_id: Optional[str] = None
    reason: str
    emotional_state: Optional[Dict] = None
    confidence: float
    notes: Optional[str] = None

@app.post("/api/aurora/leads")
async def create_lead(lead: LeadCreate):
    """Create a new lead from Aurora conversation"""
    try:
        from memory import DatabaseConnection
        from psycopg2.extras import Json
        
        query = """
            INSERT INTO aurora_leads 
            (id, "customerId", "conversationId", name, email, phone, whatsapp, 
             channel, "channelId", interest, status, "emotionalState", notes, "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'new', %s, %s, NOW(), NOW())
            RETURNING id
        """
        result = DatabaseConnection.execute_query(
            query,
            (lead.customer_id, lead.conversation_id, lead.name, lead.email, lead.phone,
             lead.whatsapp, lead.channel, lead.channel_id, lead.interest,
             Json(lead.emotional_state or {}), lead.notes),
            fetch="one"
        )
        
        return {
            "success": True,
            "lead_id": result['id'] if result else None,
            "message": "Lead created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create lead: {str(e)}")

@app.post("/api/aurora/handoffs")
async def create_handoff(handoff: HandoffCreate):
    """Register a handoff request to human agent"""
    try:
        from memory import DatabaseConnection
        from psycopg2.extras import Json
        
        query = """
            INSERT INTO aurora_handoffs
            (id, "conversationId", "leadId", reason, "emotionalState", confidence, 
             status, notes, "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, 'pending', %s, NOW(), NOW())
            RETURNING id
        """
        result = DatabaseConnection.execute_query(
            query,
            (handoff.conversation_id, handoff.lead_id, handoff.reason,
             Json(handoff.emotional_state or {}), handoff.confidence, handoff.notes),
            fetch="one"
        )
        
        return {
            "success": True,
            "handoff_id": result['id'] if result else None,
            "message": "Handoff request created"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create handoff: {str(e)}")

@app.get("/api/aurora/handoffs/pending")
async def get_pending_handoffs():
    """Get all pending handoff requests for backoffice"""
    try:
        from memory import DatabaseConnection
        
        query = """
            SELECT h.*, 
                   l.name as lead_name, 
                   l.email as lead_email,
                   l.channel as lead_channel
            FROM aurora_handoffs h
            LEFT JOIN aurora_leads l ON h."leadId" = l.id
            WHERE h.status = 'pending'
            ORDER BY h."createdAt" DESC
            LIMIT 50
        """
        results = DatabaseConnection.execute_query(query)
        
        return {
            "handoffs": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch handoffs: {str(e)}")

@app.post("/api/aurora/memory/cleanup")
async def cleanup_memory():
    """Run memory maintenance (cleanup expired entries)"""
    try:
        from memory import MemoryManager
        
        manager = MemoryManager()
        manager.cleanup_expired()
        
        return {
            "success": True,
            "message": "Memory cleanup completed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
