# 📝 VÍ DỤ CỤ THỂ UNIFIED WORKFLOW

## 🎯 TÌNH HUỐNG THỰC TẾ

Giả sử công ty bạn có:
- **Anh Minh** - Manager (Trưởng phòng Kinh doanh)
- **Chị Lan** - Legal Reviewer (Luật sư)
- **Anh Tuấn** - Finance Reviewer (Kế toán trưởng)
- **Anh Khoa** - Admin (Giám đốc)
- **Em Nam** - Member (Nhân viên Sales)

---

## 📋 VÍ DỤ 1: HỢP ĐỒNG NHỎ (50 TRIỆU)

### Tình huống:
Em Nam (nhân viên sales) cần ký hợp đồng bán phần mềm cho khách hàng ABC, giá trị **50 triệu VNĐ**.

### Quy trình chi tiết:

#### **Ngày 1 - 9:00 AM: Em Nam tạo hợp đồng**
```
Em Nam:
1. Vào trang /organization/[id]/contracts/new
2. Upload file PDF hợp đồng
3. Hệ thống OCR tự động đọc:
   ✅ Tên khách hàng: Công ty ABC
   ✅ Giá trị: 50,000,000 VNĐ
   ✅ Ngày bắt đầu: 01/11/2024
   ✅ Ngày kết thúc: 01/11/2025
4. Em Nam kiểm tra thông tin
5. Nhấn "Submit để phê duyệt"
```

#### **Hệ thống kiểm tra workflow:**
```javascript
// Hệ thống tự động check
const contract = {
  value: 50_000_000,
  type: 'sales',
  createdBy: 'Nam'
}

// Check từng step
Step 1: Department Review
  enabled: true ✅ (luôn chạy)
  → Gửi cho Anh Minh

Step 2: Expert Review  
  enabled: contract.value >= 100_000_000 ❌
  → SKIP (vì 50M < 100M)

Step 3: Director Approval
  enabled: contract.value >= 1_000_000_000 ❌
  → SKIP (vì 50M < 1B)

Kết quả: Chỉ chạy Step 1
```

#### **Ngày 1 - 9:05 AM: Anh Minh nhận thông báo**
```
📧 Email đến Anh Minh:
"Hợp đồng mới cần phê duyệt
- Tên: Hợp đồng bán phần mềm - ABC
- Giá trị: 50,000,000 VNĐ
- Người tạo: Em Nam
- Cần phê duyệt trước: 10/11/2024 9:00 AM (24h)
[Xem chi tiết] [Phê duyệt ngay]"
```

#### **Ngày 1 - 2:00 PM: Anh Minh phê duyệt**
```
Anh Minh:
1. Click vào link trong email
2. Xem chi tiết hợp đồng
3. Kiểm tra:
   ✅ Giá cả hợp lý
   ✅ Điều khoản OK
   ✅ Khách hàng uy tín
4. Nhấn "Approve"
5. Thêm comment: "Hợp đồng OK, khách hàng quen"
```

#### **Ngày 1 - 2:01 PM: Hợp đồng được duyệt**
```
✅ HỢP ĐỒNG ĐÃ ĐƯỢC PHÊ DUYỆT

Timeline:
├─ 9:00 AM: Em Nam tạo
├─ 9:05 AM: Gửi cho Anh Minh
├─ 2:00 PM: Anh Minh approve
└─ 2:01 PM: Hoàn thành ✅

Tổng thời gian: 5 giờ
Số người review: 1 (Anh Minh)
```

---

## 📋 VÍ DỤ 2: HỢP ĐỒNG TRUNG BÌNH (500 TRIỆU)

### Tình huống:
Anh Minh (Manager) cần ký hợp đồng dịch vụ với đối tác XYZ, giá trị **500 triệu VNĐ**.

### Quy trình chi tiết:

#### **Ngày 1 - 10:00 AM: Anh Minh tạo hợp đồng**
```
Anh Minh tạo hợp đồng:
- Giá trị: 500,000,000 VNĐ
- Loại: Hợp đồng dịch vụ
- Thời hạn: 12 tháng
→ Submit
```

