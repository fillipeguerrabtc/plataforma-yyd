from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_vehicles():
    return {"message": "Get vehicles"}
