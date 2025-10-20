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
    Process chat message with Aurora IA
    
    Features:
    - GPT-4 powered responses with personality
    - Multilingual support (PT, EN, ES)
    - Affective state analysis (ℝ³ mathematics)
    - Context-aware responses
    - Human handoff detection
    """
    try:
        from affective_mathematics import AffectiveAnalyzer
        from intelligence import aurora_intelligence
        
        # Extract latest user message
        user_message = request.messages[-1].content if request.messages else ""
        
        # Analyze affective state using ℝ³ mathematics
        analyzer = AffectiveAnalyzer()
        customer_state = analyzer.analyze_text(user_message, request.language)
        
        # Static tour context (fallback until embeddings + OpenAI credits added)
        context = {
            "tours": [
                {"name": "Sintra Highlights", "price": 60, "duration": 4},
                {"name": "Cascais Coastal", "price": 50, "duration": 3},
                {"name": "Sintra & Cascais Full Day", "price": 120, "duration": 8},
            ],
            "customer_name": None,
            "booking_history": []
        }
        
        # Generate intelligent response using GPT-4 (with fallback if no credits)
        response_data = aurora_intelligence.generate_response(
            messages=[{"role": msg.role, "content": msg.content} for msg in request.messages],
            language=request.language,
            customer_state=customer_state,
            context=context
        )
        
        return ChatResponse(
            message=response_data["message"],
            language=request.language,
            affective_state=customer_state.to_dict(),
            suggested_actions=response_data["suggested_actions"],
            requires_human_handoff=response_data["requires_handoff"]
        )
    except Exception as e:
        print(f"❌ Chat endpoint error: {str(e)}")
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
    # TODO: Implement OpenAI embeddings
    return {
        "embeddings": [],
        "model": "text-embedding-3-small"
    }

# Semantic search endpoint
@app.post("/search")
async def semantic_search(query: str, limit: int = 5):
    """Search knowledge base using vector similarity"""
    # TODO: Implement pgvector similarity search
    return {
        "query": query,
        "results": []
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
