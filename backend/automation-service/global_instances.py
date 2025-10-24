"""
Global service instances to avoid circular imports
"""
# from services.event_service import EventService  # DISABLED - Requires Redis
from services.audit_service import AuditService
# from services.batch_service import BatchService  # DISABLED - Requires Redis

# Global instances
# event_service = EventService()  # DISABLED - Requires Redis
audit_service = AuditService()
# batch_service = BatchService()  # DISABLED - Requires Redis
