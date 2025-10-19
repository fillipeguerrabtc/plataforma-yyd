from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, tours, guides, vehicles, bookings, users, integrations, financial, leads,
    backoffice_auth, backoffice_config, backoffice_customers, backoffice_aurora,
    aurora_chat, aurora_knowledge, integrations_webhooks, aurora_seed, telemetry
)

api_router = APIRouter()

# Public/Client APIs
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(tours.router, prefix="/tours", tags=["tours"])
api_router.include_router(guides.router, prefix="/guides", tags=["guides"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["vehicles"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
api_router.include_router(financial.router, prefix="/financial", tags=["financial"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])

# Aurora IA APIs (Public - chat interface)
api_router.include_router(aurora_chat.router, prefix="/aurora", tags=["aurora-chat"])
api_router.include_router(aurora_knowledge.router, prefix="/aurora", tags=["aurora-knowledge"])
api_router.include_router(aurora_seed.router, prefix="/aurora", tags=["aurora-seed"])

# Integration Webhooks (WhatsApp, Facebook, Instagram)
api_router.include_router(integrations_webhooks.router, prefix="", tags=["webhooks"])

# BackOffice APIs
api_router.include_router(backoffice_auth.router, prefix="/backoffice/auth", tags=["backoffice-auth"])
api_router.include_router(backoffice_config.router, prefix="/backoffice", tags=["backoffice-config"])
api_router.include_router(backoffice_customers.router, prefix="/backoffice", tags=["backoffice-customers"])
api_router.include_router(backoffice_aurora.router, prefix="/backoffice", tags=["backoffice-aurora"])

# Telemetry/Ops APIs
api_router.include_router(telemetry.router, tags=["telemetry"])
