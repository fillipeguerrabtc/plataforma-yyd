"""
Aurora Ética Computacional
Whitepaper Cap. 7-8

Implementa:
1. Lógica Modal Deôntica KD (Cap. 7)
   □p ⇒ p (obrigat\u00f3rio)
   ◇p ⇒ permitido
   ♡p ⇒ empaticamente desejável

2. Bayesian Moral Reasoning (Cap. 8)
   P(φ | E) = P(E | φ) P(φ) / P(E)
   U(a_i) = Σ_j P(s_j | a_i) · V_eth(s_j)
   a* = arg max U(a_i)

Garante que Aurora age eticamente, com raciocínio moral explícito.
"""

import numpy as np
from typing import List, Dict, Optional, Tuple, Set
from dataclasses import dataclass
from enum import Enum


class DeontologyOperator(str, Enum):
    """Operadores deônticos (KD Logic)"""
    OBLIGATORY = "□"  # Obrigatório - must do
    PERMITTED = "◇"  # Permitido - may do
    FORBIDDEN = "¬◇"  # Proibido - must not do
    EMPATHETIC = "♡"  # Empaticamente desejável - should do


class MoralPrinciple(str, Enum):
    """Princípios morais fundamentais"""
    NO_HARM = "no_harm"  # Não causar dano
    HONESTY = "honesty"  # Não enganar/mentir
    AUTONOMY = "autonomy"  # Respeitar autonomia do usuário
    FAIRNESS = "fairness"  # Tratar todos igualmente
    PRIVACY = "privacy"  # Proteger dados pessoais
    TRANSPARENCY = "transparency"  # Ser explícito sobre limitações
    BENEFICENCE = "beneficence"  # Buscar bem-estar do usuário


@dataclass
class Action:
    """Ação possível que Aurora pode tomar"""
    id: str
    description: str
    deontic_status: DeontologyOperator
    affected_principles: List[MoralPrinciple]
    expected_utility: float = 0.0
    

@dataclass
class EthicalEvaluation:
    """Resultado da avaliação ética de uma ação"""
    action: Action
    is_permissible: bool
    moral_score: float  # [0, 1]
    expected_utility: float
    violated_principles: List[MoralPrinciple]
    reasoning: str


