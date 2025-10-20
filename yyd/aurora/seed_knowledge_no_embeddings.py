"""
Knowledge Base Seeder WITHOUT Embeddings (Temporary)
=====================================================

Populates Semantic Memory with textual content only.
When OpenAI quota is restored, run seed_knowledge_base.py instead.
"""

import psycopg2
import os
from typing import List, Dict
import json

DATABASE_URL = os.getenv("DATABASE_URL")

# Import knowledge base from seed_knowledge_base
from seed_knowledge_base import KNOWLEDGE_BASE


def seed_without_embeddings():
    """Seed knowledge base with null embeddings (temporary solution)"""
    print("🌱 Seeding Knowledge Base WITHOUT Embeddings (Fallback Mode)...")
    print(f"📊 Total entries: {len(KNOWLEDGE_BASE)}\n")
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    success_count = 0
    error_count = 0
    
    for idx, entry in enumerate(KNOWLEDGE_BASE, 1):
        try:
            knowledge_id = f"kb_{entry['category']}_{idx}"
            
            print(f"[{idx}/{len(KNOWLEDGE_BASE)}] {entry['category']}: ", end="")
            
            # Insert without embeddings
            query = """
                INSERT INTO aurora_semantic_memory 
                (id, category, "contentEn", "contentPt", "contentEs",
                 "embeddingEn", "embeddingPt", "embeddingEs",
                 tags, confidence, "sourceType", "sourceId", metadata, "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, NULL, NULL, NULL, %s, %s, %s, %s, %s::jsonb, NOW(), NOW())
                ON CONFLICT (id) DO UPDATE SET
                    "contentEn" = EXCLUDED."contentEn",
                    "contentPt" = EXCLUDED."contentPt",
                    "contentEs" = EXCLUDED."contentEs",
                    "updatedAt" = NOW()
            """
            
            cur.execute(query, (
                knowledge_id,
                entry['category'],
                entry['en'],
                entry['pt'],
                entry['es'],
                entry['tags'],
                entry['confidence'],
                'website',  # sourceType
                'yesyoudeserve.tours',  # sourceId
                json.dumps({
                    "source": "yesyoudeserve.tours",
                    "seed_date": "2025-01-15",
                    "category": entry['category'],
                    "needs_embeddings": True  # Flag for later processing
                })
            ))
            
            print("✅")
            success_count += 1
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            error_count += 1
    
    conn.commit()
    cur.close()
    conn.close()
    
    print("\n" + "="*60)
    print(f"🎉 Seeding Complete (Fallback Mode)!")
    print(f"   ✅ Success: {success_count}")
    print(f"   ❌ Errors: {error_count}")
    print(f"   📈 Success Rate: {(success_count/len(KNOWLEDGE_BASE)*100):.1f}%")
    print("\n⚠️  NOTE: Embeddings are NULL - Aurora will use ChatGPT fallback")
    print("   Run seed_knowledge_base.py when OpenAI quota is restored")
    print("="*60)


if __name__ == "__main__":
    seed_without_embeddings()
