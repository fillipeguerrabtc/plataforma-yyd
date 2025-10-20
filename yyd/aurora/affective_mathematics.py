"""
Affective Mathematics in ℝ³ - Emotion Analysis Engine
Based on Valence-Arousal-Dominance (VAD) model

Mathematical Foundation:
- Affective state: s = (v, a, d) ∈ ℝ³
- Valence (v): Pleasantness/unpleasantness (-1 to 1)
- Arousal (a): Activation level (0 to 1)
- Dominance (d): Control/power (0 to 1)

Distance metric: d(s₁, s₂) = ||s₁ - s₂|| = √[(v₁-v₂)² + (a₁-a₂)² + (d₁-d₂)²]
"""

import numpy as np
from typing import Dict, Tuple, List, Optional
from dataclasses import dataclass
import re

@dataclass
class AffectiveState:
    """Represents an emotional state in ℝ³"""
    valence: float  # -1 to 1 (negative to positive)
    arousal: float  # 0 to 1 (calm to excited)
    dominance: float  # 0 to 1 (submissive to dominant)
    confidence: float = 1.0  # 0 to 1 (certainty of measurement)
    
    def as_vector(self) -> np.ndarray:
        """Return state as numpy vector"""
        return np.array([self.valence, self.arousal, self.dominance])
    
    def distance_to(self, other: 'AffectiveState') -> float:
        """Calculate Euclidean distance to another state"""
        return float(np.linalg.norm(self.as_vector() - other.as_vector()))
    
    def magnitude(self) -> float:
        """Calculate magnitude of affective vector"""
        return float(np.linalg.norm(self.as_vector()))
    
    def to_dict(self) -> Dict[str, float]:
        """Convert to dictionary for API responses"""
        return {
            "valence": float(self.valence),
            "arousal": float(self.arousal),
            "dominance": float(self.dominance),
            "confidence": float(self.confidence),
        }

# Emotion lexicon with VAD values (simplified - expand with full lexicon)
EMOTION_LEXICON = {
    # Positive emotions
    "happy": (0.8, 0.6, 0.7),
    "joy": (0.9, 0.8, 0.8),
    "excited": (0.7, 0.9, 0.6),
    "calm": (0.5, 0.2, 0.6),
    "pleased": (0.6, 0.4, 0.5),
    "satisfied": (0.7, 0.3, 0.6),
    "love": (0.9, 0.7, 0.5),
    "grateful": (0.8, 0.5, 0.4),
    
    # Negative emotions
    "sad": (-0.7, 0.3, 0.3),
    "angry": (-0.6, 0.8, 0.7),
    "fear": (-0.8, 0.7, 0.2),
    "anxious": (-0.5, 0.7, 0.3),
    "frustrated": (-0.6, 0.6, 0.4),
    "disappointed": (-0.6, 0.4, 0.3),
    "worried": (-0.5, 0.6, 0.3),
    "confused": (-0.3, 0.5, 0.2),
    
    # Neutral/mixed
    "surprised": (0.0, 0.8, 0.4),
    "curious": (0.3, 0.6, 0.5),
    "interested": (0.4, 0.6, 0.5),
    
    # Portuguese
    "feliz": (0.8, 0.6, 0.7),
    "alegre": (0.8, 0.7, 0.7),
    "triste": (-0.7, 0.3, 0.3),
    "bravo": (-0.6, 0.8, 0.7),
    "animado": (0.7, 0.9, 0.6),
    "preocupado": (-0.5, 0.6, 0.3),
    "calmo": (0.5, 0.2, 0.6),
    
    # Spanish
    "contento": (0.7, 0.5, 0.6),
    "emocionado": (0.7, 0.9, 0.6),
    "enfadado": (-0.6, 0.7, 0.6),
    "tranquilo": (0.5, 0.2, 0.6),
}

# Sentiment modifiers
INTENSIFIERS = {
    "very": 1.3,
    "extremely": 1.5,
    "really": 1.2,
    "quite": 1.1,
    "somewhat": 0.8,
    "slightly": 0.7,
    "barely": 0.5,
    "muito": 1.3,
    "super": 1.4,
    "bastante": 1.1,
    "poco": 0.8,
    "mucho": 1.3,
}

NEGATIONS = ["not", "no", "never", "neither", "nor", "não", "nunca", "jamais", "tampoco"]

