#!/usr/bin/env python3
"""
Test AI service để debug contract detection
"""

import asyncio
import json
from unittest.mock import Mock, patch

# Mock OCR service
class MockOCRService:
    def __init__(self):
        self.call_count = 0
    
    async def generate_contract_summary(self, text, filename):
        """Mock contract summary generation"""
        self.call_count += 1
        print(f"[MOCK OCR] generate_contract_summary called #{self.call_count}")
        print(f"  text length: {len(text) if text else 0}")
        print(f"  filename: {filename}")
        
        # Simulate AI response
        if text and "contract" in text.lower():
            return {
                "type": "SOFTWARE_DEVELOPMENT",
                "summary": f"Mock contract summary for {filename}",
                "effectiveDate": "2025-01-01",
                "totalValue": 100000,
                "currency": "USD"
            }
        else:
            return None

# Mock AI service
class MockAIService:
    def __init__(self):
        self.call_count = 0
    
    async def classify_document(self, text, filename):
        """Mock document classification"""
        self.call_count += 1
        print(f"[MOCK AI] classify_document called #{self.call_count}")
        print(f"  text length: {len(text) if text else 0}")
        print(f"  filename: {filename}")
        
        # Simulate AI response
        if text and "contract" in text.lower():
            return {
                "documentType": "CONTRACT",
                "isContract": True,
                "confidence": 0.95,
                "reasons": ["Document contains contract terms"],
                "category": "Legal Documents",
                "language": "vi"
            }
        else:
            return {
                "documentType": "INVOICE",
                "isContract": False,
                "confidence": 0.85,
                "reasons": ["Document appears to be invoice"],
                "category": "Financial Documents",
                "language": "vi"
            }

async def test_contract_detection():
    """Test contract detection flow"""
    print("=== TEST CONTRACT DETECTION FLOW ===")
    
    # Mock services
    ocr_service = MockOCRService()
    ai_service = MockAIService()
    
    # Test cases
    test_cases = [
        {
            "name": "Contract document",
            "text": "This is a software development contract between Company A and Company B...",
            "filename": "contract.pdf"
        },
        {
            "name": "Invoice document", 
            "text": "Invoice #12345 for services rendered...",
            "filename": "invoice.pdf"
        },
        {
            "name": "Empty text",
            "text": "",
            "filename": "empty.pdf"
        },
        {
            "name": "None text",
            "text": None,
            "filename": "none.pdf"
        }
    ]
    
    for test_case in test_cases:
        print(f"\n--- {test_case['name']} ---")
        
        # Step 1: Classify document
        classification_result = await ai_service.classify_document(
            test_case["text"], 
            test_case["filename"]
        )
        print(f"Classification result: {classification_result}")
        
        # Step 2: Check if contract
        is_contract = bool(classification_result.get("isContract"))
        print(f"Is contract: {is_contract}")
        
        # Step 3: Generate summary if contract
        summary_result = None
        if is_contract:
            summary_result = await ocr_service.generate_contract_summary(
                test_case["text"], 
                test_case["filename"]
            )
            print(f"Summary result: {summary_result}")
        
        # Step 4: Check final condition
        will_publish_contract = bool(classification_result.get("isContract")) and summary_result
        print(f"Will publish contract event: {will_publish_contract}")
        
        print("-" * 40)

async def test_real_ai_integration():
    """Test với AI service thật (nếu có)"""
    print("\n=== TEST REAL AI INTEGRATION ===")
    
    try:
        # Import real services
        from services.ai_processing_service import AutomationService
        from services.ocr_service import OCRService
        
        ai_service = AutomationService()
        ocr_service = OCRService()
        
        # Test với text thật
        test_text = """
        SOFTWARE DEVELOPMENT CONTRACT
        
        This agreement is made between Company A and Company B for the development 
        of DocGO platform. The total value is $100,000 USD.
        
        Terms and conditions:
        1. Development period: 6 months
        2. Payment: 50% upfront, 50% on completion
        3. Confidentiality: All information is confidential
        """
        
        print("Testing with real AI services...")
        
        # Test classification
        classification_result = ai_service.classify_document(test_text, "test-contract.pdf")
        print(f"Real classification result: {classification_result}")
        
        # Test contract summary
        if classification_result.get("isContract"):
            summary_result = ocr_service.generate_contract_summary(test_text, "test-contract.pdf")
            print(f"Real summary result: {summary_result}")
        
    except ImportError as e:
        print(f"Real AI services not available: {e}")
    except Exception as e:
        print(f"Error testing real AI: {e}")

def test_condition_logic():
    """Test logic điều kiện"""
    print("\n=== TEST CONDITION LOGIC ===")
    
    test_cases = [
        {"isContract": True, "summary": {"type": "CONTRACT"}, "expected": True},
        {"isContract": False, "summary": {"type": "CONTRACT"}, "expected": False},
        {"isContract": True, "summary": None, "expected": False},
        {"isContract": True, "summary": {}, "expected": False},
        {"isContract": True, "summary": [], "expected": False},
        {"isContract": True, "summary": "", "expected": False},
    ]
    
    for i, case in enumerate(test_cases, 1):
        result = bool(case["isContract"]) and case["summary"]
        print(f"Test {i}: isContract={case['isContract']}, summary={case['summary']}")
        print(f"  Result: {result} (expected: {case['expected']})")
        print(f"  {'✅ PASS' if result == case['expected'] else '❌ FAIL'}")

async def main():
    """Main test function"""
    print("🔍 AI CONTRACT DETECTION DEBUG TESTS")
    print("=" * 50)
    
    await test_contract_detection()
    await test_real_ai_integration()
    test_condition_logic()
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    asyncio.run(main())
