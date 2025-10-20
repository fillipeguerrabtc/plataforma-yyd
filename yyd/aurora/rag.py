"""
Aurora RAG System with pgvector
================================

Production-ready Retrieval-Augmented Generation:
- Semantic search using pgvector cosine similarity
- Multi-language support (EN/PT/ES)
- Hybrid scoring (affective + semantic + utility)
- Confidence-based ChatGPT fallback
"""

import os
import asyncio
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
import openai
from memory import SemanticMemory, DatabaseConnection

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY


@dataclass
class SearchResult:
    """RAG search result with metadata"""
    id: str
    content: str
    similarity: float
    confidence: float
    category: str
    metadata: Dict


@dataclass
class HybridScore:
    """Hybrid scoring components (λ₁=0.4, λ₂=0.35, λ₃=0.25)"""
    affective: float  # λ₁ = 0.4
    semantic: float   # λ₂ = 0.35
    utility: float    # λ₃ = 0.25
    total: float


class EmbeddingGenerator:
    """Manages OpenAI embeddings generation"""
    
    @staticmethod
    async def generate(text: str, model: str = "text-embedding-3-small") -> Optional[List[float]]:
        """Generate 1536D embedding using OpenAI"""
        if not OPENAI_API_KEY:
            print("⚠️ OPENAI_API_KEY not set - embeddings disabled")
            return None
        
        try:
            response = await asyncio.to_thread(
                openai.embeddings.create,
                model=model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"❌ Embedding generation error: {str(e)}")
            return None
    
    @staticmethod
    async def batch_generate(texts: List[str], model: str = "text-embedding-3-small") -> List[Optional[List[float]]]:
        """Generate embeddings for multiple texts"""
        if not OPENAI_API_KEY:
            return [None] * len(texts)
        
        try:
            response = await asyncio.to_thread(
                openai.embeddings.create,
                model=model,
                input=texts
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            print(f"❌ Batch embedding error: {str(e)}")
            return [None] * len(texts)


class RAGRetriever:
    """RAG retriever with semantic search"""
    
    def __init__(self):
        self.embedding_generator = EmbeddingGenerator()
        self.semantic_memory = SemanticMemory()
    
    async def search(self, query: str, locale: str = "en", category: Optional[str] = None, 
                    top_k: int = 5) -> List[SearchResult]:
        """Perform semantic search with pgvector OR keyword fallback"""
        # Generate query embedding
        query_embedding = await self.embedding_generator.generate(query)
        if not query_embedding:
            print("⚠️ Embeddings unavailable - using keyword search fallback")
            return self._keyword_fallback_search(query, locale, category, top_k)
        
        # Perform vector similarity search
        results = self.semantic_memory.semantic_search(
            query_embedding=query_embedding,
            locale=locale,
            category=category,
            limit=top_k
        )
        
        # Convert to SearchResult objects
        search_results = []
        content_fields = {
            "en": "contentEn",
            "pt": "contentPt",
            "es": "contentEs"
        }
        content_field = content_fields.get(locale.lower(), "contentEn")
        
        for row in results:
            search_results.append(SearchResult(
                id=row['id'],
                content=row.get(content_field, row.get('contentEn', '')),
                similarity=float(row['similarity']),
                confidence=float(row.get('confidence', 1.0)),
                category=row['category'],
                metadata=row.get('metadata', {})
            ))
        
        return search_results
    
    def _keyword_fallback_search(self, query: str, locale: str, category: Optional[str], top_k: int) -> List[SearchResult]:
        """Fallback to keyword search when embeddings unavailable"""
        results = self.semantic_memory.keyword_search(
            query=query,
            locale=locale,
            category=category,
            limit=top_k
        )
        
        # Convert to SearchResult objects
        search_results = []
        content_fields = {
            "en": "contentEn",
            "pt": "contentPt",
            "es": "contentEs"
        }
        content_field = content_fields.get(locale.lower(), "contentEn")
        
        for row in results:
            search_results.append(SearchResult(
                id=row['id'],
                content=row.get(content_field, row.get('contentEn', '')),
                similarity=float(row['similarity']),
                confidence=float(row.get('confidence', 1.0)),
                category=row['category'],
                metadata=row.get('metadata', {})
            ))
        
        return search_results
    
    async def hybrid_search(self, query: str, emotional_state: Dict, 
                           conversation_context: Dict, locale: str = "en",
                           top_k: int = 5) -> List[Tuple[SearchResult, HybridScore]]:
        """
        Hybrid scoring: λ₁=0.4 (affective) + λ₂=0.35 (semantic) + λ₃=0.25 (utility)
        """
        # Step 1: Semantic search
        semantic_results = await self.search(query, locale, top_k=top_k)
        
        # Step 2: Calculate hybrid scores
        scored_results = []
        for result in semantic_results:
            # λ₂: Semantic similarity (already calculated by pgvector)
            semantic_score = result.similarity
            
            # λ₁: Affective similarity (emotional alignment)
            affective_score = self._calculate_affective_score(emotional_state, result)
            
            # λ₃: Utility score (recency, usage, context relevance)
            utility_score = self._calculate_utility_score(result, conversation_context)
            
            # Weighted sum: r_t = λ₁⟨E_t,v_r⟩ + λ₂S(r|C_t) + λ₃U(r|H_t)
            total_score = (
                0.4 * affective_score +   # λ₁ = 0.4
                0.35 * semantic_score +   # λ₂ = 0.35
                0.25 * utility_score      # λ₃ = 0.25
            )
            
            hybrid_score = HybridScore(
                affective=affective_score,
                semantic=semantic_score,
                utility=utility_score,
                total=total_score
            )
            
            scored_results.append((result, hybrid_score))
        
        # Sort by total hybrid score
        scored_results.sort(key=lambda x: x[1].total, reverse=True)
        
        return scored_results
    
    def _calculate_affective_score(self, emotional_state: Dict, result: SearchResult) -> float:
        """
        Calculate affective similarity using VAD emotional vectors
        Returns normalized score [0, 1]
        """
        # Extract VAD from emotional state
        valence = emotional_state.get('valence', 0.0)
        arousal = emotional_state.get('arousal', 0.0)
        dominance = emotional_state.get('dominance', 0.0)
        
        # Get result's emotional context from metadata
        result_emotion = result.metadata.get('emotional_context', {})
        result_valence = result_emotion.get('valence', 0.0)
        result_arousal = result_emotion.get('arousal', 0.0)
        result_dominance = result_emotion.get('dominance', 0.0)
        
        # Cosine similarity in ℝ³ space
        dot_product = (valence * result_valence + 
                      arousal * result_arousal + 
                      dominance * result_dominance)
        
        magnitude_1 = (valence**2 + arousal**2 + dominance**2)**0.5
        magnitude_2 = (result_valence**2 + result_arousal**2 + result_dominance**2)**0.5
        
        if magnitude_1 == 0 or magnitude_2 == 0:
            return 0.5  # Neutral if no emotional data
        
        # Normalize to [0, 1]
        similarity = (dot_product / (magnitude_1 * magnitude_2) + 1) / 2
        return max(0.0, min(1.0, similarity))
    
    def _calculate_utility_score(self, result: SearchResult, conversation_context: Dict) -> float:
        """
        Calculate utility score based on:
        - Usage frequency
        - Recency
        - Context relevance
        """
        # Base utility from confidence
        utility = result.confidence
        
        # Boost for frequently used knowledge (popular = useful)
        usage_count = result.metadata.get('usage_count', 0)
        usage_boost = min(0.3, usage_count * 0.01)  # Max +30%
        
        # Boost for recent usage (recency bias)
        last_used = result.metadata.get('last_used_at')
        recency_boost = 0.0
        if last_used:
            # Simplified: recent = better
            recency_boost = 0.1
        
        # Context relevance (if category matches conversation intent)
        context_boost = 0.0
        if conversation_context.get('intent') == result.category:
            context_boost = 0.2
        
        utility = utility + usage_boost + recency_boost + context_boost
        return max(0.0, min(1.0, utility))


class AutonomousDecisionEngine:
    """Decides when to use knowledge base vs ChatGPT fallback"""
    
    def __init__(self, confidence_threshold: float = 0.85):
        self.confidence_threshold = confidence_threshold
        self.rag_retriever = RAGRetriever()
    
    async def should_use_chatgpt(self, query: str, emotional_state: Dict,
                                 conversation_context: Dict, locale: str = "en") -> Tuple[bool, Optional[str]]:
        """
        Progressive autonomy: Use ChatGPT LESS as knowledge base grows
        Returns: (use_chatgpt: bool, reason: str)
        """
        # Check if OpenAI is available FIRST
        if not OPENAI_API_KEY:
            # No OpenAI available - MUST use KB only
            return False, "openai_unavailable"
        
        # Perform hybrid search
        results = await self.rag_retriever.hybrid_search(
            query, emotional_state, conversation_context, locale, top_k=3
        )
        
        if not results:
            # KB empty but OpenAI available - use ChatGPT
            return True, "knowledge_base_empty"
        
        # Get best result confidence
        best_result, best_score = results[0]
        confidence = best_score.total
        
        # Decision logic
        if confidence >= self.confidence_threshold:
            # High confidence - use knowledge base
            return False, f"kb_confidence_{confidence:.2f}"
        else:
            # Low confidence - fallback to ChatGPT
            return True, f"low_confidence_{confidence:.2f}"
    
    async def generate_response(self, query: str, emotional_state: Dict,
                               conversation_context: Dict, locale: str = "en",
                               messages: List[Dict] = None) -> Dict:
        """
        Main response generation with autonomous decision
        """
        # Check if we should use ChatGPT
        use_chatgpt, reason = await self.should_use_chatgpt(
            query, emotional_state, conversation_context, locale
        )
        
        # Get relevant knowledge regardless
        results = await self.rag_retriever.hybrid_search(
            query, emotional_state, conversation_context, locale, top_k=5
        )
        
        if use_chatgpt:
            # Fallback to ChatGPT with context from knowledge base
            response = await self._generate_chatgpt_response(
                query, results, emotional_state, messages, locale
            )
            return {
                "message": response,
                "source": "chatgpt",
                "reason": reason,
                "confidence": results[0][1].total if results else 0.0,
                "knowledge_used": [r[0].id for r in results]
            }
        else:
            # Use knowledge base directly
            response = self._generate_kb_response(results, locale)
            return {
                "message": response,
                "source": "knowledge_base",
                "reason": reason,
                "confidence": results[0][1].total if results else 0.0,
                "knowledge_used": [r[0].id for r in results]
            }
    
    async def _generate_chatgpt_response(self, query: str, kb_results: List[Tuple[SearchResult, HybridScore]],
                                        emotional_state: Dict, messages: List[Dict], locale: str) -> str:
        """Generate response using ChatGPT with KB context"""
        if not OPENAI_API_KEY:
            return "I apologize, but I'm currently unable to process your request. Please contact our team directly."
        
        # Build context from knowledge base
        context_str = "\n\n".join([
            f"[Context {i+1}] {result.content}"
            for i, (result, score) in enumerate(kb_results[:3])
        ])
        
        # Build emotion-aware system prompt
        emotion_desc = self._describe_emotion(emotional_state)
        
        system_prompt = f"""You are Aurora, YYD's AI sales assistant for premium tuk-tuk tours in Sintra/Cascais, Portugal.

EMOTIONAL CONTEXT: Customer is feeling {emotion_desc}. Adjust your tone accordingly.

KNOWLEDGE BASE CONTEXT:
{context_str}

Use the context above to inform your response, but maintain your conversational personality.
Language: {locale.upper()}"""
        
        try:
            response = await asyncio.to_thread(
                openai.chat.completions.create,
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    *messages[-5:],  # Last 5 messages for context
                    {"role": "user", "content": query}
                ],
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"❌ ChatGPT error: {str(e)}")
            # Fallback to KB response
            return self._generate_kb_response(kb_results, locale)
    
    def _generate_kb_response(self, results: List[Tuple[SearchResult, HybridScore]], locale: str) -> str:
        """Generate response from knowledge base results"""
        if not results:
            fallback_messages = {
                "en": "I'm here to help! Could you tell me more about what you're looking for?",
                "pt": "Estou aqui para ajudar! Pode me contar mais sobre o que procura?",
                "es": "¡Estoy aquí para ayudar! ¿Puedes decirme más sobre lo que buscas?"
            }
            return fallback_messages.get(locale, fallback_messages["en"])
        
        # Use best result
        best_result = results[0][0]
        
        # Track usage
        self.rag_retriever.semantic_memory.increment_usage(best_result.id)
        
        return best_result.content
    
    def _describe_emotion(self, emotional_state: Dict) -> str:
        """Convert VAD to descriptive emotion"""
        valence = emotional_state.get('valence', 0.0)
        arousal = emotional_state.get('arousal', 0.0)
        
        if valence > 0.3 and arousal > 0.3:
            return "excited and positive"
        elif valence > 0.3:
            return "calm and content"
        elif valence < -0.3 and arousal > 0.3:
            return "frustrated or upset"
        elif valence < -0.3:
            return "sad or discouraged"
        else:
            return "neutral"


# Global instance
decision_engine = AutonomousDecisionEngine(confidence_threshold=0.85)
