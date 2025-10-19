"""
Telemetry API - Métricas do Cérebro Proxy
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import os
import sys

# Adicionar path para acessar Prisma Client do monorepo
sys.path.append(os.path.join(os.path.dirname(__file__), "../../../../../yyd"))

try:
    from prisma import Prisma
    PRISMA_AVAILABLE = True
except ImportError:
    PRISMA_AVAILABLE = False

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


@router.get("/recent")
async def get_recent_metrics():
    """Retorna métricas recentes (últimas 10)"""
    if not PRISMA_AVAILABLE:
        return []
    
    prisma = Prisma()
    await prisma.connect()
    
    try:
        recent = await prisma.metricshistory.find_many(
            order={"timestamp": "desc"},
            take=10
        )
        
        return [
            {
                "timestamp": m.timestamp.isoformat(),
                "app": m.app,
                "calls": m.calls,
                "promptTokens": m.promptTokens,
                "completionTokens": m.completionTokens,
                "estCostTotal": str(m.estCostTotal)
            }
            for m in recent
        ]
    finally:
        await prisma.disconnect()


@router.get("/daily")
async def get_daily_summary():
    """Retorna sumário diário (últimos 30 dias)"""
    if not PRISMA_AVAILABLE:
        return []
    
    prisma = Prisma()
    await prisma.connect()
    
    try:
        summary = await prisma.dailysummary.find_many(
            order={"date": "desc"},
            take=30
        )
        
        return [
            {
                "date": s.date,
                "totalCalls": s.totalCalls,
                "totalTokens": s.totalTokens,
                "totalCost": str(s.totalCost)
            }
            for s in summary
        ]
    finally:
        await prisma.disconnect()


@router.get("/self-check/proxy-test")
async def self_check_proxy():
    """Testa chamada via proxy-sdk"""
    try:
        # Simular chamada via proxy - na prática, importaria @yyd/proxy-sdk
        # Por enquanto, apenas verificar se o proxy está acessível
        import httpx
        proxy_url = os.getenv("REASON_PROXY_URL", "http://localhost:3000")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{proxy_url}/health", timeout=5.0)
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "result": {
                        "action": "proxy_health_check",
                        "params": {"status": "ok"}
                    }
                }
            else:
                return {
                    "success": False,
                    "error": f"Proxy retornou status {response.status_code}"
                }
                
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.get("/self-check/openai-block")
async def self_check_openai_block():
    """Testa se acesso direto a OpenAI está bloqueado"""
    try:
        import httpx
        
        async with httpx.AsyncClient() as client:
            try:
                # Tentar acessar OpenAI diretamente - deve falhar
                response = await client.get("https://api.openai.com/v1/models", timeout=3.0)
                
                # Se chegou aqui, o bloqueio FALHOU
                return {
                    "blocked": False,
                    "error": "SEGURANÇA COMPROMETIDA: OpenAI está acessível!"
                }
            except Exception as e:
                # Erro esperado = bloqueio funcionando
                return {
                    "blocked": True,
                    "error": str(e)
                }
                
    except Exception as e:
        return {
            "blocked": False,
            "error": f"Erro no teste: {str(e)}"
        }
