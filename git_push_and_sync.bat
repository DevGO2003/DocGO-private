@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo    GIT PUSH AND SYNC SCRIPT
echo ========================================
echo.

if "%1"=="" (
    echo [ERROR] Vui long nhap commit message!
    echo.
    echo Cach su dung:
    echo   git_push_and_sync.bat "commit message" [branch] [options]
    echo.
    echo Vi du:
    echo   git_push_and_sync.bat "feat: them tinh nang moi"
    echo   git_push_and_sync.bat "fix: sua loi bug" main
    echo   git_push_and_sync.bat "docs: cap nhat tai lieu" main --SkipSync
    echo.
    pause
    exit /b 1
)

set COMMIT_MESSAGE=%1
set BRANCH=%2
set SKIP_SYNC=%3
set FORCE=%4

if "%BRANCH%"=="" set BRANCH=main

echo [INFO] Commit message: %COMMIT_MESSAGE%
echo [INFO] Branch: %BRANCH%
echo [INFO] Skip sync: %SKIP_SYNC%
echo [INFO] Force: %FORCE%
echo.

echo [INFO] Dang chay PowerShell script...
powershell -ExecutionPolicy Bypass -File "git_push_and_sync.ps1" -CommitMessage "%COMMIT_MESSAGE%" -Branch "%BRANCH%" %SKIP_SYNC% %FORCE%

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Script da chay thanh cong!
) else (
    echo.
    echo [ERROR] Script co loi, exit code: %errorlevel%
)

echo.
pause
