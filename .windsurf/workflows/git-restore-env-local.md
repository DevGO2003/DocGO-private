---
description: 
auto_execution_mode: 3
---

# Git Restore ENV Local

Push commits lên remote repository origin.

Lập Cursor TODO, lưu ý Phần nào trước thì phải thực thiện xong trước rồi mới qua Phần tiếp theo, ko được làm song song các Phần: 
  Phần 1 - Lấy tham số
  1) Lấy thời gian hiện tại (theo định dạng hh-mm-dd-MM-yyyy) để làm tên thư mục backup env sẽ phục hồi, ví dụ: `.git-backup/env/<Thời gian hiện tại>`

  Phần 2 - Thực hiện lần lượt các công việc sau bằng Cursor, đừng sài powershell cũng như tạo file ps1:
  1) - Phục hồi (restore) tất cả các file env đã được lưu trong thư mục `/.git-backup/env/<Thời gian hiện tại>` về đúng vị trí gốc trong project.
    - Đọc file `metadata.json` trong thư mục backup để lấy thông tin mapping giữa tên file backup và đường dẫn gốc.
    - Với mỗi object trong mảng metadata:
        - `BackupName`: tên file backup mới nhất hiện có trong thư mục `/.git-backup/env/<Thời gian hiện tại>`.
        - `OriginalPath`: đường dẫn và tên file gốc trong project.
    - Thực hiện copy hoặc di chuyển: lấy file theo `BackupName` trong thư mục backup và đặt lại đúng vị trí, đúng tên gốc theo `OriginalPath` trong project.
    - Nhờ vậy, các file env như `.env`, `.env.local` và `mcp.json` sẽ được khôi phục lại đúng tên và vị trí ban đầu, không giữ nguyên tên backup.
    - Ví dụ:
        ```json
        [
        {
            "BackupName": "backend_user-management-service_.env",
            "OriginalPath": "backend/user-management-service/.env"
        },
        {
            "BackupName": "frontend_env_.env.local",
            "OriginalPath": "frontend/web-app/.env.local"
        },
        {
            "BackupName": "cursor_mcp.json",
            "OriginalPath": ".cursor/mcp.json"
        }
        ]
        ```
        - File `backend_user-management-service_.env` trong backup sẽ được đặt lại thành `backend/user-management-service/.env`.
        - File `frontend_env_.env.local` trong backup sẽ được đặt lại thành `frontend/web-app/.env.local`.
        - File `cursor_mcp.json` trong backup sẽ được đặt lại thành `.cursor/mcp.json`.
