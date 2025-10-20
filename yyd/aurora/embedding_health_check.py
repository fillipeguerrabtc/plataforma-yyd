"""
Aurora Embedding Health Check & Auto-Recovery System
====================================================

Automatically detects when OpenAI quota is restored and processes pending embeddings.
Runs as a background task checking every 30 minutes.
"""

import asyncio
import os
from datetime import datetime
from typing import Dict, Optional
from rag import EmbeddingGenerator
from memory import SemanticMemory, DatabaseConnection
import psycopg2


class EmbeddingHealthMonitor:
    """Monitors OpenAI API health and auto-recovers when quota restored"""
    
    def __init__(self, check_interval_minutes: int = 30):
        self.check_interval = check_interval_minutes * 60  # Convert to seconds
        self.embedding_generator = EmbeddingGenerator()
        self.semantic_memory = SemanticMemory()
        self.is_healthy = False
        self.last_check = None
        self.pending_count = 0
        
    async def check_quota_health(self) -> bool:
        """Test if OpenAI API is accessible with a minimal request"""
        try:
            test_embedding = await self.embedding_generator.generate(
                "Test quota health check"
            )
            
            if test_embedding:
                print("✅ OpenAI API HEALTHY - Quota available!")
                self.is_healthy = True
                self.last_check = datetime.now()
                return True
            else:
                print("⚠️ OpenAI API returned None - quota may be exhausted")
                self.is_healthy = False
                return False
                
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "insufficient_quota" in error_msg:
                print(f"❌ OpenAI API UNHEALTHY - Quota exhausted (429 error)")
                self.is_healthy = False
                return False
            else:
                print(f"❌ OpenAI API error: {error_msg}")
                self.is_healthy = False
                return False
    
    async def get_pending_embeddings_count(self) -> int:
        """Count knowledge entries without embeddings"""
        try:
            query = """
                SELECT COUNT(*) as count 
                FROM aurora_semantic_memory 
                WHERE "embeddingEn" IS NULL 
                   OR "embeddingPt" IS NULL 
                   OR "embeddingEs" IS NULL
            """
            result = DatabaseConnection.execute_query(query, fetch="one")
            count = result['count'] if result else 0
            self.pending_count = count
            return count
        except Exception as e:
            print(f"Error counting pending embeddings: {e}")
            return 0
    
    async def process_pending_embeddings(self, batch_size: int = 5) -> Dict:
        """Process pending embeddings when quota is restored"""
        print(f"\n🔄 Processing pending embeddings (batch size: {batch_size})...")
        
        try:
            # Get entries without embeddings
            query = """
                SELECT id, "contentEn", "contentPt", "contentEs"
                FROM aurora_semantic_memory 
                WHERE "embeddingEn" IS NULL 
                   OR "embeddingPt" IS NULL 
                   OR "embeddingEs" IS NULL
                LIMIT %s
            """
            results = DatabaseConnection.execute_query(query, (batch_size,))
            
            if not results:
                print("✅ No pending embeddings to process")
                return {"processed": 0, "failed": 0}
            
            processed = 0
            failed = 0
            
            for row in results:
                try:
                    knowledge_id = row['id']
                    
                    # Generate embeddings for all languages
                    embeddings = await self.embedding_generator.batch_generate([
                        row['contentEn'],
                        row['contentPt'],
                        row['contentEs']
                    ])
                    
                    if all(embeddings):
                        # Update database with embeddings
                        update_query = """
                            UPDATE aurora_semantic_memory 
                            SET "embeddingEn" = %s,
                                "embeddingPt" = %s,
                                "embeddingEs" = %s,
                                "updatedAt" = NOW()
                            WHERE id = %s
                        """
                        DatabaseConnection.execute_query(
                            update_query,
                            (embeddings[0], embeddings[1], embeddings[2], knowledge_id),
                            fetch="none"
                        )
                        processed += 1
                        print(f"  ✅ Processed: {knowledge_id}")
                    else:
                        failed += 1
                        print(f"  ❌ Failed: {knowledge_id}")
                        
                except Exception as e:
                    failed += 1
                    print(f"  ❌ Error processing {row.get('id', 'unknown')}: {e}")
            
            return {"processed": processed, "failed": failed}
            
        except Exception as e:
            print(f"❌ Batch processing error: {e}")
            return {"processed": 0, "failed": 0, "error": str(e)}
    
    async def run_health_check_cycle(self):
        """Single health check cycle"""
        print(f"\n{'='*60}")
        print(f"🏥 Aurora Embedding Health Check - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}")
        
        # 1. Check quota health
        is_healthy = await self.check_quota_health()
        
        # 2. Count pending embeddings
        pending = await self.get_pending_embeddings_count()
        print(f"📊 Pending embeddings: {pending}")
        
        # 3. If healthy and have pending, process them
        if is_healthy and pending > 0:
            print(f"\n🎉 QUOTA RESTORED! Processing {pending} pending embeddings...")
            result = await self.process_pending_embeddings(batch_size=10)
            print(f"\n✅ Processed: {result['processed']}, Failed: {result['failed']}")
            
            # Update config to mark embeddings as enabled
            self._update_config_status(enabled=True)
            
        elif not is_healthy and pending > 0:
            print(f"\n⏳ Waiting for quota restoration ({pending} pending)")
            self._update_config_status(enabled=False)
            
        elif pending == 0:
            print(f"\n✨ All embeddings processed! Knowledge base complete.")
            self._update_config_status(enabled=True)
        
        print(f"{'='*60}\n")
    
    def _update_config_status(self, enabled: bool):
        """Update Aurora config with embedding status"""
        try:
            query = """
                UPDATE aurora_configs 
                SET metadata = jsonb_set(
                    COALESCE(metadata, '{}'::jsonb),
                    '{embeddings_enabled}',
                    to_jsonb(%s::boolean)
                ),
                "updatedAt" = NOW()
                WHERE key = 'system_status'
            """
            DatabaseConnection.execute_query(query, (enabled,), fetch="none")
        except Exception as e:
            print(f"Could not update config: {e}")
    
    async def start_monitoring(self):
        """Start continuous monitoring loop"""
        print(f"🚀 Starting Aurora Embedding Health Monitor")
        print(f"   Check interval: {self.check_interval//60} minutes")
        print(f"   Next check in: {self.check_interval//60} minutes\n")
        
        while True:
            try:
                await self.run_health_check_cycle()
                await asyncio.sleep(self.check_interval)
            except KeyboardInterrupt:
                print("\n🛑 Health monitor stopped by user")
                break
            except Exception as e:
                print(f"❌ Monitor error: {e}")
                await asyncio.sleep(60)  # Wait 1 min on error


async def main():
    """Run health monitor"""
    monitor = EmbeddingHealthMonitor(check_interval_minutes=30)
    await monitor.start_monitoring()


if __name__ == "__main__":
    asyncio.run(main())
