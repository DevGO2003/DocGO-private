$ErrorActionPreference = 'Stop'

param(
  [string[]]$Keys,
  [string[]]$TransitionNames
)

if (-not $env:JIRA_BASE_URL -or -not $env:JIRA_EMAIL -or -not $env:JIRA_API_TOKEN) {
  Write-Error "Missing Jira environment variables. Please set JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN."
}

$base = $env:JIRA_BASE_URL.TrimEnd('/')
$email = $env:JIRA_EMAIL
$token = $env:JIRA_API_TOKEN
$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$email`:$token"))
$headers = @{ Authorization = "Basic $auth"; Accept = 'application/json'; 'Content-Type' = 'application/json' }

foreach ($k in $Keys) {
  try {
    $t = Invoke-RestMethod -Method Get -Uri "$base/rest/api/3/issue/$k/transitions" -Headers $headers
    $done = $null
    foreach ($name in $TransitionNames) {
      $cand = $t.transitions | Where-Object { $_.name -eq $name } | Select-Object -First 1
      if ($cand) { $done = $cand; break }
    }
    if ($done) {
      $body = @{ transition = @{ id = $done.id } } | ConvertTo-Json -Depth 4
      Invoke-RestMethod -Method Post -Uri "$base/rest/api/3/issue/$k/transitions" -Headers $headers -Body $body | Out-Null
    }

    $comment = @{ body = "Automated update: Implemented endpoints pushed on branch 'thaiGO'." } | ConvertTo-Json -Depth 4
    Invoke-RestMethod -Method Post -Uri "$base/rest/api/3/issue/$k/comment" -Headers $headers -Body $comment | Out-Null
    Write-Output "Updated $k"
  }
  catch {
    Write-Warning "Failed to update ${k}: $($_.Exception.Message)"
  }
}

Write-Output "Done."


