from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from schemas.response import RestResponse
from datetime import datetime
import uuid

async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Xử lý HTTPException theo chuẩn DocGO RestResponse
    """
    return JSONResponse(
        status_code=exc.status_code,
        content=RestResponse[None](
            statusCode=exc.status_code,
            shortMessage=exc.detail,
            description=f"An HTTP error occurred: {exc.detail}",
            data=None,
            path=str(request.url)
        ).model_dump(exclude_none=True)
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Xử lý validation errors theo chuẩn DocGO RestResponse
    """
    errors = []
    for error in exc.errors():
        field = ".".join(map(str, error["loc"]))
        errors.append(f"{field}: {error['msg']}")
    error_detail = "; ".join(errors)
    
    return JSONResponse(
        status_code=400,
        content=RestResponse[None](
            statusCode=400,
            shortMessage="Validation Error",
            description=f"Invalid input provided: {error_detail}",
            data=None,
            path=str(request.url)
        ).model_dump(exclude_none=True)
    )

async def general_exception_handler(request: Request, exc: Exception):
    """
    Xử lý general exceptions theo chuẩn DocGO RestResponse
    """
    return JSONResponse(
        status_code=500,
        content=RestResponse[None](
            statusCode=500,
            shortMessage="Internal Server Error",
            description=f"An unexpected error occurred: {str(exc)}",
            data=None,
            path=str(request.url)
        ).model_dump(exclude_none=True)
    )
