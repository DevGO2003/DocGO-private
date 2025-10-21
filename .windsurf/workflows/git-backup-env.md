
-description: Git Backup ENV Local

# Git Backup ENV Local

Push commits lên remote repository origin.

Lập Windsurf TODO, lưu ý Phần nào trước thì phải thực thiện xong trước rồi mới qua Phần tiếp theo, ko được làm song song các Phần:  
  Phần 1 - Lấy tham số
  1) Lấy thời gian mới nhất trong thư mục `.git-backup/env` (theo định dạng hh-mm-dd-MM-yyyy) để làm tên thư mục backup env sẽ phục hồi, ví dụ: `.git-backup/env/<Thời gian mới nhất>`

  Phần 2 - Thực hiện lần lượt các PowerShell (Mỗi số thứ tự là 1 dòng PowerShell duy nhất, không tạo file powershell ps1):
  1) - Backup tất cả các file env từ project vào thư mục `/.git-backup/env/<Thời gian mới nhất>`.
    - Xác định các file env cần backup, ví dụ: `.env`, `.env.local` trong project.
    - Ngoài ra, backup cả file `.windsurf/mcp.json` nếu tồn tại.
    - Với mỗi file env và file `.windsurf/mcp.json`:
        - Tạo một bản sao và đặt tên thành `BackupName` (có thể thêm prefix để phân biệt module hoặc thư mục).
        - Lưu file này vào thư mục `/.git-backup/env/<Thời gian mới nhất>`.
    - Cập nhật hoặc tạo mới file `metadata.json` trong thư mục backup, chứa thông tin mapping giữa `BackupName` và `OriginalPath`.
        - `BackupName`: tên file đã lưu trong thư mục backup.
        - `OriginalPath`: đường dẫn và tên file gốc trong project.
    - Nhờ vậy, khi cần khôi phục (restore), ta có thể biết rõ file nào trong backup tương ứng với file gốc nào trong project.
    - Ví dụ metadata:
        ```json
        [
            {
            "BackupName": "backend_user-management-service_.env",
            "OriginalPath": "backend/user-management-service/.env"
            },
            {
            "BackupName": "backend_repository-management-service_.env",
            "OriginalPath": "backend/repository-management-service/.env"
            },
            {
            "BackupName": "backend_automation-service_.env",
            "OriginalPath": "backend/automation-service/.env"
            },
            {
            "BackupName": "backend_api-gateway_.env",
            "OriginalPath": "backend/api-gateway/.env"
            },
            {
            "BackupName": "frontend_web-app_.env.local",
            "OriginalPath": "frontend/web-app/.env.local"
            },
            {
            "BackupName": "windsurf_mcp.json",
            "OriginalPath": ".windsurf/mcp.json"
            }
        ]
        ```
        - File gốc `backend/user-management-service/.env` → được lưu thành `backend_user-management-service_.env` trong backup.
        - File gốc `backend/repository-management-service/.env` → được lưu thành `backend_repository-management-service_.env` trong backup.
        - File gốc `backend/automation-service/.env` → được lưu thành `backend_automation-service_.env` trong backup.
        - File gốc `backend/api-gateway/.env` → được lưu thành `backend_api-gateway_.env` trong backup.
        - File gốc `frontend/web-app/.env.local` → được lưu thành `frontend_web-app_.env.local` trong backup.
        - File gốc `.windsurf/mcp.json` → được lưu thành `windsurf_mcp.json` trong backup.