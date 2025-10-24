from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from app.models.response.document import DocumentResponse
from app.services.document.processor import DocumentProcessor
import logging

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    data: str = Form(None)
):
    """
    Upload and process a document
    
    🔹 Input
    📄 file (optional, multipart)
    Type: UploadFile
    Description: Document file (txt, pdf, docx)
    
    📄 data (optional, form)
    Type: string
    Description: Text data to process
    
    🔹 Output
    📝 data
    Type: DocumentResponse
    Description: Processed document information
    """
    try:
        processor = DocumentProcessor()
        
        if file:
            result = await processor.process_file(file)
        elif data:
            result = await processor.process_text(data)
        else:
            raise HTTPException(status_code=400, detail="Either file or data must be provided")
        
        return DocumentResponse(
            statusCode=200,
            shortMessage="Success",
            description="Document processed successfully",
            data=result
        )
        
    except Exception as e:
        logging.error(f"Error processing document: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing document")
