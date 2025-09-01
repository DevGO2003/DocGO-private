#!/bin/bash

# Script tự động tạo env.local cho tất cả microservices
# Chạy script này để copy env_exmaple.txt thành env.local

echo "🚀 Bắt đầu setup env.local cho tất cả microservices..."

# Danh sách các microservices
services=(
    "ai-processing-service"
    "contract-management-service"
    "general-file-management-service"
    "user-management-service"
    "api-gateway-bff"
    "file-storage-asset-service"
    "authentication-identity-service"
)

backend_path="backend"
success_count=0
error_count=0

for service in "${services[@]}"; do
    service_path="$backend_path/$service"
    env_example_path="$service_path/env_exmaple.txt"
    env_local_path="$service_path/env.local"
    
    if [ -f "$env_example_path" ]; then
        if cp "$env_example_path" "$env_local_path"; then
            echo "✅ Đã tạo env.local cho $service"
            ((success_count++))
        else
            echo "❌ Lỗi khi tạo env.local cho $service"
            ((error_count++))
        fi
    else
        echo "⚠️ Không tìm thấy env_exmaple.txt trong $service"
    fi
done

echo ""
echo "📊 Kết quả setup:"
echo "✅ Thành công: $success_count services"
echo "❌ Lỗi: $error_count services"

if [ $success_count -gt 0 ]; then
    echo ""
    echo "🎉 Setup hoàn tất! Bây giờ bạn có thể:"
    echo "1. Chỉnh sửa env.local của từng service theo nhu cầu"
    echo "2. Sử dụng env_file trong docker-compose.local.yml"
    echo "3. Không cần sửa trực tiếp docker-compose.local.yml"
fi

echo ""
echo "📚 Xem hướng dẫn chi tiết tại: .cursor/rules/environment-git-standards.mdc"




