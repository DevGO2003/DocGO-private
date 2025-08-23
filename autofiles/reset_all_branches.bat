@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo    RESET TAT CA NHANH VE REMOTE
echo ========================================
echo.

echo [INFO] Dang fetch thong tin moi nhat tu remote...
git fetch --all
if %errorlevel% neq 0 (
    echo [ERROR] Khong the fetch tu remote!
    pause
    exit /b 1
)

echo [INFO] Kiem tra nhanh hien tai...
for /f "tokens=*" %%i in ('git branch --show-current') do set currentBranch=%%i
echo [INFO] Nhanh hien tai: !currentBranch!

echo [INFO] Dang reset nhanh hien tai...
git reset --hard "origin/!currentBranch!"
if %errorlevel% neq 0 (
    echo [WARNING] Khong the reset nhanh !currentBranch!
)

echo [INFO] Dang kiem tra cac nhanh local khac...
for /f "tokens=*" %%i in ('git branch --format="%%(refname:short)"') do (
    if not "%%i"=="!currentBranch!" (
        echo [INFO] Dang reset nhanh: %%i
        git checkout "%%i"
        git reset --hard "origin/%%i"
        if !errorlevel! neq 0 (
            echo [WARNING] Khong the reset nhanh %%i
        )
    )
)

echo [INFO] Quay ve nhanh ban dau: !currentBranch!
git checkout "!currentBranch!"

echo.
echo ========================================
echo    HOAN THANH!
echo ========================================
echo Tat ca nhanh da duoc reset ve trang thai remote.
echo.
echo [INFO] Kiem tra trang thai cuoi cung:
git status
echo.
pause