#### **Hệ thống kiểm tra:**
```javascript
const contract = {
  value: 500_000_000,
  type: 'service'
}

Step 1: Department Review
  enabled: true ✅
  → Anh Minh tự approve (vì là Manager)

Step 2: Expert Review
  enabled: 500M >= 100M ✅ (TRUE!)
  → Gửi cho Chị Lan (Legal) + Anh Tuấn (Finance)

Step 3: Director Approval
  enabled: 500M >= 1B ❌
  → SKIP

Kết quả: Chạy Step 1 + Step 2
```

#### **Ngày 1 - 10:05 AM: Step 1 - Anh Minh tự approve**
```
Anh Minh:
"Mình là người tạo và cũng là Manager, approve luôn"
→ Step 1 hoàn thành ✅
```

#### **Ngày 1 - 10:10 AM: Step 2 - Gửi cho Chị Lan & Anh Tuấn**
```
📧 Email đến Chị Lan (Legal):
"Hợp đồng cần đánh giá pháp lý
- Giá trị: 500,000,000 VNĐ
- Loại: Dịch vụ
- Cần review trước: 13/11/2024 10:10 AM (48h)
[Xem chi tiết]"

📧 Email đến Anh Tuấn (Finance):
"Hợp đồng cần đánh giá tài chính
- Giá trị: 500,000,000 VNĐ
- Ngân sách Q4: 2,000,000,000 VNĐ
- Cần review trước: 13/11/2024 10:10 AM (48h)
[Xem chi tiết]"
```

#### **Ngày 1 - 3:00 PM: Chị Lan review pháp lý**
```
Chị Lan:
1. Đọc hợp đồng kỹ
2. Kiểm tra:
   ✅ Điều khoản hợp pháp
   ✅ Không có rủi ro pháp lý
   ⚠️ Cần sửa điều khoản thanh toán
3. Nhấn "Request Changes"
4. Comment: "Cần sửa điều khoản 5.2 về thanh toán,
   phải có điều khoản phạt nếu chậm trễ"
```

#### **Ngày 1 - 3:05 PM: Hợp đồng trả về Anh Minh**
```
❌ HỢP ĐỒNG BỊ YÊU CẦU CHỈNH SỬA

📧 Email đến Anh Minh:
"Hợp đồng cần chỉnh sửa
- Người yêu cầu: Chị Lan (Legal)
- Lý do: Cần sửa điều khoản thanh toán
- Chi tiết: [Xem comment]
[Chỉnh sửa ngay]"
```

#### **Ngày 2 - 9:00 AM: Anh Minh sửa và gửi lại**
```
Anh Minh:
1. Sửa điều khoản 5.2
2. Thêm điều khoản phạt chậm trễ
3. Upload file mới
4. Comment: "Đã sửa theo yêu cầu của Legal"
5. Submit lại
```

#### **Ngày 2 - 9:10 AM: Gửi lại cho Chị Lan & Anh Tuấn**
```
Hệ thống tự động gửi lại cho cả 2 người
(vì Step 2 chưa hoàn thành)
```

#### **Ngày 2 - 11:00 AM: Chị Lan approve**
```
Chị Lan:
1. Xem bản sửa
2. Kiểm tra điều khoản mới
3. ✅ OK rồi!
4. Nhấn "Approve (Legal)"
5. Comment: "Điều khoản đã OK, approve"

→ Legal Review: ✅ DONE
```

#### **Ngày 2 - 2:00 PM: Anh Tuấn approve**
```
Anh Tuấn:
1. Kiểm tra tài chính:
   ✅ Ngân sách Q4 còn 2B
   ✅ Hợp đồng 500M → OK
   ✅ Dòng tiền ổn định
   ✅ ROI dự kiến 20%
2. Nhấn "Approve (Finance)"
3. Comment: "Tài chính OK, trong ngân sách"

→ Finance Review: ✅ DONE
```

