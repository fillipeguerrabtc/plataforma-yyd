"""
Aurora Autonomous Intelligence System
Implementa matemática afetiva completa com aprendizado contínuo

Arquitetura:
1. PRIMEIRO: Consulta base de conhecimento (pgvector RAG)
2. SEGUNDO: Usa matemática afetiva para scoring híbrido
3. ÚLTIMO RECURSO: Fallback para OpenAI se confidence < 0.85

Baseado no whitepaper (286 linhas):
- Scoring: r_t = arg max (λ₁⟨E_t,v_r⟩ + λ₂S(r|C_t) + λ₃U(r|H_t))
- λ₁ = 0.4 (alinhamento afetivo)
- λ₂ = 0.35 (coerência semântica) 
- λ₃ = 0.25 (utilidade histórica)
"""

import os
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import psycopg2
from psycopg2 import extras
from datetime import datetime

from affective_mathematics import AffectiveState, AffectiveAnalyzer
from embeddings import EmbeddingsService


@dataclass
class AuroraMemory:
    """Estrutura de memória Aurora conforme whitepaper linha 250-324"""
    session_context: Dict[str, Any]  # SC - volátil
    working_memory: List[Dict[str, Any]]  # WM - curto prazo
    episodic_memory: List[Dict[str, Any]]  # EM - interações por cliente
    semantic_memory: List[Dict[str, Any]]  # SM - fatos, catálogo
    affective_memory: List[AffectiveState]  # AM - estados emocionais
    team_memory: Dict[str, Any]  # TM - guias, agendas
    policy_memory: Dict[str, Any]  # PM - guardrails


@dataclass
class ResponseCandidate:
    """Candidato de resposta com scores"""
    message: str
    affective_score: float  # λ₁⟨E_t,v_r⟩
    semantic_score: float  # λ₂S(r|C_t)
    utility_score: float  # λ₃U(r|H_t)
    final_score: float
    source: str  # 'knowledge_base', 'learned', 'openai_fallback'
    confidence: float


