def build_file_api_payload(
    *,
    file_id: str,
    file_url: str,
    filename: str,
    content_type: str,
    size: int,
    ocr_text: str | None,
    classification_result: dict | None,
    overview_document_type: str,  # 'CONTRACT' | 'GENERAL'
    contract_metadata: dict | None,  # None nếu non-contract
    summary_result: dict | None,
    now_iso: str,
) -> dict:
    """
    Build File Management API payload matching the sample schema.
    Single source of truth for API response format.
    """
    is_contract = overview_document_type == "CONTRACT"
    
    return {
        "id": file_id,
        "overview": {
            "title": filename,
            "status": "ACTIVE" if is_contract else "PENDING",
            "documentType": overview_document_type,
            "contractType": "SERVICE_AGREEMENT" if is_contract else None,
            "category": "Hợp đồng dịch vụ" if is_contract else None,
            "tags": [],
            "ownerUserId": None,
            "isNew": False,
        },
        "contract": None if not is_contract else {
            "effectiveDate": (summary_result or {}).get("effectiveDate"),
            "expiryDate": (summary_result or {}).get("expiryDate"),
            "totalValue": (summary_result or {}).get("totalValue"),
            "currency": (summary_result or {}).get("currency"),
            "summary": (summary_result or {}).get("summary"),
            "parties": (summary_result or {}).get("parties", []),
            "payment": (summary_result or {}).get("payment", {}),
            "clauses": (summary_result or {}).get("clauses", {}),
            "reminders": (summary_result or {}).get("reminders", []),
            "risk": (summary_result or {}).get("risk", {}),
            "compliance": (summary_result or {}).get("compliance", {}),
        },
        "content": {
            "plaintext": ocr_text,
            "ocr": { 
                "text": ocr_text, 
                "status": "DONE" if is_contract else "QUEUED" 
            },
            "classification": classification_result,
            "processing": { 
                "status": "COMPLETED" if is_contract else "PROCESSING", 
                "error": None 
            },
        },
        "file": { 
            "id": file_id, 
            "name": filename, 
            "type": content_type, 
            "size": size, 
            "version": None 
        },
        "storage": {
            "s3": {
                "url": file_url, 
                "bucket": None, 
                "objectKey": None, 
                "region": None,
                "contentType": content_type, 
                "size": size, 
                "versionId": None,
                "checksum": { 
                    "originalMD5": None, 
                    "archiveMD5": None 
                }
            },
            "local": {
                "path": None, 
                "filename": filename, 
                "mimeType": content_type,
                "size": size, 
                "mtime": now_iso, 
                "revision": None
            },
        },
        "versioning": None,
        "metadata": {
            "fileSystem": {
                "dateModified": now_iso, 
                "dateAdded": now_iso,
                "mediaFilename": filename, 
                "originalFilename": filename,
                "originalMD5": None, 
                "originalFileSize": size,
                "originalMimeType": content_type, 
                "archiveMD5": None, 
                "archiveFileSize": size
            },
            "originalDocument": None,
            "archivedDocument": None,
        },
        "audit": {
            "createdAt": now_iso, 
            "createdBy": "system",
            "updatedAt": now_iso, 
            "updatedBy": "system", 
            "deletedAt": None, 
            "deletedBy": None, 
            "isDeleted": False, 
            "version": None
        },
    }
