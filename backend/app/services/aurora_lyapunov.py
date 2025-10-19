"""
Aurora Função de Lyapunov - Estabilidade Global
Whitepaper Cap. 5

Implementa:
V(E) = (1/2) E^T P E

dV/dt = E^T P Ė = -E^T Q E ≤ 0

Teorema: Se Q é definida positiva e A = -Q, então o sistema afetivo
é globalmente estável (convergência assintótica para equilíbrio).

Prova:
dV/dt = E^T P (-QE) = -E^T Q E = -||E||²_Q ≤ 0

Logo V é função de Lyapunov e equilíbrio é globalmente assintótico. ∎
"""

import numpy as np
from typing import Tuple, Dict, Optional
from dataclasses import dataclass


@dataclass
class LyapunovAnalysis:
    """Resultado da análise de estabilidade de Lyapunov"""
    V: float  # Valor da função de Lyapunov
    dV_dt: float  # Derivada temporal
    is_stable: bool  # Se V é função de Lyapunov válida
    is_asymptotically_stable: bool  # Se dV/dt < 0
    distance_to_equilibrium: float  # ||E - E*||


class AuroraLyapunov:
    """
    Análise de Estabilidade usando Função de Lyapunov
    
    Garante que sistema afetivo converge para equilíbrio estável.
    """
    
    def __init__(
        self,
        P: Optional[np.ndarray] = None,
        Q: Optional[np.ndarray] = None,
        equilibrium: Optional[np.ndarray] = None
    ):
        """
        Args:
            P: Matriz P simétrica definida positiva (3x3)
            Q: Matriz Q simétrica definida positiva (3x3)
            equilibrium: Ponto de equilíbrio E* (3,)
        """
        # Matriz P (padrão: identidade)
        self.P = P if P is not None else np.eye(3)
        
        # Matriz Q (padrão: identidade)
        self.Q = Q if Q is not None else np.eye(3)
        
        # Equilíbrio (padrão: estado neutro)
        self.equilibrium = equilibrium if equilibrium is not None else \
            np.array([1.0, 1.0, 1.0]) / np.sqrt(3)
        
        # Verificar que P e Q são simétricas e definidas positivas
        assert self._is_positive_definite(self.P), "P must be positive definite"
        assert self._is_positive_definite(self.Q), "Q must be positive definite"
    
    def _is_positive_definite(self, M: np.ndarray) -> bool:
        """Verifica se matriz é definida positiva"""
        if M.shape != (3, 3):
            return False
        
        try:
            # Tentar decomposição de Cholesky
            np.linalg.cholesky(M)
            return True
        except np.linalg.LinAlgError:
            return False
    
    def compute_V(self, E: np.ndarray) -> float:
        """
        Calcula função de Lyapunov
        
        V(E) = (1/2) (E - E*)^T P (E - E*)
        
        Args:
            E: Estado afetivo atual (3,)
        
        Returns:
            V(E) ≥ 0
        """
        diff = E - self.equilibrium
        V = 0.5 * diff.T @ self.P @ diff
        return float(V)
    
    def compute_dV_dt(
        self,
        E: np.ndarray,
        E_dot: np.ndarray
    ) -> float:
        """
        Calcula derivada temporal da função de Lyapunov
        
        dV/dt = (E - E*)^T P Ė
        
        Para estabilidade assintótica: dV/dt < 0
        
        Args:
            E: Estado atual (3,)
            E_dot: Derivada temporal Ė (3,)
        
        Returns:
            dV/dt
        """
        diff = E - self.equilibrium
        dV_dt = diff.T @ self.P @ E_dot
        return float(dV_dt)
    
    def is_lyapunov_stable(self, E: np.ndarray, E_dot: np.ndarray) -> bool:
        """
        Verifica se sistema é estável no sentido de Lyapunov
        
        Condições:
        1. V(E) > 0 para E ≠ E*
        2. V(E*) = 0
        3. dV/dt ≤ 0
        
        Args:
            E: Estado atual
            E_dot: Derivada temporal
        
        Returns:
            True se estável
        """
        V = self.compute_V(E)
        dV_dt = self.compute_dV_dt(E, E_dot)
        
        # V deve ser positiva (exceto no equilíbrio)
        if V < -1e-6:
            return False
        
        # dV/dt deve ser não-positiva
        if dV_dt > 1e-6:
            return False
        
        return True
    
    def is_asymptotically_stable(
        self,
        E: np.ndarray,
        E_dot: np.ndarray
    ) -> bool:
        """
        Verifica estabilidade assintótica (convergência garantida)
        
        Requer dV/dt < 0 (estritamente negativa)
        
        Args:
            E: Estado atual
            E_dot: Derivada temporal
        
        Returns:
            True se assintoticamente estável
        """
        if not self.is_lyapunov_stable(E, E_dot):
            return False
        
        dV_dt = self.compute_dV_dt(E, E_dot)
        
        # Deve ser estritamente negativa
        return dV_dt < -1e-6
    
    def compute_rate_of_convergence(
        self,
        E: np.ndarray,
        E_dot: np.ndarray
    ) -> float:
        """
        Calcula taxa de convergência ao equilíbrio
        
        λ = -dV/dt / V
        
        λ > 0 ⇒ convergência exponencial com taxa λ
        
        Args:
            E: Estado atual
            E_dot: Derivada temporal
        
        Returns:
            Taxa de convergência λ
        """
        V = self.compute_V(E)
        dV_dt = self.compute_dV_dt(E, E_dot)
        
        if V < 1e-6:
            return 0.0
        
        return float(-dV_dt / V)
    
    def analyze(
        self,
        E: np.ndarray,
        E_dot: np.ndarray
    ) -> LyapunovAnalysis:
        """
        Análise completa de estabilidade
        
        Args:
            E: Estado afetivo atual (3,)
            E_dot: Derivada temporal Ė (3,)
        
        Returns:
            Análise completa
        """
        V = self.compute_V(E)
        dV_dt = self.compute_dV_dt(E, E_dot)
        
        is_stable = self.is_lyapunov_stable(E, E_dot)
        is_asymptotically_stable = self.is_asymptotically_stable(E, E_dot)
        
        distance = float(np.linalg.norm(E - self.equilibrium))
        
        return LyapunovAnalysis(
            V=V,
            dV_dt=dV_dt,
            is_stable=is_stable,
            is_asymptotically_stable=is_asymptotically_stable,
            distance_to_equilibrium=distance
        )
    
    def estimate_E_dot(
        self,
        E_prev: np.ndarray,
        E_current: np.ndarray,
        dt: float = 1.0
    ) -> np.ndarray:
        """
        Estima derivada temporal por diferenças finitas
        
        Ė ≈ (E_t - E_{t-1}) / Δt
        
        Args:
            E_prev: Estado anterior
            E_current: Estado atual
            dt: Intervalo de tempo
        
        Returns:
            Estimativa de Ė
        """
        return (E_current - E_prev) / dt
    
    def predict_convergence_time(
        self,
        E: np.ndarray,
        E_dot: np.ndarray,
        epsilon: float = 0.01
    ) -> Optional[float]:
        """
        Prediz tempo até convergência
        
        Assume decaimento exponencial: ||E(t) - E*|| ≈ ||E(0) - E*|| e^(-λt)
        
        Resolve: ||E(0) - E*|| e^(-λt) = ε
        ⇒ t = ln(||E(0) - E*|| / ε) / λ
        
        Args:
            E: Estado atual
            E_dot: Derivada
            epsilon: Threshold de convergência
        
        Returns:
            Tempo estimado (ou None se divergente)
        """
        lambda_rate = self.compute_rate_of_convergence(E, E_dot)
        
        if lambda_rate <= 0:
            return None  # Divergente ou estacionário
        
        distance = np.linalg.norm(E - self.equilibrium)
        
        if distance < epsilon:
            return 0.0  # Já convergiu
        
        t_conv = np.log(distance / epsilon) / lambda_rate
        return float(t_conv)


# Singleton
_lyapunov: Optional[AuroraLyapunov] = None

def get_lyapunov() -> AuroraLyapunov:
    """Get singleton instance"""
    global _lyapunov
    if _lyapunov is None:
        _lyapunov = AuroraLyapunov()
    return _lyapunov
