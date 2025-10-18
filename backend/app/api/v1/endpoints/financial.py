from fastapi import APIRouter

router = APIRouter()

@router.get("/transactions")
async def get_transactions():
    return {"message": "Get transactions"}
