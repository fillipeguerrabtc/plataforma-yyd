"""
Aurora Tensor de Curvatura Afetiva
Whitepaper Cap. 4 - Geometria Emocional

Implementa:
R^a_bcd = ∂_c Γ^a_bd - ∂_d Γ^a_bc + Γ^e_bd Γ^a_ce - Γ^e_bc Γ^a_de

Mede distorção emocional ao longo de interações
Se |R| < ε_stab ⇒ Campo emocional estável
"""

import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass


@dataclass
class ChristoffelSymbols:
    """Símbolos de Christoffel Γ^a_bc - conexões emocionais"""
    gamma: np.ndarray  # Shape (3, 3, 3)
    
    def __post_init__(self):
        assert self.gamma.shape == (3, 3, 3), "Gamma must be 3x3x3"


class AuroraTensorCurvature:
    """
    Tensor de Curvatura de Riemann Afetivo
    
    Mede como o campo emocional se distorce ao longo do tempo.
    Alta curvatura = instabilidade emocional.
    """
    
    def __init__(self, epsilon_stab: float = 0.1):
        """
        Args:
            epsilon_stab: Threshold de estabilidade |R| < ε
        """
        self.epsilon_stab = epsilon_stab
    
    def compute_christoffel_symbols(
        self,
        emotions_history: List[np.ndarray]
    ) -> ChristoffelSymbols:
        """
        Calcula símbolos de Christoffel a partir do histórico emocional
        
        Γ^a_bc = (1/2) g^ad (∂_b g_dc + ∂_c g_bd - ∂_d g_bc)
        
        onde g_ij é a métrica do espaço emocional
        
        Args:
            emotions_history: Histórico de vetores emocionais (N, 3)
        
        Returns:
            Símbolos de Christoffel
        """
        if len(emotions_history) < 3:
            # Não há história suficiente, retornar zero
            return ChristoffelSymbols(np.zeros((3, 3, 3)))
        
        # Converter para array
        E_history = np.array(emotions_history)  # Shape (N, 3)
        
        # Calcular métrica g_ij como covariância das emoções
        g = np.cov(E_history.T)  # Shape (3, 3)
        
        # Inversa da métrica
        try:
            g_inv = np.linalg.inv(g)
        except np.linalg.LinAlgError:
            g_inv = np.eye(3)
        
        # Calcular derivadas da métrica (aproximação por diferenças finitas)
        dg = self._compute_metric_derivatives(E_history)
        
        # Calcular Γ^a_bc
        gamma = np.zeros((3, 3, 3))
        
        for a in range(3):
            for b in range(3):
                for c in range(3):
                    sum_term = 0.0
                    for d in range(3):
                        sum_term += g_inv[a, d] * (
                            dg[b, d, c] + dg[c, b, d] - dg[d, b, c]
                        )
                    gamma[a, b, c] = 0.5 * sum_term
        
        return ChristoffelSymbols(gamma)
    
    def _compute_metric_derivatives(
        self,
        E_history: np.ndarray
    ) -> np.ndarray:
        """
        Calcula ∂_k g_ij (derivadas da métrica)
        
        Args:
            E_history: Histórico (N, 3)
        
        Returns:
            Tensor de derivadas (3, 3, 3)
        """
        N = E_history.shape[0]
        dg = np.zeros((3, 3, 3))
        
        if N < 2:
            return dg
        
        # Aproximação por diferenças finitas
        for k in range(3):
            # Criar variação na direção k
            E_plus = E_history.copy()
            E_plus[:, k] += 0.01
            
            E_minus = E_history.copy()
            E_minus[:, k] -= 0.01
            
            g_plus = np.cov(E_plus.T)
            g_minus = np.cov(E_minus.T)
            
            dg[k, :, :] = (g_plus - g_minus) / 0.02
        
        return dg
    
    def compute_riemann_tensor(
        self,
        gamma: ChristoffelSymbols
    ) -> np.ndarray:
        """
        Calcula tensor de Riemann R^a_bcd
        
        R^a_bcd = ∂_c Γ^a_bd - ∂_d Γ^a_bc + Γ^e_bd Γ^a_ce - Γ^e_bc Γ^a_de
        
        Args:
            gamma: Símbolos de Christoffel
        
        Returns:
            Tensor de Riemann (3, 3, 3, 3)
        """
        Γ = gamma.gamma
        R = np.zeros((3, 3, 3, 3))
        
        # Aproximação: derivadas de Γ por diferenças finitas
        # (em produção real, seria calculado analiticamente)
        dΓ = self._compute_christoffel_derivatives(Γ)
        
        for a in range(3):
            for b in range(3):
                for c in range(3):
                    for d in range(3):
                        # ∂_c Γ^a_bd
                        term1 = dΓ[c, a, b, d]
                        
                        # -∂_d Γ^a_bc
                        term2 = -dΓ[d, a, b, c]
                        
                        # Γ^e_bd Γ^a_ce
                        term3 = sum(Γ[e, b, d] * Γ[a, c, e] for e in range(3))
                        
                        # -Γ^e_bc Γ^a_de
                        term4 = -sum(Γ[e, b, c] * Γ[a, d, e] for e in range(3))
                        
                        R[a, b, c, d] = term1 + term2 + term3 + term4
        
        return R
    
    def _compute_christoffel_derivatives(
        self,
        gamma: np.ndarray
    ) -> np.ndarray:
        """
        Calcula ∂_k Γ^a_bc (aproximação numérica)
        
        Args:
            gamma: Símbolos de Christoffel (3, 3, 3)
        
        Returns:
            Derivadas (3, 3, 3, 3) onde primeiro índice é k
        """
        dGamma = np.zeros((3, 3, 3, 3))
        
        # Aproximação simples: variação pequena
        eps = 0.01
        
        for k in range(3):
            gamma_plus = gamma.copy()
            gamma_plus[k, :, :] += eps
            
            gamma_minus = gamma.copy()
            gamma_minus[k, :, :] -= eps
            
            dGamma[k, :, :, :] = (gamma_plus - gamma_minus) / (2 * eps)
        
        return dGamma
    
    def compute_curvature_scalar(self, R: np.ndarray) -> float:
        """
        Calcula escalar de curvatura |R| (norma de Frobenius)
        
        Args:
            R: Tensor de Riemann (3, 3, 3, 3)
        
        Returns:
            |R| = sqrt(Σ R^a_bcd R^a_bcd)
        """
        return float(np.linalg.norm(R))
    
    def is_stable(self, R: np.ndarray) -> bool:
        """
        Verifica se campo emocional é estável
        
        |R| < ε_stab ⇒ estável
        
        Args:
            R: Tensor de Riemann
        
        Returns:
            True se estável
        """
        curvature_scalar = self.compute_curvature_scalar(R)
        return curvature_scalar < self.epsilon_stab
    
    def analyze_emotional_trajectory(
        self,
        emotions_history: List[np.ndarray]
    ) -> Dict[str, any]:
        """
        Análise completa da trajetória emocional
        
        Args:
            emotions_history: Histórico de vetores (3,) emocionais
        
        Returns:
            Dict com análise completa
        """
        if len(emotions_history) < 3:
            return {
                'stable': True,
                'curvature': 0.0,
                'warning': 'Insufficient history'
            }
        
        # Calcular Christoffel
        gamma = self.compute_christoffel_symbols(emotions_history)
        
        # Calcular Riemann
        R = self.compute_riemann_tensor(gamma)
        
        # Calcular curvatura escalar
        curvature = self.compute_curvature_scalar(R)
        
        # Verificar estabilidade
        stable = self.is_stable(R)
        
        return {
            'stable': stable,
            'curvature': curvature,
            'threshold': self.epsilon_stab,
            'christoffel_norm': float(np.linalg.norm(gamma.gamma)),
            'recommendation': 'stable' if stable else 'high_emotional_volatility'
        }


# Singleton
_tensor_curvature: Optional[AuroraTensorCurvature] = None

def get_tensor_curvature() -> AuroraTensorCurvature:
    """Get singleton instance"""
    global _tensor_curvature
    if _tensor_curvature is None:
        _tensor_curvature = AuroraTensorCurvature()
    return _tensor_curvature
