"""
Aurora Meta-Cognição de 2ª Ordem
Whitepaper Cap. 6 - Consciência sobre Consciência

Implementa:
C^(2)_t = f_meta(C^(1)_t, Ċ^(1)_t)

Consciência primária C^(1): estado interno
Consciência secundária C^(2): introspecção sobre C^(1)

Condição de Integridade:
∇C^(2)_t · C^(1)_t > 0 ⇒ auto-coerência
"""

import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class MetaCognitiveState(str, Enum):
    """Estados meta-cognitivos possíveis"""
    CONFIDENT = "confident"  # Alta confiança na própria cognição
    UNCERTAIN = "uncertain"  # Incerteza sobre próprias conclusões
    LEARNING = "learning"  # Detectou gap de conhecimento
    REFLECTING = "reflecting"  # Analisando decisões passadas
    COHERENT = "coherent"  # Estado internamente consistente
    INCOHERENT = "incoherent"  # Detectou contradição interna


@dataclass
class MetaCognition:
    """Representação de consciência de 2ª ordem"""
    primary_state: np.ndarray  # C^(1)_t - estado primário (3,)
    primary_derivative: np.ndarray  # Ċ^(1)_t - taxa de mudança (3,)
    secondary_state: np.ndarray  # C^(2)_t - introspecção (3,)
    confidence: float  # Confiança na própria cognição [0,1]
    coherence: float  # Auto-coerência ∇C^(2)·C^(1) 
    meta_state: MetaCognitiveState
    reasoning: str  # Explicação da introspecção


