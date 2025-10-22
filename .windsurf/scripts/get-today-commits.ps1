# Get commits from today (UTC+7)
$today = (Get-Date).ToString("yyyy-MM-dd")
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")

Write-Host "=== TODAY'S COMMITS ===" -ForegroundColor Green
git log --since="$today 00:00:00 +0700" --until="$tomorrow 00:00:00 +0700" --pretty=format:"%h|%an|%ad|%s" --date=iso

Write-Host "`n`n=== FILES CHANGED TODAY ===" -ForegroundColor Green
git log --since="$today 00:00:00 +0700" --until="$tomorrow 00:00:00 +0700" --name-only --pretty=format: | Sort-Object -Unique | Where-Object { $_ -ne "" }

Write-Host "`n`n=== STATISTICS ===" -ForegroundColor Green
$commitCount = (git log --since="$today 00:00:00 +0700" --until="$tomorrow 00:00:00 +0700" --oneline).Count
$filesCount = (git log --since="$today 00:00:00 +0700" --until="$tomorrow 00:00:00 +0700" --name-only --pretty=format: | Sort-Object -Unique | Where-Object { $_ -ne "" }).Count

Write-Host "Total Commits: $commitCount"
Write-Host "Files Changed: $filesCount"
Write-Host "Report Date: $today"