#### **Ngày 2 - 2:01 PM: Hợp đồng được duyệt**
```
✅ HỢP ĐỒNG ĐÃ ĐƯỢC PHÊ DUYỆT

Timeline:
├─ Ngày 1, 10:00 AM: Anh Minh tạo
├─ Ngày 1, 10:05 AM: Step 1 - Anh Minh approve
├─ Ngày 1, 10:10 AM: Step 2 - Gửi Legal + Finance
├─ Ngày 1, 3:00 PM: Chị Lan request changes
├─ Ngày 2, 9:00 AM: Anh Minh sửa và gửi lại
├─ Ngày 2, 11:00 AM: Chị Lan approve
├─ Ngày 2, 2:00 PM: Anh Tuấn approve
└─ Ngày 2, 2:01 PM: Hoàn thành ✅

Tổng thời gian: ~2 ngày
Số người review: 3 (Anh Minh, Chị Lan, Anh Tuấn)
Số lần sửa: 1
```

---

## 📋 VÍ DỤ 3: HỢP ĐỒNG LỚN (2 TỶ)

### Tình huống:
Anh Minh cần ký hợp đồng đối tác chiến lược với công ty DEF, giá trị **2 tỷ VNĐ**.

### Quy trình chi tiết:

#### **Ngày 1 - 9:00 AM: Anh Minh tạo hợp đồng**
```
Hợp đồng:
- Giá trị: 2,000,000,000 VNĐ
- Loại: Đối tác chiến lược
- Thời hạn: 3 năm
```

#### **Hệ thống kiểm tra:**
```javascript
const contract = {
  value: 2_000_000_000,
  type: 'partnership'
}

Step 1: Department Review
  enabled: true ✅
  → Anh Minh

Step 2: Expert Review
  enabled: 2B >= 100M ✅
  → Chị Lan + Anh Tuấn

Step 3: Director Approval
  enabled: 2B >= 1B ✅ (TRUE!)
  → Anh Khoa (Admin/Director)

Kết quả: Chạy CẢ 3 STEPS!
```

#### **Ngày 1 - 9:05 AM: Step 1 hoàn thành**
```
Anh Minh tự approve Step 1
→ Chuyển sang Step 2
```

#### **Ngày 1 - 9:10 AM: Step 2 bắt đầu**
```
Gửi cho Chị Lan + Anh Tuấn
Deadline: 72 giờ (3 ngày)
```

#### **Ngày 1-3: Chị Lan & Anh Tuấn review**
```
Chị Lan (Legal):
- Ngày 1: Đọc hợp đồng
- Ngày 2: Tham khảo luật sư bên ngoài
- Ngày 3, 10:00 AM: Approve
  Comment: "Đã tham khảo chuyên gia, hợp đồng OK"

Anh Tuấn (Finance):
- Ngày 1: Phân tích tài chính
- Ngày 2: Họp với CFO
- Ngày 3, 2:00 PM: Approve
  Comment: "CFO đã approve, tài chính OK"
```

#### **Ngày 3 - 2:01 PM: Step 2 hoàn thành → Step 3 bắt đầu**
```
📧 Email đến Anh Khoa (Director):
"HỢP ĐỒNG QUAN TRỌNG CẦN PHÊ DUYỆT
- Giá trị: 2,000,000,000 VNĐ ⚠️
- Đã qua Legal ✅
- Đã qua Finance ✅
- Cần phê duyệt cuối cùng
- Deadline: 48 giờ
- ⚠️ Nếu quá hạn sẽ escalate lên Owner
[XEM NGAY]"
```

#### **Ngày 4 - 10:00 AM: Anh Khoa review**
```
Anh Khoa:
1. Đọc toàn bộ hợp đồng
2. Xem comments của Legal & Finance
3. Đánh giá chiến lược:
   ✅ Đối tác uy tín
   ✅ Lợi ích dài hạn
   ✅ Phù hợp định hướng công ty
4. Họp với CEO (Owner)
5. CEO đồng ý
6. Nhấn "Approve"
7. Comment: "Đã trao đổi với CEO, approve"
```

