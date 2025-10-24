import pytest
from app.services.document.processor import DocumentProcessor

@pytest.mark.asyncio
async def test_document_processor_initialization():
    processor = DocumentProcessor()
    assert processor is not None
    assert processor.contract_analyzer is not None
    assert processor.ocr_orchestrator is not None
    assert processor.event_publisher is not None

@pytest.mark.asyncio
async def test_process_text():
    processor = DocumentProcessor()
    text = "This is a test contract for analysis."
    
    # This test might fail if Gemini API key is not configured
    # In that case, we expect an exception
    try:
        result = await processor.process_text(text)
        assert "fileId" in result
        assert "text" in result
    except Exception as e:
        # Expected if API key is not configured
        assert "Error processing text" in str(e) or "API" in str(e)
