#!/usr/bin/env python3
"""
Test AI cuối cùng với JSON cleaning
"""

import sys
import os
sys.path.append('/app')

from services.ai_processing_service import AutomationService
import json

def clean_json_response(response_text):
    """Clean AI response để parse JSON"""
    cleaned = response_text.strip()
    
    # Remove markdown code blocks
    if cleaned.startswith('```json'):
        cleaned = cleaned[7:]
    if cleaned.startswith('```'):
        cleaned = cleaned[3:]
    if cleaned.endswith('```'):
        cleaned = cleaned[:-3]
    
    # Find JSON object boundaries
    json_start = cleaned.find('{')
    json_end = cleaned.rfind('}') + 1
    
    if json_start >= 0 and json_end > json_start:
        cleaned = cleaned[json_start:json_end]
    
    return cleaned.strip()

def test_final_ai():
    """Test AI cuối cùng"""
    
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
        print("🤖 Testing AI cuối cùng...")
        result = ai_service.generate_contract_summary(test_content.encode('utf-8'), "test-contract.txt")
        
        if result:
            print("✅ AI analysis thành công!")
            
            # Kiểm tra các field quan trọng
            print("\n🔍 Kiểm tra kết quả:")
            
            # totalValue
            total_value = result.get('totalValue')
            if total_value is not None:
                print(f"💰 Total Value: {total_value} ✅")
            else:
                print("❌ Missing totalValue")
            
            # payment.schedule
            payment = result.get('payment', {})
            schedule = payment.get('schedule', [])
            if schedule:
                print(f"📅 Payment Schedule: {len(schedule)} items ✅")
                for i, item in enumerate(schedule):
                    print(f"  - {i+1}: {item.get('milestone', 'N/A')} - {item.get('percentage', 0)}% - {item.get('amount', 0)}")
            else:
                print("❌ Missing payment schedule")
            
            # clauses.key
            clauses = result.get('clauses', {})
            key_clauses = clauses.get('key', [])
            if key_clauses:
                print(f"📋 Key Clauses: {len(key_clauses)} items ✅")
                for i, clause in enumerate(key_clauses[:5]):  # Show first 5
                    print(f"  - {i+1}: {clause.get('name', 'N/A')}")
            else:
                print("❌ Missing key clauses")
            
            # risk.factors
            risk = result.get('risk', {})
            factors = risk.get('factors', [])
            if factors:
                print(f"⚠️ Risk Factors: {len(factors)} items ✅")
                for i, factor in enumerate(factors):
                    print(f"  - {i+1}: {factor.get('description', 'N/A')} - {factor.get('severity', 'N/A')}")
            else:
                print("❌ Missing risk factors")
            
            # Lưu kết quả
            with open('/app/uploads/final_ai_result.json', 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            
            print("\n💾 Kết quả đã lưu vào final_ai_result.json")
            return True
        else:
            print("❌ AI analysis thất bại")
            return False
            
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Testing AI cuối cùng...")
    success = test_final_ai()
    
    if success:
        print("🎉 Test thành công!")
    else:
        print("💥 Test thất bại!")
        sys.exit(1)
