# Get commits from yesterday (UTC+7)
$yesterday = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")
$today = (Get-Date).ToString("yyyy-MM-dd")

Write-Host "=== COMMITS ===" -ForegroundColor Green
git log --since="$yesterday 00:00:00 +0700" --until="$today 00:00:00 +0700" --pretty=format:"%h|%an|%ad|%s" --date=iso

Write-Host "`n`n=== FILES CHANGED ===" -ForegroundColor Green
git log --since="$yesterday 00:00:00 +0700" --until="$today 00:00:00 +0700" --name-only --pretty=format: | Sort-Object -Unique | Where-Object { $_ -ne "" }

Write-Host "`n`n=== STATISTICS ===" -ForegroundColor Green
$commitCount = (git log --since="$yesterday 00:00:00 +0700" --until="$today 00:00:00 +0700" --oneline).Count
$filesCount = (git log --since="$yesterday 00:00:00 +0700" --until="$today 00:00:00 +0700" --name-only --pretty=format: | Sort-Object -Unique | Where-Object { $_ -ne "" }).Count

Write-Host "Total Commits: $commitCount"
Write-Host "Files Changed: $filesCount"
Write-Host "Report Date: $yesterday"