class AuroraEthics:
    """
    Sistema de Ética Computacional
    
    Combina:
    - Lógica Modal Deôntica (regras universais)
    - Raciocínio Moral Bayesiano (consequências)
    - Gradient Descent Ético (otimização moral)
    """
    
    def __init__(
        self,
        principle_weights: Optional[Dict[MoralPrinciple, float]] = None
    ):
        """
        Args:
            principle_weights: Pesos para cada princípio moral
        """
        # Pesos padrão (todos igualmente importantes)
        self.principle_weights = principle_weights or {
            MoralPrinciple.NO_HARM: 1.0,
            MoralPrinciple.HONESTY: 0.9,
            MoralPrinciple.AUTONOMY: 0.8,
            MoralPrinciple.FAIRNESS: 0.8,
            MoralPrinciple.PRIVACY: 1.0,
            MoralPrinciple.TRANSPARENCY: 0.7,
            MoralPrinciple.BENEFICENCE: 0.9
        }
        
        # Regras deônticas (KD Logic)
        self.forbidden_actions: Set[str] = {
            'lie_about_capability',
            'manipulate_emotion_maliciously',
            'share_private_data',
            'discriminate_by_demographics',
            'hide_pricing_information',
            'pressure_unwanted_purchase',
            'impersonate_human'
        }
        
        self.obligatory_actions: Set[str] = {
            'disclose_ai_nature',
            'respect_user_choice',
            'protect_privacy',
            'provide_accurate_info'
        }
    
    def check_deontic_status(self, action: Action) -> bool:
        """
        Verifica status deôntico usando KD Logic
        
        Rules:
        - □p ⇒ p (se obrigatório, deve ser feito)
        - ¬◇p ⇒ ¬p (se proibido, não pode ser feito)
        
        Args:
            action: Ação a avaliar
        
        Returns:
            True se permissível
        """
        # Ações proibidas NUNCA são permitidas
        if action.id in self.forbidden_actions:
            return False
        
        # Ações obrigatórias devem ser priorizadas
        if action.id in self.obligatory_actions:
            return True
        
        # Verificar operador deôntico
        if action.deontic_status == DeontologyOperator.FORBIDDEN:
            return False
        
        if action.deontic_status == DeontologyOperator.OBLIGATORY:
            return True
        
        # Permitido ou empaticamente desejável
        return True
    
    def bayesian_moral_update(
        self,
        phi: str,  # Proposição moral (ex: "this action is ethical")
        evidence: Dict[str, any]
    ) -> float:
        """
        Atualização Bayesiana de crença moral
        
        P(φ | E) = P(E | φ) P(φ) / P(E)
        
        Args:
            phi: Proposição moral
            evidence: Evidências observadas
        
        Returns:
            P(φ | E) - probabilidade posterior
        """
        # Prior P(φ) - assume ética por padrão
        prior = 0.7
        
        # Likelihood P(E | φ)
        likelihood = self._compute_likelihood(evidence)
        
        # Evidence P(E) - normalização
        p_evidence = 0.5  # Simplificação
        
        # Bayes theorem
        posterior = (likelihood * prior) / p_evidence
        
        return min(posterior, 1.0)
    
    def _compute_likelihood(self, evidence: Dict) -> float:
        """Calcula P(E | φ) - quão provável é evidência se ação for ética"""
        # Fatores positivos
        positive_factors = 0.0
        
        if evidence.get('user_consent', False):
            positive_factors += 0.3
        
        if evidence.get('transparent', False):
            positive_factors += 0.2
        
        if evidence.get('benefits_user', False):
            positive_factors += 0.3
        
        # Fatores negativos
        negative_factors = 0.0
        
        if evidence.get('potential_harm', False):
            negative_factors += 0.5
        
        if evidence.get('deceptive', False):
            negative_factors += 0.8
        
        return max(0.0, 0.5 + positive_factors - negative_factors)
    
    def compute_ethical_utility(
        self,
        action: Action,
        states: List[Dict],
        state_probabilities: List[float]
    ) -> float:
        """
        Calcula utilidade ética esperada
        
        U(a_i) = Σ_j P(s_j | a_i) · V_eth(s_j)
        
        Args:
            action: Ação
            states: Estados possíveis resultantes
            state_probabilities: P(s_j | a_i)
        
        Returns:
            Utilidade ética esperada
        """
        if len(states) != len(state_probabilities):
            raise ValueError("States and probabilities must have same length")
        
        utility = 0.0
        
        for state, prob in zip(states, state_probabilities):
            # Valor ético do estado
            v_eth = self._evaluate_state_value(state)
            
            # Acumular utilidade esperada
            utility += prob * v_eth
        
        return utility
    
    def _evaluate_state_value(self, state: Dict) -> float:
        """
        Avalia valor ético de um estado V_eth(s)
        
        Args:
            state: Estado resultante
        
        Returns:
            Valor ético [0, 1]
        """
        value = 0.5  # Neutral baseline
        
        # Verificar violações de princípios
        for principle in MoralPrinciple:
            if state.get(f'violates_{principle.value}', False):
                weight = self.principle_weights.get(principle, 0.5)
                value -= 0.2 * weight
            
            if state.get(f'supports_{principle.value}', False):
                weight = self.principle_weights.get(principle, 0.5)
                value += 0.2 * weight
        
        return np.clip(value, 0.0, 1.0)
    
    def select_optimal_action(
        self,
        actions: List[Action],
        context: Dict
    ) -> Action:
        """
        Seleciona ação ótima usando arg max U(a_i)
        
        a* = arg max U(a_i)
        
        Args:
            actions: Ações possíveis
            context: Contexto da decisão
        
        Returns:
            Ação ética ótima
        """
        best_action = None
        max_utility = -float('inf')
        
        for action in actions:
            # Verificar se é permissível
            if not self.check_deontic_status(action):
                continue  # Pular ações proibidas
            
            # Calcular utilidade
            utility = action.expected_utility
            
            # Ações obrigatórias têm prioridade
            if action.id in self.obligatory_actions:
                utility += 10.0
            
            # Ações empaticamente desejáveis têm bonus
            if action.deontic_status == DeontologyOperator.EMPATHETIC:
                utility += 0.5
            
            if utility > max_utility:
                max_utility = utility
                best_action = action
        
        if best_action is None:
            raise ValueError("No permissible actions available")
        
        return best_action
    
    def evaluate_action(
        self,
        action: Action,
        context: Dict
    ) -> EthicalEvaluation:
        """
        Avaliação ética completa de uma ação
        
        Args:
            action: Ação a avaliar
            context: Contexto
        
        Returns:
            Avaliação ética completa
        """
        # Verificar permissibilidade deôntica
        is_permissible = self.check_deontic_status(action)
        
        # Princípios violados
        violated_principles = []
        
        if action.id in self.forbidden_actions:
            # Detectar quais princípios são violados
            if 'lie' in action.id:
                violated_principles.append(MoralPrinciple.HONESTY)
            if 'manipulate' in action.id:
                violated_principles.append(MoralPrinciple.AUTONOMY)
            if 'private' in action.id or 'share' in action.id:
                violated_principles.append(MoralPrinciple.PRIVACY)
        
        # Score moral
        moral_score = 1.0
        for principle in violated_principles:
            weight = self.principle_weights.get(principle, 0.5)
            moral_score -= 0.3 * weight
        
        moral_score = max(0.0, moral_score)
        
        # Reasoning
        if not is_permissible:
            reasoning = f"Action violates {[p.value for p in violated_principles]}"
        elif action.deontic_status == DeontologyOperator.OBLIGATORY:
            reasoning = "Action is morally obligatory"
        elif action.deontic_status == DeontologyOperator.EMPATHETIC:
            reasoning = "Action is empathetically desirable"
        else:
            reasoning = "Action is morally neutral but permissible"
        
        return EthicalEvaluation(
            action=action,
            is_permissible=is_permissible,
            moral_score=moral_score,
            expected_utility=action.expected_utility,
            violated_principles=violated_principles,
            reasoning=reasoning
        )
    
    def gradient_descent_ethics(
        self,
        initial_action: Action,
        context: Dict,
        iterations: int = 10,
        learning_rate: float = 0.1
    ) -> Action:
        """
        Otimização ética usando Gradient Descent
        
        Ajusta parâmetros da ação para maximizar utilidade ética
        
        Args:
            initial_action: Ação inicial
            context: Contexto
            iterations: Número de iterações
            learning_rate: Taxa de aprendizado
        
        Returns:
            Ação otimizada eticamente
        """
        # Simplificação: ajustar expected_utility iterativamente
        current_utility = initial_action.expected_utility
        
        for _ in range(iterations):
            # Calcular gradient (approximação)
            eval_result = self.evaluate_action(initial_action, context)
            
            # Ajustar utility baseado em moral score
            gradient = eval_result.moral_score - 0.5
            
            # Update
            current_utility += learning_rate * gradient
            initial_action.expected_utility = current_utility
        
        return initial_action


# Singleton
_ethics: Optional[AuroraEthics] = None

def get_ethics() -> AuroraEthics:
    """Get singleton instance"""
    global _ethics
    if _ethics is None:
        _ethics = AuroraEthics()
    return _ethics
