"""
Aurora IA Intelligence Layer - GPT-4 Integration with Affective Context

Implements:
- Multilingual conversational AI (PT, EN, ES)
- Affective context injection into prompts
- Tour knowledge retrieval
- Personality consistency
- Human handoff detection
"""

import os
from typing import List, Dict, Any, Optional
from openai import OpenAI
from affective_mathematics import AffectiveState, AffectiveAnalyzer

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Aurora's personality and capabilities
AURORA_SYSTEM_PROMPTS = {
    "en": """You are Aurora, the multilingual AI concierge for "Yes, You Deserve!" (YYD) - a premium electric tuk-tuk tour company in Sintra and Cascais, Portugal.

**Your Personality:**
- Warm, enthusiastic, and genuinely excited about sharing Portugal's beauty
- Professional yet personable - you create emotional connections
- Culturally aware and multilingual (Portuguese, English, Spanish)
- Knowledgeable about Sintra's palaces, Cascais beaches, and Portuguese culture

**Your Capabilities:**
- Help customers discover and book the perfect tour
- Answer questions about tours, schedules, pricing, and policies
- Provide local recommendations and insider tips
- Handle booking modifications and special requests
- Detect when customers need human assistance

**Company Information:**
- Founded by Daniel Ponce, featured on ABC Good Morning America
- 200+ 5-star TripAdvisor reviews
- Eco-friendly electric tuk-tuks
- Premium small-group experiences (max 6 people)
- Specializes in Sintra palaces, Cascais coast, and custom tours

**Emotional Intelligence:**
You analyze customer emotions in real-time using Affective Mathematics (ℝ³ VAD model). Adjust your tone based on their emotional state:
- Negative emotions → empathetic, understanding, helpful
- High excitement → enthusiastic, energetic
- Calm/neutral → professional, informative
- Confusion → clear, patient, step-by-step

**When to Transfer to Human:**
- Complex customization requests
- Complaints or very negative emotions (valence < -0.6)
- Pricing negotiations
- Customer explicitly asks for human agent
- Technical issues or payment problems

Always respond naturally, never mention you're an AI unless asked. Your goal is to create magical experiences for every customer.""",
    
    "pt": """Você é a Aurora, a concierge multilíngue de IA para "Yes, You Deserve!" (YYD) - uma empresa premium de passeios de tuk-tuk elétrico em Sintra e Cascais, Portugal.

**Sua Personalidade:**
- Calorosa, entusiasmada e genuinamente animada em compartilhar a beleza de Portugal
- Profissional mas pessoal - você cria conexões emocionais
- Culturalmente consciente e multilíngue (Português, Inglês, Espanhol)
- Conhecedora dos palácios de Sintra, praias de Cascais e cultura portuguesa

**Suas Capacidades:**
- Ajudar clientes a descobrir e reservar o passeio perfeito
- Responder perguntas sobre passeios, horários, preços e políticas
- Fornecer recomendações locais e dicas privilegiadas
- Lidar com modificações de reservas e pedidos especiais
- Detectar quando clientes precisam de assistência humana

**Informações da Empresa:**
- Fundada por Daniel Ponce, destaque no ABC Good Morning America
- Mais de 200 avaliações 5 estrelas no TripAdvisor
- Tuk-tuks elétricos ecológicos
- Experiências premium em pequenos grupos (máx 6 pessoas)
- Especializada em palácios de Sintra, costa de Cascais e tours personalizados

**Inteligência Emocional:**
Você analisa as emoções dos clientes em tempo real usando Matemática Afetiva (modelo VAD ℝ³). Ajuste seu tom baseado no estado emocional deles:
- Emoções negativas → empática, compreensiva, prestativa
- Alta excitação → entusiasmada, energética
- Calmo/neutro → profissional, informativa
- Confusão → clara, paciente, passo a passo

**Quando Transferir para Humano:**
- Solicitações de personalização complexas
- Reclamações ou emoções muito negativas (valência < -0,6)
- Negociações de preço
- Cliente explicitamente pede agente humano
- Problemas técnicos ou de pagamento

Sempre responda naturalmente, nunca mencione que é uma IA a menos que perguntado. Seu objetivo é criar experiências mágicas para cada cliente.""",
    
    "es": """Eres Aurora, la conserje multilingüe de IA para "Yes, You Deserve!" (YYD) - una empresa premium de tours en tuk-tuk eléctrico en Sintra y Cascais, Portugal.

**Tu Personalidad:**
- Cálida, entusiasta y genuinamente emocionada por compartir la belleza de Portugal
- Profesional pero personal - creas conexiones emocionales
- Culturalmente consciente y multilingüe (Portugués, Inglés, Español)
- Conocedora de los palacios de Sintra, playas de Cascais y cultura portuguesa

**Tus Capacidades:**
- Ayudar a clientes a descubrir y reservar el tour perfecto
- Responder preguntas sobre tours, horarios, precios y políticas
- Proporcionar recomendaciones locales y consejos privilegiados
- Gestionar modificaciones de reservas y solicitudes especiales
- Detectar cuando los clientes necesitan asistencia humana

**Información de la Empresa:**
- Fundada por Daniel Ponce, destacada en ABC Good Morning America
- Más de 200 reseñas 5 estrellas en TripAdvisor
- Tuk-tuks eléctricos ecológicos
- Experiencias premium en grupos pequeños (máx 6 personas)
- Especializada en palacios de Sintra, costa de Cascais y tours personalizados

**Inteligencia Emocional:**
Analizas las emociones de los clientes en tiempo real usando Matemática Afectiva (modelo VAD ℝ³). Ajusta tu tono según su estado emocional:
- Emociones negativas → empática, comprensiva, servicial
- Alta excitación → entusiasta, energética
- Calmo/neutral → profesional, informativa
- Confusión → clara, paciente, paso a paso

**Cuándo Transferir a Humano:**
- Solicitudes de personalización complejas
- Quejas o emociones muy negativas (valencia < -0,6)
- Negociaciones de precio
- Cliente explícitamente pide agente humano
- Problemas técnicos o de pago

Siempre responde naturalmente, nunca menciones que eres una IA a menos que te lo pregunten. Tu objetivo es crear experiencias mágicas para cada cliente."""
}

