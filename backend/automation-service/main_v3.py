"""
Automation Service v3 - Main Entry Point

Event Architecture v3 Implementation:
- Upload Handler: Generate UUID v7, upload to S3, publish Event 1
- Content Processor: Extract text, AI classification, publish Event 2
- Contract Analyzer: Analyze contracts, publish Event 3 (conditional)
- Kafka Publisher: Publish events to docgo-file-events topic
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers.upload_router import router as upload_router
from services.kafka_publisher_v3 import KafkaPublisherV3
from config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Kafka publisher
kafka_publisher = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown"""
    # Startup
    global kafka_publisher
    kafka_publisher = KafkaPublisherV3()
    logger.info("✅ Automation Service v3 started")
    logger.info("📡 Kafka Publisher initialized")
    logger.info("🔄 Event Architecture v3 ready")
    
    yield
    
    # Shutdown
    logger.info("🛑 Automation Service v3 shutting down")


# Create FastAPI app
app = FastAPI(
    title="Automation Service v3",
    description="Event Architecture v3 - File Upload & Processing",
    version="3.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "automation-service",
        "version": "3.0.0"
    }


@app.get("/docs")
async def docs():
    """API documentation"""
    return {
        "title": "Automation Service v3",
        "description": "Event Architecture v3 Implementation",
        "version": "3.0.0",
        "endpoints": {
            "upload": "POST /api/v1/automation-service/files/upload",
            "status": "GET /api/v1/automation-service/files/status/{document_id}",
            "health": "GET /health"
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        log_level="info"
    )
