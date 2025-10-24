from fastapi import APIRouter, HTTPException
from app.models.response.contract import ContractResponse
from app.services.ai.contract_analyzer import ContractAnalyzer
import logging

router = APIRouter(prefix="/contracts", tags=["Contracts"])

@router.post("/analyze", response_model=ContractResponse)
async def analyze_contract(text: str):
    """
    Analyze contract text using AI
    
    🔹 Input
    📄 text
    Type: string
    Description: Contract text to analyze
    
    🔹 Output
    📝 data
    Type: ContractResponse
    Description: AI analysis results
    """
    try:
        analyzer = ContractAnalyzer()
        result = await analyzer.analyze_contract(text)
        
        if result is None:
            raise HTTPException(status_code=500, detail="Failed to analyze contract")
        
        return ContractResponse(
            statusCode=200,
            shortMessage="Success",
            description="Contract analyzed successfully",
            data=result
        )
        
    except Exception as e:
        logging.error(f"Error analyzing contract: {str(e)}")
        raise HTTPException(status_code=500, detail="Error analyzing contract")
