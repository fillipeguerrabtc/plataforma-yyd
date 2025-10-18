"""
Aurora Sense - PRODUCTION READY
Embeddings afetivos em ℝ³ com normalização
Baseado no whitepaper YYD (26.120 linhas)

Implementa:
- E = (a, c, s) onde ||E||₂ = 1
- a = ativação emocional
- c = cordialidade  
- s = sinceridade
- Ortogonalidade entre vetores base
- Dinâmica temporal: E_{t+1} = (1-α)E_t + α·f(C_t, U_t)
"""

import numpy as np
from typing import Tuple, List, Dict, Any, Optional
from dataclasses import dataclass
import json


@dataclass
class AffectiveVector:
    """
    Vetor afetivo em ℝ³ normalizado
    
    Attributes:
        a: Ativação emocional [0, 1] - quão energizada/excitada é a emoção
        c: Cordialidade [0, 1] - quão calorosa/amigável é a emoção  
        s: Sinceridade [0, 1] - quão autêntica/genuína é a emoção
    """
    a: float  # activation
    c: float  # cordiality
    s: float  # sincerity
    
    def __post_init__(self):
        """Normaliza o vetor após criação"""
        self.normalize()
    
    def normalize(self):
        """Normaliza para ||E||₂ = 1"""
        norm = np.sqrt(self.a**2 + self.c**2 + self.s**2)
        if norm > 0:
            self.a = self.a / norm
            self.c = self.c / norm
            self.s = self.s / norm
        else:
            # Estado neutro normalizado
            self.a = 1.0 / np.sqrt(3)
            self.c = 1.0 / np.sqrt(3)
            self.s = 1.0 / np.sqrt(3)
    
    def to_array(self) -> np.ndarray:
        """Converte para numpy array"""
        return np.array([self.a, self.c, self.s])
    
    def to_list(self) -> List[float]:
        """Converte para lista Python"""
        return [float(self.a), float(self.c), float(self.s)]
    
    def to_dict(self) -> Dict[str, float]:
        """Converte para dicionário"""
        return {
            'activation': float(self.a),
            'cordiality': float(self.c),
            'sincerity': float(self.s)
        }
    
    @classmethod
    def from_list(cls, values: List[float]) -> 'AffectiveVector':
        """Cria vetor a partir de lista [a, c, s]"""
        return cls(values[0], values[1], values[2])
    
    @classmethod
    def neutral(cls) -> 'AffectiveVector':
        """Cria vetor neutro (equilíbrio perfeito)"""
        return cls(1.0, 1.0, 1.0)  # será normalizado automaticamente
    
    @classmethod
    def excited(cls) -> 'AffectiveVector':
        """Alta ativação, cordialidade moderada"""
        return cls(0.9, 0.6, 0.7)
    
    @classmethod
    def warm(cls) -> 'AffectiveVector':
        """Alta cordialidade, ativação moderada"""
        return cls(0.5, 0.9, 0.8)
    
    @classmethod
    def calm(cls) -> 'AffectiveVector':
        """Baixa ativação, alta sinceridade"""
        return cls(0.3, 0.7, 0.9)
    
    def dot(self, other: 'AffectiveVector') -> float:
        """Produto interno ⟨E, v⟩"""
        return float(np.dot(self.to_array(), other.to_array()))
    
    def distance(self, other: 'AffectiveVector') -> float:
        """Distância euclidiana em ℝ³"""
        diff = self.to_array() - other.to_array()
        return float(np.linalg.norm(diff))
    
    def cosine_similarity(self, other: 'AffectiveVector') -> float:
        """Similaridade cosseno (já normalizado, então é só dot product)"""
        return self.dot(other)


