# Test script for the entire document processing workflow

# --- Configuration ---
$fileStorageServiceUrl = "http://localhost:8012/api/v1/file-storage-asset-service/files"
$filePath = ".\test_data\sample_contract.pdf"
$folder = "contracts"

# --- Pre-check ---
if (-not (Test-Path $filePath)) {
    Write-Host "Test file not found at '$filePath'. Please create it first." -ForegroundColor Red
    exit
}

# --- Create Form Data ---
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$fileEnc = [System.Text.Encoding]::GetEncoding('UTF-8').GetString($fileBytes)

$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = @()
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"file`"; filename=`"$(Split-Path $filePath -Leaf)`""
$bodyLines += "Content-Type: application/pdf"
$bodyLines += ""
$bodyLines += $fileEnc
$bodyLines += "--$boundary--"

$body = $bodyLines -join $LF

# --- Send Request ---
Write-Host "Uploading file '$filePath' to '$fileStorageServiceUrl?folder=$folder'..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "$fileStorageServiceUrl?folder=$folder" -Method Post -ContentType "multipart/form-data; boundary=`"$boundary`"" -Body $body
    
    Write-Host "Upload successful!" -ForegroundColor Green
    Write-Host "Response:"
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "An error occurred during upload:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $result = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($result)
        $reader.BaseStream.Position = 0
        $errorBody = $reader.ReadToEnd();
        Write-Host "Error Body: $errorBody"
    }
}

Write-Host "`nWorkflow triggered. Monitor the logs of the services to see the event flow:" -ForegroundColor Yellow
Write-Host "1. file-storage-asset-service"
Write-Host "2. general-file-management-service"
Write-Host "3. ai-processing-service"
Write-Host "4. contract-management-service"

