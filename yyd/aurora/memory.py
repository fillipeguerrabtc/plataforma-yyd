"""
Aurora Memory System - 7 Layers
================================

Implements the complete memory hierarchy as per whitepaper:
- SC (Sensory Context): 30s cache, raw input
- WM (Working Memory): 6h TTL, conversation context
- EM (Episodic Memory): 18 months, LGPD anonymization
- SM (Semantic Memory): pgvector 1536D, knowledge base
- PM (Procedural Memory): Versioned procedures
- AM (Aggregate Memory): 90-day windows, analytics
- TM (Template Memory): Response templates
"""

import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
import openai

DATABASE_URL = os.getenv("DATABASE_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY


@dataclass
class MemoryItem:
    """Generic memory item structure"""
    id: str
    content: Any
    metadata: Dict[str, Any]
    created_at: datetime
    

class DatabaseConnection:
    """Thread-safe database connection manager"""
    
    @staticmethod
    def get_connection():
        return psycopg2.connect(DATABASE_URL)
    
    @staticmethod
    def execute_query(query: str, params: tuple = None, fetch: str = "all"):
        """Execute query with automatic connection management"""
        conn = DatabaseConnection.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, params)
                if fetch == "all":
                    return cur.fetchall()
                elif fetch == "one":
                    return cur.fetchone()
                else:
                    conn.commit()
                    return None
        finally:
            conn.close()


class SensoryContextMemory:
    """SC - Sensory Context: 30s cache for raw input"""
    
    @staticmethod
    def store(session_id: str, content: str, metadata: Dict = None):
        """Store raw sensory input"""
        expires_at = datetime.now() + timedelta(seconds=30)
        query = """
            INSERT INTO aurora_sensory_context (id, "sessionId", content, metadata, "createdAt", "expiresAt")
            VALUES (gen_random_uuid()::text, %s, %s, %s, NOW(), %s)
        """
        DatabaseConnection.execute_query(query, (session_id, content, Json(metadata or {}), expires_at), fetch="none")
    
    @staticmethod
    def get_recent(session_id: str, limit: int = 10):
        """Retrieve recent sensory context"""
        query = """
            SELECT * FROM aurora_sensory_context
            WHERE "sessionId" = %s AND "expiresAt" > NOW()
            ORDER BY "createdAt" DESC
            LIMIT %s
        """
        return DatabaseConnection.execute_query(query, (session_id, limit))
    
    @staticmethod
    def cleanup_expired():
        """Remove expired sensory context"""
        query = 'DELETE FROM aurora_sensory_context WHERE "expiresAt" < NOW()'
        DatabaseConnection.execute_query(query, fetch="none")


class WorkingMemory:
    """WM - Working Memory: 6h TTL for conversation context"""
    
    @staticmethod
    def store(session_id: str, conversation_id: str, context_window: Dict, 
              active_entities: Dict = None, current_intent: str = None, 
              emotional_state: Dict = None):
        """Store or update working memory"""
        expires_at = datetime.now() + timedelta(hours=6)
        query = """
            INSERT INTO aurora_working_memory 
            (id, "sessionId", "conversationId", "contextWindow", "activeEntities", 
             "currentIntent", "emotionalState", "createdAt", "expiresAt")
            VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, NOW(), %s)
        """
        DatabaseConnection.execute_query(
            query, 
            (session_id, conversation_id, Json(context_window), Json(active_entities or {}),
             current_intent, Json(emotional_state or {}), expires_at),
            fetch="none"
        )
    
    @staticmethod
    def get(session_id: str) -> Optional[Dict]:
        """Retrieve working memory for session"""
        query = """
            SELECT * FROM aurora_working_memory
            WHERE "sessionId" = %s AND "expiresAt" > NOW()
            ORDER BY "createdAt" DESC
            LIMIT 1
        """
        return DatabaseConnection.execute_query(query, (session_id,), fetch="one")
    
    @staticmethod
    def cleanup_expired():
        """Remove expired working memory"""
        query = 'DELETE FROM aurora_working_memory WHERE "expiresAt" < NOW()'
        DatabaseConnection.execute_query(query, fetch="none")


