#!/bin/bash
# test/health-check.sh

echo "Testing DocGO Simplified Architecture Health..."

# Test API Gateway
curl -f http://localhost:8000/api/health || echo "API Gateway: FAILED"

# Test Auth Service
curl -f http://localhost:8001/health || echo "Auth Service: FAILED"

# Test Contract Service
curl -f http://localhost:8002/health || echo "Contract Service: FAILED"

# Test AI Service
curl -f http://localhost:8003/health || echo "AI Service: FAILED"

# Test File Service
curl -f http://localhost:8004/health || echo "File Service: FAILED"

echo "Health check completed!"
