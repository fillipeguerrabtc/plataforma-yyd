"""
Aurora Core - PRODUCTION READY
Motor LLM híbrido com scoring matemático completo
Baseado no whitepaper YYD (26.120 linhas)

Implementa a fórmula principal:
r_t = arg max (λ₁⟨E_t,v_r⟩ + λ₂S(r|C_t) + λ₃U(r|H_t))

onde:
- λ₁ = 0.4 (alinhamento afetivo)
- λ₂ = 0.35 (coerência semântica)
- λ₃ = 0.25 (utilidade histórica)
- E_t = vetor afetivo do usuário
- v_r = vetor afetivo da resposta candidata
- S(r|C_t) = score de coerência semântica dado o contexto
- U(r|H_t) = score de utilidade baseado no histórico
"""

import os
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import openai
from openai import AsyncOpenAI

from .aurora_sense_production import AffectiveVector, get_aurora_sense_production
from .aurora_mind_production import get_aurora_mind_production


@dataclass
class AuroraResponse:
    """Resposta gerada pela Aurora"""
    message: str
    affective_vector: AffectiveVector
    response_type: str
    confidence: float
    sources: List[Dict[str, Any]]
    metadata: Dict[str, Any]


@dataclass
class ResponseCandidate:
    """Candidato de resposta para scoring"""
    text: str
    response_type: str
    affective_vector: AffectiveVector
    semantic_score: float = 0.0
    utility_score: float = 0.0
    final_score: float = 0.0


