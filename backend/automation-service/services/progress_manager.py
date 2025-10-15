"""
Progress Manager for tracking document processing progress
Manages progress state in memory with support for multiple connections per document
"""

import asyncio
import time
from typing import Dict, Optional, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ProgressManager:
    """
    Manages progress state for document processing
    Supports multiple connections per document_id
    """
    
    def __init__(self):
        # In-memory storage: {document_id: ProgressState}
        self._progress_states: Dict[str, Dict[str, Any]] = {}
        # Connection tracking: {document_id: [websocket_connections]}
        self._connections: Dict[str, list] = {}
        # Lock for thread safety
        self._lock = asyncio.Lock()
    
    async def set_progress(self, document_id: str, progress: int, stage: str, message: str = "", metadata: Optional[Dict] = None):
        """
        Set progress for a document
        
        Args:
            document_id: Document ID
            progress: Progress percentage (0-100)
            stage: Current processing stage
            message: Human-readable message
            metadata: Additional metadata
        """
        async with self._lock:
            self._progress_states[document_id] = {
                "progress": progress,
                "stage": stage,
                "message": message,
                "metadata": metadata or {},
                "timestamp": datetime.now().isoformat(),
                "updated_at": time.time()
            }
            
            logger.info(f"Progress updated for {document_id}: {progress}% - {stage}")
    
    async def get_progress(self, document_id: str) -> Optional[Dict[str, Any]]:
        """
        Get current progress for a document
        
        Args:
            document_id: Document ID
            
        Returns:
            Progress state dict or None if not found
        """
        async with self._lock:
            return self._progress_states.get(document_id)
    
    async def add_connection(self, document_id: str, websocket):
        """
        Add WebSocket connection for a document
        
        Args:
            document_id: Document ID
            websocket: WebSocket connection
        """
        async with self._lock:
            if document_id not in self._connections:
                self._connections[document_id] = []
            self._connections[document_id].append(websocket)
            logger.info(f"Added connection for {document_id}. Total connections: {len(self._connections[document_id])}")
    
    async def remove_connection(self, document_id: str, websocket):
        """
        Remove WebSocket connection for a document
        
        Args:
            document_id: Document ID
            websocket: WebSocket connection
        """
        async with self._lock:
            if document_id in self._connections:
                try:
                    self._connections[document_id].remove(websocket)
                    if not self._connections[document_id]:
                        del self._connections[document_id]
                    logger.info(f"Removed connection for {document_id}")
                except ValueError:
                    pass  # Connection not in list
    
    async def get_connections(self, document_id: str) -> list:
        """
        Get all connections for a document
        
        Args:
            document_id: Document ID
            
        Returns:
            List of WebSocket connections
        """
        async with self._lock:
            return self._connections.get(document_id, [])
    
    async def broadcast_progress(self, document_id: str, data: Dict[str, Any]):
        """
        Broadcast progress update to all connections for a document
        
        Args:
            document_id: Document ID
            data: Progress data to broadcast
        """
        connections = await self.get_connections(document_id)
        
        if not connections:
            logger.warning(f"No connections found for {document_id}")
            return
        
        # Send to all connections
        disconnected = []
        for websocket in connections:
            try:
                await websocket.send_json(data)
                logger.debug(f"Broadcasted progress to {document_id}: {data}")
            except Exception as e:
                logger.error(f"Failed to send progress to {document_id}: {e}")
                disconnected.append(websocket)
        
        # Remove disconnected connections
        for websocket in disconnected:
            await self.remove_connection(document_id, websocket)
    
    async def cleanup_old_progress(self, max_age_seconds: int = 3600):
        """
        Clean up old progress states
        
        Args:
            max_age_seconds: Maximum age in seconds (default: 1 hour)
        """
        current_time = time.time()
        async with self._lock:
            to_remove = []
            for doc_id, state in self._progress_states.items():
                if current_time - state.get("updated_at", 0) > max_age_seconds:
                    to_remove.append(doc_id)
            
            for doc_id in to_remove:
                del self._progress_states[doc_id]
                if doc_id in self._connections:
                    del self._connections[doc_id]
                logger.info(f"Cleaned up old progress for {doc_id}")
    
    async def get_all_progress(self) -> Dict[str, Dict[str, Any]]:
        """
        Get all current progress states (for debugging)
        
        Returns:
            Dict of all progress states
        """
        async with self._lock:
            return self._progress_states.copy()
    
    async def clear_progress(self, document_id: str):
        """
        Clear progress for a specific document
        
        Args:
            document_id: Document ID
        """
        async with self._lock:
            if document_id in self._progress_states:
                del self._progress_states[document_id]
            if document_id in self._connections:
                del self._connections[document_id]
            logger.info(f"Cleared progress for {document_id}")

# Global instance
progress_manager = ProgressManager()
