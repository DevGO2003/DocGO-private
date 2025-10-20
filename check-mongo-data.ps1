$fileId = "e561844b-3f52-470a-bdc1-08b07179de0d"

Write-Host "Checking MongoDB for file: $fileId" -ForegroundColor Cyan

$mongoUri = "mongodb+srv://root:Kienthuc1@devgo-docgo-cluster0.hsudzga.mongodb.net/docgo_repository?retryWrites=true&w=majority"

# Using mongosh command
$query = "db.files.findOne({_id: '$fileId'})"
$command = "mongosh `"$mongoUri`" --quiet --eval `"$query`""

Write-Host "Executing MongoDB query..." -ForegroundColor Gray
Invoke-Expression $command