class EpisodicMemory:
    """EM - Episodic Memory: 18 months with LGPD anonymization"""
    
    @staticmethod
    def store(session_id: str, event_type: str, content: str, emotional_vector: Dict,
              customer_id: str = None, conversation_id: str = None, 
              outcome: str = None, importance: float = 0.5, metadata: Dict = None):
        """Store episodic event"""
        query = """
            INSERT INTO aurora_episodic_memory
            (id, "customerId", "sessionId", "conversationId", "eventType", content,
             "emotionalVector", outcome, importance, metadata, "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        DatabaseConnection.execute_query(
            query,
            (customer_id, session_id, conversation_id, event_type, content,
             Json(emotional_vector), outcome, importance, Json(metadata or {})),
            fetch="none"
        )
    
    @staticmethod
    def get_by_customer(customer_id: str, limit: int = 50):
        """Retrieve customer's episodic memory"""
        query = """
            SELECT * FROM aurora_episodic_memory
            WHERE "customerId" = %s AND "anonymizedAt" IS NULL
            ORDER BY "createdAt" DESC
            LIMIT %s
        """
        return DatabaseConnection.execute_query(query, (customer_id, limit))
    
    @staticmethod
    def anonymize_old_memories():
        """LGPD compliance: Anonymize memories > 18 months"""
        eighteen_months_ago = datetime.now() - timedelta(days=18*30)
        query = """
            UPDATE aurora_episodic_memory
            SET "customerId" = NULL, 
                content = '[ANONYMIZED]',
                "anonymizedAt" = NOW()
            WHERE "createdAt" < %s AND "anonymizedAt" IS NULL
        """
        DatabaseConnection.execute_query(query, (eighteen_months_ago,), fetch="none")


class SemanticMemory:
    """SM - Semantic Memory: pgvector 1536D knowledge base"""
    
    @staticmethod
    async def generate_embedding(text: str) -> List[float]:
        """Generate OpenAI embedding (1536D)"""
        if not OPENAI_API_KEY:
            return None
        
        try:
            response = await openai.Embedding.acreate(
                model="text-embedding-3-small",
                input=text
            )
            return response['data'][0]['embedding']
        except Exception as e:
            print(f"❌ Embedding error: {str(e)}")
            return None
    
    @staticmethod
    def store(content_en: str, content_pt: str, content_es: str,
              category: str, subcategory: str = None, tags: List[str] = None,
              source_type: str = "manual", source_id: str = None,
              confidence: float = 1.0, metadata: Dict = None):
        """Store semantic knowledge with embeddings"""
        # Note: Embeddings should be generated asynchronously and stored separately
        query = """
            INSERT INTO aurora_semantic_memory
            (id, "contentEn", "contentPt", "contentEs", category, subcategory, tags,
             "sourceType", "sourceId", confidence, metadata, "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            RETURNING id
        """
        result = DatabaseConnection.execute_query(
            query,
            (content_en, content_pt, content_es, category, subcategory, tags or [],
             source_type, source_id, confidence, Json(metadata or {})),
            fetch="one"
        )
        return result['id'] if result else None
    
    @staticmethod
    def update_embedding(memory_id: str, embedding: List[float], locale: str):
        """Update embedding for specific locale"""
        # Map locale to camelCase field name
        embedding_fields = {
            "en": "embeddingEn",
            "pt": "embeddingPt",
            "es": "embeddingEs"
        }
        embedding_field = embedding_fields.get(locale.lower(), "embeddingEn")
        
        query = f"""
            UPDATE aurora_semantic_memory
            SET "{embedding_field}" = %s::vector
            WHERE id = %s
        """
        DatabaseConnection.execute_query(query, (embedding, memory_id), fetch="none")
    
    @staticmethod
    def semantic_search(query_embedding: List[float], locale: str = "en", 
                       category: str = None, limit: int = 5):
        """Perform pgvector similarity search"""
        # Map locale to camelCase field name
        embedding_fields = {
            "en": "embeddingEn",
            "pt": "embeddingPt",
            "es": "embeddingEs"
        }
        embedding_field = embedding_fields.get(locale.lower(), "embeddingEn")
        
        category_filter = ""
        params = [query_embedding, limit]
        if category:
            category_filter = "AND category = %s"
            params.insert(1, category)
        
        query = f"""
            SELECT *, 
                   1 - ("{embedding_field}" <=> %s::vector) as similarity
            FROM aurora_semantic_memory
            WHERE active = true AND "{embedding_field}" IS NOT NULL {category_filter}
            ORDER BY "{embedding_field}" <=> %s::vector
            LIMIT %s
        """
        params_with_double = params[:1] + params  # <=> needs the vector twice
        return DatabaseConnection.execute_query(query, tuple(params_with_double))
    
    @staticmethod
    def increment_usage(memory_id: str):
        """Track knowledge usage"""
        query = """
            UPDATE aurora_semantic_memory
            SET "usageCount" = "usageCount" + 1,
                "lastUsedAt" = NOW()
            WHERE id = %s
        """
        DatabaseConnection.execute_query(query, (memory_id,), fetch="none")


