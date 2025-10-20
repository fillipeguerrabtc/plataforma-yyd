"""
Vector Embeddings Service for Aurora IA
Uses OpenAI embeddings + pgvector for semantic search

Enables:
- Tour information retrieval
- FAQ search
- Policy lookups
- Context injection for GPT-4
"""

import os
import numpy as np
from typing import List, Dict, Any, Optional
from openai import OpenAI
import psycopg2
from psycopg2 import extras
from psycopg2.extras import execute_values

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "")

# Embedding model
EMBEDDING_MODEL = "text-embedding-3-small"  # 1536 dimensions, cost-effective
EMBEDDING_DIMENSIONS = 1536

class EmbeddingsService:
    """Service for generating and searching vector embeddings"""
    
    def __init__(self):
        self.client = client
        self.model = EMBEDDING_MODEL
        self._ensure_pgvector_extension()
        self._ensure_knowledge_table()
    
    def _ensure_pgvector_extension(self):
        """Ensure pgvector extension is enabled in PostgreSQL"""
        try:
            conn = psycopg2.connect(DATABASE_URL)
            cursor = conn.cursor()
            cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            conn.commit()
            cursor.close()
            conn.close()
            print("✅ pgvector extension enabled")
        except Exception as e:
            print(f"⚠️  pgvector extension setup: {str(e)}")
    
    def _ensure_knowledge_table(self):
        """Create knowledge base table if not exists"""
        try:
            conn = psycopg2.connect(DATABASE_URL)
            cursor = conn.cursor()
            
            # Create knowledge table with vector column
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS aurora_knowledge (
                    id SERIAL PRIMARY KEY,
                    content TEXT NOT NULL,
                    content_type VARCHAR(50) NOT NULL,
                    language VARCHAR(5) NOT NULL,
                    metadata JSONB,
                    embedding vector({EMBEDDING_DIMENSIONS}),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """)
            
            # Create index for vector similarity search
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS aurora_knowledge_embedding_idx 
                ON aurora_knowledge 
                USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100);
            """)
            
            # Create index for content type filtering
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS aurora_knowledge_type_idx 
                ON aurora_knowledge (content_type);
            """)
            
            conn.commit()
            cursor.close()
            conn.close()
            print("✅ Aurora knowledge base table ready")
        except Exception as e:
            print(f"⚠️  Knowledge table setup: {str(e)}")
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding vector for text using OpenAI
        
        Args:
            text: Input text to embed
        
        Returns:
            1536-dimensional embedding vector
        """
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"❌ Embedding generation error: {str(e)}")
            return [0.0] * EMBEDDING_DIMENSIONS  # Fallback zero vector
    
    def add_knowledge(
        self,
        content: str,
        content_type: str,
        language: str = "en",
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Add knowledge to vector database
        
        Args:
            content: Text content to store
            content_type: Type (tour_info, faq, policy, etc.)
            language: Language code (en, pt, es)
            metadata: Additional metadata (tour_id, price, etc.)
        
        Returns:
            Success boolean
        """
        try:
            # Generate embedding
            embedding = self.generate_embedding(content)
            
            # Store in database
            conn = psycopg2.connect(DATABASE_URL)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO aurora_knowledge 
                (content, content_type, language, metadata, embedding)
                VALUES (%s, %s, %s, %s, %s::vector)
            """, (
                content,
                content_type,
                language,
                extras.Json(metadata or {}),
                embedding
            ))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            print(f"✅ Added knowledge: {content_type} ({language})")
            return True
            
        except Exception as e:
            print(f"❌ Add knowledge error: {str(e)}")
            return False
    
    def semantic_search(
        self,
        query: str,
        content_type: Optional[str] = None,
        language: Optional[str] = None,
        limit: int = 5,
        similarity_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """
        Perform semantic search on knowledge base
        
        Args:
            query: Search query
            content_type: Filter by type (optional)
            language: Filter by language (optional)
            limit: Max results to return
            similarity_threshold: Minimum cosine similarity (0-1)
        
        Returns:
            List of matching knowledge items with similarity scores
        """
        try:
            # Generate query embedding
            query_embedding = self.generate_embedding(query)
            
            # Build SQL query with filters
            conn = psycopg2.connect(DATABASE_URL)
            cursor = conn.cursor()
            
            where_clauses = []
            params = [query_embedding]
            
            if content_type:
                where_clauses.append("content_type = %s")
                params.append(content_type)
            
            if language:
                where_clauses.append("language = %s")
                params.append(language)
            
            where_sql = " AND " + " AND ".join(where_clauses) if where_clauses else ""
            
            # Cosine similarity search
            params.extend([limit])
            
            cursor.execute(f"""
                SELECT 
                    id,
                    content,
                    content_type,
                    language,
                    metadata,
                    1 - (embedding <=> %s::vector) as similarity
                FROM aurora_knowledge
                WHERE 1=1 {where_sql}
                ORDER BY embedding <=> %s::vector
                LIMIT %s
            """, params + [query_embedding])
            
            results = []
            for row in cursor.fetchall():
                similarity = row[5]
                if similarity >= similarity_threshold:
                    results.append({
                        "id": row[0],
                        "content": row[1],
                        "content_type": row[2],
                        "language": row[3],
                        "metadata": row[4],
                        "similarity": float(similarity)
                    })
            
            cursor.close()
            conn.close()
            
            return results
            
        except Exception as e:
            print(f"❌ Semantic search error: {str(e)}")
            return []
    
    def get_tour_context(self, query: str, language: str = "en") -> Dict[str, Any]:
        """
        Get relevant tour information for a query
        
        Returns enriched context for GPT-4 injection
        """
        results = self.semantic_search(
            query=query,
            content_type="tour_info",
            language=language,
            limit=3
        )
        
        tours = []
        for result in results:
            metadata = result.get("metadata", {})
            tours.append({
                "name": metadata.get("name", ""),
                "price": metadata.get("price", 0),
                "duration": metadata.get("duration", 0),
                "description": result["content"],
                "similarity": result["similarity"]
            })
        
        return {"tours": tours}
    
    def clear_knowledge(self, content_type: Optional[str] = None):
        """Clear knowledge base (use with caution)"""
        try:
            conn = psycopg2.connect(DATABASE_URL)
            cursor = conn.cursor()
            
            if content_type:
                cursor.execute("DELETE FROM aurora_knowledge WHERE content_type = %s", (content_type,))
                print(f"✅ Cleared {content_type} knowledge")
            else:
                cursor.execute("DELETE FROM aurora_knowledge")
                print("✅ Cleared all knowledge")
            
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"❌ Clear knowledge error: {str(e)}")

# Global instance
embeddings_service = EmbeddingsService()
