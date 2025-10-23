import asyncio
import json
import logging
from typing import Optional
from datetime import datetime, timezone

from aiokafka import AIOKafkaConsumer
from config import Config as FMConfig
from services.file_service import FileStorageService

logger = logging.getLogger(__name__)


class FileEventsConsumer:
    def __init__(self) -> None:
        self._consumer: Optional[AIOKafkaConsumer] = None
        self._running: bool = False
        self._file_service = FileStorageService()

    async def start(self) -> None:
        if not FMConfig.KAFKA_ENABLED:
            logger.info("[KAFKA_DISABLED] Skipping consumer startup")
            return

        if self._consumer is None:
            # Subscribe to actual topics published by automation-service
            self._consumer = AIOKafkaConsumer(
                "file.metadata.recorded",
                "file.plaintext.extracted",
                "contract.summary.generated",
                bootstrap_servers=FMConfig.KAFKA_BOOTSTRAP_SERVERS,
                group_id=FMConfig.KAFKA_GROUP_ID,
                client_id=FMConfig.KAFKA_CLIENT_ID,
                enable_auto_commit=True,
                value_deserializer=lambda v: json.loads(v.decode("utf-8")),
                auto_offset_reset="earliest",  # Changed to earliest to catch existing messages
            )
            await self._consumer.start()
            self._running = True
            asyncio.create_task(self._consume_loop())
            logger.info("[FILE_CONSUMER_STARTED] topics=['file.metadata.recorded', 'file.plaintext.extracted', 'contract.summary.generated']")

    async def stop(self) -> None:
        self._running = False
        if self._consumer is not None:
            try:
                await self._consumer.stop()
            finally:
                self._consumer = None

    async def _consume_loop(self) -> None:
        assert self._consumer is not None
        while self._running:
            try:
                msg = await self._consumer.getone()
                await self._handle_message(msg.value)
            except Exception as e:
                logger.error("[KAFKA_CONSUME_ERROR] %s", e, exc_info=True)

    async def _handle_message(self, payload: dict) -> None:
        try:
            event_type = payload.get("eventType")
            
            if event_type == "file.metadata.recorded":
                await self._save_file_basic_metadata(payload.get("data"))
            elif event_type == "file.plaintext.extracted":
                await self._save_file_processed_metadata(payload.get("data"))
            elif event_type == "contract.summary.generated":
                await self._update_file_analysis(payload.get("data"))
            else:
                logger.info("[FILE_EVENT_IGNORED] eventType=%s", event_type)
                
        except Exception as e:
            logger.error("[FILE_EVENT_ERROR] %s", e, exc_info=True)
    
    async def _save_file_basic_metadata(self, file_data: dict) -> None:
        """Save basic file metadata from file.metadata.recorded event"""
        try:
            from config import get_mongodb_database
            
            db = get_mongodb_database()
            collection = db.files
            
            file_id = file_data.get("fileId")
            if not file_id:
                logger.error("[MONGODB_SAVE_ERROR] Missing fileId in event data")
                return
            
            basic_doc = {
                "_id": file_id,
                "name": file_data.get("name"),
                "contentType": file_data.get("contentType"),
                "size": file_data.get("size"),
                "storage": file_data.get("storage"),
                "ownerUserId": file_data.get("ownerUserId", "system"),
                "version": file_data.get("version", 1),
                "status": "UPLOADED",
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }
            
            result = await collection.replace_one(
                {"_id": file_id},
                basic_doc,
                upsert=True
            )
            
            logger.info("[MONGODB_FILE_BASIC_SAVED] fileId=%s name=%s", file_id, file_data.get("name"))
            
        except Exception as e:
            logger.error("[MONGODB_FILE_BASIC_SAVE_ERROR] %s", e, exc_info=True)

    async def _save_file_processed_metadata(self, file_data: dict) -> None:
        """Save processed file metadata from file.plaintext.extracted event"""
        try:
            from config import get_mongodb_database
            
            db = get_mongodb_database()
            collection = db.files
            
            file_id = file_data.get("fileId")
            if not file_id:
                logger.error("[MONGODB_SAVE_ERROR] Missing fileId")
                return
            
            # Merge với existing data
            existing = await collection.find_one({"_id": file_id})
            if existing:
                existing.update({
                    "plaintext": file_data.get("plaintext"),
                    "ocr": file_data.get("ocr"),
                    "jsonContent": file_data.get("jsonContent"),
                    "classification": file_data.get("classification"),
                    "processing": file_data.get("processing"),
                    "status": "PROCESSED",
                    "updatedAt": datetime.now(timezone.utc).isoformat()
                })
                
                await collection.replace_one({"_id": file_id}, existing)
            else:
                # Create new document if not exists
                await collection.insert_one({
                    "_id": file_id,
                    "plaintext": file_data.get("plaintext"),
                    "ocr": file_data.get("ocr"),
                    "jsonContent": file_data.get("jsonContent"),
                    "classification": file_data.get("classification"),
                    "processing": file_data.get("processing"),
                    "status": "PROCESSED",
                    "createdAt": datetime.now(timezone.utc).isoformat(),
                    "updatedAt": datetime.now(timezone.utc).isoformat()
                })
            
            logger.info("[MONGODB_FILE_PROCESSED_SAVED] fileId=%s isContract=%s", file_id, file_data.get("classification", {}).get("isContract"))
            
        except Exception as e:
            logger.error("[MONGODB_FILE_PROCESSED_SAVE_ERROR] %s", e, exc_info=True)

    async def _update_file_metadata(self, file_data: dict) -> None:
        """Update file với contract analysis hoặc metadata khác"""
        try:
            from config import get_mongodb_database
            
            db = get_mongodb_database()
            collection = db.files
            
            file_id = file_data.get("id")
            update_type = file_data.get("updateType")
            
            if update_type == "contract_analysis":
                contract_data = file_data.get("contract")
                await collection.update_one(
                    {"_id": file_id},
                    {
                        "$set": {
                            "contract": contract_data,
                            "status": "ANALYZED",
                            "updatedAt": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                logger.info("[MONGODB_FILE_CONTRACT_UPDATED] fileId=%s", file_id)
            
        except Exception as e:
            logger.error("[MONGODB_FILE_UPDATE_ERROR] %s", e, exc_info=True)

    async def _update_file_analysis(self, file_data: dict) -> None:
        """Update file with contract summary from contract.summary.generated event"""
        try:
            from config import get_mongodb_database
            
            db = get_mongodb_database()
            collection = db.files
            
            file_id = file_data.get("fileId")
            if not file_id:
                logger.error("[MONGODB_UPDATE_ERROR] Missing fileId")
                return
                
            await collection.update_one(
                {"_id": file_id},
                {
                    "$set": {
                        "contractSummary": file_data.get("summary"),
                        "contractMetadata": file_data.get("contractMetadata"),
                        "status": "ANALYZED",
                        "updatedAt": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            logger.info("[MONGODB_FILE_ANALYSIS_UPDATED] fileId=%s hasSummary=%s", file_id, bool(file_data.get("summary")))
            
        except Exception as e:
            logger.error("[MONGODB_FILE_ANALYSIS_UPDATE_ERROR] %s", e, exc_info=True)

    async def _delete_file_metadata(self, file_data: dict) -> None:
        """Mark file as deleted"""
        try:
            from config import get_mongodb_database
            
            db = get_mongodb_database()
            collection = db.files
            
            file_id = file_data.get("id")
            await collection.update_one(
                {"_id": file_id},
                {
                    "$set": {
                        "status": "DELETED",
                        "deletedAt": datetime.now(timezone.utc).isoformat(),
                        "updatedAt": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            logger.info("[MONGODB_FILE_DELETED] fileId=%s", file_id)
            
        except Exception as e:
            logger.error("[MONGODB_FILE_DELETE_ERROR] %s", e, exc_info=True)
    
    async def get_file_metadata(self, file_id: str) -> Optional[dict]:
        """Get file metadata from MongoDB"""
        try:
            from config import get_mongodb_database
            
            db = get_mongodb_database()
            collection = db.files  # Đổi từ 'documents' thành 'files'
            
            file_doc = await collection.find_one({"_id": file_id})
            if file_doc:
                # Remove MongoDB _id field to match API response format
                file_doc.pop("_id", None)
                return file_doc
            else:
                logger.info("[MONGODB_NOT_FOUND] fileId=%s", file_id)
                return None
                
        except Exception as e:
            logger.error("[MONGODB_FILE_GET_ERROR] fileId=%s error=%s", file_id, e, exc_info=True)
            return None


