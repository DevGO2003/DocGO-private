import json
import logging
from app.services.ai.gemini_service import GeminiService
from app.services.ai.text_processor import TextProcessor

class ContractAnalyzer:
    def __init__(self):
        self.gemini_service = GeminiService()
        self.text_processor = TextProcessor()

    async def analyze_contract(self, text: str) -> dict:
        prompt = f"""
        Analyze the following contract text and extract key information in JSON format:

        {text}

        Please provide a JSON response with the following structure:
        {{
            "overview": {{
                "title": "Contract title",
                "type": "Contract type",
                "status": "Contract status",
                "summary": "Brief summary"
            }},
            "parties": [
                {{"name": "Party name", "role": "Role", "contact": "Contact info"}}
            ],
            "contract": {{
                "totalValue": "Total contract value",
                "currency": "Currency",
                "duration": "Contract duration",
                "startDate": "Start date",
                "endDate": "End date",
                "payment": {{
                    "schedule": "Payment schedule details",
                    "method": "Payment method",
                    "terms": "Payment terms"
                }},
                "clauses": {{
                    "key": ["Key clause 1", "Key clause 2"],
                    "penalty": "Penalty clauses",
                    "termination": "Termination clauses"
                }},
                "risk": {{
                    "factors": ["Risk factor 1", "Risk factor 2"],
                    "mitigation": "Risk mitigation strategies"
                }}
            }}
        }}

        Important:
        - Extract actual values from the text
        - Use null for missing information
        - Ensure all monetary values are clearly stated
        - List all key clauses and risk factors
        - Return only valid JSON
        """

        try:
            response = await self.gemini_service.generate_content(prompt)
            cleaned_response = self.text_processor.clean_json_response(response)
            
            # Parse JSON
            parsed_data = json.loads(cleaned_response)
            return parsed_data
            
        except json.JSONDecodeError as e:
            logging.error(f"JSON parse error: {e}")
            logging.error(f"Raw response: {response}")
            return None
        except Exception as e:
            logging.error(f"Error analyzing contract: {e}")
            return None
