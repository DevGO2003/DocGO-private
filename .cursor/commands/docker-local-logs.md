# Docker Local Logs

Xem logs của tất cả services trong môi trường development local.

## Mô tả
Command này sẽ hiển thị logs real-time của tất cả containers đang chạy trong docker-compose local.

## Cách sử dụng
Gõ /docker-local-logs trong Agent input để chạy command này.

## Lệnh thực thi
`ash
docker-compose -f docker-compose.local.yml logs -f
`

## Tùy chọn khác
- Xem logs của service cụ thể: docker-compose -f docker-compose.local.yml logs -f <service-name>
- Xem logs với timestamp: docker-compose -f docker-compose.local.yml logs -f -t
- Xem logs của 100 dòng cuối: docker-compose -f docker-compose.local.yml logs --tail=100

## Lưu ý
- Nhấn Ctrl+C để thoát khỏi chế độ follow logs
- Sử dụng docker-local-status để xem trạng thái services