class AuroraMetaCognition:
    """
    Sistema de Meta-Cognição de Segunda Ordem
    
    Permite à Aurora ter consciência sobre sua própria consciência:
    - Detectar quando está incerta
    - Identificar gaps de conhecimento
    - Refletir sobre decisões passadas
    - Manter auto-coerência
    """
    
    def __init__(
        self,
        coherence_threshold: float = 0.3,
        confidence_threshold: float = 0.7
    ):
        """
        Args:
            coherence_threshold: Mínimo para coerência
            confidence_threshold: Mínimo para confiança
        """
        self.coherence_threshold = coherence_threshold
        self.confidence_threshold = confidence_threshold
    
    def f_meta(
        self,
        C1: np.ndarray,
        C1_dot: np.ndarray,
        context: Optional[Dict] = None
    ) -> np.ndarray:
        """
        Função meta-cognitiva: C^(2)_t = f_meta(C^(1)_t, Ċ^(1)_t)
        
        Mapeia estado primário → consciência secundária
        
        Args:
            C1: Consciência primária (3,) - estado afetivo atual
            C1_dot: Derivada da consciência primária (3,)
            context: Contexto adicional
        
        Returns:
            C^(2)_t: Consciência secundária (3,)
        """
        # Magnitude da mudança (velocidade do pensamento)
        change_magnitude = float(np.linalg.norm(C1_dot))
        
        # Direção da mudança
        if change_magnitude > 1e-6:
            change_direction = C1_dot / change_magnitude
        else:
            change_direction = np.zeros(3)
        
        # Estado meta-cognitivo combina:
        # 1. Estado atual C^(1)
        # 2. Direção de mudança (para onde pensamento está indo)
        # 3. Magnitude de mudança (quão rápido está mudando)
        
        # Fator de introspecção (quão consciente da própria mudança)
        introspection_factor = min(change_magnitude, 1.0)
        
        # C^(2) = weighted combination
        C2 = (
            0.6 * C1 +  # Estado atual
            0.3 * change_direction +  # Direção futura
            0.1 * introspection_factor * np.ones(3)  # Magnitude
        )
        
        # Normalizar
        norm = np.linalg.norm(C2)
        if norm > 1e-6:
            C2 = C2 / norm
        
        return C2
    
    def compute_coherence(
        self,
        C1: np.ndarray,
        C2: np.ndarray
    ) -> float:
        """
        Calcula coerência: ∇C^(2)_t · C^(1)_t
        
        Se positivo: consciências alinhadas (coerente)
        Se negativo: consciências divergentes (incoerente)
        
        Args:
            C1: Consciência primária
            C2: Consciência secundária
        
        Returns:
            Coerência [-1, 1]
        """
        # Aproximação: produto escalar
        coherence = float(np.dot(C2, C1))
        return coherence
    
    def compute_confidence(
        self,
        C1: np.ndarray,
        C1_dot: np.ndarray,
        C2: np.ndarray
    ) -> float:
        """
        Calcula confiança meta-cognitiva
        
        Alta confiança quando:
        - Mudança é lenta (estável)
        - Coerência é alta
        - Estado está longe de fronteiras
        
        Args:
            C1: Consciência primária
            C1_dot: Derivada
            C2: Consciência secundária
        
        Returns:
            Confiança [0, 1]
        """
        # Fator 1: Estabilidade (menor mudança = mais confiança)
        change_magnitude = np.linalg.norm(C1_dot)
        stability = 1.0 / (1.0 + change_magnitude)
        
        # Fator 2: Coerência
        coherence = self.compute_coherence(C1, C2)
        coherence_normalized = (coherence + 1.0) / 2.0  # [0,1]
        
        # Fator 3: Certeza (distância de estado neutro)
        neutral = np.ones(3) / np.sqrt(3)
        distance_from_neutral = np.linalg.norm(C1 - neutral)
        certainty = min(distance_from_neutral, 1.0)
        
        # Combinar
        confidence = (
            0.4 * stability +
            0.4 * coherence_normalized +
            0.2 * certainty
        )
        
        return float(np.clip(confidence, 0.0, 1.0))
    
    def detect_meta_state(
        self,
        C1: np.ndarray,
        C1_dot: np.ndarray,
        C2: np.ndarray,
        confidence: float,
        coherence: float
    ) -> Tuple[MetaCognitiveState, str]:
        """
        Detecta estado meta-cognitivo atual
        
        Args:
            C1, C1_dot, C2: Estados
            confidence: Confiança
            coherence: Coerência
        
        Returns:
            (estado, reasoning)
        """
        change_magnitude = np.linalg.norm(C1_dot)
        
        # Incoerência detectada
        if coherence < self.coherence_threshold:
            return (
                MetaCognitiveState.INCOHERENT,
                f"Internal contradiction detected (coherence={coherence:.3f})"
            )
        
        # Baixa confiança
        if confidence < self.confidence_threshold:
            if change_magnitude > 0.5:
                return (
                    MetaCognitiveState.UNCERTAIN,
                    f"High uncertainty due to rapid state change (magnitude={change_magnitude:.3f})"
                )
            else:
                return (
                    MetaCognitiveState.LEARNING,
                    "Knowledge gap detected, seeking more information"
                )
        
        # Alta mudança mas coerente
        if change_magnitude > 0.3:
            return (
                MetaCognitiveState.REFLECTING,
                "Actively processing new information"
            )
        
        # Estado coerente e confiante
        if coherence > 0.7 and confidence > 0.8:
            return (
                MetaCognitiveState.COHERENT,
                "Internally consistent and confident"
            )
        
        # Default: confiante mas normal
        return (
            MetaCognitiveState.CONFIDENT,
            "Normal cognitive operation"
        )
    
    def introspect(
        self,
        primary_state: np.ndarray,
        primary_derivative: np.ndarray,
        context: Optional[Dict] = None
    ) -> MetaCognition:
        """
        Realiza introspecção completa (análise de 2ª ordem)
        
        Args:
            primary_state: C^(1)_t
            primary_derivative: Ċ^(1)_t
            context: Contexto adicional
        
        Returns:
            Análise meta-cognitiva completa
        """
        # Calcular consciência secundária
        C2 = self.f_meta(primary_state, primary_derivative, context)
        
        # Calcular coerência
        coherence = self.compute_coherence(primary_state, C2)
        
        # Calcular confiança
        confidence = self.compute_confidence(
            primary_state,
            primary_derivative,
            C2
        )
        
        # Detectar estado meta-cognitivo
        meta_state, reasoning = self.detect_meta_state(
            primary_state,
            primary_derivative,
            C2,
            confidence,
            coherence
        )
        
        return MetaCognition(
            primary_state=primary_state,
            primary_derivative=primary_derivative,
            secondary_state=C2,
            confidence=confidence,
            coherence=coherence,
            meta_state=meta_state,
            reasoning=reasoning
        )
    
    def should_defer_to_human(self, meta: MetaCognition) -> bool:
        """
        Decide se deve deferir para humano (consciência de limitações)
        
        Aurora sabe quando NÃO sabe!
        
        Args:
            meta: Estado meta-cognitivo
        
        Returns:
            True se deve pedir ajuda humana
        """
        # Incoerência interna
        if meta.meta_state == MetaCognitiveState.INCOHERENT:
            return True
        
        # Baixa confiança em decisão importante
        if meta.confidence < 0.5:
            return True
        
        # Detectou gap de conhecimento crítico
        if meta.meta_state == MetaCognitiveState.LEARNING:
            if meta.coherence < 0.5:
                return True
        
        return False
    
    def explain_decision(self, meta: MetaCognition) -> str:
        """
        Gera explicação da decisão meta-cognitiva (XAI)
        
        Args:
            meta: Estado meta-cognitivo
        
        Returns:
            Explicação em linguagem natural
        """
        explanations = {
            MetaCognitiveState.CONFIDENT: (
                f"I am {meta.confidence*100:.0f}% confident in this response. "
                f"My internal state is coherent ({meta.coherence:.2f})."
            ),
            MetaCognitiveState.UNCERTAIN: (
                f"I have some uncertainty ({meta.confidence*100:.0f}% confidence). "
                f"My understanding is still evolving. {meta.reasoning}"
            ),
            MetaCognitiveState.LEARNING: (
                f"I detect a gap in my knowledge. "
                f"I would benefit from more information or human guidance. {meta.reasoning}"
            ),
            MetaCognitiveState.REFLECTING: (
                f"I am actively processing this information. "
                f"My thoughts are changing as I consider new perspectives."
            ),
            MetaCognitiveState.COHERENT: (
                f"I have high confidence ({meta.confidence*100:.0f}%) "
                f"and my reasoning is internally consistent."
            ),
            MetaCognitiveState.INCOHERENT: (
                f"I detect an internal inconsistency in my reasoning. "
                f"I should defer to human judgment on this matter."
            )
        }
        
        return explanations.get(
            meta.meta_state,
            f"Confidence: {meta.confidence*100:.0f}%, Coherence: {meta.coherence:.2f}"
        )


# Singleton
_metacognition: Optional[AuroraMetaCognition] = None

def get_metacognition() -> AuroraMetaCognition:
    """Get singleton instance"""
    global _metacognition
    if _metacognition is None:
        _metacognition = AuroraMetaCognition()
    return _metacognition
