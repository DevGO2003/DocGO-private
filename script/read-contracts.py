#!/usr/bin/env python3
"""
Script đọc và hiển thị contracts từ MongoDB Atlas
Tác giả: Moe Moe - Nữ quản gia của quý ngài Thaïs Gault
"""

import os
import sys
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
import json

def connect_to_atlas():
    """Kết nối đến MongoDB Atlas"""
    try:
        # Connection string từ environment hoặc hardcode
        connection_string = "mongodb+srv://root:sapassword@devgo-docgo-cluster0.hsudzga.mongodb.net/?retryWrites=true&w=majority&appName=devgo-docgo-cluster0"
        
        print("🔗 Đang kết nối đến MongoDB Atlas...")
        client = MongoClient(connection_string)
        
        # Test connection
        client.admin.command('ping')
        print("✅ Kết nối thành công!")
        
        return client
    except Exception as e:
        print(f"❌ Lỗi kết nối: {e}")
        return None

def read_contracts(client):
    """Đọc và hiển thị contracts"""
    try:
        db = client['docgo_contract_service']
        collection = db['contracts']
        
        print(f"\n📋 Tổng số contracts: {collection.count_documents({})}")
        
        # Lấy tất cả contracts
        contracts = list(collection.find({}).sort("created_at", -1))
        
        if not contracts:
            print("❌ Không có contracts nào!")
            return
        
        print(f"\n📄 CHI TIẾT CÁC CONTRACTS:")
        print("=" * 80)
        
        for i, contract in enumerate(contracts, 1):
            print(f"\n🔹 CONTRACT #{i}")
            print("-" * 40)
            
            # Thông tin cơ bản
            print(f"📝 ID: {contract.get('_id')}")
            print(f"📄 Contract Number: {contract.get('contract_number', 'N/A')}")
            print(f"📋 Title: {contract.get('title', 'N/A')}")
            print(f"📊 Status: {contract.get('status', 'N/A')}")
            print(f"🏷️  Type: {contract.get('contract_type', 'N/A')}")
            print(f"🆔 System ID: {contract.get('system_id', 'N/A')}")
            
            # Ngày tháng
            created_at = contract.get('created_at')
            if created_at:
                if isinstance(created_at, str):
                    print(f"📅 Created: {created_at}")
                else:
                    print(f"📅 Created: {created_at.strftime('%Y-%m-%d %H:%M:%S')}")
            
            # Các bên tham gia
            parties = contract.get('parties_json')
            if parties:
                print(f"👥 Parties: {parties}")
            
            # Đối tượng hợp đồng
            contract_object = contract.get('contract_object')
            if contract_object:
                print(f"🎯 Object: {contract_object[:100]}..." if len(str(contract_object)) > 100 else f"🎯 Object: {contract_object}")
            
            # Tóm tắt
            summary = contract.get('summary')
            if summary:
                print(f"📄 Summary: {summary[:200]}..." if len(str(summary)) > 200 else f"📄 Summary: {summary}")
            
            # Điều khoản chính
            key_terms = contract.get('key_terms')
            if key_terms:
                print(f"🔑 Key Terms: {key_terms[:100]}..." if len(str(key_terms)) > 100 else f"🔑 Key Terms: {key_terms}")
            
            # Đánh giá rủi ro
            risk_level = contract.get('risk_level')
            if risk_level:
                print(f"⚠️  Risk Level: {risk_level}")
            
            # Giá trị
            total_value = contract.get('total_value')
            if total_value:
                print(f"💰 Total Value: {total_value}")
            
            # Tiền tệ
            currency = contract.get('currency')
            if currency:
                print(f"💱 Currency: {currency}")
            
            # Ngày hiệu lực
            effective_date = contract.get('effective_date')
            if effective_date:
                print(f"📅 Effective Date: {effective_date}")
            
            # Thời hạn
            contract_term = contract.get('contract_term')
            if contract_term:
                print(f"⏰ Term: {contract_term}")
            
            # Trạng thái AI
            ai_processed = contract.get('ai_processed')
            if ai_processed is not None:
                print(f"🤖 AI Processed: {ai_processed}")
            
            # Tags
            tags = contract.get('tags')
            if tags:
                print(f"🏷️  Tags: {tags}")
            
            print("-" * 40)
        
        print(f"\n✅ Đã đọc {len(contracts)} contracts thành công!")
        
    except Exception as e:
        print(f"❌ Lỗi khi đọc contracts: {e}")

def main():
    """Hàm chính"""
    print("=== ĐỌC CONTRACTS TỪ MONGODB ATLAS ===")
    print("Tác giả: Moe Moe - Nữ quản gia của quý ngài Thaïs Gault")
    print()
    
    # Kết nối
    client = connect_to_atlas()
    if not client:
        return
    
    try:
        # Đọc contracts
        read_contracts(client)
        
    finally:
        # Đóng kết nối
        client.close()
        print("\n🔒 Đã đóng kết nối MongoDB")

if __name__ == "__main__":
    main()