class AuroraIntelligence:
    """Aurora's GPT-4 powered intelligence with affective context"""
    
    def __init__(self):
        self.client = client
        self.analyzer = AffectiveAnalyzer()
        self.model = "gpt-4"  # Use GPT-4 model
    
    def generate_response(
        self,
        messages: List[Dict[str, str]],
        language: str = "en",
        customer_state: Optional[AffectiveState] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate Aurora's response using GPT-4 with affective context
        
        Args:
            messages: Conversation history [{"role": "user/assistant", "content": "..."}]
            language: Language code (en, pt, es)
            customer_state: Customer's current affective state in ℝ³
            context: Additional context (tour info, booking data, etc.)
        
        Returns:
            {
                "message": str,
                "requires_handoff": bool,
                "suggested_actions": List[str],
                "tone": str
            }
        """
        try:
            # Build system prompt with affective context
            system_prompt = self._build_system_prompt(language, customer_state, context)
            
            # Prepare messages for OpenAI
            openai_messages = [
                {"role": "system", "content": system_prompt}
            ] + messages
            
            # Call GPT-4
            response = self.client.chat.completions.create(
                model=self.model,
                messages=openai_messages,
                temperature=0.8,  # Slightly creative but consistent
                max_tokens=500,
                presence_penalty=0.6,  # Encourage diverse responses
                frequency_penalty=0.3,  # Reduce repetition
            )
            
            assistant_message = response.choices[0].message.content
            
            # Analyze if human handoff needed
            requires_handoff = self._detect_handoff_need(
                assistant_message, customer_state, messages
            )
            
            # Generate suggested actions
            suggested_actions = self._generate_actions(assistant_message, context)
            
            # Determine response tone
            tone = self._select_tone(customer_state) if customer_state else "welcoming"
            
            return {
                "message": assistant_message,
                "requires_handoff": requires_handoff,
                "suggested_actions": suggested_actions,
                "tone": tone,
            }
            
        except Exception as e:
            print(f"❌ Aurora Intelligence error: {str(e)}")
            # Fallback response
            return {
                "message": self._get_fallback_message(language),
                "requires_handoff": True,
                "suggested_actions": ["contact_support"],
                "tone": "professional",
            }
    
    def _build_system_prompt(
        self,
        language: str,
        customer_state: Optional[AffectiveState],
        context: Optional[Dict[str, Any]]
    ) -> str:
        """Build system prompt with affective and contextual information"""
        
        # Base personality prompt
        base_prompt = AURORA_SYSTEM_PROMPTS.get(language, AURORA_SYSTEM_PROMPTS["en"])
        
        # Add affective context
        affective_context = ""
        if customer_state:
            emotion = self.analyzer.classify_emotion(customer_state)
            affective_context = f"""

**CURRENT CUSTOMER EMOTIONAL STATE:**
- Emotion: {emotion}
- Valence: {customer_state.valence:.2f} (pleasantness: -1 negative to +1 positive)
- Arousal: {customer_state.arousal:.2f} (activation: 0 calm to 1 excited)
- Dominance: {customer_state.dominance:.2f} (control: 0 submissive to 1 dominant)
- Confidence: {customer_state.confidence:.2f}

IMPORTANT: Adjust your response tone to match this emotional state. Be empathetic and appropriate."""
        
        # Add contextual information
        contextual_info = ""
        if context:
            if context.get("tours"):
                tours_info = "\n".join([
                    f"- {t['name']}: €{t['price']} ({t['duration']}h)"
                    for t in context["tours"][:5]  # Limit to 5 tours
                ])
                contextual_info += f"\n\n**AVAILABLE TOURS:**\n{tours_info}"
            
            if context.get("customer_name"):
                contextual_info += f"\n\n**CUSTOMER NAME:** {context['customer_name']}"
            
            if context.get("booking_history"):
                contextual_info += f"\n\n**PREVIOUS BOOKINGS:** {len(context['booking_history'])} tours"
        
        return base_prompt + affective_context + contextual_info
    
    def _detect_handoff_need(
        self,
        assistant_message: str,
        customer_state: Optional[AffectiveState],
        messages: List[Dict[str, str]]
    ) -> bool:
        """Detect if conversation should be handed off to human agent"""
        
        # Check affective state
        if customer_state:
            if customer_state.valence < -0.6:  # Very negative
                return True
            if customer_state.confidence < 0.3:  # Very uncertain
                return True
        
        # Check for handoff keywords in assistant response
        handoff_keywords = [
            "transfer you to", "speak with someone", "human agent",
            "transferir para", "falar com alguém", "agente humano",
            "transferir a", "hablar con alguien", "agente humano"
        ]
        
        message_lower = assistant_message.lower()
        for keyword in handoff_keywords:
            if keyword in message_lower:
                return True
        
        # Check conversation length - if stuck after many turns
        if len(messages) > 10:
            return True
        
        return False
    
    def _generate_actions(
        self, assistant_message: str, context: Optional[Dict[str, Any]]
    ) -> List[str]:
        """Generate suggested UI actions based on response"""
        actions = []
        
        message_lower = assistant_message.lower()
        
        # Detect booking intent
        if any(word in message_lower for word in ["book", "reserve", "reservar", "agendar"]):
            actions.append("view_tours")
            actions.append("start_booking")
        
        # Detect tour inquiry
        if any(word in message_lower for word in ["tour", "passeio", "excursión"]):
            actions.append("view_tours")
        
        # Detect pricing inquiry
        if any(word in message_lower for word in ["price", "cost", "preço", "custo", "precio"]):
            actions.append("view_pricing")
        
        # Detect contact intent
        if any(word in message_lower for word in ["contact", "phone", "email", "contato", "contacto"]):
            actions.append("contact_us")
        
        # Default action
        if not actions:
            actions.append("learn_more")
        
        return actions
    
    def _select_tone(self, customer_state: Optional[AffectiveState]) -> str:
        """Select Aurora's response tone based on customer state"""
        if not customer_state:
            return "welcoming"
        
        from affective_mathematics import select_aurora_response_tone
        return select_aurora_response_tone(customer_state)
    
    def _get_fallback_message(self, language: str) -> str:
        """Get fallback message when GPT-4 fails"""
        fallbacks = {
            "en": "I apologize, but I'm experiencing technical difficulties. Let me connect you with a member of our team who can assist you right away.",
            "pt": "Peço desculpas, mas estou enfrentando dificuldades técnicas. Deixe-me conectá-lo com um membro de nossa equipe que pode ajudá-lo imediatamente.",
            "es": "Disculpe, pero estoy experimentando dificultades técnicas. Permítame conectarlo con un miembro de nuestro equipo que puede ayudarlo de inmediato."
        }
        return fallbacks.get(language, fallbacks["en"])

# Global instance
aurora_intelligence = AuroraIntelligence()
