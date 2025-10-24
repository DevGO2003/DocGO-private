# OpenRouter API Test Script
# Test OpenRouter API directly using PowerShell

$apiKey = "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"
$url = "https://openrouter.ai/api/v1/chat/completions"

# Models to test
$models = @(
    "deepseek/deepseek-chat-v3.1",
    "alibaba/tongyi-deepresearch-30b-a3b",
    "nvidia/nemotron-nano-9b-v2",
    "meituan/longcat-flash-chat",
    "meta-llama/llama-3.3-8b-instruct"
)

# Test prompt
$prompt = "Hello! Please respond with a simple greeting in Vietnamese."

Write-Host "🧪 Testing OpenRouter API with prompt: $prompt" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

$headers = @{
    'Authorization' = "Bearer $apiKey"
    'Content-Type' = 'application/json'
}

foreach ($i in 1..$models.Count) {
    $model = $models[$i-1]
    Write-Host "`n$i. Testing model: $model" -ForegroundColor Yellow
    
    $body = @{
        model = $model
        messages = @(
            @{
                role = "user"
                content = $prompt
            }
        )
        max_tokens = 100
    } | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body -TimeoutSec 30
        
        if ($response.choices -and $response.choices.Count -gt 0) {
            $content = $response.choices[0].message.content
            if ($content) {
                Write-Host "   ✅ Success: $($content.Substring(0, [Math]::Min(100, $content.Length)))..." -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  No content in response" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   ❌ Invalid response format" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "   ❌ Request failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "🏁 Test completed!" -ForegroundColor Cyan
