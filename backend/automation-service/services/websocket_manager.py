

import asyncio
import logging
from typing import Dict, List, Optional, Any
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime
import json

from .progress_manager import progress_manager

logger = logging.getLogger(__name__)

class WebSocketManager:
    
    
    def __init__(self):
        # Connection tracking: {document_id: [websocket_connections]}
        self._connections: Dict[str, List[WebSocket]] = {}
        # Lock for thread safety
        self._lock = asyncio.Lock()
    
    async def connect(self, websocket: WebSocket, document_id: str):
        
        try:
            await websocket.accept()
            
            async with self._lock:
                if document_id not in self._connections:
                    self._connections[document_id] = []
                self._connections[document_id].append(websocket)
            
            # Add to progress manager
            await progress_manager.add_connection(document_id, websocket)
            
            # Send current progress if available
            current_progress = await progress_manager.get_progress(document_id)
            if current_progress:
                await self._send_progress_update(websocket, document_id, current_progress)
            
            logger.info(f"WebSocket connected for document {document_id}")
            
        except Exception as e:
            logger.error(f"Failed to connect WebSocket for {document_id}: {e}")
            await self.disconnect(websocket, document_id)
    
    async def disconnect(self, websocket: WebSocket, document_id: str):
        
        try:
            async with self._lock:
                if document_id in self._connections:
                    try:
                        self._connections[document_id].remove(websocket)
                        if not self._connections[document_id]:
                            del self._connections[document_id]
                    except ValueError:
                        pass  # Connection not in list
            
            # Remove from progress manager
            await progress_manager.remove_connection(document_id, websocket)
            
            logger.info(f"WebSocket disconnected for document {document_id}")
            
        except Exception as e:
            logger.error(f"Failed to disconnect WebSocket for {document_id}: {e}")
    
    async def broadcast_progress(self, document_id: str, progress: int, stage: str, message: str = "", metadata: Optional[Dict] = None):
        
        # Update progress in manager
        await progress_manager.set_progress(document_id, progress, stage, message, metadata)
        
        # Prepare broadcast data
        broadcast_data = {
            "documentId": document_id,
            "progress": progress,
            "stage": stage,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        
        # Get all connections for this document
        connections = await progress_manager.get_connections(document_id)
        
        if not connections:
            logger.warning(f"No connections found for document {document_id}")
            return
        
        # Send to all connections
        disconnected = []
        for websocket in connections:
            try:
                await self._send_progress_update(websocket, document_id, broadcast_data)
                logger.debug(f"Broadcasted progress to {document_id}: {progress}% - {stage}")
            except Exception as e:
                logger.error(f"Failed to broadcast progress to {document_id}: {e}")
                disconnected.append(websocket)
        
        # Remove disconnected connections
        for websocket in disconnected:
            await self.disconnect(websocket, document_id)
    
    async def _send_progress_update(self, websocket: WebSocket, document_id: str, data: Dict[str, Any]):
        
        try:
            await websocket.send_json(data)
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected for {document_id}")
            await self.disconnect(websocket, document_id)
        except Exception as e:
            logger.error(f"Failed to send progress update to {document_id}: {e}")
            raise
    
    async def get_connection_count(self, document_id: str) -> int:
        
        connections = await progress_manager.get_connections(document_id)
        return len(connections)
    
    async def get_all_connections(self) -> Dict[str, int]:
        
        async with self._lock:
            return {doc_id: len(connections) for doc_id, connections in self._connections.items()}
    
    async def cleanup_disconnected(self):
        
        async with self._lock:
            for document_id, connections in list(self._connections.items()):
                active_connections = []
                for websocket in connections:
                    try:
                        # Try to ping the connection
                        await websocket.ping()
                        active_connections.append(websocket)
                    except:
                        # Connection is dead, remove it
                        await progress_manager.remove_connection(document_id, websocket)
                
                if active_connections:
                    self._connections[document_id] = active_connections
                else:
                    del self._connections[document_id]
                    logger.info(f"Cleaned up all connections for {document_id}")
    
    async def send_error(self, document_id: str, error_message: str, error_code: str = "PROCESSING_ERROR"):
        
        error_data = {
            "documentId": document_id,
            "error": True,
            "errorCode": error_code,
            "errorMessage": error_message,
            "timestamp": datetime.now().isoformat()
        }
        
        connections = await progress_manager.get_connections(document_id)
        for websocket in connections:
            try:
                await websocket.send_json(error_data)
            except Exception as e:
                logger.error(f"Failed to send error to {document_id}: {e}")
                await self.disconnect(websocket, document_id)
    
    async def send_completion(self, document_id: str, result_data: Optional[Dict] = None):
        
        completion_data = {
            "documentId": document_id,
            "progress": 100,
            "stage": "processing_complete",
            "message": "Xử lý hoàn tất",
            "completed": True,
            "result": result_data or {},
            "timestamp": datetime.now().isoformat()
        }
        
        # Update final progress
        await progress_manager.set_progress(document_id, 100, "processing_complete", "Xử lý hoàn tất", result_data)
        
        # Broadcast completion
        connections = await progress_manager.get_connections(document_id)
        for websocket in connections:
            try:
                await websocket.send_json(completion_data)
            except Exception as e:
                logger.error(f"Failed to send completion to {document_id}: {e}")
                await self.disconnect(websocket, document_id)

# Global instance
websocket_manager = WebSocketManager()