class AffectiveAnalyzer:
    """Analyzes text and calculates affective state in ℝ³"""
    
    def __init__(self):
        self.lexicon = EMOTION_LEXICON
        self.intensifiers = INTENSIFIERS
        self.negations = NEGATIONS
    
    def analyze_text(self, text: str, language: str = "en") -> AffectiveState:
        """
        Analyze text and return affective state
        
        Algorithm:
        1. Tokenize and normalize text
        2. Identify emotion words from lexicon
        3. Apply intensifiers and negations
        4. Aggregate to single VAD vector
        5. Calculate confidence based on signal strength
        """
        text_lower = text.lower()
        words = re.findall(r'\b\w+\b', text_lower)
        
        if not words:
            return AffectiveState(0.0, 0.0, 0.0, 0.0)
        
        # Find emotion-bearing words
        vad_vectors = []
        confidences = []
        
        for i, word in enumerate(words):
            if word in self.lexicon:
                v, a, d = self.lexicon[word]
                
                # Check for intensifier before word
                intensifier = 1.0
                if i > 0 and words[i-1] in self.intensifiers:
                    intensifier = self.intensifiers[words[i-1]]
                
                # Check for negation before word
                negated = False
                if i > 0 and words[i-1] in self.negations:
                    negated = True
                if i > 1 and words[i-2] in self.negations:
                    negated = True
                
                # Apply negation (flip valence)
                if negated:
                    v = -v
                
                # Apply intensifier
                v = np.clip(v * intensifier, -1, 1)
                a = np.clip(a * intensifier, 0, 1)
                d = np.clip(d * intensifier, 0, 1)
                
                vad_vectors.append((v, a, d))
                confidences.append(0.8)  # Base confidence for lexicon match
        
        # No emotional content found - return neutral with low confidence
        if not vad_vectors:
            return self._estimate_baseline_state(text, language)
        
        # Aggregate VAD vectors (weighted average)
        v_avg = np.mean([v for v, a, d in vad_vectors])
        a_avg = np.mean([a for v, a, d in vad_vectors])
        d_avg = np.mean([d for v, a, d in vad_vectors])
        
        # Confidence based on signal strength and coverage
        coverage = len(vad_vectors) / len(words)
        confidence = np.mean(confidences) * min(coverage * 10, 1.0)
        
        return AffectiveState(
            valence=float(v_avg),
            arousal=float(a_avg),
            dominance=float(d_avg),
            confidence=float(confidence)
        )
    
    def _estimate_baseline_state(self, text: str, language: str) -> AffectiveState:
        """Estimate baseline state from structural features"""
        # Punctuation analysis
        exclamations = text.count('!') + text.count('¡')
        questions = text.count('?') + text.count('¿')
        
        # Baseline arousal from punctuation
        arousal = min(0.3 + (exclamations * 0.15), 1.0)
        
        # Question marks suggest uncertainty (lower dominance)
        dominance = max(0.5 - (questions * 0.1), 0.2)
        
        return AffectiveState(
            valence=0.0,  # Neutral
            arousal=arousal,
            dominance=dominance,
            confidence=0.3  # Low confidence for baseline
        )
    
    def classify_emotion(self, state: AffectiveState) -> str:
        """
        Map VAD coordinates to emotion category
        Using distance-based classification in ℝ³
        """
        min_distance = float('inf')
        closest_emotion = "neutral"
        
        state_vector = state.as_vector()
        
        for emotion, (v, a, d) in self.lexicon.items():
            emotion_vector = np.array([v, a, d])
            distance = float(np.linalg.norm(state_vector - emotion_vector))
            
            if distance < min_distance:
                min_distance = distance
                closest_emotion = emotion
        
        return closest_emotion
    
    def calculate_emotional_trajectory(
        self, states: List[AffectiveState]
    ) -> Dict[str, float]:
        """
        Calculate emotional trajectory metrics
        Useful for conversation flow analysis
        """
        if len(states) < 2:
            return {
                "total_distance": 0.0,
                "average_velocity": 0.0,
                "volatility": 0.0,
                "valence_trend": 0.0,
            }
        
        # Calculate distances between consecutive states
        distances = [
            states[i].distance_to(states[i+1])
            for i in range(len(states) - 1)
        ]
        
        # Valence trend (linear regression slope)
        valences = [s.valence for s in states]
        if len(valences) > 1:
            x = np.arange(len(valences))
            valence_trend = np.polyfit(x, valences, 1)[0]
        else:
            valence_trend = 0.0
        
        return {
            "total_distance": float(np.sum(distances)),
            "average_velocity": float(np.mean(distances)),
            "volatility": float(np.std(distances)),
            "valence_trend": float(valence_trend),
        }

# Predefined emotional targets for Aurora's responses
AURORA_TARGET_STATES = {
    "welcoming": AffectiveState(0.7, 0.5, 0.6, 1.0),  # Warm, moderate energy
    "enthusiastic": AffectiveState(0.8, 0.8, 0.7, 1.0),  # Excited about tours
    "empathetic": AffectiveState(0.5, 0.4, 0.5, 1.0),  # Understanding, calm
    "professional": AffectiveState(0.4, 0.3, 0.7, 1.0),  # Composed, confident
}

def select_aurora_response_tone(customer_state: AffectiveState) -> str:
    """
    Select appropriate Aurora response tone based on customer's affective state
    
    Decision matrix:
    - Negative valence → empathetic
    - High arousal + positive → enthusiastic
    - Low arousal → professional
    - Default → welcoming
    """
    if customer_state.valence < -0.3:
        return "empathetic"
    elif customer_state.arousal > 0.7 and customer_state.valence > 0.5:
        return "enthusiastic"
    elif customer_state.arousal < 0.4:
        return "professional"
    else:
        return "welcoming"
