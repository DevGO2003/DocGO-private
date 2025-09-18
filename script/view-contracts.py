#!/usr/bin/env python3
"""
Script để xem chi tiết từng contract thủ công
Tác giả: Moe Moe - Nữ quản gia của quý ngài Thaïs Gault
"""

import json
from datetime import datetime
from pymongo import MongoClient

def connect_mongodb_atlas():
    """Kết nối MongoDB Atlas"""
    uri = "mongodb+srv://root:sapassword@devgo-docgo-cluster0.hsudzga.mongodb.net/?retryWrites=true&w=majority&appName=devgo-docgo-cluster0"
    
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=10000)
        client.admin.command('ping')
        print("✓ Kết nối thành công MongoDB Atlas")
        return client
    except Exception as e:
        print(f"✗ Lỗi kết nối: {e}")
        return None

def view_contracts():
    """Xem chi tiết từng contract"""
    client = connect_mongodb_atlas()
    if not client:
        return
    
    try:
        db = client['docgo_contract_service']
        collection = db['contracts']
        
        # Lấy tất cả contracts
        contracts = list(collection.find().sort("created_at", 1))
        
        print(f"\n=== DANH SÁCH {len(contracts)} CONTRACTS ===")
        
        for i, contract in enumerate(contracts, 1):
            print(f"\n{'='*80}")
            print(f"CONTRACT {i}/{len(contracts)}")
            print(f"{'='*80}")
            
            # Thông tin cơ bản
            print(f"📋 ID: {contract.get('_id')}")
            print(f"📋 Contract Number: {contract.get('contract_number', 'N/A')}")
            print(f"📋 Title: {contract.get('title', 'N/A')}")
            print(f"📋 Status: {contract.get('status', 'N/A')}")
            print(f"📋 Contract Type: {contract.get('contract_type', 'N/A')}")
            print(f"📋 System ID: {contract.get('system_id', 'N/A')}")
            
            # Thời gian
            print(f"\n⏰ Thời gian:")
            print(f"   Created: {contract.get('created_at', 'N/A')}")
            print(f"   Updated: {contract.get('updated_at', 'N/A')}")
            
            # Thông tin hợp đồng
            print(f"\n📄 Chi tiết hợp đồng:")
            print(f"   Object: {contract.get('contract_object', 'N/A')}")
            print(f"   Effective Date: {contract.get('effective_date', 'N/A')}")
            print(f"   Contract Term: {contract.get('contract_term', 'N/A')}")
            print(f"   Start Date: {contract.get('start_date', 'N/A')}")
            print(f"   End Date: {contract.get('end_date', 'N/A')}")
            
            # Thanh toán
            print(f"\n💰 Thanh toán:")
            print(f"   Total Value: {contract.get('total_value', 'N/A')}")
            print(f"   Currency: {contract.get('currency', 'N/A')}")
            print(f"   Payment Schedule: {contract.get('payment_schedule', 'N/A')}")
            print(f"   Payment Method: {contract.get('payment_method', 'N/A')}")
            
            # Rủi ro và tuân thủ
            print(f"\n⚠️ Rủi ro và tuân thủ:")
            print(f"   Risk Level: {contract.get('risk_level', 'N/A')}")
            print(f"   Compliance Status: {contract.get('compliance_status', 'N/A')}")
            print(f"   Legal Review Required: {contract.get('legal_review_required', 'N/A')}")
            
            # AI Processing
            print(f"\n🤖 AI Processing:")
            print(f"   AI Processed: {contract.get('ai_processed', 'N/A')}")
            print(f"   Processing Status: {contract.get('processing_status', 'N/A')}")
            
            # Tags
            tags = contract.get('tags', [])
            if tags:
                print(f"\n🏷️ Tags: {', '.join(tags) if isinstance(tags, list) else tags}")
            
            # Summary (nếu có)
            summary = contract.get('summary')
            if summary:
                print(f"\n📝 Summary:")
                if isinstance(summary, str):
                    try:
                        summary_obj = json.loads(summary)
                        print(f"   {json.dumps(summary_obj, ensure_ascii=False, indent=2)[:500]}...")
                    except:
                        print(f"   {summary[:200]}...")
                else:
                    print(f"   {str(summary)[:200]}...")
            
            # Key Terms (nếu có)
            key_terms = contract.get('key_terms')
            if key_terms:
                print(f"\n🔑 Key Terms:")
                if isinstance(key_terms, str):
                    print(f"   {key_terms[:200]}...")
                else:
                    print(f"   {str(key_terms)[:200]}...")
            
            # Risk Assessment (nếu có)
            risk_assessment = contract.get('risk_assessment')
            if risk_assessment:
                print(f"\n⚠️ Risk Assessment:")
                if isinstance(risk_assessment, str):
                    try:
                        risk_obj = json.loads(risk_assessment)
                        print(f"   {json.dumps(risk_obj, ensure_ascii=False, indent=2)[:300]}...")
                    except:
                        print(f"   {risk_assessment[:200]}...")
                else:
                    print(f"   {str(risk_assessment)[:200]}...")
            
            # Parties (nếu có)
            parties_json = contract.get('parties_json')
            if parties_json:
                print(f"\n👥 Parties:")
                if isinstance(parties_json, str):
                    try:
                        parties_obj = json.loads(parties_json)
                        print(f"   {json.dumps(parties_obj, ensure_ascii=False, indent=2)[:300]}...")
                    except:
                        print(f"   {parties_json[:200]}...")
                else:
                    print(f"   {str(parties_json)[:200]}...")
            
            print(f"\n{'='*80}")
            
            # Hỏi có muốn xem tiếp không
            if i < len(contracts):
                input(f"Nhấn Enter để xem contract tiếp theo...")
        
        print(f"\n✅ Đã xem xong tất cả {len(contracts)} contracts!")
        
    except Exception as e:
        print(f"Lỗi: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        client.close()

if __name__ == "__main__":
    print("=== XEM CHI TIẾT CONTRACTS THỦ CÔNG ===")
    print("Tác giả: Moe Moe - Nữ quản gia của quý ngài Thaïs Gault")
    view_contracts()
