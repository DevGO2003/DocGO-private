#!/bin/bash

echo "🚀 Setting up DocGO Simplified Environment..."

# Copy environment template
if [ -f "env.simplified" ]; then
    cp env.simplified .env
    echo "✅ Environment template copied from env.simplified to .env"
else
    echo "❌ env.simplified file not found. Please create it first."
    exit 1
fi

echo ""
echo "📋 Please configure the following in your .env file:"
echo "1. MongoDB Atlas URI (MONGODB_ATLAS_URI)"
echo "2. Redis Cloud credentials (REDIS_CLOUD_HOST, REDIS_CLOUD_PORT, REDIS_CLOUD_PASSWORD)"
echo "3. JWT Secret (JWT_SECRET)"
echo "4. Gemini API Key (GEMINI_API_KEY)"
echo "5. S3/Filebase credentials (S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET_NAME)"
echo "6. SMTP credentials (SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD)"
echo ""
echo "🔧 After configuration, you can run:"
echo "   docker-compose -f script/docker-compose.dev.yml up -d"
echo ""
echo "📖 For more details, check the documentation in each service's 'How to run this microservice.md' file"
