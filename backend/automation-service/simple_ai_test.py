#!/usr/bin/env python3
"""
Test AI với prompt đơn giản
"""

import sys
import os
sys.path.append('/app')

from services.ai_processing_service import AutomationService
import json

def test_simple_ai():
    """Test AI với prompt đơn giản"""
    
    ai_service = AutomationService()
    
    # Prompt đơn giản
    simple_prompt = """
    Bạn là chuyên gia phân tích hợp đồng. Hãy phân tích văn bản sau và trả về JSON:
    
    VĂN BẢN:
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
    
    YÊU CẦU: Trả về JSON với:
    - totalValue: số tiền (500000000)
    - payment: {schedule: [array các đợt thanh toán]}
    - clauses: {key: [array các điều khoản]}
    - risk: {factors: [array các rủi ro]}
    
    CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC.
    """
    
    try:
        print("🤖 Testing AI với prompt đơn giản...")
        
        # Gọi AI trực tiếp
        response = ai_service.model.generate_content(simple_prompt)
        
        print("📋 AI Response:")
        print("=" * 50)
        print(response.text)
        print("=" * 50)
        
        # Thử parse JSON
        try:
            result = json.loads(response.text)
            print("✅ JSON parse thành công!")
            print(f"totalValue: {result.get('totalValue')}")
            print(f"payment: {result.get('payment')}")
            print(f"clauses: {result.get('clauses')}")
            print(f"risk: {result.get('risk')}")
        except json.JSONDecodeError as e:
            print(f"❌ JSON parse thất bại: {e}")
            print("Raw response:", response.text[:200])
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Testing AI với prompt đơn giản...")
    success = test_simple_ai()
    
    if success:
        print("🎉 Test hoàn thành!")
    else:
        print("💥 Test thất bại!")
        sys.exit(1)
