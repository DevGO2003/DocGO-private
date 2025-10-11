import logging
import json
import os
import sys
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path

class JsonFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "service": "automation-service",
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Add request ID and correlation ID if available
        if hasattr(record, 'request_id'):
            log_entry["requestId"] = record.request_id
        if hasattr(record, 'correlation_id'):
            log_entry["correlationId"] = record.correlation_id
        
        # Add extra fields
        if hasattr(record, 'extra_fields'):
            log_entry.update(record.extra_fields)
        
        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": self.formatException(record.exc_info)
            }
        
        return json.dumps(log_entry, ensure_ascii=False)

class Logger:
    """Centralized logger for Automation Service"""
    
    _instance: Optional['Logger'] = None
    _logger: Optional[logging.Logger] = None
    
    def __new__(cls) -> 'Logger':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._logger is None:
            self._setup_logger()
    
    def _setup_logger(self):
        """Setup logger with JSON formatting"""
        self._logger = logging.getLogger('automation-service')
        self._logger.setLevel(getattr(logging, os.getenv('LOG_LEVEL', 'INFO').upper()))
        
        # Remove existing handlers
        for handler in self._logger.handlers[:]:
            self._logger.removeHandler(handler)
        
        # Console handler with JSON formatting
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(JsonFormatter())
        self._logger.addHandler(console_handler)
        
        # File handler for persistent logging
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        file_handler = logging.FileHandler(log_dir / "automation-service.log")
        file_handler.setFormatter(JsonFormatter())
        self._logger.addHandler(file_handler)
        
        # Prevent duplicate logs
        self._logger.propagate = False
    
    def _log_with_context(self, level: str, message: str, **kwargs):
        """Log with additional context"""
        extra_fields = kwargs.pop('extra_fields', {})
        request_id = kwargs.pop('request_id', None)
        correlation_id = kwargs.pop('correlation_id', None)
        
        # Create a new log record with extra fields
        record = self._logger.makeRecord(
            self._logger.name,
            getattr(logging, level.upper()),
            "",  # filename
            0,   # lineno
            message,
            (),  # args
            None  # exc_info
        )
        
        if request_id:
            record.request_id = request_id
        if correlation_id:
            record.correlation_id = correlation_id
        if extra_fields:
            record.extra_fields = extra_fields
        
        self._logger.handle(record)
    
    def info(self, message: str, **kwargs):
        """Log info message"""
        self._log_with_context('INFO', message, **kwargs)
    
    def debug(self, message: str, **kwargs):
        """Log debug message"""
        self._log_with_context('DEBUG', message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log warning message"""
        self._log_with_context('WARNING', message, **kwargs)
    
    def error(self, message: str, **kwargs):
        """Log error message"""
        self._log_with_context('ERROR', message, **kwargs)
    
    def critical(self, message: str, **kwargs):
        """Log critical message"""
        self._log_with_context('CRITICAL', message, **kwargs)
    
    def log_request(self, method: str, url: str, request_id: str, correlation_id: str, **kwargs):
        """Log incoming request"""
        self.info(
            f"Incoming request: {method} {url}",
            request_id=request_id,
            correlation_id=correlation_id,
            extra_fields={
                "stage": "incoming",
                "method": method,
                "url": url,
                **kwargs
            }
        )
    
    def log_proxy_request(self, target_service: str, target_url: str, method: str, request_id: str, correlation_id: str):
        """Log outgoing proxy request"""
        self.info(
            f"Proxying request to {target_service}: {method} {target_url}",
            request_id=request_id,
            correlation_id=correlation_id,
            extra_fields={
                "stage": "proxying",
                "targetService": target_service,
                "targetUrl": target_url,
                "method": method
            }
        )
    
    def log_response(self, status_code: int, duration_ms: int, request_id: str, correlation_id: str, **kwargs):
        """Log response"""
        level = "error" if status_code >= 400 else "info"
        stage = "error" if status_code >= 400 else "response"
        
        getattr(self, level)(
            f"Response: {status_code} ({duration_ms}ms)",
            request_id=request_id,
            correlation_id=correlation_id,
            extra_fields={
                "stage": stage,
                "statusCode": status_code,
                "duration": duration_ms,
                **kwargs
            }
        )
    
    def log_external_call(self, service: str, url: str, method: str, status_code: int, duration_ms: int, request_id: str, correlation_id: str):
        """Log external service call"""
        level = "error" if status_code >= 400 else "info"
        
        getattr(self, level)(
            f"External call to {service}: {method} {url} -> {status_code} ({duration_ms}ms)",
            request_id=request_id,
            correlation_id=correlation_id,
            extra_fields={
                "stage": "external_call",
                "service": service,
                "url": url,
                "method": method,
                "statusCode": status_code,
                "duration": duration_ms
            }
        )
    
    def log_database_query(self, operation: str, collection: str, duration_ms: int, request_id: str, correlation_id: str, **kwargs):
        """Log database query"""
        self.info(
            f"Database {operation} on {collection} ({duration_ms}ms)",
            request_id=request_id,
            correlation_id=correlation_id,
            extra_fields={
                "stage": "database",
                "operation": operation,
                "collection": collection,
                "duration": duration_ms,
                **kwargs
            }
        )

# Global logger instance
logger = Logger()

# Convenience functions
def get_logger() -> Logger:
    """Get the global logger instance"""
    return logger

def log_request(method: str, url: str, request_id: str, correlation_id: str, **kwargs):
    """Log incoming request"""
    logger.log_request(method, url, request_id, correlation_id, **kwargs)

def log_proxy_request(target_service: str, target_url: str, method: str, request_id: str, correlation_id: str):
    """Log outgoing proxy request"""
    logger.log_proxy_request(target_service, target_url, method, request_id, correlation_id)

def log_response(status_code: int, duration_ms: int, request_id: str, correlation_id: str, **kwargs):
    """Log response"""
    logger.log_response(status_code, duration_ms, request_id, correlation_id, **kwargs)

def log_external_call(service: str, url: str, method: str, status_code: int, duration_ms: int, request_id: str, correlation_id: str):
    """Log external service call"""
    logger.log_external_call(service, url, method, status_code, duration_ms, request_id, correlation_id)

def log_database_query(operation: str, collection: str, duration_ms: int, request_id: str, correlation_id: str, **kwargs):
    """Log database query"""
    logger.log_database_query(operation, collection, duration_ms, request_id, correlation_id, **kwargs)

