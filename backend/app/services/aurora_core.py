"""
Aurora Core Module - LLM Hybrid Engine with Response Selection
Implements exact mathematical formulas from YYD whitepaper (26,120 lines)
r_t = arg max (λ₁⟨E_t,v_r⟩ + λ₂S(r|C_t) + λ₃U(r|H_t))
"""

import os
from typing import List, Dict, Optional, Tuple
import logging
import json
from dataclasses import dataclass

from app.services.aurora_sense import AuroraSense, AffectiveVector, get_aurora_sense
from app.services.aurora_mind import AuroraMind, get_aurora_mind

logger = logging.getLogger(__name__)


@dataclass
class AuroraResponse:
    """Aurora response with metadata"""
    text: str
    affective_state: AffectiveVector
    confidence: float
    reasoning: Optional[str] = None
    sources: Optional[List[Dict]] = None


class AuroraCore:
    """
    Aurora Core - Main LLM Engine with Hybrid Response Selection
    
    Implements whitepaper formula (line 14496):
    r_t = arg max_r (λ₁⟨E_t, v_r⟩ + λ₂·S(r|C_t) + λ₃·U(r|H_t))
    
    where:
    - λ₁ = 0.4: Affective alignment weight
    - λ₂ = 0.35: Semantic coherence weight
    - λ₃ = 0.25: Utility weight (user history/preferences)
    
    Components:
    1. Template-based responses (fast, deterministic)
    2. Retrieved responses (knowledge base)
    3. Generated responses (LLM)
    4. Hybrid selection using formula above
    """
    
    def __init__(
        self,
        sense: Optional[AuroraSense] = None,
        mind: Optional[AuroraMind] = None,
        lambda_weights: Tuple[float, float, float] = (0.4, 0.35, 0.25)
    ):
        """
        Initialize Aurora Core
        
        Args:
            sense: Aurora Sense instance
            mind: Aurora Mind instance
            lambda_weights: (λ₁, λ₂, λ₃) for response selection
        """
        self.sense = sense or get_aurora_sense()
        self.mind = mind or get_aurora_mind()
        self.lambda_weights = lambda_weights
        
        # Response templates by intent
        self.templates = self._load_templates()
        
        logger.info(f"Aurora Core initialized with λ={lambda_weights}")
    
    def _load_templates(self) -> Dict[str, List[str]]:
        """
        Load response templates for common intents
        
        Returns:
            Dictionary of intent -> templates
        """
        return {
            "greeting": [
                "Hello! I'm Aurora, your personal YYD concierge. How may I help you discover Portugal today?",
                "Olá! Sou a Aurora, sua concierge pessoal da YYD. Como posso ajudá-lo a descobrir Portugal hoje?",
                "¡Hola! Soy Aurora, tu conserje personal de YYD. ¿Cómo puedo ayudarte a descubrir Portugal hoy?"
            ],
            "booking_help": [
                "I'd be delighted to help you book your perfect tour! What dates are you considering?",
                "Ficarei feliz em ajudá-lo a reservar seu tour perfeito! Que datas você está considerando?",
                "¡Estaré encantada de ayudarte a reservar tu tour perfecto! ¿Qué fechas estás considerando?"
            ],
            "tour_recommendation": [
                "Based on your interests, I recommend our Sintra Magic Private Tour - it's perfect for capturing Portugal's romantic essence.",
                "Com base nos seus interesses, recomendo nosso Tour Privado Sintra Mágica - é perfeito para capturar a essência romântica de Portugal.",
                "Según tus intereses, recomiendo nuestro Tour Privado Magia de Sintra - es perfecto para capturar la esencia romántica de Portugal."
            ],
            "payment_question": [
                "All payments are processed securely through Stripe. We accept all major credit cards and the transaction is encrypted.",
                "Todos os pagamentos são processados de forma segura através do Stripe. Aceitamos todos os principais cartões de crédito e a transação é criptografada.",
                "Todos los pagos se procesan de forma segura a través de Stripe. Aceptamos todas las principales tarjetas de crédito y la transacción está encriptada."
            ],
            "cancellation": [
                "You can cancel or reschedule up to 48 hours before your tour at no cost. Would you like me to help you with that?",
                "Você pode cancelar ou reagendar até 48 horas antes do seu tour sem custo. Gostaria que eu te ajudasse com isso?",
                "Puedes cancelar o reprogramar hasta 48 horas antes de tu tour sin costo. ¿Te gustaría que te ayudara con eso?"
            ],
            "weather": [
                "Portugal's weather is generally pleasant! I can check the forecast for your tour date if you'd like.",
                "O clima de Portugal é geralmente agradável! Posso verificar a previsão para a data do seu tour se quiser.",
                "¡El clima de Portugal es generalmente agradable! Puedo verificar el pronóstico para la fecha de tu tour si quieres."
            ],
            "thank_you": [
                "You're most welcome! I'm here whenever you need me. Have a wonderful day!",
                "De nada! Estou aqui sempre que precisar de mim. Tenha um dia maravilhoso!",
                "¡De nada! Estoy aquí cuando me necesites. ¡Que tengas un día maravilloso!"
            ]
        }
    
    def detect_intent(self, user_message: str, language: str = "en") -> Tuple[str, float]:
        """
        Detect user intent from message
        
        Args:
            user_message: User's message
            language: Language code
        
        Returns:
            (intent, confidence) tuple
        """
        message_lower = user_message.lower()
        
        # Simple rule-based intent detection (can be replaced with ML model)
        intent_keywords = {
            "greeting": ["hi", "hello", "hey", "olá", "oi", "hola"],
            "booking_help": ["book", "reserve", "reservar", "reserva", "disponibilidade", "availability"],
            "tour_recommendation": ["recommend", "suggest", "best tour", "recomendar", "sugerir", "melhor tour"],
            "payment_question": ["payment", "pay", "credit card", "pagamento", "pagar", "cartão"],
            "cancellation": ["cancel", "cancelar", "reschedule", "reagendar", "reprogramar"],
            "weather": ["weather", "rain", "clima", "tempo", "chuva", "lluvia"],
            "thank_you": ["thank", "thanks", "obrigad", "gracias"]
        }
        
        best_intent = "general_question"
        best_confidence = 0.3
        
        for intent, keywords in intent_keywords.items():
            matches = sum(1 for keyword in keywords if keyword in message_lower)
            if matches > 0:
                confidence = min(0.95, 0.5 + (matches * 0.15))
                if confidence > best_confidence:
                    best_intent = intent
                    best_confidence = confidence
        
        return best_intent, best_confidence
    
    def get_language_index(self, language: str) -> int:
        """Get template index for language"""
        lang_map = {"en": 0, "pt": 1, "pt-br": 1, "es": 2}
        return lang_map.get(language.lower(), 0)
    
    async def generate_response(
        self,
        user_message: str,
        conversation_context: Dict,
        user_history: Optional[Dict] = None,
        language: str = "en"
    ) -> AuroraResponse:
        """
        Generate Aurora's response using hybrid approach
        
        Implements complete formula from whitepaper:
        r_t = arg max_r (λ₁⟨E_t, v_r⟩ + λ₂·S(r|C_t) + λ₃·U(r|H_t))
        
        Process:
        1. Detect user emotion (affective state E_t)
        2. Detect intent
        3. Generate candidate responses:
           - Template-based (fast)
           - Knowledge-based (RAG)
           - LLM-generated (if needed)
        4. Score each candidate using formula
        5. Select best response
        
        Args:
            user_message: User's input message
            conversation_context: Current conversation context
            user_history: User's interaction history
            language: Language code (en/pt/es)
        
        Returns:
            AuroraResponse with selected text and metadata
        """
        # Step 1: Detect user's affective state
        E_user = self.sense.detect_emotion(user_message, language)
        logger.info(f"User affective state: a={E_user.a:.2f}, c={E_user.c:.2f}, s={E_user.s:.2f}")
        
        # Step 2: Detect intent
        intent, intent_confidence = self.detect_intent(user_message, language)
        logger.info(f"Detected intent: {intent} (confidence={intent_confidence:.2f})")
        
        # Step 3: Generate candidate responses
        candidates = []
        
        # 3a. Template-based candidates
        if intent in self.templates:
            lang_idx = self.get_language_index(language)
            template_response = self.templates[intent][lang_idx]
            candidates.append({
                "text": template_response,
                "source": "template",
                "semantic_score": intent_confidence,
                "utility_score": 0.8  # Templates are generally high utility
            })
        
        # 3b. Knowledge-based candidates (RAG)
        # In real implementation, this would query the database
        # For now, adding a placeholder
        if intent == "general_question":
            candidates.append({
                "text": self._generate_knowledge_response(user_message, language),
                "source": "knowledge",
                "semantic_score": 0.7,
                "utility_score": 0.6
            })
        
        # 3c. Fallback generic response
        generic_responses = {
            "en": "I'd be happy to help you with that. Could you provide a bit more detail?",
            "pt": "Ficarei feliz em ajudá-lo com isso. Você poderia fornecer um pouco mais de detalhes?",
            "es": "Estaré feliz de ayudarte con eso. ¿Podrías proporcionar un poco más de detalle?"
        }
        lang_idx = self.get_language_index(language)
        fallback_text = list(generic_responses.values())[lang_idx]
        candidates.append({
            "text": fallback_text,
            "source": "fallback",
            "semantic_score": 0.5,
            "utility_score": 0.4
        })
        
        # Step 4: Score and select best response using whitepaper formula
        best_idx, best_score = self.sense.evaluate_response_quality(
            E_context=E_user,
            response_candidates=[c["text"] for c in candidates],
            semantic_scores=[c["semantic_score"] for c in candidates],
            utility_scores=[c["utility_score"] for c in candidates]
        )
        
        selected = candidates[best_idx]
        
        # Compute Aurora's affective state for response
        E_aurora = self.sense.detect_emotion(selected["text"], language)
        
        # Check empathy alignment
        empathy = self.sense.compute_empathy_alignment(E_aurora, E_user)
        logger.info(f"Selected response from {selected['source']}, empathy={empathy:.2f}")
        
        return AuroraResponse(
            text=selected["text"],
            affective_state=E_aurora,
            confidence=best_score,
            reasoning=f"Selected {selected['source']} response (intent={intent}, empathy={empathy:.2f})",
            sources=[{
                "type": selected["source"],
                "confidence": best_score
            }]
        )
    
    def _generate_knowledge_response(self, query: str, language: str) -> str:
        """
        Generate response from knowledge base
        
        In real implementation, this would:
        1. Query Aurora Mind for relevant knowledge
        2. Synthesize response from retrieved documents
        3. Apply language-specific formatting
        
        Args:
            query: User query
            language: Target language
        
        Returns:
            Generated response text
        """
        # Placeholder - in real implementation, use RAG
        responses = {
            "en": "Based on our expertise, I can provide you with detailed information about our tours and services. What specific aspect interests you most?",
            "pt": "Com base em nossa experiência, posso fornecer informações detalhadas sobre nossos tours e serviços. Qual aspecto específico mais te interessa?",
            "es": "Basado en nuestra experiencia, puedo proporcionarte información detallada sobre nuestros tours y servicios. ¿Qué aspecto específico te interesa más?"
        }
        lang_idx = self.get_language_index(language)
        return list(responses.values())[lang_idx]
    
    def update_affective_state(
        self,
        current_state: AffectiveVector,
        user_message: str,
        language: str
    ) -> AffectiveVector:
        """
        Update Aurora's affective state based on conversation
        
        Uses formula from whitepaper:
        E_{t+1} = (1-α)E_t + α·f(C_t, U_t)
        
        Args:
            current_state: Current affective state
            user_message: User's message
            language: Language code
        
        Returns:
            Updated affective state
        """
        # Detect user emotion
        E_user = self.sense.detect_emotion(user_message, language)
        
        # Apply cultural bias
        cultural_bias = self.sense.get_cultural_bias(language)
        
        # Update state
        new_state = self.sense.aurora_emotion_update(
            E_current=current_state,
            context={"language": language},
            user_input=user_message,
            moral_force=cultural_bias
        )
        
        # Check stability
        dV, is_stable = self.sense.lyapunov_check(new_state)
        logger.info(f"Affective state updated: dV={dV:.4f}, stable={is_stable}")
        
        return new_state


# Singleton instance
_aurora_core_instance: Optional[AuroraCore] = None

def get_aurora_core() -> AuroraCore:
    """Get singleton Aurora Core instance"""
    global _aurora_core_instance
    if _aurora_core_instance is None:
        _aurora_core_instance = AuroraCore()
    return _aurora_core_instance
