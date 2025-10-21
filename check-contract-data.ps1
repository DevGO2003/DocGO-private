$fileId = "a0d0432c-15b4-4e23-a062-d46e5daf6077"

Write-Host "Checking contract data in MongoDB for fileId: $fileId" -ForegroundColor Cyan

docker exec -it mongodb mongosh docgo --quiet --eval "db.files.findOne({_id: '$fileId'}, {contract: 1, overview: 1, _id: 0})" | ConvertFrom-Json | ConvertTo-Json -Depth 10
