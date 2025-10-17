"""
Global service instances to avoid circular imports
"""
from services.event_service import EventService
from services.audit_service import AuditService
from services.batch_service import BatchService

# Global instances
event_service = EventService()
audit_service = AuditService()
batch_service = BatchService()