class ProceduralMemory:
    """PM - Procedural Memory: Versioned procedures"""
    
    @staticmethod
    def store(procedure_name: str, version: int, trigger: str, 
              conditions: Dict, actions: Dict, priority: int = 0, metadata: Dict = None):
        """Store versioned procedure"""
        query = """
            INSERT INTO aurora_procedural_memory
            (id, "procedureName", version, trigger, conditions, actions, priority, metadata, "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        DatabaseConnection.execute_query(
            query,
            (procedure_name, version, trigger, Json(conditions), Json(actions), priority, Json(metadata or {})),
            fetch="none"
        )
    
    @staticmethod
    def get_latest_version(procedure_name: str):
        """Get latest version of a procedure"""
        query = """
            SELECT * FROM aurora_procedural_memory
            WHERE "procedureName" = %s AND active = true
            ORDER BY version DESC
            LIMIT 1
        """
        return DatabaseConnection.execute_query(query, (procedure_name,), fetch="one")
    
    @staticmethod
    def execute(procedure_name: str):
        """Record procedure execution"""
        query = """
            UPDATE aurora_procedural_memory
            SET "executionCount" = "executionCount" + 1,
                "lastExecutedAt" = NOW()
            WHERE "procedureName" = %s AND active = true
            ORDER BY version DESC
            LIMIT 1
        """
        DatabaseConnection.execute_query(query, (procedure_name,), fetch="none")


class AggregateMemory:
    """AM - Aggregate Memory: 90-day windows for analytics"""
    
    @staticmethod
    def store_metric(period_type: str, period_start: datetime, period_end: datetime,
                    metric: str, value: float, count: int, metadata: Dict = None):
        """Store aggregated metric"""
        query = """
            INSERT INTO aurora_aggregate_memory
            (id, "periodType", "periodStart", "periodEnd", metric, value, count, metadata, "createdAt")
            VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT ("periodType", "periodStart", metric) DO UPDATE SET
                value = EXCLUDED.value,
                count = EXCLUDED.count,
                metadata = EXCLUDED.metadata
        """
        DatabaseConnection.execute_query(
            query,
            (period_type, period_start, period_end, metric, value, count, Json(metadata or {})),
            fetch="none"
        )
    
    @staticmethod
    def get_metric(period_type: str, metric: str, limit: int = 90):
        """Retrieve metric history"""
        query = """
            SELECT * FROM aurora_aggregate_memory
            WHERE "periodType" = %s AND metric = %s
            ORDER BY "periodStart" DESC
            LIMIT %s
        """
        return DatabaseConnection.execute_query(query, (period_type, metric, limit))


class TemplateMemory:
    """TM - Template Memory: Response templates"""
    
    @staticmethod
    def store(template_name: str, locale: str, category: str, template_text: str,
              variables: List[str], metadata: Dict = None):
        """Store response template"""
        query = """
            INSERT INTO aurora_template_memory
            (id, "templateName", locale, category, "templateText", variables, metadata, "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            ON CONFLICT ("templateName", locale) DO UPDATE SET
                "templateText" = EXCLUDED."templateText",
                variables = EXCLUDED.variables,
                metadata = EXCLUDED.metadata,
                "updatedAt" = NOW()
        """
        DatabaseConnection.execute_query(
            query,
            (template_name, locale, category, template_text, variables, Json(metadata or {})),
            fetch="none"
        )
    
    @staticmethod
    def get_template(template_name: str, locale: str):
        """Retrieve template"""
        query = """
            SELECT * FROM aurora_template_memory
            WHERE "templateName" = %s AND locale = %s AND active = true
        """
        return DatabaseConnection.execute_query(query, (template_name, locale), fetch="one")
    
    @staticmethod
    def increment_usage(template_name: str, locale: str):
        """Track template usage"""
        query = """
            UPDATE aurora_template_memory
            SET "usageCount" = "usageCount" + 1,
                "lastUsedAt" = NOW()
            WHERE "templateName" = %s AND locale = %s
        """
        DatabaseConnection.execute_query(query, (template_name, locale), fetch="none")


class MemoryManager:
    """High-level memory orchestrator"""
    
    def __init__(self):
        self.sc = SensoryContextMemory()
        self.wm = WorkingMemory()
        self.em = EpisodicMemory()
        self.sm = SemanticMemory()
        self.pm = ProceduralMemory()
        self.am = AggregateMemory()
        self.tm = TemplateMemory()
    
    def cleanup_expired(self):
        """Run maintenance on all memory layers"""
        self.sc.cleanup_expired()
        self.wm.cleanup_expired()
        self.em.anonymize_old_memories()
    
    def store_conversation_snapshot(self, session_id: str, conversation_id: str,
                                   customer_id: str, messages: List[Dict],
                                   emotional_state: Dict):
        """Store complete conversation snapshot across layers"""
        # SC: Raw input
        latest_message = messages[-1] if messages else {}
        self.sc.store(session_id, latest_message.get('content', ''))
        
        # WM: Conversation context
        context_window = {
            'messages': messages[-10:],  # Last 10 messages
            'message_count': len(messages)
        }
        self.wm.store(session_id, conversation_id, context_window,
                     current_intent=latest_message.get('intent'),
                     emotional_state=emotional_state)
        
        # EM: Episodic event
        self.em.store(
            session_id=session_id,
            conversation_id=conversation_id,
            customer_id=customer_id,
            event_type='conversation_turn',
            content=json.dumps(latest_message),
            emotional_vector=emotional_state
        )
