"""
Contract Summary Service
Xử lý CONTRACT_SUMMARY_GENERATED event
Chỉ gọi AI khi cần, không có null - chỉ có fail status nếu AI thất bại
"""

import logging
import json
from typing import Dict, Any, Optional
from datetime import datetime

# Import AI service
from services.ai_processing_service import AutomationService


class ContractSummaryService:
    """Service xử lý contract summary với AI"""
    
    def __init__(self):
        self.ai_service = AutomationService()
    
    def generate_contract_metadata(
        self, 
        plaintext: str, 
        filename: str,
        classification_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate contract metadata với AI
        
        Returns:
        - success=True: Có data từ AI (không null, không fallback)
        - success=False: AI fail → trả status + error message
        """
        try:
            # Chỉ gọi AI nếu là contract
            if not classification_result.get("isContract"):
                return {
                    "success": False,
                    "error": "Not a contract document",
                    "contractMetadata": None
                }
            
            logging.info(f"[CONTRACT_SUMMARY] Generating AI summary for: {filename}")
            
            # Gọi AI để summarize
            ai_result = self.ai_service.generate_contract_summary(plaintext, filename)
            
            if not ai_result:
                return {
                    "success": False,
                    "error": "AI failed to generate summary",
                    "contractMetadata": None
                }
            
            # Transform AI result to schema-compliant format
            contract_metadata = self._transform_ai_result(ai_result, plaintext, filename)
            
            return {
                "success": True,
                "error": None,
                "contractMetadata": contract_metadata
            }
            
        except Exception as e:
            logging.error(f"[CONTRACT_SUMMARY_ERROR] {e}")
            return {
                "success": False,
                "error": str(e),
                "contractMetadata": None
            }
    
    def _transform_ai_result(
        self, 
        ai_result: Dict[str, Any],
        plaintext: str,
        filename: str
    ) -> Dict[str, Any]:
        """
        Transform AI result to contract metadata schema
        Không có null/fallback - chỉ lấy data AI trả về
        """
        
        # Basic fields - lấy trực tiếp từ AI
        metadata = {
            "effectiveDate": ai_result.get("effectiveDate"),
            "expiryDate": ai_result.get("expiryDate"),
            "totalValue": ai_result.get("totalValue"),
            "currency": ai_result.get("currency"),
            "summary": ai_result.get("summary"),
            "project": ai_result.get("project"),
            "department": ai_result.get("department"),
            "priority": ai_result.get("priority"),
            "confidentiality": ai_result.get("confidentiality"),
        }
        
        # Parties - transform to full structure
        parties_raw = ai_result.get("parties", [])
        metadata["parties"] = self._transform_parties(parties_raw)
        
        # Payment - full structure
        payment_raw = ai_result.get("payment", {})
        metadata["payment"] = {
            "totalValue": payment_raw.get("totalValue"),
            "currency": payment_raw.get("currency"),
            "schedule": payment_raw.get("schedule", []),
            "method": payment_raw.get("method"),
            "paymentMethod": payment_raw.get("paymentMethod")
        }
        
        # Clauses - full structure
        clauses_raw = ai_result.get("clauses", {})
        metadata["clauses"] = {
            "key": clauses_raw.get("key", []),
            "unfavorable": clauses_raw.get("unfavorable", []),
            "intellectualProperty": clauses_raw.get("intellectualProperty"),
            "confidentiality": clauses_raw.get("confidentiality"),
            "warranty": clauses_raw.get("warranty"),
            "termination": clauses_raw.get("termination")
        }
        
        # Reminders - transform to full structure
        reminders_raw = ai_result.get("reminders", [])
        metadata["reminders"] = self._transform_reminders(reminders_raw)
        
        # Risk - full structure
        risk_raw = ai_result.get("risk", {})
        metadata["risk"] = {
            "level": risk_raw.get("level") or ai_result.get("riskLevel"),
            "score": risk_raw.get("score"),
            "factors": risk_raw.get("factors", []),
            "mitigations": risk_raw.get("mitigations") or ai_result.get("mitigationProposals", []),
            "advice": risk_raw.get("advice")
        }
        
        # Compliance - full structure
        compliance_raw = ai_result.get("compliance", {})
        metadata["compliance"] = {
            "status": compliance_raw.get("status") or ai_result.get("complianceStatus"),
            "requirements": compliance_raw.get("requirements", []),
            "regulations": compliance_raw.get("regulations", []),
            "certifications": compliance_raw.get("certifications", []),
            "issues": compliance_raw.get("issues", []),
            "recommendations": compliance_raw.get("recommendations", [])
        }
        
        return metadata
    
    def _transform_parties(self, parties_raw: list) -> list:
        """Transform parties to full structure với contact và representative objects"""
        transformed = []
        
        for party in parties_raw:
            if isinstance(party, str):
                # Fallback nếu AI trả string
                transformed.append({
                    "id": None,
                    "name": party,
                    "type": None,
                    "role": None,
                    "contact": {
                        "email": None,
                        "phone": None,
                        "address": None
                    },
                    "representative": {
                        "name": None,
                        "position": None,
                        "email": None
                    },
                    "taxCode": None
                })
            elif isinstance(party, dict):
                # Transform to full structure
                transformed.append({
                    "id": party.get("id"),
                    "name": party.get("name"),
                    "type": party.get("type"),
                    "role": party.get("role"),
                    "contact": {
                        "email": party.get("email") or party.get("contact", {}).get("email"),
                        "phone": party.get("contact") if isinstance(party.get("contact"), str) else party.get("contact", {}).get("phone"),
                        "address": party.get("address") or party.get("contact", {}).get("address")
                    },
                    "representative": {
                        "name": party.get("representative") if isinstance(party.get("representative"), str) else party.get("representative", {}).get("name"),
                        "position": party.get("position") or party.get("representative", {}).get("position"),
                        "email": party.get("representative", {}).get("email") if isinstance(party.get("representative"), dict) else None
                    },
                    "taxCode": party.get("taxCode")
                })
        
        return transformed
    
    def _transform_reminders(self, reminders_raw: list) -> list:
        """Transform reminders to full structure"""
        transformed = []
        
        for reminder in reminders_raw:
            if isinstance(reminder, dict):
                transformed.append({
                    "date": reminder.get("date"),
                    "type": reminder.get("type"),
                    "title": reminder.get("title"),
                    "description": reminder.get("description", ""),
                    "notifyBefore": reminder.get("notifyBefore"),
                    "status": reminder.get("status"),
                    "assignedTo": reminder.get("assignedTo")
                })
        
        return transformed
