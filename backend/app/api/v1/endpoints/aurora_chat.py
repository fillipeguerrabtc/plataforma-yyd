from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID, uuid4
from datetime import datetime

from app.db.session import get_db
from app.models.aurora import AuroraConversation, AuroraMessage, AuroraKnowledge, AuroraConfig as AuroraConfigModel
from pydantic import BaseModel

router = APIRouter()


class ChatMessage(BaseModel):
    content: str
    language: str = 'en'
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    conversation_id: str
    message: str
    affective_state: List[float] | None = None
    timestamp: datetime


@router.post("/aurora/chat", response_model=ChatResponse)
async def chat_with_aurora(
    message: ChatMessage,
    db: Session = Depends(get_db)
):
    """
    Public endpoint for chatting with Aurora IA.
    Creates or continues a conversation.
    """
    
    # Get or create conversation
    if message.conversation_id:
        conversation = db.query(AuroraConversation).filter(
            AuroraConversation.id == UUID(message.conversation_id)
        ).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        # Create new conversation
        conversation = AuroraConversation(
            id=uuid4(),
            language=message.language,
            affective_state=[0.5, 0.5, 0.5],  # neutral initial state (valence, arousal, dominance)
            is_active=True
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
    
    # Save user message
    user_message = AuroraMessage(
        id=uuid4(),
        conversation_id=conversation.id,
        role='user',
        content=message.content,
        affective_embedding=[0.5, 0.5, 0.5],
        language=message.language
    )
    db.add(user_message)
    
    # Generate Aurora response (simplified - in production would use LLM)
    response_text = await _generate_aurora_response(message.content, message.language, db)
    
    # Save Aurora response
    aurora_message = AuroraMessage(
        id=uuid4(),
        conversation_id=conversation.id,
        role='assistant',
        content=response_text,
        affective_embedding=[0.7, 0.6, 0.8],  # positive, calm, confident
        language=message.language
    )
    db.add(aurora_message)
    
    # Update conversation affective state
    conversation.affective_state = [0.7, 0.6, 0.8]
    conversation.message_count += 2
    
    db.commit()
    
    return ChatResponse(
        conversation_id=str(conversation.id),
        message=response_text,
        affective_state=conversation.affective_state,
        timestamp=aurora_message.created_at
    )


async def _generate_aurora_response(user_message: str, language: str, db: Session) -> str:
    """
    Generate Aurora's response based on user message and language.
    This is a simplified version - in production would use LLM with RAG.
    """
    
    user_message_lower = user_message.lower()
    
    # Greeting responses
    if any(word in user_message_lower for word in ['hello', 'hi', 'hey', 'olá', 'oi', 'hola']):
        responses = {
            'en': "Hello! 👋 I'm Aurora, your personal guide to Yes You Deserve tours in Portugal! How can I help you explore Sintra, Cascais, or our other amazing destinations today?",
            'pt': "Olá! 👋 Sou a Aurora, sua guia pessoal para os passeios Yes You Deserve em Portugal! Como posso ajudá-lo a explorar Sintra, Cascais ou nossos outros destinos incríveis hoje?",
            'es': "¡Hola! 👋 Soy Aurora, tu guía personal para los tours Yes You Deserve en Portugal! ¿Cómo puedo ayudarte a explorar Sintra, Cascais o nuestros otros destinos increíbles hoy?"
        }
        return responses.get(language, responses['en'])
    
    # Tour inquiry
    if any(word in user_message_lower for word in ['tour', 'price', 'cost', 'book', 'passeio', 'preço', 'reservar']):
        responses = {
            'en': """We offer 3 incredible tuk-tuk tours:

🌟 **Personalized Half-Day Tour** (€280, 4 hours)
• Visit all monuments outside
• Cabo da Roca
• Fully personalized itinerary

⭐ **Personalized Full-Day Tour** (€420, 8 hours) - BEST CHOICE!
• Everything in Half-Day plus Azenhas do Mar & Cascais
• Wine tasting available

💎 **All-Inclusive Experience** (€640, 8 hours)
• Transfer service, lunch, monument tickets & wine tasting included
• No hidden costs!

Which one interests you most?""",
            'pt': """Oferecemos 3 passeios incríveis de tuk-tuk:

🌟 **Passeio Meio Dia Personalizado** (€280, 4 horas)
• Visite todos os monumentos por fora
• Cabo da Roca
• Itinerário totalmente personalizado

⭐ **Passeio Dia Inteiro Personalizado** (€420, 8 horas) - MELHOR ESCOLHA!
• Tudo do Meio Dia mais Azenhas do Mar e Cascais
• Degustação de vinhos disponível

💎 **Experiência All-Inclusive** (€640, 8 horas)
• Serviço de transfer, almoço, ingressos e degustação incluídos
• Sem custos ocultos!

Qual te interessa mais?""",
            'es': """Ofrecemos 3 tours increíbles en tuk-tuk:

🌟 **Tour Medio Día Personalizado** (€280, 4 horas)
• Visita todos los monumentos por fuera
• Cabo da Roca
• Itinerario totalmente personalizado

⭐ **Tour Día Completo Personalizado** (€420, 8 horas) - ¡MEJOR OPCIÓN!
• Todo del Medio Día más Azenhas do Mar y Cascais
• Degustación de vinos disponible

💎 **Experiencia All-Inclusive** (€640, 8 horas)
• Servicio de transfer, almuerzo, entradas y degustación incluidos
• ¡Sin costos ocultos!

¿Cuál te interesa más?"""
        }
        return responses.get(language, responses['en'])
    
    # Sintra inquiry
    if any(word in user_message_lower for word in ['sintra', 'pena', 'regaleira', 'moorish', 'castle']):
        responses = {
            'en': "Sintra is magical! ✨ Our tours visit the most iconic spots: Pena Palace, Quinta da Regaleira, Moorish Castle, and Cabo da Roca (Europe's westernmost point). We skip the tourist crowds and show you hidden gems only locals know! Which monument interests you most?",
            'pt': "Sintra é mágica! ✨ Nossos passeios visitam os pontos mais icônicos: Palácio da Pena, Quinta da Regaleira, Castelo dos Mouros e Cabo da Roca (ponto mais ocidental da Europa). Fugimos das multidões turísticas e mostramos tesouros escondidos que apenas os locais conhecem! Qual monumento te interessa mais?",
            'es': "¡Sintra es mágica! ✨ Nuestros tours visitan los lugares más icónicos: Palacio de Pena, Quinta da Regaleira, Castillo de los Moros y Cabo da Roca (punto más occidental de Europa). ¡Evitamos las multitudes turísticas y te mostramos gemas ocultas que solo los locales conocen! ¿Qué monumento te interesa más?"
        }
        return responses.get(language, responses['en'])
    
    # Contact/booking
    if any(word in user_message_lower for word in ['contact', 'whatsapp', 'phone', 'contato', 'telefone']):
        responses = {
            'en': "Great! You can book directly through our website or contact us via WhatsApp for instant answers. We're featured on ABC Good Morning America and have 200+ 5-star reviews on TripAdvisor! 🌟 Would you like to see our tour options?",
            'pt': "Ótimo! Você pode reservar diretamente pelo nosso site ou nos contatar via WhatsApp para respostas instantâneas. Fomos destaque no ABC Good Morning America e temos mais de 200 avaliações 5 estrelas no TripAdvisor! 🌟 Gostaria de ver nossas opções de passeio?",
            'es': "¡Genial! Puedes reservar directamente a través de nuestro sitio web o contactarnos por WhatsApp para respuestas instantáneas. ¡Salimos en ABC Good Morning America y tenemos más de 200 reseñas de 5 estrellas en TripAdvisor! 🌟 ¿Te gustaría ver nuestras opciones de tour?"
        }
        return responses.get(language, responses['en'])
    
    # Default response
    responses = {
        'en': "I'd love to help you explore Portugal! 🇵🇹 Ask me about our tours, prices, Sintra highlights, or how to book. What would you like to know?",
        'pt': "Adoraria ajudá-lo a explorar Portugal! 🇵🇹 Pergunte-me sobre nossos passeios, preços, destaques de Sintra ou como reservar. O que gostaria de saber?",
        'es': "¡Me encantaría ayudarte a explorar Portugal! 🇵🇹 Pregúntame sobre nuestros tours, precios, destacados de Sintra o cómo reservar. ¿Qué te gustaría saber?"
    }
    return responses.get(language, responses['en'])
