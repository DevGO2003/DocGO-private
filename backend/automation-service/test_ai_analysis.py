#!/usr/bin/env python3
"""
Script test AI analysis với file DOCX
"""

import sys
import os
sys.path.append('/app')

from services.ai_processing_service import AutomationService
import json

def test_ai_analysis():
    """Test AI analysis với file DOCX"""
    
    # Khởi tạo AI service
    ai_service = AutomationService()
    
    # Test với file DOCX
    docx_path = "/app/uploads/test-contract.docx"
    
    if not os.path.exists(docx_path):
        print(f"❌ File không tồn tại: {docx_path}")
        return False
    
    try:
        # Đọc nội dung file
        with open(docx_path, 'rb') as f:
            content = f.read()
        
        print(f"📄 File size: {len(content)} bytes")
        
        # Test AI analysis
        print("🤖 Testing AI analysis...")
        result = ai_service.generate_contract_summary(content, "test-contract.docx")
        
        if result:
            print("✅ AI analysis thành công!")
            print(f"📊 Result keys: {list(result.keys())}")
            
            # Kiểm tra các field quan trọng
            if 'totalValue' in result:
                print(f"💰 Total Value: {result['totalValue']}")
            else:
                print("❌ Missing totalValue")
            
            if 'payment' in result and 'schedule' in result['payment']:
                print(f"📅 Payment Schedule: {len(result['payment']['schedule'])} items")
            else:
                print("❌ Missing payment schedule")
            
            if 'clauses' in result and 'key' in result['clauses']:
                print(f"📋 Key Clauses: {len(result['clauses']['key'])} items")
            else:
                print("❌ Missing key clauses")
            
            if 'risk' in result and 'factors' in result['risk']:
                print(f"⚠️ Risk Factors: {len(result['risk']['factors'])} items")
            else:
                print("❌ Missing risk factors")
            
            # Lưu kết quả
            with open('/app/uploads/ai_analysis_result.json', 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            
            print("💾 Kết quả đã lưu vào ai_analysis_result.json")
            return True
        else:
            print("❌ AI analysis thất bại")
            return False
            
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing AI analysis với DOCX file...")
    success = test_ai_analysis()
    
    if success:
        print("🎉 Test thành công!")
    else:
        print("💥 Test thất bại!")
        sys.exit(1)
