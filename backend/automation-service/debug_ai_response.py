#!/usr/bin/env python3
"""
Debug AI response để xem AI trả về gì
"""

import sys
import os
sys.path.append('/app')

from services.ai_processing_service import AutomationService
import json

def debug_ai_response():
    """Debug AI response"""
    
    ai_service = AutomationService()
    
    # Nội dung test
    test_content = """
    HỢP ĐỒNG LAO ĐỘNG
    
    Tổng giá trị hợp đồng: 500.000.000 VNĐ
    Thanh toán chia làm 4 đợt:
    - Đợt 1: 30% (150.000.000 VNĐ)
    - Đợt 2: 30% (150.000.000 VNĐ)
    - Đợt 3: 25% (125.000.000 VNĐ)
    - Đợt 4: 15% (75.000.000 VNĐ)
    
    Điều 1: Thông tin cơ bản
    Điều 2: Phạm vi công việc
    Điều 3: Lương và phúc lợi
    Điều 4: Nghỉ phép
    Điều 5: Bảo hiểm
    Điều 6: Đào tạo
    Điều 7: Bảo mật
    Điều 8: Sở hữu trí tuệ
    Điều 9: Chấm dứt hợp đồng
    Điều 10: Giải quyết tranh chấp
    Điều 11: Điều khoản phạt
    Điều 12: Bồi thường
    Điều 13: Luật áp dụng
    
    Phạt chậm tiến độ: 1% giá trị hợp đồng/tuần
    Phạt vi phạm bảo mật: 10% giá trị hợp đồng
    """
    
    try:
        print("🔍 Debug AI response...")
        
        # Gọi AI trực tiếp
        prompt = ai_service.get_contract_summary_prompt(test_content, "test.txt")
        print("📝 Prompt length:", len(prompt))
        print("📝 Prompt preview:", prompt[:200] + "...")
        
        print("\n🤖 Calling AI...")
        response = ai_service.model.generate_content(prompt)
        
        print("📋 Raw AI Response:")
        print("=" * 80)
        print(response.text)
        print("=" * 80)
        
        # Clean response
        cleaned = response.text.strip()
        if cleaned.startswith('```json'):
            cleaned = cleaned[7:]
        if cleaned.startswith('```'):
            cleaned = cleaned[3:]
        if cleaned.endswith('```'):
            cleaned = cleaned[:-3]
        
        # Find JSON boundaries
        json_start = cleaned.find('{')
        json_end = cleaned.rfind('}') + 1
        if json_start >= 0 and json_end > json_start:
            cleaned = cleaned[json_start:json_end]
        
        print("\n🧹 Cleaned Response:")
        print("=" * 80)
        print(cleaned)
        print("=" * 80)
        
        # Try to parse
        try:
            parsed = json.loads(cleaned)
            print("\n✅ JSON Parse Success!")
            print("📊 Parsed keys:", list(parsed.keys()))
            
            # Check specific fields
            print("\n🔍 Field Analysis:")
            print(f"totalValue: {parsed.get('totalValue')}")
            print(f"payment: {parsed.get('payment')}")
            print(f"clauses: {parsed.get('clauses')}")
            print(f"risk: {parsed.get('risk')}")
            
        except json.JSONDecodeError as e:
            print(f"\n❌ JSON Parse Failed: {e}")
            print("First 200 chars of cleaned:", cleaned[:200])
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Debug AI response...")
    success = debug_ai_response()
    
    if success:
        print("🎉 Debug completed!")
    else:
        print("💥 Debug failed!")
        sys.exit(1)
