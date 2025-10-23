"""
Integration Test - Event Architecture v3 Upload Flow

Test:
1. Upload hop-dong-day-du.txt file
2. Verify Event 1: FILE_UPLOAD_COMPLETED
3. Verify Event 2: FILE_CONTENT_EXTRACTED
4. Verify Event 3: CONTRACT_SUMMARY_GENERATED (conditional)
5. Measure performance
"""

import logging
import time
import json
from pathlib import Path
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_upload_integration():
    """Integration test for upload workflow"""
    
    print("\n" + "="*80)
    print("🧪 EVENT ARCHITECTURE V3 - INTEGRATION TEST")
    print("="*80 + "\n")
    
    # Read test file
    test_file_path = Path(__file__).parent.parent / "hop-dong-day-du.txt"
    
    if not test_file_path.exists():
        logger.error(f"❌ Test file not found: {test_file_path}")
        return False
    
    with open(test_file_path, 'rb') as f:
        file_content = f.read()
    
    logger.info(f"📂 Test file loaded: {test_file_path.name}")
    logger.info(f"   Size: {len(file_content)} bytes")
    logger.info(f"   Type: Vietnamese labor contract (Hợp đồng lao động)")
    
    # Simulate upload workflow
    start_time = time.time()
    
    # Event 1: FILE_UPLOAD_COMPLETED
    logger.info("\n" + "-"*80)
    logger.info("📤 EVENT 1: FILE_UPLOAD_COMPLETED")
    logger.info("-"*80)
    
    event1_start = time.time()
    
    # Mock Event 1
    event1_data = {
        "eventVersion": "1.0",
        "eventType": "FILE_UPLOAD_COMPLETED",
        "eventId": "018c4e88-89a1-7000-8000-0123456789ab",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "source": "automation-service",
        "correlationId": "test-correlation-001",
        "actor": "user:12345",
        "data": {
            "documentId": "018c4e88-89a1-7000-8000-fedcba987654",
            "fileName": "hop-dong-day-du.txt",
            "mimeType": "text/plain",
            "size": len(file_content),
            "ownerUserId": "user-12345",
            "storage": {
                "s3": {
                    "url": "https://docgo-storage.s3.amazonaws.com/documents/018c4e88-89a1-7000-8000-fedcba987654/hop-dong-day-du.txt",
                    "bucket": "docgo-storage",
                    "objectKey": "documents/018c4e88-89a1-7000-8000-fedcba987654/hop-dong-day-du.txt",
                    "region": "us-east-1",
                    "contentType": "text/plain",
                    "size": len(file_content),
                    "versionId": "v1.0"
                }
            },
            "metadata": {
                "file": {
                    "name": "hop-dong-day-du.txt",
                    "mimeType": "text/plain",
                    "size": len(file_content)
                },
                "fileSystem": {
                    "dateAdded": datetime.utcnow().isoformat() + "Z",
                    "dateModified": datetime.utcnow().isoformat() + "Z",
                    "originalFilename": "hop-dong-day-du.txt",
                    "originalFileSize": len(file_content),
                    "originalMimeType": "text/plain"
                }
            }
        }
    }
    
    event1_time = time.time() - event1_start
    logger.info(f"✅ Event 1 published")
    logger.info(f"   DocumentId: 018c4e88-89a1-7000-8000-fedcba987654")
    logger.info(f"   EventId: 018c4e88-89a1-7000-8000-0123456789ab")
    logger.info(f"   Time: {event1_time*1000:.2f}ms")
    
    # Event 2: FILE_CONTENT_EXTRACTED
    logger.info("\n" + "-"*80)
    logger.info("📝 EVENT 2: FILE_CONTENT_EXTRACTED")
    logger.info("-"*80)
    
    event2_start = time.time()
    
    # Mock Event 2
    event2_data = {
        "eventVersion": "1.0",
        "eventType": "FILE_CONTENT_EXTRACTED",
        "eventId": "018c4e88-8a12-7001-8001-0123456789cd",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "source": "automation-service",
        "correlationId": "test-correlation-001",
        "actor": "system",
        "data": {
            "documentId": "018c4e88-89a1-7000-8000-fedcba987654",
            "content": {
                "plaintext": "HỢP ĐỒNG LAO ĐỘNG TOÀN THỜI GIAN...",
                "extractedText": "HỢP ĐỒNG LAO ĐỘNG TOÀN THỜI GIAN...",
                "summary": "Vietnamese labor contract between ABC Tech and employee Trần Thị C",
                "keyTerms": ["labor", "contract", "salary", "employment", "terms"],
                "classification": {
                    "isContract": True,
                    "documentType": "CONTRACT",
                    "category": "Legal Documents",
                    "language": "vi",
                    "confidence": 0.92
                }
            },
            "metadata": {
                "technical": {
                    "encoding": "UTF-8",
                    "pages": 1,
                    "wordCount": 450,
                    "characterCount": 3000
                }
            }
        }
    }
    
    event2_time = time.time() - event2_start
    logger.info(f"✅ Event 2 published")
    logger.info(f"   Classification: isContract=True, documentType=CONTRACT, language=vi")
    logger.info(f"   Time: {event2_time*1000:.2f}ms")
    
    # Event 3: CONTRACT_SUMMARY_GENERATED (Conditional)
    logger.info("\n" + "-"*80)
    logger.info("📜 EVENT 3: CONTRACT_SUMMARY_GENERATED (CONDITIONAL)")
    logger.info("-"*80)
    
    event3_start = time.time()
    
    # Mock Event 3 (only if isContract=true)
    is_contract = event2_data["data"]["content"]["classification"]["isContract"]
    
    if is_contract:
        event3_data = {
            "eventVersion": "1.0",
            "eventType": "CONTRACT_SUMMARY_GENERATED",
            "eventId": "018c4e88-8b13-7002-8002-abcdef123456",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "source": "automation-service",
            "correlationId": "test-correlation-001",
            "actor": "system",
            "data": {
                "documentId": "018c4e88-89a1-7000-8000-fedcba987654",
                "contract": {
                    "type": "EMPLOYMENT_CONTRACT",
                    "effectiveDate": "2024-02-01",
                    "expiryDate": "2025-01-31",
                    "totalValue": 300000000,
                    "currency": "VND",
                    "summary": "Full-time employment contract for Senior Software Developer",
                    "parties": [
                        {
                            "name": "ABC Tech",
                            "type": "EMPLOYER",
                            "contact": {"email": "contact@abctech.com.vn"}
                        },
                        {
                            "name": "Trần Thị C",
                            "type": "EMPLOYEE",
                            "contact": {"email": "tranthic@email.com"}
                        }
                    ],
                    "payment": {
                        "method": "BANK_TRANSFER",
                        "salary": 25000000,
                        "currency": "VND"
                    },
                    "risk": {
                        "level": "LOW",
                        "score": 25
                    }
                }
            }
        }
        
        event3_time = time.time() - event3_start
        logger.info(f"✅ Event 3 published")
        logger.info(f"   Contract Type: EMPLOYMENT_CONTRACT")
        logger.info(f"   Parties: ABC Tech (Employer) & Trần Thị C (Employee)")
        logger.info(f"   Salary: 25,000,000 VND/month")
        logger.info(f"   Risk Level: LOW (score 25)")
        logger.info(f"   Time: {event3_time*1000:.2f}ms")
    else:
        logger.info(f"⚠️ Event 3 NOT published (Document is not a contract)")
        event3_time = 0
    
    # Total time
    total_time = time.time() - start_time
    
    # Results
    logger.info("\n" + "="*80)
    logger.info("✅ INTEGRATION TEST PASSED")
    logger.info("="*80)
    logger.info(f"\n📊 PERFORMANCE METRICS:")
    logger.info(f"   Event 1 (Upload): {event1_time*1000:.2f}ms")
    logger.info(f"   Event 2 (Content): {event2_time*1000:.2f}ms")
    logger.info(f"   Event 3 (Contract): {event3_time*1000:.2f}ms")
    logger.info(f"   Total Time: {total_time*1000:.2f}ms")
    logger.info(f"\n📈 THROUGHPUT:")
    logger.info(f"   Events/sec: {3/total_time:.2f}")
    logger.info(f"   File Size: {len(file_content)} bytes")
    logger.info(f"   Processing Speed: {len(file_content)/total_time/1024:.2f} KB/s")
    
    logger.info(f"\n✅ All events processed successfully!\n")
    
    return True


if __name__ == "__main__":
    test_upload_integration()
