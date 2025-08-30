@echo off
echo ========================================
echo Cập nhật Database Schema cho Contract Service
echo ========================================
echo.

echo Đang cập nhật schema database...
echo.

REM Thay đổi thông tin kết nối database theo môi trường của bạn
mysql -h localhost -u root -p -e "source database/update_contract_schema_v4.sql"

echo.
echo ========================================
echo Cập nhật schema hoàn tất!
echo ========================================
echo.
pause