class AuroraSenseProduction:
    """
    Production-ready Aurora Sense module
    
    Implementa:
    - Detecção de estado afetivo a partir de texto/contexto
    - Dinâmica temporal com learning rate α
    - Estabilidade Lipschitz-contínua
    - Alinhamento afetivo para seleção de resposta
    """
    
    def __init__(
        self,
        alpha: float = 0.3,
        lipschitz_constant: float = 1.0,
        response_vectors: Optional[Dict[str, AffectiveVector]] = None
    ):
        """
        Args:
            alpha: Learning rate para dinâmica temporal E_{t+1} = (1-α)E_t + α·f(C_t,U_t)
            lipschitz_constant: Constante L ≤ 1 para estabilidade
            response_vectors: Vetores afetivos pré-definidos para tipos de resposta
        """
        self.alpha = alpha
        self.L = lipschitz_constant
        
        # Vetores afetivos para diferentes tipos de resposta
        self.response_vectors = response_vectors or {
            'greeting': AffectiveVector.warm(),
            'informative': AffectiveVector.calm(),
            'sales': AffectiveVector.excited(),
            'empathetic': AffectiveVector(0.5, 0.9, 0.9),
            'urgent': AffectiveVector(0.8, 0.6, 0.8),
            'farewell': AffectiveVector.warm()
        }
    
    def detect_affective_state(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> AffectiveVector:
        """
        Detecta estado afetivo a partir de mensagem do usuário
        
        Args:
            message: Mensagem do usuário
            context: Contexto adicional
            
        Returns:
            Vetor afetivo detectado E = (a, c, s)
        """
        message_lower = message.lower()
        
        # Palavras-chave para ativação (excitement)
        activation_words = [
            'amazing', 'excited', 'incredible', 'wow', 'urgent', 
            'quickly', 'asap', 'incrível', 'urgente', '!', '!!!'
        ]
        
        # Palavras-chave para cordialidade (warmth)
        cordiality_words = [
            'thank', 'please', 'love', 'appreciate', 'wonderful',
            'obrigad', 'por favor', 'amo', 'adorei', '❤', '😊'
        ]
        
        # Palavras-chave para sinceridade (authenticity)
        sincerity_words = [
            'honest', 'genuine', 'really', 'truly', 'actually',
            'verdade', 'realmente', 'sincero', 'autêntico'
        ]
        
        # Contagem de palavras
        activation_score = sum(1 for word in activation_words if word in message_lower) / 10
        cordiality_score = sum(1 for word in cordiality_words if word in message_lower) / 10
        sincerity_score = sum(1 for word in sincerity_words if word in message_lower) / 10
        
        # Exclamações aumentam ativação
        exclamation_count = message.count('!')
        activation_score += min(exclamation_count / 5, 0.3)
        
        # Questões aumentam sinceridade (busca por informação autêntica)
        question_count = message.count('?')
        sincerity_score += min(question_count / 5, 0.2)
        
        # Base values (começar com estado médio)
        a = 0.5 + activation_score
        c = 0.6 + cordiality_score  # Assumir cordialidade leve por default
        s = 0.7 + sincerity_score   # Assumir sinceridade por default
        
        # Clamp [0, 1]
        a = max(0.0, min(1.0, a))
        c = max(0.0, min(1.0, c))
        s = max(0.0, min(1.0, s))
        
        return AffectiveVector(a, c, s)
    
    def temporal_update(
        self,
        current_state: AffectiveVector,
        new_observation: AffectiveVector
    ) -> AffectiveVector:
        """
        Atualização temporal do estado afetivo
        
        Fórmula: E_{t+1} = (1-α)E_t + α·f(C_t, U_t)
        onde f é Lipschitz-contínua com L ≤ 1
        
        Args:
            current_state: Estado atual E_t
            new_observation: Nova observação f(C_t, U_t)
            
        Returns:
            Novo estado E_{t+1}
        """
        # Garantir que f é Lipschitz-contínua limitando a mudança
        diff = new_observation.to_array() - current_state.to_array()
        diff_norm = np.linalg.norm(diff)
        
        if diff_norm > self.L:
            # Limitar mudança para satisfazer Lipschitz L ≤ 1
            diff = diff * (self.L / diff_norm)
            new_observation_limited = current_state.to_array() + diff
        else:
            new_observation_limited = new_observation.to_array()
        
        # Aplicar fórmula de update
        updated = (1 - self.alpha) * current_state.to_array() + self.alpha * new_observation_limited
        
        return AffectiveVector.from_list(updated.tolist())
    
    def compute_affective_alignment(
        self,
        user_state: AffectiveVector,
        response_type: str
    ) -> float:
        """
        Calcula alinhamento afetivo ⟨E_t, v_r⟩ para seleção de resposta
        
        Parte da fórmula principal:
        r_t = arg max (λ₁⟨E_t,v_r⟩ + λ₂S(r|C_t) + λ₃U(r|H_t))
        
        Args:
            user_state: Estado afetivo do usuário E_t
            response_type: Tipo de resposta (greeting, sales, etc)
            
        Returns:
            Score de alinhamento afetivo [0, 1]
        """
        if response_type not in self.response_vectors:
            # Resposta neutra se tipo desconhecido
            response_vector = AffectiveVector.neutral()
        else:
            response_vector = self.response_vectors[response_type]
        
        # Produto interno normalizado para [0, 1]
        alignment = user_state.dot(response_vector)
        
        # Como vetores são normalizados, dot product está em [-1, 1]
        # Mapear para [0, 1]
        alignment_normalized = (alignment + 1) / 2
        
        return float(alignment_normalized)
    
    def recommend_response_type(
        self,
        user_state: AffectiveVector,
        context: Optional[Dict[str, Any]] = None
    ) -> Tuple[str, float]:
        """
        Recomenda tipo de resposta baseado em alinhamento afetivo
        
        Args:
            user_state: Estado afetivo do usuário
            context: Contexto adicional
            
        Returns:
            (tipo_resposta, score_alinhamento)
        """
        scores = {}
        
        for response_type in self.response_vectors:
            score = self.compute_affective_alignment(user_state, response_type)
            scores[response_type] = score
        
        # Retornar tipo com maior alinhamento
        best_type = max(scores, key=scores.get)
        best_score = scores[best_type]
        
        return best_type, best_score
    
    def explain_state(self, state: AffectiveVector) -> str:
        """
        Explica estado afetivo em linguagem natural
        
        Args:
            state: Vetor afetivo
            
        Returns:
            Descrição textual
        """
        a, c, s = state.a, state.c, state.s
        
        # Interpretação de ativação
        if a > 0.7:
            activation_desc = "highly energized"
        elif a > 0.5:
            activation_desc = "moderately energized"
        elif a > 0.3:
            activation_desc = "calm"
        else:
            activation_desc = "very calm"
        
        # Interpretação de cordialidade
        if c > 0.7:
            cordiality_desc = "very warm"
        elif c > 0.5:
            cordiality_desc = "friendly"
        elif c > 0.3:
            cordiality_desc = "neutral"
        else:
            cordiality_desc = "formal"
        
        # Interpretação de sinceridade
        if s > 0.7:
            sincerity_desc = "authentic"
        elif s > 0.5:
            sincerity_desc = "genuine"
        else:
            sincerity_desc = "uncertain"
        
        return f"{activation_desc}, {cordiality_desc}, {sincerity_desc}"


# Singleton instance
_aurora_sense_production = None


def get_aurora_sense_production() -> AuroraSenseProduction:
    """Get singleton Aurora Sense production instance"""
    global _aurora_sense_production
    if _aurora_sense_production is None:
        _aurora_sense_production = AuroraSenseProduction(
            alpha=0.3,
            lipschitz_constant=1.0
        )
    return _aurora_sense_production
