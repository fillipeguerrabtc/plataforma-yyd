from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_integrations():
    return {"message": "Get integrations"}
