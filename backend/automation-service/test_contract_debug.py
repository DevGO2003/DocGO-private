#!/usr/bin/env python3
"""
Unit test để debug contract event generation
"""

import asyncio
import json
from datetime import datetime, timezone
from unittest.mock import Mock, patch

# Mock data để test
def create_mock_classification_result():
    """Tạo mock classification result"""
    return {
        "documentType": "CONTRACT",
        "isContract": True,  # Quan trọng: phải là True
        "confidence": 0.95,
        "reasons": ["Document contains contract terms"],
        "category": "Legal Documents",
        "language": "vi"
    }

def create_mock_summary_result():
    """Tạo mock summary result"""
    return {
        "type": "SOFTWARE_DEVELOPMENT",
        "effectiveDate": "2025-01-01",
        "expiryDate": "2025-12-31",
        "totalValue": 100000,
        "currency": "USD",
        "summary": "Software development contract",
        "project": "DocGO Platform",
        "department": "IT",
        "priority": "HIGH",
        "confidentiality": "CONFIDENTIAL",
        "parties": [
            {
                "id": "party-001",
                "name": "Company A",
                "type": "CLIENT"
            }
        ],
        "payment": {
            "method": "BANK_TRANSFER",
            "schedule": []
        },
        "reminders": [],
        "risk": {
            "level": "MEDIUM",
            "score": 65
        },
        "compliance": {
            "status": "COMPLIANT"
        }
    }

def test_contract_condition():
    """Test điều kiện phát contract event"""
    print("=== TEST CONTRACT CONDITION ===")
    
    # Test case 1: isContract=True, summary_result có data
    classification_result = create_mock_classification_result()
    summary_result = create_mock_summary_result()
    
    condition = bool(classification_result.get("isContract")) and summary_result
    print(f"Test 1 - isContract=True, summary_result có data: {condition}")
    print(f"  isContract: {classification_result.get('isContract')}")
    print(f"  summary_result: {summary_result is not None}")
    
    # Test case 2: isContract=False
    classification_result["isContract"] = False
    condition = bool(classification_result.get("isContract")) and summary_result
    print(f"Test 2 - isContract=False: {condition}")
    
    # Test case 3: isContract=True, summary_result=None
    classification_result["isContract"] = True
    summary_result = None
    condition = bool(classification_result.get("isContract")) and summary_result
    print(f"Test 3 - isContract=True, summary_result=None: {condition}")
    
    # Test case 4: isContract=True, summary_result={}
    summary_result = {}
    condition = bool(classification_result.get("isContract")) and summary_result
    print(f"Test 4 - isContract=True, summary_result={{}}: {condition}")