#### **Ngày 4 - 10:01 AM: Hợp đồng được duyệt**
```
✅ HỢP ĐỒNG ĐÃ ĐƯỢC PHÊ DUYỆT

Timeline:
├─ Ngày 1, 9:00 AM: Anh Minh tạo
├─ Ngày 1, 9:05 AM: Step 1 - Anh Minh approve
├─ Ngày 1, 9:10 AM: Step 2 - Gửi Legal + Finance
├─ Ngày 3, 10:00 AM: Chị Lan approve
├─ Ngày 3, 2:00 PM: Anh Tuấn approve
├─ Ngày 3, 2:01 PM: Step 3 - Gửi Anh Khoa
├─ Ngày 4, 10:00 AM: Anh Khoa approve
└─ Ngày 4, 10:01 AM: Hoàn thành ✅

Tổng thời gian: ~4 ngày
Số người review: 4 (Anh Minh, Chị Lan, Anh Tuấn, Anh Khoa)
Số cấp phê duyệt: 3 cấp
```

---

## 🎯 SO SÁNH 3 TRƯỜNG HỢP

| Tiêu chí | 50M | 500M | 2B |
|----------|-----|------|-----|
| **Steps chạy** | 1 | 2 | 3 |
| **Người review** | 1 | 3 | 4 |
| **Thời gian** | 5 giờ | 2 ngày | 4 ngày |
| **Department** | ✅ | ✅ | ✅ |
| **Expert** | ❌ | ✅ | ✅ |
| **Director** | ❌ | ❌ | ✅ |

---

## 💡 ĐIỂM QUAN TRỌNG

### **1. Tự động quyết định steps**
```
Hệ thống TỰ ĐỘNG check:
- 50M → Chỉ cần Manager
- 500M → Cần thêm Legal + Finance
- 2B → Cần thêm Director

KHÔNG CẦN người dùng chọn workflow!
```

### **2. Parallel Review**
```
Step 2 (Expert Review):
├─ Chị Lan review ĐỒNG THỜI với
└─ Anh Tuấn review

→ Tiết kiệm thời gian
→ Cả 2 phải approve mới qua step tiếp
```

### **3. Request Changes**
```
Nếu ai đó request changes:
→ Hợp đồng trả về người tạo
→ Người tạo sửa
→ Gửi lại từ đầu step đó
→ Tất cả người trong step phải review lại
```

### **4. Escalation**
```
Nếu Anh Khoa không approve trong 48h:
→ Tự động escalate lên Owner (CEO)
→ CEO nhận thông báo khẩn
→ CEO phải xử lý ngay
```

---

## 🎨 FLOW CHART TRỰC QUAN

### Hợp đồng 50M:
```
Em Nam tạo
     ↓
Anh Minh approve
     ↓
   XONG ✅
```

### Hợp đồng 500M:
```
Anh Minh tạo
     ↓
Anh Minh approve (Step 1)
     ↓
┌────────┴────────┐
│                 │
Chị Lan        Anh Tuấn
(Legal)        (Finance)
│                 │
└────────┬────────┘
     ↓
   XONG ✅
```

### Hợp đồng 2B:
```
Anh Minh tạo
     ↓
Anh Minh approve (Step 1)
     ↓
┌────────┴────────┐
│                 │
Chị Lan        Anh Tuấn
(Legal)        (Finance)
│                 │
└────────┬────────┘
     ↓
Anh Khoa (Director)
     ↓
   XONG ✅
```

---

## ✅ KẾT LUẬN

Với **1 Unified Workflow**, hệ thống tự động:

1. ✅ **Check giá trị** hợp đồng
2. ✅ **Quyết định steps** cần chạy
3. ✅ **Gửi thông báo** cho đúng người
4. ✅ **Theo dõi tiến độ** từng step
5. ✅ **Escalate** nếu timeout
6. ✅ **Hoàn thành** khi tất cả approve

**Người dùng KHÔNG CẦN làm gì**, chỉ cần:
- Tạo hợp đồng
- Approve khi được yêu cầu
- Hệ thống lo phần còn lại!

Bạn hiểu rõ hơn chưa? 😊
