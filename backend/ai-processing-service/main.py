from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
import routers

app = FastAPI(
    title="AI Processing Service",
    description="Một dịch vụ xử lý tài liệu sử dụng AI.",
    version="1.0.0",
)

app.include_router(routers.router)

@app.get("/", tags=["Root"])
async def read_root():
    """
    Root endpoint - tự động redirect sang /docs để hiển thị API documentation
    """
    return RedirectResponse(url="/docs", status_code=302)