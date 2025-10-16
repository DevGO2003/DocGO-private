$ErrorActionPreference = 'Stop'

param(
    [string]$FilePath = "./sample.txt",
    [string]$Folder = "documents",
    [string]$UserId = "system",
    [string]$GatewayUrl = "http://localhost:8000/api/files/upload"
)

if (!(Test-Path $FilePath)) {
    "Sample content" | Out-File -FilePath $FilePath -Encoding utf8
}

$form = @{
    file   = Get-Item -LiteralPath $FilePath
    folder = $Folder
    user_id = $UserId
}

Write-Host "Uploading $FilePath to $GatewayUrl ..."

try {
    $resp = Invoke-WebRequest -Uri $GatewayUrl -Method Post -Form $form -UseBasicParsing
    Write-Output $resp.Content
}
catch {
    Write-Error $_
}