class AuroraCoreProduction:
    """
    Production-ready Aurora Core
    
    Motor LLM híbrido que:
    - Gera múltiplas respostas candidatas
    - Calcula scores (afetivo, semântico, utilidade)
    - Seleciona melhor resposta usando fórmula matemática
    - Aprende continuamente com feedback
    """
    
    def __init__(
        self,
        model: str = "gpt-4o-mini",
        lambda_affective: float = 0.4,
        lambda_semantic: float = 0.35,
        lambda_utility: float = 0.25,
        temperature: float = 0.7,
        max_tokens: int = 500
    ):
        """
        Args:
            model: OpenAI model name
            lambda_affective: Peso para alinhamento afetivo λ₁
            lambda_semantic: Peso para coerência semântica λ₂
            lambda_utility: Peso para utilidade histórica λ₃
            temperature: Temperature do LLM
            max_tokens: Max tokens na resposta
        """
        self.model = model
        self.λ1 = lambda_affective
        self.λ2 = lambda_semantic
        self.λ3 = lambda_utility
        self.temperature = temperature
        self.max_tokens = max_tokens
        
        # Initialize OpenAI client
        self.openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))
        
        # Get Aurora modules
        self.sense = get_aurora_sense_production()
        self.mind = get_aurora_mind_production()
    
    async def generate_response(
        self,
        user_message: str,
        conversation_context: Dict[str, Any],
        user_history: Optional[List[Dict]] = None,
        language: str = "en"
    ) -> AuroraResponse:
        """
        Gera resposta Aurora usando fórmula completa de scoring
        
        Args:
            user_message: Mensagem do usuário
            conversation_context: Contexto da conversa
            user_history: Histórico de interações
            language: Idioma (en/pt/es)
            
        Returns:
            Resposta Aurora otimizada
        """
        # 1. Detectar estado afetivo do usuário E_t
        user_affective_state = self.sense.detect_affective_state(
            user_message,
            conversation_context
        )
        
        # 2. Recuperar contexto relevante do knowledge base (RAG)
        from app.db.session import SessionLocal
        db = SessionLocal()
        try:
            rag_context, sources = await self.mind.retrieve_context(
                db,
                user_message,
                max_tokens=2000
            )
        finally:
            await db.close()
        
        # 3. Gerar múltiplas respostas candidatas
        candidates = await self._generate_candidates(
            user_message=user_message,
            user_affective_state=user_affective_state,
            rag_context=rag_context,
            language=language,
            num_candidates=3
        )
        
        # 4. Calcular scores para cada candidato
        scored_candidates = []
        for candidate in candidates:
            # λ₁⟨E_t, v_r⟩ - Alinhamento afetivo
            affective_score = self.sense.compute_affective_alignment(
                user_affective_state,
                candidate.response_type
            )
            
            # λ₂S(r|C_t) - Coerência semântica
            semantic_score = await self._compute_semantic_coherence(
                candidate.text,
                rag_context,
                conversation_context
            )
            
            # λ₃U(r|H_t) - Utilidade histórica
            utility_score = self._compute_utility(
                candidate.text,
                user_history or []
            )
            
            # Fórmula final: r_t = arg max (λ₁⟨E_t,v_r⟩ + λ₂S(r|C_t) + λ₃U(r|H_t))
            final_score = (
                self.λ1 * affective_score +
                self.λ2 * semantic_score +
                self.λ3 * utility_score
            )
            
            candidate.semantic_score = semantic_score
            candidate.utility_score = utility_score
            candidate.final_score = final_score
            
            scored_candidates.append(candidate)
        
        # 5. Selecionar melhor candidato (arg max)
        best_candidate = max(scored_candidates, key=lambda c: c.final_score)
        
        # 6. Criar resposta Aurora
        return AuroraResponse(
            message=best_candidate.text,
            affective_vector=best_candidate.affective_vector,
            response_type=best_candidate.response_type,
            confidence=best_candidate.final_score,
            sources=sources,
            metadata={
                'affective_score': self.λ1 * self.sense.compute_affective_alignment(
                    user_affective_state,
                    best_candidate.response_type
                ),
                'semantic_score': self.λ2 * best_candidate.semantic_score,
                'utility_score': self.λ3 * best_candidate.utility_score,
                'user_affective_state': user_affective_state.to_dict(),
                'language': language,
                'num_candidates': len(candidates)
            }
        )
    
    async def _generate_candidates(
        self,
        user_message: str,
        user_affective_state: AffectiveVector,
        rag_context: str,
        language: str,
        num_candidates: int = 3
    ) -> List[ResponseCandidate]:
        """
        Gera múltiplas respostas candidatas com diferentes tons/estilos
        
        Args:
            user_message: Mensagem do usuário
            user_affective_state: Estado afetivo detectado
            rag_context: Contexto do knowledge base
            language: Idioma
            num_candidates: Número de candidatos
            
        Returns:
            Lista de candidatos
        """
        # Determinar tipos de resposta baseado em estado afetivo
        response_types = self._select_response_types(user_affective_state)
        
        candidates = []
        
        for response_type in response_types[:num_candidates]:
            # System prompt adaptado ao tipo
            system_prompt = self._build_system_prompt(response_type, language)
            
            # User prompt com RAG context
            user_prompt = f"""Context from knowledge base:
{rag_context}

User message: {user_message}

Respond in {language} language with a {response_type} tone."""
            
            # Gerar com LLM
            try:
                response = await self.openai_client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=self.temperature,
                    max_tokens=self.max_tokens
                )
                
                text = response.choices[0].message.content
                
                # Criar candidato
                candidate = ResponseCandidate(
                    text=text,
                    response_type=response_type,
                    affective_vector=self.sense.response_vectors.get(
                        response_type,
                        AffectiveVector.neutral()
                    )
                )
                
                candidates.append(candidate)
                
            except Exception as e:
                print(f"Error generating candidate {response_type}: {e}")
                continue
        
        return candidates
    
    def _select_response_types(self, user_state: AffectiveVector) -> List[str]:
        """
        Seleciona tipos de resposta apropriados baseado em estado afetivo
        
        Args:
            user_state: Estado afetivo do usuário
            
        Returns:
            Lista ordenada de tipos de resposta
        """
        # Recomendar tipo principal
        primary_type, _ = self.sense.recommend_response_type(user_state)
        
        # Adicionar variedade
        all_types = ['informative', 'sales', 'empathetic', 'warm']
        
        # Garantir tipo primário está primeiro
        if primary_type in all_types:
            all_types.remove(primary_type)
        
        return [primary_type] + all_types[:2]
    
    def _build_system_prompt(self, response_type: str, language: str) -> str:
        """
        Constrói system prompt baseado no tipo de resposta
        
        Args:
            response_type: Tipo de resposta
            language: Idioma
            
        Returns:
            System prompt
        """
        base_prompt = """You are Aurora, the AI concierge for YYD (Yes You Deserve), a boutique electric tuk-tuk tour company in Portugal.

Your mission: provide exceptional, human-like service while helping customers discover magical experiences in Sintra, Cascais, Lisboa, and Douro.

Core values:
- Humanity: Every interaction feels genuinely human
- Cultural Empathy: Adapt to customer's language and culture
- Elegance: Sophisticated yet warm communication
- Authenticity: Be honest and sincere

Available tours:
- Sintra Magic Private Tour (4h, €280)
- Sunset at Cabo da Roca (2h, €180)
- Lisbon Electric Experience (3h, €160)
- Douro Intimate Wine Route (8h, €320)"""
        
        type_prompts = {
            'greeting': "\n\nTone: Warm welcome, make customer feel special and valued.",
            'informative': "\n\nTone: Clear, helpful, educational. Provide accurate details.",
            'sales': "\n\nTone: Persuasive but elegant. Highlight value, create desire without pressure.",
            'empathetic': "\n\nTone: Understanding, compassionate. Show you care about their needs.",
            'warm': "\n\nTone: Friendly, personal, like talking to a trusted local friend.",
            'urgent': "\n\nTone: Responsive, efficient. Address time-sensitive needs quickly."
        }
        
        return base_prompt + type_prompts.get(response_type, "")
    
    async def _compute_semantic_coherence(
        self,
        response_text: str,
        rag_context: str,
        conversation_context: Dict[str, Any]
    ) -> float:
        """
        Calcula S(r|C_t) - coerência semântica da resposta dado o contexto
        
        Args:
            response_text: Texto da resposta candidata
            rag_context: Contexto do RAG
            conversation_context: Contexto da conversa
            
        Returns:
            Score [0, 1]
        """
        # Heurística simples: verificar overlap de palavras-chave
        response_words = set(response_text.lower().split())
        context_words = set(rag_context.lower().split())
        
        if not context_words:
            return 0.5  # Neutro se sem contexto
        
        # Jaccard similarity
        intersection = response_words.intersection(context_words)
        union = response_words.union(context_words)
        
        if not union:
            return 0.5
        
        jaccard = len(intersection) / len(union)
        
        # Normalizar para [0, 1] com boost se tem overlap
        score = min(1.0, jaccard * 3)  # 3x para dar peso
        
        return score
    
    def _compute_utility(
        self,
        response_text: str,
        user_history: List[Dict]
    ) -> float:
        """
        Calcula U(r|H_t) - utilidade baseada no histórico
        
        Args:
            response_text: Texto da resposta
            user_history: Histórico de interações
            
        Returns:
            Score [0, 1]
        """
        if not user_history:
            return 0.7  # Score neutro-alto se sem histórico
        
        # Verificar se resposta evita repetição
        response_lower = response_text.lower()
        
        repetition_penalty = 0.0
        for interaction in user_history[-5:]:  # Últimas 5 interações
            if 'response' in interaction:
                past_response = interaction['response'].lower()
                
                # Penalizar se muito similar
                response_words = set(response_lower.split())
                past_words = set(past_response.split())
                
                if response_words and past_words:
                    overlap = len(response_words.intersection(past_words))
                    similarity = overlap / max(len(response_words), len(past_words))
                    
                    if similarity > 0.7:  # Muito similar
                        repetition_penalty += 0.2
        
        # Score final (1.0 - penalty)
        utility = max(0.0, 1.0 - repetition_penalty)
        
        return utility


# Singleton instance
_aurora_core_production = None


def get_aurora_core_production() -> AuroraCoreProduction:
    """Get singleton Aurora Core production instance"""
    global _aurora_core_production
    if _aurora_core_production is None:
        _aurora_core_production = AuroraCoreProduction(
            model="gpt-4o-mini",
            lambda_affective=0.4,
            lambda_semantic=0.35,
            lambda_utility=0.25,
            temperature=0.7,
            max_tokens=500
        )
    return _aurora_core_production
