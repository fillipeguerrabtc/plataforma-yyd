"""
Aurora IA - Centralized Human Handoff Detection System
=====================================================

Implements 3-rule handoff detection across all channels:
1. Negative emotion (valence < -0.6)
2. Low confidence (< 0.5)
3. Explicit human request (30+ multilingual keywords)
"""

from typing import Dict, Any, Optional, Tuple

# Comprehensive multilingual human request keywords (30+)
HUMAN_REQUEST_KEYWORDS = [
    # English (10 variants)
    'speak to human', 'talk to person', 'real person', 'human agent', 'live agent',
    'speak with someone', 'talk to someone', 'human help', 'real help', 'customer service',
    'representative', 'speak to rep', 'real representative', 'live support',
    
    # Portuguese (10 variants)
    'falar com humano', 'falar com pessoa', 'pessoa real', 'atendente humano', 'agente humano',
    'falar com alguém', 'falar com atendente', 'atendimento humano', 'ajuda humana',
    'representante', 'serviço ao cliente', 'suporte humano', 'atendente real',
    
    # Spanish (10+ variants)
    'hablar con humano', 'hablar con persona', 'persona real', 'agente humano', 'agente en vivo',
    'hablar con alguien', 'hablar con asesor', 'hablar con representante', 'ayuda humana',
    'atención al cliente', 'servicio al cliente', 'asesor', 'representante', 'soporte humano'
]


def detect_handoff(
    user_message: str,
    emotional_state: Dict[str, float],
    response_confidence: float = 1.0
) -> Tuple[bool, Optional[str]]:
    """
    Detect if conversation requires human handoff based on 3 rules
    
    Args:
        user_message: User's message text
        emotional_state: Dict with valence, arousal, dominance
        response_confidence: Confidence score of AI response (0-1)
    
    Returns:
        (requires_handoff: bool, reason: str)
    """
    # Rule 1: Very negative emotion (valence < -0.6)
    if emotional_state.get('valence', 0) < -0.6:
        return (True, "negative_emotion")
    
    # Rule 2: Low confidence in AI response
    if response_confidence < 0.5:
        return (True, "low_confidence")
    
    # Rule 3: Explicit request for human agent (30+ multilingual keywords)
    message_lower = user_message.lower()
    if any(keyword in message_lower for keyword in HUMAN_REQUEST_KEYWORDS):
        return (True, "explicit_request")
    
    return (False, None)


async def create_handoff_record(
    conversation_id: str,
    lead_id: Optional[str],
    reason: str,
    emotional_state: Dict[str, float],
    confidence: float,
    notes: Optional[str] = None
) -> Optional[str]:
    """
    Create handoff record in aurora_handoffs table
    
    Returns:
        handoff_id if successful, None otherwise
    """
    try:
        from memory import DatabaseConnection
        from psycopg2.extras import Json
        import uuid
        
        handoff_id = str(uuid.uuid4())
        
        query = """
            INSERT INTO aurora_handoffs
            (id, "conversationId", "leadId", reason, "emotionalState", confidence, 
             status, notes, "createdAt", "updatedAt")
            VALUES (%s, %s, %s, %s, %s, %s, 'pending', %s, NOW(), NOW())
            RETURNING id
        """
        
        result = DatabaseConnection.execute_query(
            query,
            (handoff_id, conversation_id, lead_id, reason,
             Json(emotional_state), confidence, notes),
            fetch="one"
        )
        
        if result:
            print(f"✅ Handoff record created: {handoff_id} (reason: {reason})")
            return handoff_id
        return None
        
    except Exception as e:
        print(f"❌ Failed to create handoff record: {e}")
        return None
