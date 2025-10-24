# OpenRouter Integration for DocGO Automation Service

## Overview
OpenRouter được tích hợp như một phương án dự phòng khi Gemini AI gặp lỗi hoặc hết quota. Hệ thống sẽ tự động chuyển sang OpenRouter khi cần thiết.

## Cấu hình

### 1. API Key
```bash
OPENROUTER_API_KEY=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
```

### 2. Model Configuration
```bash
# Primary model
OPENROUTER_MODEL=deepseek/deepseek-chat-v3.1

# Fallback models (comma-separated)
OPENROUTER_FALLBACK_MODELS=alibaba/tongyi-deepresearch-30b-a3b,nvidia/nemotron-nano-9b-v2,meituan/longcat-flash-chat,meta-llama/llama-3.3-8b-instruct
```

## Cách hoạt động

### 1. Fallback Mechanism
```
Gemini AI (Primary) → OpenRouter (Backup) → Error
```

### 2. Model Selection
- **Primary**: `deepseek/deepseek-chat-v3.1` ✅ Working
- **Fallback 1**: `meituan/longcat-flash-chat` ✅ Working
- **Fallback 2**: `alibaba/tongyi-deepresearch-30b-a3b` ⚠️ No content
- **Fallback 3**: `nvidia/nemotron-nano-9b-v2` ❌ Server unavailable
- **Fallback 4**: `meta-llama/llama-3.3-8b-instruct` ❌ Not found

### 3. Error Handling
- **Quota exceeded**: Tự động chuyển sang OpenRouter
- **API key invalid**: Log error và return None
- **Network timeout**: Retry với model khác
- **All models failed**: Return None

## Sử dụng

### 1. Trong AI Processing Service
```python
# Tự động fallback khi Gemini fail
response = self._generate_with_fallback(prompt, max_tokens=4000)
```

### 2. Direct OpenRouter Usage
```python
from utils.openrouter_client_v2 import OpenRouterClient

client = OpenRouterClient()
if client.is_available():
    response = client.generate_content("Your prompt here")
```

## Monitoring

### 1. Logs
```
[AI_FALLBACK] Gemini quota exceeded, trying OpenRouter...
[OPENROUTER] Attempting primary model: deepseek/deepseek-chat-v3.1
[OPENROUTER] Success with primary model: deepseek/deepseek-chat-v3.1
```

### 2. Health Check
```bash
curl http://localhost:8003/api/v1/automation-service/gemini/get-config
```

## Troubleshooting

### 1. API Key Issues
```bash
# Check API key
echo $OPENROUTER_API_KEY

# Test API key
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "deepseek/deepseek-chat-v3.1", "messages": [{"role": "user", "content": "Hello"}]}'
```

### 2. Model Availability
```bash
# Check available models
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

### 3. Rate Limits
- OpenRouter có rate limits riêng
- Hệ thống sẽ retry với model khác nếu bị rate limit
- Logs sẽ hiển thị thông tin rate limit

## Best Practices

### 1. Model Selection
- **Primary**: Chọn model có performance tốt nhất
- **Fallbacks**: Chọn models có cost thấp hơn
- **Diversity**: Sử dụng models từ different providers

### 2. Error Handling
- Luôn có fallback mechanism
- Log đầy đủ thông tin error
- Graceful degradation khi tất cả models fail

### 3. Monitoring
- Monitor success rate của từng model
- Track cost per request
- Alert khi fallback rate cao

## Cost Optimization

### 1. Model Costs
- `deepseek/deepseek-chat-v3.1`: $0.14/1M tokens
- `alibaba/tongyi-deepresearch-30b-a3b`: $0.20/1M tokens
- `nvidia/nemotron-nano-9b-v2`: $0.10/1M tokens
- `meituan/longcat-flash-chat`: $0.15/1M tokens
- `meta-llama/llama-3.3-8b-instruct`: $0.12/1M tokens

### 2. Usage Patterns
- Sử dụng primary model cho requests quan trọng
- Fallback models cho bulk processing
- Monitor và adjust model selection dựa trên cost/performance

## Security

### 1. API Key Protection
- Không commit API key vào code
- Sử dụng environment variables
- Rotate API key định kỳ

### 2. Request Validation
- Validate input trước khi gửi đến OpenRouter
- Sanitize sensitive data
- Log requests để audit

## Future Enhancements

### 1. Model Selection
- Dynamic model selection dựa trên task type
- A/B testing để optimize performance
- Cost-aware model routing

### 2. Caching
- Cache responses để giảm API calls
- Smart cache invalidation
- Response similarity detection

### 3. Analytics
- Detailed usage analytics
- Performance metrics per model
- Cost tracking và optimization
