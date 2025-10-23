"""
Test Upload Script - Test Event Architecture v3

Test file: hop-dong-day-du.txt (Vietnamese labor contract)
Expected flow:
1. Upload file → Event 1: FILE_UPLOAD_COMPLETED
2. Process content → Event 2: FILE_CONTENT_EXTRACTED
3. Analyze contract → Event 3: CONTRACT_SUMMARY_GENERATED (if isContract=true)
"""

import logging
import sys
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from services.upload_handler import UploadHandler
from services.content_processor import ContentProcessor
from services.contract_analyzer import ContractAnalyzer
from services.kafka_publisher_v3 import KafkaPublisherV3


def test_upload_workflow():
    """Test complete upload workflow"""
    
    logger.info("\n" + "="*80)
    logger.info("🧪 STARTING EVENT ARCHITECTURE V3 TEST")
    logger.info("="*80 + "\n")
    
    # Initialize services
    kafka_publisher = KafkaPublisherV3()
    upload_handler = UploadHandler(kafka_publisher)
    content_processor = ContentProcessor(kafka_publisher)
    contract_analyzer = ContractAnalyzer(kafka_publisher)
    
    # Read test file
    test_file_path = Path(__file__).parent.parent / "hop-dong-day-du.txt"
    
    if not test_file_path.exists():
        logger.error(f"❌ Test file not found: {test_file_path}")
        return
    
    with open(test_file_path, 'rb') as f:
        file_content = f.read()
    
    logger.info(f"📂 Test file loaded: {test_file_path.name} ({len(file_content)} bytes)")
    
    # Test parameters
    owner_user_id = "user-12345"
    correlation_id = "test-correlation-001"
    actor = f"user:{owner_user_id}"
    
    # ========== EVENT 1: FILE_UPLOAD_COMPLETED ==========
    logger.info("\n" + "="*80)
    logger.info("📤 PHASE 1: UPLOAD FILE")
    logger.info("="*80 + "\n")
    
    upload_result = upload_handler.handle_upload(
        file_data=file_content,
        file_name="hop-dong-day-du.txt",
        mime_type="text/plain",
        owner_user_id=owner_user_id,
        correlation_id=correlation_id,
        actor=actor
    )
    
    if not upload_result["success"]:
        logger.error(f"❌ Upload failed: {upload_result['error']}")
        return
    
    document_id = upload_result["documentId"]
    event1_id = upload_result["eventId"]
    
    logger.info(f"\n✅ EVENT 1 RESULT:")
    logger.info(f"   DocumentId: {document_id}")
    logger.info(f"   EventId: {event1_id}")
    logger.info(f"   S3 URL: {upload_result['s3_result']['url']}")
    
    # ========== EVENT 2: FILE_CONTENT_EXTRACTED ==========
    logger.info("\n" + "="*80)
    logger.info("📝 PHASE 2: PROCESS CONTENT")
    logger.info("="*80 + "\n")
    
    content_result = content_processor.process_content(
        document_id=document_id,
        file_data=file_content,
        mime_type="text/plain",
        correlation_id=correlation_id,
        actor="system"
    )
    
    if not content_result["success"]:
        logger.error(f"❌ Content processing failed: {content_result['error']}")
        return
    
    event2_id = content_result["eventId"]
    is_contract = content_result["isContract"]
    
    logger.info(f"\n✅ EVENT 2 RESULT:")
    logger.info(f"   EventId: {event2_id}")
    logger.info(f"   isContract: {is_contract}")
    logger.info(f"   Classification: {content_result['classification']}")
    
    # ========== EVENT 3: CONTRACT_SUMMARY_GENERATED (CONDITIONAL) ==========
    logger.info("\n" + "="*80)
    logger.info("📜 PHASE 3: ANALYZE CONTRACT (CONDITIONAL)")
    logger.info("="*80 + "\n")
    
    contract_result = contract_analyzer.analyze_contract(
        document_id=document_id,
        text="extracted_text_placeholder",
        is_contract=is_contract,
        correlation_id=correlation_id,
        actor="system"
    )
    
    if not contract_result["success"]:
        logger.error(f"❌ Contract analysis failed: {contract_result['error']}")
        return
    
    if contract_result.get("eventPublished"):
        event3_id = contract_result["eventId"]
        logger.info(f"\n✅ EVENT 3 RESULT:")
        logger.info(f"   EventId: {event3_id}")
        logger.info(f"   Contract Type: {contract_result['analysis'].get('type')}")
    else:
        logger.info(f"\n⚠️ EVENT 3 NOT PUBLISHED (Document is not a contract)")
    
    # ========== SUMMARY ==========
    logger.info("\n" + "="*80)
    logger.info("✅ TEST COMPLETED SUCCESSFULLY")
    logger.info("="*80)
    logger.info(f"\n📊 SUMMARY:")
    logger.info(f"   Document ID: {document_id}")
    logger.info(f"   Event 1 (Upload): {event1_id}")
    logger.info(f"   Event 2 (Content): {event2_id}")
    logger.info(f"   Event 3 (Contract): {event3_id if contract_result.get('eventPublished') else 'NOT PUBLISHED'}")
    logger.info(f"   Is Contract: {is_contract}")
    logger.info(f"\n✅ All events published successfully!\n")


if __name__ == "__main__":
    test_upload_workflow()