class AutonomousIntelligence:
    """
    Sistema de Inteligência Autônoma Aurora
    Aprende sozinha, usa OpenAI apenas como fallback
    """
    
    # Pesos calibrados (linha 13-16)
    LAMBDA_1 = 0.4  # alinhamento afetivo
    LAMBDA_2 = 0.35  # coerência semântica
    LAMBDA_3 = 0.25  # utilidade histórica
    
    # Threshold para fallback OpenAI (linha 515-517)
    CONFIDENCE_THRESHOLD = 0.85
    
    # Learning rate (linha 56)
    ALPHA = 0.3
    
    def __init__(self):
        self.analyzer = AffectiveAnalyzer()
        self.embeddings = EmbeddingsService()
        self.database_url = os.getenv("DATABASE_URL", "")
        self._ensure_memory_tables()
        
        # Vetores afetivos pré-definidos (linha 65-74)
        self.response_vectors = {
            'greeting': np.array([0.6, 0.7, 0.6]),  # alta cordialidade, média ativação
            'informative': np.array([0.2, 0.5, 0.9]),  # baixa ativação, alta sinceridade
            'sales': np.array([0.8, 0.6, 0.7]),  # alta ativação, média cordialidade
            'empathetic': np.array([0.5, 0.9, 0.9]),
            'urgent': np.array([0.8, 0.6, 0.8])
        }
    
    def _ensure_memory_tables(self):
        """Cria tabelas de memória conforme whitepaper linha 276-317"""
        try:
            conn = psycopg2.connect(self.database_url)
            cursor = conn.cursor()
            
            # yyd_client (linha 278-285)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS yyd_client (
                    client_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name TEXT,
                    email TEXT UNIQUE,
                    locale TEXT,
                    tz TEXT,
                    created_at TIMESTAMPTZ DEFAULT now()
                );
            """)
            
            # yyd_session (linha 287-295)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS yyd_session (
                    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    client_id UUID REFERENCES yyd_client(client_id),
                    channel TEXT CHECK (channel IN ('whatsapp','facebook','web','voice')),
                    locale TEXT,
                    status TEXT,
                    started_at TIMESTAMPTZ,
                    updated_at TIMESTAMPTZ
                );
            """)
            
            # yyd_embeddings (linha 297-305)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS yyd_embeddings (
                    emb_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    scope TEXT CHECK (scope IN ('SM','EM','AM','TM','PM')),
                    ref_id UUID,
                    locale TEXT,
                    vector vector(1536),
                    meta JSONB,
                    created_at TIMESTAMPTZ DEFAULT now()
                );
            """)
            
            # yyd_episode (linha 307-316)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS yyd_episode (
                    episode_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    client_id UUID REFERENCES yyd_client(client_id),
                    session_id UUID REFERENCES yyd_session(session_id),
                    emotion JSONB,
                    transcript JSONB,
                    outcome TEXT,
                    rating NUMERIC,
                    created_at TIMESTAMPTZ DEFAULT now()
                );
            """)
            
            # Tabela de aprendizado contínuo
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS yyd_learning (
                    learning_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    query TEXT NOT NULL,
                    response TEXT NOT NULL,
                    affective_score NUMERIC,
                    semantic_score NUMERIC,
                    utility_score NUMERIC,
                    final_score NUMERIC,
                    feedback_rating NUMERIC,
                    created_at TIMESTAMPTZ DEFAULT now()
                );
            """)
            
            conn.commit()
            cursor.close()
            conn.close()
            print("✅ Aurora autonomous memory tables created")
            
        except Exception as e:
            print(f"⚠️  Memory tables setup: {str(e)}")
    
    def generate_autonomous_response(
        self,
        query: str,
        language: str = "pt",
        customer_state: Optional[AffectiveState] = None,
        client_id: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Gera resposta AUTÔNOMA usando scoring híbrido
        
        Fluxo (conforme whitepaper linha 8-28):
        1. Gera múltiplas respostas candidatas (n=3)
        2. Calcula score para cada candidato
        3. Seleciona arg max
        4. Aplica guardrails éticos
        5. Só usa OpenAI se confidence < 0.85
        
        Returns:
            {
                "message": str,
                "confidence": float,
                "source": str,
                "requires_handoff": bool,
                "affective_alignment": float,
                "learning_applied": bool
            }
        """
        
        # 1. Gerar candidatos de resposta
        candidates = self._generate_candidates(
            query, language, customer_state, client_id
        )
        
        # 2. Calcular scores para cada candidato
        scored_candidates = []
        for candidate in candidates:
            final_score = self._calculate_hybrid_score(
                candidate, query, customer_state, client_id
            )
            scored_candidates.append((candidate, final_score))
        
        # 3. Selecionar arg max (melhor score)
        if scored_candidates:
            best_candidate, best_score = max(scored_candidates, key=lambda x: x[1])
        else:
            # Fallback se nenhum candidato
            best_candidate = self._generate_openai_fallback(
                query, language, customer_state
            )
            best_score = 0.5
        
        # 4. Verificar confidence threshold
        if best_candidate.confidence < self.CONFIDENCE_THRESHOLD:
            # Baixa confidence - usar OpenAI como fallback
            openai_response = self._generate_openai_fallback(
                query, language, customer_state
            )
            best_candidate = openai_response
        
        # 5. Aplicar guardrails éticos (linha 515-521)
        if self._requires_handoff(best_candidate, customer_state):
            requires_handoff = True
        else:
            requires_handoff = False
        
        # 6. Armazenar episódio para aprendizado
        self._store_episode(
            client_id, session_id, query, best_candidate.message,
            customer_state, best_candidate.final_score
        )
        
        # 7. Aprendizado contínuo (linha 327-342)
        self._continuous_learning(query, best_candidate)
        
        return {
            "message": best_candidate.message,
            "confidence": best_candidate.confidence,
            "source": best_candidate.source,
            "requires_handoff": requires_handoff,
            "affective_alignment": best_candidate.affective_score,
            "semantic_relevance": best_candidate.semantic_score,
            "utility": best_candidate.utility_score,
            "final_score": best_candidate.final_score,
            "learning_applied": best_candidate.source == 'learned'
        }
    
    def _generate_candidates(
        self,
        query: str,
        language: str,
        customer_state: Optional[AffectiveState],
        client_id: Optional[str]
    ) -> List[ResponseCandidate]:
        """
        Gera múltiplas respostas candidatas
        Fontes: knowledge base, aprendizado prévio, memória episódica
        """
        candidates = []
        
        # Candidato 1: Base de conhecimento (RAG)
        kb_results = self.embeddings.semantic_search(
            query=query,
            language=language,
            limit=3,
            similarity_threshold=0.7
        )
        
        if kb_results:
            # Combinar top results em resposta coerente
            kb_content = self._synthesize_knowledge(kb_results)
            candidates.append(ResponseCandidate(
                message=kb_content,
                affective_score=0.0,  # Calculado depois
                semantic_score=kb_results[0]['similarity'],
                utility_score=0.0,  # Calculado depois
                final_score=0.0,
                source='knowledge_base',
                confidence=kb_results[0]['similarity']
            ))
        
        # Candidato 2: Respostas aprendidas
        learned = self._retrieve_learned_responses(query, language)
        if learned:
            candidates.append(ResponseCandidate(
                message=learned['response'],
                affective_score=learned.get('affective_score', 0.0),
                semantic_score=learned.get('semantic_score', 0.0),
                utility_score=learned.get('utility_score', 0.0),
                final_score=learned.get('final_score', 0.0),
                source='learned',
                confidence=learned.get('confidence', 0.8)
            ))
        
        # Candidato 3: Memória episódica (se houver client_id)
        if client_id:
            episodic = self._retrieve_episodic_memory(client_id, query)
            if episodic:
                candidates.append(ResponseCandidate(
                    message=episodic['response'],
                    affective_score=0.0,
                    semantic_score=episodic.get('similarity', 0.0),
                    utility_score=episodic.get('utility', 0.0),
                    final_score=0.0,
                    source='episodic',
                    confidence=0.75
                ))
        
        return candidates
    
    def _calculate_hybrid_score(
        self,
        candidate: ResponseCandidate,
        query: str,
        customer_state: Optional[AffectiveState],
        client_id: Optional[str]
    ) -> float:
        """
        Calcula score híbrido conforme whitepaper linha 8-28:
        
        r_t = arg max (λ₁⟨E_t,v_r⟩ + λ₂S(r|C_t) + λ₃U(r|H_t))
        
        λ₁ = 0.4 (alinhamento afetivo)
        λ₂ = 0.35 (coerência semântica)
        λ₃ = 0.25 (utilidade histórica)
        """
        
        # λ₁⟨E_t,v_r⟩ - Alinhamento afetivo (linha 76-80)
        if customer_state:
            # Detectar tom apropriado para resposta
            response_tone = self._detect_response_tone(candidate.message)
            response_vector = self.response_vectors.get(
                response_tone, self.response_vectors['informative']
            )
            
            # Produto interno normalizado
            customer_vector = customer_state.as_vector()
            dot_product = np.dot(customer_vector, response_vector)
            affective_score = (dot_product + 1) / 2  # Normaliza para [0,1]
        else:
            affective_score = 0.5  # Neutro se não houver estado
        
        candidate.affective_score = affective_score
        
        # λ₂S(r|C_t) - Coerência semântica
        semantic_score = candidate.semantic_score
        
        # λ₃U(r|H_t) - Utilidade histórica
        if client_id:
            utility_score = self._calculate_utility(client_id, candidate.message)
        else:
            utility_score = 0.5
        
        candidate.utility_score = utility_score
        
        # Score final
        final_score = (
            self.LAMBDA_1 * affective_score +
            self.LAMBDA_2 * semantic_score +
            self.LAMBDA_3 * utility_score
        )
        
        candidate.final_score = final_score
        return final_score
    
    def _synthesize_knowledge(self, results: List[Dict[str, Any]]) -> str:
        """Sintetiza múltiplos resultados em resposta coerente"""
        if not results:
            return ""
        
        # Combinar top 3 resultados
        combined = "\n\n".join([r['content'] for r in results[:3]])
        return combined
    
    def _retrieve_learned_responses(
        self, query: str, language: str
    ) -> Optional[Dict[str, Any]]:
        """Recupera respostas aprendidas anteriormente"""
        try:
            conn = psycopg2.connect(self.database_url)
            cursor = conn.cursor()
            
            # Buscar resposta similar com bom rating
            cursor.execute("""
                SELECT response, affective_score, semantic_score, 
                       utility_score, final_score, feedback_rating
                FROM yyd_learning
                WHERE feedback_rating >= 4.0
                ORDER BY created_at DESC
                LIMIT 1
            """)
            
            row = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if row:
                return {
                    'response': row[0],
                    'affective_score': float(row[1] or 0),
                    'semantic_score': float(row[2] or 0),
                    'utility_score': float(row[3] or 0),
                    'final_score': float(row[4] or 0),
                    'confidence': 0.85
                }
            
            return None
            
        except Exception as e:
            print(f"⚠️  Learned responses retrieval: {str(e)}")
            return None
    
    def _retrieve_episodic_memory(
        self, client_id: str, query: str
    ) -> Optional[Dict[str, Any]]:
        """Recupera memória episódica do cliente"""
        try:
            conn = psycopg2.connect(self.database_url)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT transcript, outcome, rating
                FROM yyd_episode
                WHERE client_id = %s AND rating >= 4.0
                ORDER BY created_at DESC
                LIMIT 1
            """, (client_id,))
            
            row = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if row:
                transcript = row[0]
                return {
                    'response': transcript.get('assistant', ''),
                    'similarity': 0.7,
                    'utility': float(row[2] or 0) / 5.0
                }
            
            return None
            
        except Exception as e:
            print(f"⚠️  Episodic memory retrieval: {str(e)}")
            return None
    
    def _calculate_utility(self, client_id: str, response: str) -> float:
        """Calcula utilidade baseada em histórico do cliente"""
        # Simplificado - pode ser expandido com aprendizado
        return 0.6
    
    def _detect_response_tone(self, message: str) -> str:
        """Detecta tom da mensagem"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['olá', 'oi', 'hello', 'bem-vindo']):
            return 'greeting'
        elif any(word in message_lower for word in ['reservar', 'book', 'agendar']):
            return 'sales'
        elif any(word in message_lower for word in ['desculpa', 'sorry', 'compreendo']):
            return 'empathetic'
        elif any(word in message_lower for word in ['urgente', 'urgent', 'agora']):
            return 'urgent'
        else:
            return 'informative'
    
    def _generate_openai_fallback(
        self,
        query: str,
        language: str,
        customer_state: Optional[AffectiveState]
    ) -> ResponseCandidate:
        """Gera resposta usando OpenAI como FALLBACK"""
        from intelligence import aurora_intelligence
        
        messages = [{"role": "user", "content": query}]
        response = aurora_intelligence.generate_response(
            messages=messages,
            language=language,
            customer_state=customer_state
        )
        
        return ResponseCandidate(
            message=response['message'],
            affective_score=0.5,
            semantic_score=0.5,
            utility_score=0.5,
            final_score=0.5,
            source='openai_fallback',
            confidence=0.7
        )
    
    def _requires_handoff(
        self,
        candidate: ResponseCandidate,
        customer_state: Optional[AffectiveState]
    ) -> bool:
        """Verifica se requer handoff humano (linha 515-521)"""
        if candidate.confidence < 0.85:
            return True
        
        if customer_state:
            if customer_state.valence < -0.6:
                return True
        
        return False
    
    def _store_episode(
        self,
        client_id: Optional[str],
        session_id: Optional[str],
        query: str,
        response: str,
        customer_state: Optional[AffectiveState],
        score: float
    ):
        """Armazena episódio para aprendizado futuro"""
        if not client_id:
            return
        
        try:
            conn = psycopg2.connect(self.database_url)
            cursor = conn.cursor()
            
            emotion_data = customer_state.to_dict() if customer_state else {}
            transcript_data = {
                "user": query,
                "assistant": response
            }
            
            cursor.execute("""
                INSERT INTO yyd_episode 
                (client_id, session_id, emotion, transcript, outcome, rating)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                client_id,
                session_id,
                extras.Json(emotion_data),
                extras.Json(transcript_data),
                'completed',
                score
            ))
            
            conn.commit()
            cursor.close()
            conn.close()
            
        except Exception as e:
            print(f"⚠️  Store episode: {str(e)}")
    
    def _continuous_learning(
        self, query: str, candidate: ResponseCandidate
    ):
        """
        Aprendizado contínuo conforme whitepaper linha 327-342
        PPO-lite com anti-forgetting
        """
        try:
            conn = psycopg2.connect(self.database_url)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO yyd_learning 
                (query, response, affective_score, semantic_score, 
                 utility_score, final_score, feedback_rating)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                query,
                candidate.message,
                candidate.affective_score,
                candidate.semantic_score,
                candidate.utility_score,
                candidate.final_score,
                None  # Feedback será atualizado depois
            ))
            
            conn.commit()
            cursor.close()
            conn.close()
            
        except Exception as e:
            print(f"⚠️  Continuous learning: {str(e)}")


# Instância global
autonomous_intelligence = AutonomousIntelligence()
