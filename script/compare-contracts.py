#!/usr/bin/env python3
"""
Script để so sánh và tìm contracts trùng lặp thực sự
Tác giả: Moe Moe - Nữ quản gia của quý ngài Thaïs Gault
"""

import json
from datetime import datetime
from pymongo import MongoClient
from difflib import SequenceMatcher

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

def similarity(a, b):
    """Tính độ tương đồng giữa 2 chuỗi"""
    return SequenceMatcher(None, a, b).ratio()

def compare_contracts():
    """So sánh tất cả contracts để tìm trùng lặp"""
    client = connect_mongodb_atlas()
    if not client:
        return
    
    try:
        db = client['docgo_contract_service']
        collection = db['contracts']
        
        # Lấy tất cả contracts
        contracts = list(collection.find().sort("created_at", 1))
        
        print(f"\n=== SO SÁNH {len(contracts)} CONTRACTS ===")
        
        # Hiển thị danh sách contracts
        print(f"\n📋 DANH SÁCH CONTRACTS:")
        for i, contract in enumerate(contracts, 1):
            print(f"{i}. ID: {contract.get('_id')}")
            print(f"   Title: {contract.get('title', 'N/A')}")
            print(f"   Contract Number: {contract.get('contract_number', 'N/A')}")
            print(f"   System ID: {contract.get('system_id', 'N/A')}")
            print(f"   Created: {contract.get('created_at', 'N/A')}")
            print()
        
        # So sánh từng cặp contracts
        duplicates = []
        checked_pairs = set()
        
        print(f"🔍 BẮT ĐẦU SO SÁNH...")
        
        for i in range(len(contracts)):
            for j in range(i + 1, len(contracts)):
                contract1 = contracts[i]
                contract2 = contracts[j]
                
                pair_key = tuple(sorted([contract1['_id'], contract2['_id']]))
                if pair_key in checked_pairs:
                    continue
                checked_pairs.add(pair_key)
                
                print(f"\n--- So sánh Contract {i+1} vs Contract {j+1} ---")
                
                # So sánh các trường quan trọng
                similarities = {}
                
                # Title similarity
                title1 = contract1.get('title', '')
                title2 = contract2.get('title', '')
                if title1 and title2:
                    similarities['title'] = similarity(title1, title2)
                    print(f"Title similarity: {similarities['title']:.2f}")
                
                # Contract Number similarity
                num1 = contract1.get('contract_number', '')
                num2 = contract2.get('contract_number', '')
                if num1 and num2:
                    similarities['contract_number'] = similarity(num1, num2)
                    print(f"Contract Number similarity: {similarities['contract_number']:.2f}")
                
                # System ID similarity
                sys1 = contract1.get('system_id', '')
                sys2 = contract2.get('system_id', '')
                if sys1 and sys2:
                    similarities['system_id'] = similarity(sys1, sys2)
                    print(f"System ID similarity: {similarities['system_id']:.2f}")
                
                # Object similarity
                obj1 = contract1.get('contract_object', '')
                obj2 = contract2.get('contract_object', '')
                if obj1 and obj2:
                    similarities['object'] = similarity(obj1, obj2)
                    print(f"Object similarity: {similarities['object']:.2f}")
                
                # Summary similarity
                summary1 = contract1.get('summary', '')
                summary2 = contract2.get('summary', '')
                if summary1 and summary2:
                    # Parse JSON nếu có thể
                    try:
                        if isinstance(summary1, str):
                            summary1 = json.loads(summary1)
                        if isinstance(summary2, str):
                            summary2 = json.loads(summary2)
                        summary1_str = json.dumps(summary1, ensure_ascii=False)
                        summary2_str = json.dumps(summary2, ensure_ascii=False)
                    except:
                        summary1_str = str(summary1)
                        summary2_str = str(summary2)
                    
                    similarities['summary'] = similarity(summary1_str, summary2_str)
                    print(f"Summary similarity: {similarities['summary']:.2f}")
                
                # Key Terms similarity
                terms1 = contract1.get('key_terms', '')
                terms2 = contract2.get('key_terms', '')
                if terms1 and terms2:
                    similarities['key_terms'] = similarity(str(terms1), str(terms2))
                    print(f"Key Terms similarity: {similarities['key_terms']:.2f}")
                
                # Tính điểm trung bình
                if similarities:
                    avg_similarity = sum(similarities.values()) / len(similarities)
                    print(f"🎯 Điểm trung bình: {avg_similarity:.2f}")
                    
                    # Nếu tương đồng > 80%, coi là trùng lặp
                    if avg_similarity > 0.8:
                        print(f"⚠️  CÓ THỂ TRÙNG LẶP! (Điểm: {avg_similarity:.2f})")
                        duplicates.append({
                            'contract1': contract1,
                            'contract2': contract2,
                            'similarity': avg_similarity,
                            'details': similarities
                        })
                    else:
                        print(f"✅ Không trùng lặp (Điểm: {avg_similarity:.2f})")
                else:
                    print("❌ Không có dữ liệu để so sánh")
        
        # Báo cáo kết quả
        print(f"\n{'='*80}")
        print(f"📊 KẾT QUẢ SO SÁNH")
        print(f"{'='*80}")
        
        if duplicates:
            print(f"Tìm thấy {len(duplicates)} cặp contracts có thể trùng lặp:")
            
            for i, dup in enumerate(duplicates, 1):
                print(f"\n{i}. Cặp trùng lặp (Điểm: {dup['similarity']:.2f}):")
                print(f"   Contract 1: {dup['contract1']['_id']} - {dup['contract1'].get('title', 'N/A')}")
                print(f"   Contract 2: {dup['contract2']['_id']} - {dup['contract2'].get('title', 'N/A')}")
                print(f"   Chi tiết tương đồng:")
                for field, sim in dup['details'].items():
                    print(f"     - {field}: {sim:.2f}")
        else:
            print("✅ Không tìm thấy contracts trùng lặp!")
        
        # Hỏi có muốn xóa không
        if duplicates:
            print(f"\n{'='*80}")
            print(f"🗑️  XÓA CONTRACTS TRÙNG LẶP")
            print(f"{'='*80}")
            
            for i, dup in enumerate(duplicates, 1):
                contract1 = dup['contract1']
                contract2 = dup['contract2']
                
                print(f"\nCặp {i}: {contract1.get('title', 'N/A')} vs {contract2.get('title', 'N/A')}")
                print(f"Contract 1: {contract1['_id']} (Tạo: {contract1.get('created_at', 'N/A')})")
                print(f"Contract 2: {contract2['_id']} (Tạo: {contract2.get('created_at', 'N/A')})")
                
                # Chọn contract cũ hơn để xóa
                if contract1.get('created_at', '') < contract2.get('created_at', ''):
                    to_delete = contract1
                    to_keep = contract2
                else:
                    to_delete = contract2
                    to_keep = contract1
                
                print(f"Giữ lại: {to_keep['_id']} (Mới hơn)")
                print(f"Sẽ xóa: {to_delete['_id']} (Cũ hơn)")
                
                confirm = input(f"Xóa contract {to_delete['_id']}? (y/N): ").strip().lower()
                if confirm == 'y':
                    try:
                        result = collection.delete_one({'_id': to_delete['_id']})
                        if result.deleted_count > 0:
                            print(f"✅ Đã xóa contract {to_delete['_id']}")
                        else:
                            print(f"❌ Không thể xóa contract {to_delete['_id']}")
                    except Exception as e:
                        print(f"❌ Lỗi khi xóa: {e}")
                else:
                    print(f"⏭️  Bỏ qua contract {to_delete['_id']}")
        
    except Exception as e:
        print(f"Lỗi: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        client.close()

if __name__ == "__main__":
    print("=== SO SÁNH VÀ TÌM CONTRACTS TRÙNG LẶP ===")
    print("Tác giả: Moe Moe - Nữ quản gia của quý ngài Thaïs Gault")
    compare_contracts()
