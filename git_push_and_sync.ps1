# Git Push and Sync Script
# Tự động push lên origin và đồng bộ sang private

param(
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage,
    
    [Parameter(Mandatory=$false)]
    [string]$Branch = "main",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipSync,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Test-GitStatus {
    $status = git status --porcelain
    if ($status) {
        Write-ColorOutput "📝 Có thay đổi cần commit:" "Yellow"
        Write-Host $status
        return $true
    } else {
        Write-ColorOutput "✅ Không có thay đổi nào cần commit" "Green"
        return $false
    }
}

function Test-RemoteStatus {
    param([string]$RemoteName)
    
    try {
        Write-ColorOutput "🔄 Kiểm tra trạng thái remote $RemoteName..." "Cyan"
        git fetch $RemoteName
        
        $localCommit = git rev-parse HEAD
        $remoteCommit = git rev-parse "$RemoteName/$Branch"
        
        if ($localCommit -eq $remoteCommit) {
            Write-ColorOutput "✅ Remote $RemoteName đã đồng bộ với local" "Green"
            return $true
        } else {
            Write-ColorOutput "⚠️  Remote $RemoteName chưa đồng bộ với local" "Yellow"
            return $false
        }
    } catch {
        Write-ColorOutput "❌ Không thể kiểm tra remote $RemoteName" "Red"
        return $false
    }
}

function Push-ToRemote {
    param(
        [string]$RemoteName,
        [string]$BranchName,
        [bool]$ForcePush = $false
    )
    
    try {
        Write-ColorOutput "🚀 Đang push lên $RemoteName/$BranchName..." "Cyan"
        
        if ($ForcePush) {
            git push $RemoteName $BranchName --force
        } else {
            git push $RemoteName $BranchName
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Push lên $RemoteName thành công!" "Green"
            return $true
        } else {
            Write-ColorOutput "❌ Push lên $RemoteName thất bại!" "Red"
            return $false
        }
    } catch {
        Write-ColorOutput "❌ Lỗi khi push lên $RemoteName: $($_.Exception.Message)" "Red"
        return $false
    }
}

function Sync-FromOrigin {
    try {
        Write-ColorOutput "🔄 Đồng bộ từ origin..." "Cyan"
        git fetch origin
        git pull origin $Branch
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Đồng bộ từ origin thành công!" "Green"
            return $true
        } else {
            Write-ColorOutput "❌ Đồng bộ từ origin thất bại!" "Red"
            return $false
        }
    } catch {
        Write-ColorOutput "❌ Lỗi khi đồng bộ từ origin: $($_.Exception.Message)" "Red"
        return $false
    }
}

# Main execution
try {
    Write-ColorOutput "========================================" "Magenta"
    Write-ColorOutput "    GIT PUSH AND SYNC SCRIPT" "Magenta"
    Write-ColorOutput "========================================" "Magenta"
    Write-Host ""
    
    # Kiểm tra Git repository
    if (-not (Test-Path ".git")) {
        Write-ColorOutput "❌ Không phải Git repository!" "Red"
        exit 1
    }
    
    # Kiểm tra remote
    $remotes = git remote -v
    if (-not ($remotes -match "origin")) {
        Write-ColorOutput "❌ Không tìm thấy remote 'origin'!" "Red"
        exit 1
    }
    
    if (-not ($remotes -match "private")) {
        Write-ColorOutput "⚠️  Không tìm thấy remote 'private'!" "Yellow"
        Write-ColorOutput "   Chỉ push lên origin..." "Yellow"
        $SkipSync = $true
    }
    
    # Kiểm tra trạng thái
    if (-not (Test-GitStatus)) {
        Write-ColorOutput "ℹ️  Không có gì để commit, thoát..." "Blue"
        exit 0
    }
    
    # Commit changes
    Write-ColorOutput "💾 Đang commit changes..." "Cyan"
    git add .
    git commit -m $CommitMessage
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "❌ Commit thất bại!" "Red"
        exit 1
    }
    
    Write-ColorOutput "✅ Commit thành công với message: '$CommitMessage'" "Green"
    
    # Kiểm tra trạng thái remote
    $originInSync = Test-RemoteStatus "origin"
    $privateInSync = if (-not $SkipSync) { Test-RemoteStatus "private" } else { $true }
    
    # Push to origin
    if (-not $originInSync) {
        Write-ColorOutput "⚠️  Origin không đồng bộ, đang pull trước..." "Yellow"
        if (-not (Sync-FromOrigin)) {
            Write-ColorOutput "❌ Không thể đồng bộ từ origin, thoát..." "Red"
            exit 1
        }
    }
    
    if (-not (Push-ToRemote "origin" $Branch $Force)) {
        Write-ColorOutput "❌ Push lên origin thất bại, thoát..." "Red"
        exit 1
    }
    
    # Sync to private
    if (-not $SkipSync) {
        if (-not $privateInSync) {
            Write-ColorOutput "⚠️  Private không đồng bộ, đang pull trước..." "Yellow"
            git fetch private
            git pull private $Branch
        }
        
        Write-ColorOutput "🔄 Đang đồng bộ sang private..." "Cyan"
        if (Push-ToRemote "private" $Branch $false) {
            Write-ColorOutput "✅ Đồng bộ sang private thành công!" "Green"
        } else {
            Write-ColorOutput "❌ Đồng bộ sang private thất bại!" "Red"
            Write-ColorOutput "   Code đã được push lên origin thành công" "Yellow"
        }
    }
    
    Write-Host ""
    Write-ColorOutput "========================================" "Magenta"
    Write-ColorOutput "    HOÀN THÀNH!" "Magenta"
    Write-ColorOutput "========================================" "Magenta"
    Write-ColorOutput "✅ Code đã được push và đồng bộ thành công!" "Green"
    
    if (-not $SkipSync) {
        Write-ColorOutput "📋 Tóm tắt:" "Cyan"
        Write-ColorOutput "   - Origin: ✅ Đã push" "Green"
        Write-ColorOutput "   - Private: ✅ Đã đồng bộ" "Green"
    } else {
        Write-ColorOutput "📋 Tóm tắt:" "Cyan"
        Write-ColorOutput "   - Origin: ✅ Đã push" "Green"
        Write-ColorOutput "   - Private: ⏭️  Bỏ qua" "Yellow"
    }
    
} catch {
    Write-ColorOutput "❌ Lỗi không mong muốn: $($_.Exception.Message)" "Red"
    exit 1
}
