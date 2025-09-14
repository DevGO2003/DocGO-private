# Docker Development Script - PowerShell
# Chạy lệnh: docker dev
# Tối ưu hóa cho development với hot reload và hybrid approach

param(
    [switch]$new,
    [switch]$down,
    [switch]$logs,
    [switch]$status,
    [string]$service = ""
)

# Màu sắc cho output
$ErrorActionPreference = "Continue"
$Host.UI.RawUI.ForegroundColor = "White"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Show-Header {
    Write-ColorOutput Cyan "=========================================="
    Write-ColorOutput Cyan "  DocGO Development Environment"
    Write-ColorOutput Cyan "  Docker Compose Dev - Optimized"
    Write-ColorOutput Cyan "=========================================="
    Write-Output ""
}

function Show-Help {
    Write-ColorOutput Yellow "Cách sử dụng:"
    Write-Output "  docker dev              # Khởi động development environment"
    Write-Output "  docker dev --new        # Khởi động mới (xóa cache, rebuild)"
    Write-Output "  docker dev --down       # Dừng tất cả services"
    Write-Output "  docker dev --logs       # Xem logs tất cả services"
    Write-Output "  docker dev --logs <service>  # Xem logs service cụ thể"
    Write-Output "  docker dev --status     # Xem trạng thái services"
    Write-Output ""
    Write-ColorOutput Yellow "Ví dụ:"
    Write-Output "  docker dev --logs api-gateway-bff"
    Write-Output "  docker dev --logs ai-processing-service"
    Write-Output ""
}

function Test-DockerCompose {
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-ColorOutput Red "❌ Docker Compose không được cài đặt!"
        Write-ColorOutput Red "Vui lòng cài đặt Docker Desktop hoặc Docker Compose"
        exit 1
    }
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-ColorOutput Red "❌ Docker không được cài đặt!"
        Write-ColorOutput Red "Vui lòng cài đặt Docker Desktop"
        exit 1
    }
}

function Start-DevEnvironment {
    param([bool]$isNew = $false)
    
    Show-Header
    
    if ($isNew) {
        Write-ColorOutput Yellow "🔄 Khởi động mới - Xóa cache và rebuild..."
        Write-ColorOutput Yellow "Dừng tất cả containers..."
        docker-compose -f script/docker-compose.dev.yml down
        
        Write-ColorOutput Yellow "Xóa volumes cache cũ..."
        docker volume prune -f
        
        Write-ColorOutput Yellow "Rebuild images..."
        docker-compose -f script/docker-compose.dev.yml build --no-cache
    } else {
        Write-ColorOutput Green "🚀 Khởi động development environment..."
    }
    
    Write-ColorOutput Green "Khởi động services với hot reload..."
    docker-compose -f script/docker-compose.dev.yml up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "✅ Development environment đã khởi động thành công!"
        Write-Output ""
        Show-ServiceStatus
        Write-Output ""
        Write-ColorOutput Cyan "Cac service dang chay:"
        Write-ColorOutput White "  • API Gateway BFF:     http://localhost:8000"
        Write-ColorOutput White "  • Auth Service:        http://localhost:8001"
        Write-ColorOutput White "  • User Management:     http://localhost:8002"
        Write-ColorOutput White "  • Contract Management: http://localhost:8003"
        Write-ColorOutput White "  • Document History:    http://localhost:8004"
        Write-ColorOutput White "  • Collaboration:       http://localhost:8005"
        Write-ColorOutput White "  • Approval Workflow:   http://localhost:8006"
        Write-ColorOutput White "  • Reminder Scheduler:  http://localhost:8007"
        Write-ColorOutput White "  • eSignature:          http://localhost:8008"
        Write-ColorOutput White "  • Notification:        http://localhost:8009"
        Write-ColorOutput White "  • Reporting:           http://localhost:8010"
        Write-ColorOutput White "  • OCR Extraction:      http://localhost:8011"
        Write-ColorOutput White "  • File Storage:        http://localhost:8012"
        Write-ColorOutput White "  • Integration:         http://localhost:8014"
        Write-ColorOutput White "  • Batch ETL:           http://localhost:8015"
        Write-ColorOutput White "  • Health Monitoring:   http://localhost:8016"
        Write-ColorOutput White "  • AI Processing:       http://localhost:8017"
        Write-ColorOutput White "  • General File Mgmt:   http://localhost:8018"
        Write-ColorOutput White "  • Frontend Next.js:    http://localhost:3000"
        Write-Output ""
        Write-ColorOutput Cyan "Databases:"
        Write-ColorOutput White "  • MariaDB:             localhost:3307"
        Write-ColorOutput White "  • MongoDB:             localhost:27017"
        Write-ColorOutput White "  • Redis:               localhost:6379"
        Write-ColorOutput White "  • Elasticsearch:       localhost:9200"
        Write-ColorOutput White "  • Kafka:               localhost:9092"
        Write-Output ""
        Write-ColorOutput Yellow "Tips:"
        Write-ColorOutput White "  • Xem logs: docker dev --logs"
        Write-ColorOutput White "  • Dừng services: docker dev --down"
        Write-ColorOutput White "  • Restart mới: docker dev --new"
    } else {
        Write-ColorOutput Red "❌ Có lỗi khi khởi động development environment!"
        Write-ColorOutput Red "Kiểm tra logs: docker dev --logs"
    }
}

function Stop-DevEnvironment {
    Show-Header
    Write-ColorOutput Yellow "🛑 Dừng development environment..."
    docker-compose -f script/docker-compose.dev.yml down
    Write-ColorOutput Green "✅ Đã dừng tất cả services!"
}

function Show-Logs {
    param([string]$serviceName = "")
    
    Show-Header
    
    if ($serviceName) {
        Write-ColorOutput Green "Logs cua service: $serviceName"
        docker-compose -f script/docker-compose.dev.yml logs -f $serviceName
    } else {
        Write-ColorOutput Green "Logs cua tat ca services:"
        docker-compose -f script/docker-compose.dev.yml logs -f
    }
}

function Show-ServiceStatus {
        Write-ColorOutput Green "Trang thai services:"
    docker-compose -f script/docker-compose.dev.yml ps
}

function Show-Status {
    Show-Header
    Show-ServiceStatus
    Write-Output ""
        Write-ColorOutput Cyan "Thong ke containers:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Main execution
Test-DockerCompose

if ($down) {
    Stop-DevEnvironment
} elseif ($logs) {
    Show-Logs -serviceName $service
} elseif ($status) {
    Show-Status
} elseif ($new) {
    Start-DevEnvironment -isNew $true
} elseif ($service) {
    Show-Help
} else {
    Start-DevEnvironment
}
