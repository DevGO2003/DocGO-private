#!/usr/bin/env python3
"""
Script test AI analysis với nội dung cụ thể
"""

import sys
import os
sys.path.append('/app')

from services.ai_processing_service import AutomationService
import json

def test_ai_with_specific_content():
    """Test AI analysis với nội dung cụ thể"""
    
    # Khởi tạo AI service
    ai_service = AutomationService()
    
    # Nội dung test cụ thể
    test_content = """
    HỢP ĐỒNG LAO ĐỘNG
    
    Hợp đồng lao động giữa:
    Bên A: CÔNG TY TNHH ABC
    Bên B: Nguyễn Văn A
    
    Điều 1: Thông tin cơ bản
    Tổng giá trị hợp đồng: 500.000.000 VNĐ
    Thanh toán chia làm 4 đợt:
    - Đợt 1: 30% (150.000.000 VNĐ)
    - Đợt 2: 30% (150.000.000 VNĐ)
    - Đợt 3: 25% (125.000.000 VNĐ)
    - Đợt 4: 15% (75.000.000 VNĐ)
    
    Điều 2: Điều khoản chính
    Điều khoản 1: Phạm vi công việc
    Điều khoản 2: Thời gian làm việc
    Điều khoản 3: Lương và phúc lợi
    Điều khoản 4: Nghỉ phép
    Điều khoản 5: Bảo hiểm
    Điều khoản 6: Đào tạo
    Điều khoản 7: Bảo mật
    Điều khoản 8: Sở hữu trí tuệ
    Điều khoản 9: Chấm dứt hợp đồng
    Điều khoản 10: Giải quyết tranh chấp
    Điều khoản 11: Điều khoản phạt
    Điều khoản 12: Bồi thường
    Điều khoản 13: Luật áp dụng
    
    Điều 3: Rủi ro và phạt
    Phạt chậm tiến độ: 1% giá trị hợp đồng/tuần
    Phạt vi phạm bảo mật: 10% giá trị hợp đồng
    Bồi thường thiệt hại: Theo thực tế
    """
    
    try:
        print("🤖 Testing AI analysis với nội dung cụ thể...")
        result = ai_service.generate_contract_summary(test_content.encode('utf-8'), "test-contract.txt")
        
        if result:
            print("✅ AI analysis thành công!")
            print(f"📊 Result keys: {list(result.keys())}")
            
            # Kiểm tra các field quan trọng
            print("\n🔍 Kiểm tra các field quan trọng:")
            
            # totalValue
            if 'totalValue' in result and result['totalValue'] is not None:
                print(f"💰 Total Value: {result['totalValue']} ✅")
            else:
                print("❌ Missing totalValue")
            
            # payment.schedule
            if 'payment' in result and 'schedule' in result['payment'] and result['payment']['schedule'] is not None:
                schedule = result['payment']['schedule']
                print(f"📅 Payment Schedule: {len(schedule)} items ✅")
                for i, item in enumerate(schedule):
                    print(f"  - {i+1}: {item.get('milestone', 'N/A')} - {item.get('percentage', 0)}% - {item.get('amount', 0)}")
            else:
                print("❌ Missing payment schedule")
            
            # clauses.key
            if 'clauses' in result and 'key' in result['clauses'] and result['clauses']['key'] is not None:
                clauses = result['clauses']['key']
                print(f"📋 Key Clauses: {len(clauses)} items ✅")
                for i, clause in enumerate(clauses):
                    print(f"  - {i+1}: {clause.get('name', 'N/A')}")
            else:
                print("❌ Missing key clauses")
            
            # risk.factors
            if 'risk' in result and 'factors' in result['risk'] and result['risk']['factors'] is not None:
                factors = result['risk']['factors']
                print(f"⚠️ Risk Factors: {len(factors)} items ✅")
                for i, factor in enumerate(factors):
                    print(f"  - {i+1}: {factor.get('description', 'N/A')} - {factor.get('severity', 'N/A')}")
            else:
                print("❌ Missing risk factors")
            
            # Lưu kết quả
            with open('/app/uploads/ai_analysis_detailed.json', 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            
            print("\n💾 Kết quả đã lưu vào ai_analysis_detailed.json")
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
    print("🚀 Testing AI analysis với nội dung cụ thể...")
    success = test_ai_with_specific_content()
    
    if success:
        print("🎉 Test thành công!")
    else:
        print("💥 Test thất bại!")
        sys.exit(1)
