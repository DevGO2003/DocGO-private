"""
Contract Analyzer - AI Contract Analysis

Responsibilities:
- Analyze contract (only if isContract=true)
- Extract parties, payment terms, clauses, risks
- Publish CONTRACT_SUMMARY_GENERATED event (conditional)
"""

import logging
from typing import Dict, Any, Optional
from services.kafka_publisher_v3 import KafkaPublisherV3

logger = logging.getLogger(__name__)


class ContractAnalyzer:
    """Analyze contracts and publish Event 3 (conditional)"""
    
    def __init__(self, kafka_publisher: KafkaPublisherV3, gemini_client=None):
        self.kafka_publisher = kafka_publisher
        self.gemini_client = gemini_client
        
    def analyze_contract(self, document_id: str, text: str, is_contract: bool,
                        correlation_id: str, actor: str) -> Dict[str, Any]:
        """
        Analyze contract (only if isContract=true)
        
        Args:
            document_id: UUID v7 of document
            text: Extracted text content
            is_contract: Whether document is a contract
            correlation_id: Request correlation ID
            actor: Actor performing action
            
        Returns:
            Dict with analysis result
        """
        try:
            # Only process if isContract=true
            if not is_contract:
                logger.info(f"Document {document_id} is not a contract, skipping analysis")
                return {
                    "success": True,
                    "documentId": document_id,
                    "isContract": False,
                    "eventPublished": False
                }
            
            logger.info(f"Analyzing contract for documentId: {document_id}")
            
            # Perform contract analysis
            contract_analysis = self._analyze_contract_content(text)
            logger.info(f"Contract analysis completed")
            
            # Prepare event payload
            event_payload = self._prepare_event_payload(document_id, contract_analysis)
            
            # Publish Event 3: CONTRACT_SUMMARY_GENERATED (conditional)
            event_id = self.kafka_publisher.publish_event(
                event_type="CONTRACT_SUMMARY_GENERATED",
                document_id=document_id,
                event_data=event_payload,
                correlation_id=correlation_id,
                actor=actor
            )
            
            logger.info(f"Published CONTRACT_SUMMARY_GENERATED: eventId={event_id}, documentId={document_id}")
            
            return {
                "success": True,
                "documentId": document_id,
                "eventId": event_id,
                "isContract": True,
                "eventPublished": True,
                "analysis": contract_analysis
            }
            
        except Exception as e:
            logger.error(f"Error analyzing contract: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e)
            }
    
    def _analyze_contract_content(self, text: str) -> Dict[str, Any]:
        """Analyze contract using AI"""
        # TODO: Implement Gemini AI contract analysis
        # For now, return mock analysis
        return {
            "type": "SOFTWARE_DEVELOPMENT",
            "effectiveDate": "2025-11-01",
            "expiryDate": "2025-12-31",
            "totalValue": 100000,
            "currency": "USD",
            "summary": "Software development contract between Company A and Company B",
            "project": "DocGO Platform Development",
            "department": "IT Department",
            "priority": "HIGH",
            "confidentiality": "CONFIDENTIAL",
            "parties": [
                {
                    "id": "party-001",
                    "name": "Company A",
                    "type": "BUYER",
                    "contact": {
                        "email": "contact@companya.com",
                        "phone": "+84-123-456-789",
                        "address": "123 Main Street, District 1, HCMC"
                    },
                    "representative": {
                        "name": "Mr. Nguyen Van A",
                        "position": "CEO",
                        "email": "ceo@companya.com"
                    }
                },
                {
                    "id": "party-002",
                    "name": "Company B",
                    "type": "SELLER",
                    "contact": {
                        "email": "contact@companyb.com",
                        "phone": "+84-987-654-321",
                        "address": "456 Tech Avenue, District 2, HCMC"
                    },
                    "representative": {
                        "name": "Ms. Tran Thi B",
                        "position": "Director",
                        "email": "director@companyb.com"
                    }
                }
            ],
            "payment": {
                "method": "BANK_TRANSFER",
                "schedule": [
                    {
                        "milestone": "Phase 1 Completion",
                        "percentage": 50,
                        "amount": 50000,
                        "dueDate": "2025-11-30",
                        "status": "PENDING"
                    },
                    {
                        "milestone": "Final Acceptance",
                        "percentage": 50,
                        "amount": 50000,
                        "dueDate": "2025-12-31",
                        "status": "PENDING"
                    }
                ]
            },
            "clauses": {
                "key": [
                    {
                        "name": "Payment Terms",
                        "description": "50% upon phase completion, 50% upon final acceptance",
                        "content": "Payment shall be made in 2 phases...",
                        "importance": "HIGH",
                        "risk": "MEDIUM",
                        "advice": "Ensure milestone criteria are clearly defined"
                    }
                ],
                "unfavorable": [
                    {
                        "name": "Execution Deadline",
                        "description": "Short contract deadline may cause schedule pressure",
                        "content": "Project must be completed before Dec 31, 2025",
                        "risk": "HIGH",
                        "advice": "Consider extension clause if needed"
                    }
                ]
            },
            "reminders": [
                {
                    "id": "reminder-001",
                    "type": "PAYMENT_DUE",
                    "title": "Payment Phase 1",
                    "description": "Reminder for 50% payment",
                    "content": "Payment phase 1 must be made before Nov 30, 2025",
                    "dueDate": "2025-11-30",
                    "status": "PENDING",
                    "priority": "HIGH"
                }
            ],
            "risk": {
                "level": "MEDIUM",
                "score": 65,
                "factors": [
                    {
                        "type": "TECHNICAL",
                        "description": "Risk of new AI technology causing integration errors",
                        "content": "System must use latest AI but not fully tested",
                        "probability": "MEDIUM",
                        "impact": "HIGH",
                        "riskToParties": [{"id": "party-002", "name": "Company B"}],
                        "beneficiaries": []
                    }
                ],
                "mitigationProposals": [
                    {
                        "description": "Train team and test AI technology",
                        "content": "Party B must provide weekly test reports",
                        "cost": "LOW",
                        "timeline": "2 weeks",
                        "assignedTo": "Party B"
                    }
                ],
                "advice": "Legal consultation to clearly allocate risks"
            },
            "compliance": {
                "status": "COMPLIANT",
                "regulations": ["Information Security Law", "Decree 13/2023/ND-CP"],
                "certifications": ["ISO 27001", "SOC 2"],
                "auditSchedule": "2024-06-01T00:00:00Z",
                "issues": [],
                "recommendations": ["Contract legal review"]
            }
        }
    
    def _prepare_event_payload(self, document_id: str,
                              contract_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare CONTRACT_SUMMARY_GENERATED event payload"""
        return {
            "documentId": document_id,
            "contract": contract_analysis
        }
