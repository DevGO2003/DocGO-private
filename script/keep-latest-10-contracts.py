#!/usr/bin/env python3
"""
Script để giữ lại 10 contract mới nhất và xóa hết các contract cũ hơn
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

def keep_latest_10_contracts():
    """Giữ lại 10 contract mới nhất, xóa hết các contract cũ hơn"""
    client = connect_mongodb_atlas()
    if not client:
        return
    
    try:
        db = client['docgo_contract_service']
        collection = db['contracts']
        
        # Đếm tổng số contracts hiện tại
        total_count = collection.count_documents({})
        print(f"📊 Tổng số contracts hiện tại: {total_count}")
        
        if total_count <= 10:
            print(f"✅ Chỉ có {total_count} contracts (≤ 10), không cần xóa gì!")
            return
        
        # Lấy 10 contracts mới nhất (sắp xếp theo created_at giảm dần)
        latest_10 = list(collection.find().sort("created_at", -1).limit(10))
        
        print(f"\n📋 10 CONTRACTS MỚI NHẤT SẼ ĐƯỢC GIỮ LẠI:")
        for i, contract in enumerate(latest_10, 1):
            print(f"{i:2d}. ID: {contract.get('_id')}")
            print(f"    Title: {contract.get('title', 'N/A')}")
            print(f"    Contract Number: {contract.get('contract_number', 'N/A')}")
            print(f"    Created: {contract.get('created_at', 'N/A')}")
            print()
        
        # Lấy danh sách ID của 10 contracts mới nhất
        latest_10_ids = [contract['_id'] for contract in latest_10]
        
        # Tìm các contracts cũ hơn (không nằm trong danh sách 10 mới nhất)
        old_contracts = list(collection.find({'_id': {'$nin': latest_10_ids}}).sort("created_at", 1))
        
        print(f"🗑️  CÁC CONTRACTS SẼ BỊ XÓA ({len(old_contracts)} contracts):")
        for i, contract in enumerate(old_contracts, 1):
            print(f"{i:2d}. ID: {contract.get('_id')}")
            print(f"    Title: {contract.get('title', 'N/A')}")
            print(f"    Contract Number: {contract.get('contract_number', 'N/A')}")
            print(f"    Created: {contract.get('created_at', 'N/A')}")
            print()
        
        # Tạo backup trước khi xóa
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = f"backup_contracts_before_cleanup_{timestamp}.json"
        
        print(f"💾 Tạo backup toàn bộ contracts vào file: {backup_file}")
        all_contracts = list(collection.find())
        
        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(all_contracts, f, ensure_ascii=False, indent=2, default=str)
        
        print(f"✅ Đã backup {len(all_contracts)} contracts")
        
        # Xác nhận trước khi xóa
        print(f"\n{'='*80}")
        print(f"⚠️  XÁC NHẬN XÓA CONTRACTS")
        print(f"{'='*80}")
        print(f"Sẽ giữ lại: 10 contracts mới nhất")
        print(f"Sẽ xóa: {len(old_contracts)} contracts cũ hơn")
        print(f"Backup đã tạo: {backup_file}")
        
        confirm = input(f"\nBạn có chắc chắn muốn xóa {len(old_contracts)} contracts cũ? (y/N): ").strip().lower()
        
        if confirm != 'y':
            print("❌ Đã hủy thao tác xóa")
            return
        
        # Thực hiện xóa contracts cũ
        print(f"\n🗑️  BẮT ĐẦU XÓA CONTRACTS CŨ...")
        
        deleted_count = 0
        for contract in old_contracts:
            try:
                result = collection.delete_one({'_id': contract['_id']})
                if result.deleted_count > 0:
                    deleted_count += 1
                    print(f"✅ Đã xóa: {contract.get('title', 'N/A')} ({contract['_id']})")
                else:
                    print(f"❌ Không thể xóa: {contract['_id']}")
            except Exception as e:
                print(f"❌ Lỗi khi xóa {contract['_id']}: {e}")
        
        # Kiểm tra kết quả cuối cùng
        final_count = collection.count_documents({})
        
        print(f"\n{'='*80}")
        print(f"📊 KẾT QUẢ CUỐI CÙNG")
        print(f"{'='*80}")
        print(f"Contracts ban đầu: {total_count}")
        print(f"Contracts đã xóa: {deleted_count}")
        print(f"Contracts còn lại: {final_count}")
        print(f"Backup file: {backup_file}")
        
        if final_count == 10:
            print(f"✅ Thành công! Đã giữ lại đúng 10 contracts mới nhất")
        else:
            print(f"⚠️  Cảnh báo: Số contracts còn lại ({final_count}) không đúng như mong đợi (10)")
        
        # Hiển thị danh sách contracts còn lại
        remaining_contracts = list(collection.find().sort("created_at", -1))
        print(f"\n📋 DANH SÁCH CONTRACTS CÒN LẠI:")
        for i, contract in enumerate(remaining_contracts, 1):
            print(f"{i:2d}. {contract.get('title', 'N/A')} - {contract.get('created_at', 'N/A')}")
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        client.close()

if __name__ == "__main__":
    print("=== GIỮ LẠI 10 CONTRACTS MỚI NHẤT VÀ XÓA HẾT CÁC CONTRACTS CŨ ===")
    print("Tác giả: Moe Moe - Nữ quản gia của quý ngài Thaïs Gault")
    keep_latest_10_contracts()
