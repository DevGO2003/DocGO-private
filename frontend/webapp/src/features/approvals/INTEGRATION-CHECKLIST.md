# ✅ CHECKLIST - TÍCH HỢP APPROVAL SYSTEM

> **Làm theo checklist này để tích hợp approval workflow vào app**

---

## 📋 CHECKLIST

### **□ 1. Backend Setup**

- [x] ✅ Backend entities đã tạo (`ContractApprovalWorkflow.java`)
- [x] ✅ Repository đã tạo (`ContractApprovalWorkflowRepository.java`)
- [x] ✅ Service đã tạo (`ContractApprovalService.java`)
- [x] ✅ Controller đã tạo (`ContractApprovalController.java`)
- [ ] ⏳ **TODO: Start backend service**
  ```bash
  cd backend/repository-management-service
  ./mvnw spring-boot:run
  ```
- [ ] ⏳ **TODO: Test API bằng Postman/Swagger**
  - URL: `http://localhost:8002/api/docs`

---

### **□ 2. Frontend Config**

- [x] ✅ Components đã tạo
- [x] ✅ Hooks đã tạo  
- [x] ✅ API service đã tạo
- [ ] ⏳ **TODO: Thêm vào `.env`**
  ```env
  REACT_APP_REPOSITORY_SERVICE_URL=http://localhost:8002/api/v1/repository-management-service
  ```
- [ ] ⏳ **TODO: Start frontend**
  ```bash
  cd frontend/webapp
  npm start
  ```

---

### **□ 3. Tích hợp vào Contract Detail Page**

- [ ] ⏳ **TODO: Import components**
  ```tsx
  import { 
    useContractApproval, 
    ApprovalWorkflowStatus, 
    ApprovalActionModal 
  } from '@features/approvals';
  ```

- [ ] ⏳ **TODO: Thêm hook vào component**
  ```tsx
  const { workflow, approve, reject, currentLevel } = useContractApproval({
    contractId,
    userRole: 'MANAGER',
    userPermissions: ['approve:legal']
  });
  ```

- [ ] ⏳ **TODO: Thêm UI components**
  - `<ApprovalWorkflowStatus />` - Timeline
  - `<ApprovalActionModal />` - Approve/Reject modals

- [ ] ⏳ **TODO: Test trong browser**
  - Tạo contract
  - Click "Gửi phê duyệt"
  - Xem workflow timeline
  - Test approve/reject

**📝 Xem code mẫu:** `examples/ContractDetailWithApproval.example.tsx`

---

### **□ 4. Thêm Approval Dashboard**

- [ ] ⏳ **TODO: Thêm route**
  ```tsx
  import { MyApprovalsDashboard } from '@features/approvals';
  
  <Route path="/approvals/me" element={<MyApprovalsDashboard />} />
  ```

- [ ] ⏳ **TODO: Thêm vào navigation menu**
  ```tsx
  <NavLink to="/approvals/me">
    📋 Phê duyệt của tôi
  </NavLink>
  ```

- [ ] ⏳ **TODO: Test dashboard**
  - Vào `/approvals/me`
  - Xem danh sách chờ duyệt
  - Click vào contract

---

### **□ 5. User Authentication**

- [ ] ⏳ **TODO: Lưu user info vào localStorage sau khi login**
  ```tsx
  localStorage.setItem('userId', user.id);
  localStorage.setItem('userName', user.name);
  localStorage.setItem('userEmail', user.email);
  localStorage.setItem('userRole', user.role);
  localStorage.setItem('userPermissions', user.permissions.join(','));
  localStorage.setItem('currentOrganizationId', org.id);
  ```

- [ ] ⏳ **TODO: Thêm headers vào API calls**
  - `approvalApi.ts` đã tự động lấy từ localStorage
  - Check code ở `getAuthHeaders()` function

---

### **□ 6. Testing**

- [ ] ⏳ **TODO: Test workflow flow**
  1. Tạo contract với giá trị < 100tr → Chỉ cần Legal
  2. Tạo contract với giá trị 100tr-500tr → Legal + Finance
  3. Tạo contract với giá trị > 500tr → Legal + Finance + Executive

- [ ] ⏳ **TODO: Test permissions**
  1. Login với OWNER → Có thể approve tất cả
  2. Login với MANAGER (approve:legal) → Chỉ approve Legal
  3. Login với MEMBER → Không approve được

- [ ] ⏳ **TODO: Test reject**
  1. Reject ở bước Legal → Workflow dừng
  2. Check comment bắt buộc (min 10 chars)
  3. Creator nhận notification

- [ ] ⏳ **TODO: Test sequential approval**
  1. User có nhiều permissions → Phải approve từng bước
  2. Không thể skip bước

---

### **□ 7. Optional Enhancements**

- [ ] 🔔 **Notification system**
  - Email notifications
  - In-app notifications
  - Push notifications

- [ ] 📊 **Analytics Dashboard**
  - Approval stats
  - Average approval time
  - Rejection rate

- [ ] ⏰ **Timeout Reminders**
  - Remind approver after 24h
  - Escalate after 48h

- [ ] 📱 **Mobile Responsive**
  - Test trên mobile
  - Optimize UI for small screens

---

## 🎯 QUICK VERIFICATION

### Test 1: Can Start Approval?
```bash
curl -X POST http://localhost:8002/api/v1/repository-management-service/contracts/{contractId}/approvals/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-User-Id: user-123" \
  -H "X-Organization-Id: org-456" \
  -d '{"comment": "Test"}'
```

### Test 2: Can Get Workflow?
```bash
curl http://localhost:8002/api/v1/repository-management-service/contracts/{contractId}/approvals/workflow \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 3: Frontend Integration?
1. Mở browser → DevTools → Console
2. Vào contract detail page
3. Check console logs
4. Check Network tab → Xem API calls

---

## 📖 DOCS & EXAMPLES

- **Full Guide:** `documents/APPROVAL-SYSTEM-INTEGRATION-GUIDE.md`
- **Quick Start:** `frontend/webapp/src/features/approvals/README.md`
- **Code Snippets:** `frontend/webapp/src/features/approvals/COPY-PASTE-CODE.md`
- **Example File:** `frontend/webapp/src/features/approvals/examples/ContractDetailWithApproval.example.tsx`

---

## ❓ TROUBLESHOOTING

### Problem: "Cannot find module '@features/approvals'"
**Solution:** Check import path hoặc restart dev server

### Problem: "Workflow not found"
**Solution:** Contract chưa được submit for approval

### Problem: "User không có quyền"
**Solution:** Check userRole và userPermissions trong localStorage

### Problem: API call failed
**Solution:** Check backend running + CORS + .env config

---

## ✨ DONE!

Khi hoàn thành tất cả checklist → Approval system đã sẵn sàng! 🎉

**Next Steps:**
1. Deploy to staging
2. User testing
3. Fix bugs
4. Deploy to production

---

**🚀 Good luck!**