def test_contract_metadata_generation():
    """Test tạo contract metadata"""
    print("\n=== TEST CONTRACT METADATA GENERATION ===")
    
    summary_result = create_mock_summary_result()
    
    # Simulate contract metadata generation như trong file_router.py
    contract_metadata = {
        "type": summary_result.get("type"),
        "effectiveDate": summary_result.get("effectiveDate"),
        "expiryDate": summary_result.get("expiryDate"),
        "totalValue": summary_result.get("totalValue"),
        "currency": summary_result.get("currency"),
        "summary": summary_result.get("summary"),
        "project": summary_result.get("project"),
        "department": summary_result.get("department"),
        "priority": summary_result.get("priority"),
        "confidentiality": summary_result.get("confidentiality"),
        "parties": [
            {
                "id": party.get("id") if isinstance(party, dict) else None,
                "name": party.get("name") if isinstance(party, dict) else party,
                "type": party.get("type"),
                "role": party.get("role") if isinstance(party, dict) else None,
                "contact": {
                    "email": party.get("email") or party.get("contact", {}).get("email") if isinstance(party, dict) else None,
                    "phone": party.get("contact", {}).get("phone") if isinstance(party, dict) else None,
                    "address": party.get("address") or party.get("contact", {}).get("address") if isinstance(party, dict) else None
                },
                "representative": {
                    "name": party.get("representative", {}).get("name") if isinstance(party, dict) else None,
                    "position": party.get("position") or party.get("representative", {}).get("position") if isinstance(party, dict) else None,
                    "email": party.get("representative", {}).get("email") if isinstance(party, dict) else None
                },
                "taxCode": party.get("taxCode") if isinstance(party, dict) else None
            }
            for party in (summary_result.get("parties") or [])
        ],
        "payment": {
            "schedule": summary_result.get("payment", {}).get("schedule") or [],
            "method": summary_result.get("payment", {}).get("method"),
            "paymentMethod": summary_result.get("payment", {}).get("paymentMethod")
        },
        "clauses": {
            "key": summary_result.get("clauses", {}).get("key") or [],
            "unfavorable": summary_result.get("clauses", {}).get("unfavorable") or [],
            "intellectualProperty": summary_result.get("clauses", {}).get("intellectualProperty"),
            "confidentiality": summary_result.get("clauses", {}).get("confidentiality"),
            "warranty": summary_result.get("clauses", {}).get("warranty"),
            "termination": summary_result.get("clauses", {}).get("termination")
        },
        "reminders": [
            {
                "date": reminder.get("date") if isinstance(reminder, dict) else None,
                "type": reminder.get("type"),
                "title": reminder.get("title") if isinstance(reminder, dict) else None,
                "description": reminder.get("description", "") if isinstance(reminder, dict) else "",
                "notifyBefore": reminder.get("notifyBefore") if isinstance(reminder, dict) else None,
                "status": reminder.get("status"),
                "assignedTo": reminder.get("assignedTo") if isinstance(reminder, dict) else None
            }
            for reminder in (summary_result.get("reminders") or [])
        ],
        "risk": {
            "level": summary_result.get("risk", {}).get("level") or summary_result.get("risk", {}).get("riskLevel"),
            "score": summary_result.get("risk", {}).get("score"),
            "factors": summary_result.get("risk", {}).get("factors") or [],
            "mitigations": summary_result.get("risk", {}).get("mitigations") or summary_result.get("risk", {}).get("mitigationProposals") or [],
            "advice": summary_result.get("risk", {}).get("advice")
        },
        "compliance": {
            "status": summary_result.get("compliance", {}).get("status") or summary_result.get("compliance", {}).get("complianceStatus"),
            "requirements": summary_result.get("compliance", {}).get("requirements") or [],
            "regulations": summary_result.get("compliance", {}).get("regulations") or [],
            "certifications": summary_result.get("compliance", {}).get("certifications") or [],
            "issues": summary_result.get("compliance", {}).get("issues") or [],
            "recommendations": summary_result.get("compliance", {}).get("recommendations") or []
        }
    }
    
    print("Contract metadata generated:")
    print(json.dumps(contract_metadata, indent=2, default=str))

def test_event_payload_generation():
    """Test tạo event payload"""
    print("\n=== TEST EVENT PAYLOAD GENERATION ===")
    
    file_id = "test-file-123"
    correlation_id = "test-correlation-123"
    now_iso = datetime.now(timezone.utc).isoformat()
    summary_result = create_mock_summary_result()
    
    # Simulate contract event generation
    contract_evt = {
        "eventVersion": "1.0",
        "eventType": "CONTRACT_SUMMARY_GENERATED",
        "eventId": "test-event-123",
        "timestamp": now_iso,
        "source": "automation-service",
        "correlationId": correlation_id,
        "actor": {"userId": "system", "userRole": "system", "ip": "127.0.0.1"},
        "data": {
            "documentId": file_id,
            "summary": summary_result.get("summary"),
            "contract": summary_result  # Simplified for test
        },
        "metadata": {"serviceVersion": "1.0.0", "region": "VN"}
    }
    
    print("Contract event payload:")
    print(json.dumps(contract_evt, indent=2, default=str))

def test_debug_scenarios():
    """Test các scenario debug"""
    print("\n=== DEBUG SCENARIOS ===")
    
    scenarios = [
        {
            "name": "Normal contract",
            "classification": {"isContract": True, "documentType": "CONTRACT"},
            "summary": {"type": "SOFTWARE_DEVELOPMENT", "summary": "Test contract"}
        },
        {
            "name": "Non-contract document",
            "classification": {"isContract": False, "documentType": "INVOICE"},
            "summary": None
        },
        {
            "name": "Contract but no summary",
            "classification": {"isContract": True, "documentType": "CONTRACT"},
            "summary": None
        },
        {
            "name": "Contract with empty summary",
            "classification": {"isContract": True, "documentType": "CONTRACT"},
            "summary": {}
        }
    ]
    
    for scenario in scenarios:
        print(f"\n--- {scenario['name']} ---")
        classification_result = scenario["classification"]
        summary_result = scenario["summary"]
        
        condition = bool(classification_result.get("isContract")) and summary_result
        print(f"Will publish contract event: {condition}")
        print(f"  isContract: {classification_result.get('isContract')}")
        print(f"  summary_result: {summary_result}")
        print(f"  summary_result truthy: {bool(summary_result)}")

if __name__ == "__main__":
    print("🔍 CONTRACT EVENT DEBUG TESTS")
    print("=" * 50)
    
    test_contract_condition()
    test_contract_metadata_generation()
    test_event_payload_generation()
    test_debug_scenarios()
    
    print("\n✅ All tests completed!")
