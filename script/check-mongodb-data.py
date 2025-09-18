#!/usr/bin/env python3
"""
Script để kiểm tra dữ liệu thực tế trong MongoDB
Tác giả: Moe Moe - Nữ quản gia của quý ngài Thaïs Gault
"""

import os
import sys
import json
from datetime import datetime
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

def connect_mongodb():
    """Kết nối MongoDB"""
    # Thử các URI khác nhau
    uris = [
        "mongodb://localhost:27017",
        "mongodb://root:sapassword@localhost:27017",
        "mongodb://localhost:27017/docgo_contract_service"
    ]
    
    for uri in uris:
        try:
            print(f"Thử kết nối: {uri}")
            client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            # Test connection
            client.admin.command('ping')
            print(f"✓ Kết nối thành công: {uri}")
            return client
        except Exception as e:
            print(f"✗ Không thể kết nối: {e}")
            continue
    
    return None

def check_database_structure(client):
    """Kiểm tra cấu trúc database"""
    print("\n=== KIỂM TRA CẤU TRÚC DATABASE ===")
    
    # Liệt kê databases
    databases = client.list_database_names()
    print(f"Databases có sẵn: {databases}")
    
    # Kiểm tra database docgo_contract_service
    if 'docgo_contract_service' in databases:
        db = client['docgo_contract_service']
        collections = db.list_collection_names()
        print(f"Collections trong docgo_contract_service: {collections}")
        
        # Kiểm tra collection contract_summaries
        if 'contract_summaries' in collections:
            collection = db['contract_summaries']
            count = collection.count_documents({})
            print(f"Số lượng documents trong contract_summaries: {count}")
            return db, collection
        else:
            print("Không tìm thấy collection contract_summaries")
            return db, None
    else:
        print("Không tìm thấy database docgo_contract_service")
        return None, None

def analyze_contract_summaries(collection):
    """Phân tích dữ liệu contract summaries"""
    if not collection:
        print("Không có collection để phân tích")
        return
    
    print("\n=== PHÂN TÍCH CONTRACT SUMMARIES ===")
    
    # Đếm tổng số documents
    total_count = collection.count_documents({})
    print(f"Tổng số contract summaries: {total_count}")
    
    if total_count == 0:
        print("Không có dữ liệu để phân tích")
        return
    
    # Lấy một vài documents mẫu để xem cấu trúc
    print("\n--- CẤU TRÚC DỮ LIỆU MẪU ---")
    sample_docs = list(collection.find().limit(3))
    
    for i, doc in enumerate(sample_docs, 1):
        print(f"\nDocument {i}:")
        print(f"  _id: {doc.get('_id')}")
        print(f"  contract_id: {doc.get('contract_id')}")
        print(f"  created_at: {doc.get('created_at')}")
        print(f"  updated_at: {doc.get('updated_at')}")
        print(f"  summary_text: {str(doc.get('summary_text', ''))[:100]}...")
        print(f"  key_points: {str(doc.get('key_points', ''))[:50]}...")
        print(f"  risk_assessment: {str(doc.get('risk_assessment', ''))[:50]}...")
        print(f"  recommendations: {str(doc.get('recommendations', ''))[:50]}...")
    
    # Tìm duplicates dựa trên contract_id
    print("\n--- TÌM KIẾM DUPLICATES ---")
    
    # Pipeline aggregation để tìm duplicates
    pipeline = [
        {
            "$group": {
                "_id": "$contract_id",
                "count": {"$sum": 1},
                "docs": {"$push": "$$ROOT"}
            }
        },
        {
            "$match": {
                "count": {"$gt": 1}
            }
        },
        {
            "$sort": {"count": -1}
        }
    ]
    
    duplicates = list(collection.aggregate(pipeline))
    
    if duplicates:
        print(f"Tìm thấy {len(duplicates)} contract_id có summaries trùng lặp:")
        
        total_duplicates = 0
        total_to_delete = 0
        
        for duplicate in duplicates:
            contract_id = duplicate["_id"]
            count = duplicate["count"]
            docs = duplicate["docs"]
            
            print(f"\nContract ID: {contract_id}")
            print(f"  Số summaries: {count}")
            
            # Sắp xếp theo thời gian tạo
            docs.sort(key=lambda x: x.get("created_at", datetime.min), reverse=True)
            
            print("  Chi tiết:")
            for j, doc in enumerate(docs):
                status = "GIỮ LẠI" if j == 0 else "SẼ XÓA"
                created_at = doc.get("created_at", "không xác định")
                print(f"    {status}: {doc['_id']} (tạo: {created_at})")
            
            total_duplicates += count
            total_to_delete += count - 1
        
        print(f"\n--- TỔNG KẾT DUPLICATES ---")
        print(f"Tổng số summaries trùng lặp: {total_duplicates}")
        print(f"Số summaries sẽ bị xóa: {total_to_delete}")
        print(f"Số summaries sẽ được giữ lại: {len(duplicates)}")
        
        # Tính phần trăm
        if total_count > 0:
            duplicate_percentage = (total_duplicates / total_count) * 100
            print(f"Phần trăm trùng lặp: {duplicate_percentage:.2f}%")
        
    else:
        print("Không tìm thấy contract summaries trùng lặp nào!")

def check_other_collections(db):
    """Kiểm tra các collections khác"""
    if not db:
        return
    
    print("\n=== KIỂM TRA CÁC COLLECTIONS KHÁC ===")
    
    collections = db.list_collection_names()
    
    for collection_name in collections:
        collection = db[collection_name]
        count = collection.count_documents({})
        print(f"{collection_name}: {count} documents")
        
        # Nếu có ít documents, hiển thị cấu trúc
        if count > 0 and count <= 5:
            sample = collection.find_one()
            if sample:
                print(f"  Cấu trúc mẫu: {list(sample.keys())}")

def main():
    """Hàm main"""
    print("=== KIỂM TRA DỮ LIỆU MONGODB THỰC TẾ ===")
    print("Tác giả: Moe Moe - Nữ quản gia của quý ngài Thaïs Gault")
    print()
    
    # Kết nối MongoDB
    client = connect_mongodb()
    if not client:
        print("Không thể kết nối MongoDB. Vui lòng kiểm tra:")
        print("1. MongoDB có đang chạy không?")
        print("2. Port 27017 có mở không?")
        print("3. Thông tin kết nối có đúng không?")
        return
    
    try:
        # Kiểm tra cấu trúc database
        db, collection = check_database_structure(client)
        
        # Phân tích contract summaries
        analyze_contract_summaries(collection)
        
        # Kiểm tra các collections khác
        check_other_collections(db)
        
    except Exception as e:
        print(f"Lỗi trong quá trình phân tích: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        client.close()
        print("\n=== HOÀN THÀNH KIỂM TRA ===")

if __name__ == "__main__":
    main()
