from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from routers import router

app = FastAPI(
	title="File Storage Asset Service",
	description="Dịch vụ lưu trữ và quản lý tài sản (file) dùng S3/Filebase và tùy chọn IPFS.",
	version="1.0.0",
)

app.include_router(router)


@app.get("/", tags=["Root"])
async def read_root():
	"""
	Root endpoint - tự động redirect sang /docs để hiển thị API documentation
	"""
	return RedirectResponse(url="/docs", status_code=302)


if __name__ == "__main__":
	import uvicorn
	uvicorn.run(app, host="0.0.0.0", port=8012)


