// MongoDB script để test dữ liệu
// Chạy với: mongosh --file test-mongo.js

// Kết nối đến database
use docgo_contract_service

// Xóa dữ liệu cũ nếu có
db.contracts.deleteMany({})

print("=== BẮT ĐẦU TẠO DỮ LIỆU TEST ===")

// Tạo 5 hợp đồng test
var contracts = [
    {
        contractNumber: "CTR-2024-001",
        title: "Hợp đồng cung cấp dịch vụ IT cho Công ty ABC",
        status: "ACTIVE",
        partiesJson: '[{"role":"CLIENT","name":"Công ty ABC","address":"123 Đường ABC, Quận 1, TP.HCM"},{"role":"PROVIDER","name":"Công ty IT Solutions","address":"456 Đường XYZ, Quận 3, TP.HCM"}]',
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        systemId: "SYS-IT-001",
        summary: "Hợp đồng cung cấp dịch vụ IT bao gồm phát triển phần mềm, bảo trì hệ thống và hỗ trợ kỹ thuật",
        contractType: "Dịch vụ IT",
        riskLevel: "LOW",
        keyTerms: "Thanh toán theo tiến độ, bảo hành 12 tháng, SLA 99.9%",
        favorableClauses: "Điều khoản bảo hành, cam kết chất lượng, hỗ trợ 24/7",
        unfavorableClauses: "Phạt chậm tiến độ, giới hạn trách nhiệm",
        paymentCurrency: "VND",
        aiProcessed: true,
        processingStatus: "COMPLETED",
        contractObject: "Dịch vụ phát triển phần mềm và bảo trì hệ thống",
        effectiveDate: "01/01/2024",
        contractTerm: "12 tháng",
        totalValue: "500000000",
        paymentSchedule: "Thanh toán 30% khi ký hợp đồng, 40% khi hoàn thành 50% công việc, 30% khi nghiệm thu",
        currency: "VND",
        paymentMethod: "Chuyển khoản ngân hàng",
        reminders: "Nhắc nhở thanh toán trước 7 ngày, nhắc nhở gia hạn trước 30 ngày",
        terminationConditions: "Chấm dứt khi vi phạm nghiêm trọng, không thanh toán đúng hạn, chất lượng không đạt yêu cầu",
        riskAssessment: "Rủi ro thấp do đối tác uy tín, có kinh nghiệm trong lĩnh vực IT",
        complianceStatus: "COMPLIANT",
        legalReviewRequired: false,
        tags: "IT, Software Development, Maintenance",
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        isDeleted: false
    },
    {
        contractNumber: "CTR-2024-002",
        title: "Hợp đồng thuê văn phòng tại Tòa nhà Landmark",
        status: "PENDING_APPROVAL",
        partiesJson: '[{"role":"TENANT","name":"Công ty Startup XYZ","address":"789 Đường Startup, Quận 2, TP.HCM"},{"role":"LANDLORD","name":"Công ty BDS Landmark","address":"Tòa nhà Landmark, Quận 1, TP.HCM"}]',
        startDate: new Date("2024-02-01"),
        endDate: new Date("2025-01-31"),
        systemId: "SYS-RE-002",
        summary: "Hợp đồng thuê văn phòng 200m2 tại tầng 15 Tòa nhà Landmark với đầy đủ tiện ích",
        contractType: "Thuê văn phòng",
        riskLevel: "MEDIUM",
        keyTerms: "Thuê 12 tháng, gia hạn tự động, đặt cọc 3 tháng tiền thuê",
        favorableClauses: "Điều khoản gia hạn tự động, bảo trì cơ sở hạ tầng, an ninh 24/7",
        unfavorableClauses: "Phạt chấm dứt sớm, giới hạn sửa đổi nội thất",
        paymentCurrency: "VND",
        aiProcessed: false,
        processingStatus: "PENDING",
        contractObject: "Văn phòng 200m2 tại Tòa nhà Landmark",
        effectiveDate: "15/01/2024",
        contractTerm: "12 tháng",
        totalValue: "120000000",
        paymentSchedule: "Thanh toán hàng tháng vào ngày 15, đặt cọc 3 tháng tiền thuê",
        currency: "VND",
        paymentMethod: "Chuyển khoản ngân hàng",
        reminders: "Nhắc nhở thanh toán trước 5 ngày, nhắc nhở gia hạn trước 60 ngày",
        terminationConditions: "Chấm dứt khi vi phạm quy định tòa nhà, không thanh toán đúng hạn",
        riskAssessment: "Rủi ro trung bình do thị trường bất động sản biến động",
        complianceStatus: "PENDING_REVIEW",
        legalReviewRequired: true,
        tags: "Real Estate, Office Rental, Landmark",
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        isDeleted: false
    },
    {
        contractNumber: "CTR-2024-003",
        title: "Hợp đồng cung cấp nguyên vật liệu xây dựng",
        status: "DRAFT",
        partiesJson: '[{"role":"BUYER","name":"Công ty Xây dựng DEF","address":"321 Đường Construction, Quận 7, TP.HCM"},{"role":"SUPPLIER","name":"Công ty Vật liệu GHI","address":"654 Đường Materials, Quận 8, TP.HCM"}]',
        startDate: new Date("2024-03-01"),
        endDate: new Date("2025-02-28"),
        systemId: "SYS-CON-003",
        summary: "Hợp đồng cung cấp xi măng, thép, gạch và các vật liệu xây dựng khác cho dự án chung cư cao cấp",
        contractType: "Cung cấp vật liệu",
        riskLevel: "HIGH",
        keyTerms: "Cung cấp theo tiến độ dự án, bảo hành chất lượng, giao hàng tận công trường",
        favorableClauses: "Điều khoản bảo hành dài hạn, cam kết chất lượng, giao hàng đúng hạn",
        unfavorableClauses: "Phạt chậm giao hàng, giới hạn bồi thường, điều kiện thanh toán khắt khe",
        paymentCurrency: "VND",
        aiProcessed: false,
        processingStatus: "PENDING",
        contractObject: "Xi măng, thép, gạch và vật liệu xây dựng",
        effectiveDate: "01/02/2024",
        contractTerm: "12 tháng",
        totalValue: "2500000000",
        paymentSchedule: "Thanh toán 20% khi ký hợp đồng, 60% theo tiến độ giao hàng, 20% khi hoàn thành",
        currency: "VND",
        paymentMethod: "Thư tín dụng và chuyển khoản",
        reminders: "Nhắc nhở giao hàng trước 7 ngày, nhắc nhở thanh toán trước 3 ngày",
        terminationConditions: "Chấm dứt khi chất lượng không đạt, chậm giao hàng nghiêm trọng",
        riskAssessment: "Rủi ro cao do giá vật liệu biến động, phụ thuộc vào thị trường quốc tế",
        complianceStatus: "UNDER_REVIEW",
        legalReviewRequired: true,
        tags: "Construction, Materials, Supply Chain",
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        isDeleted: false
    },
    {
        contractNumber: "CTR-2024-004",
        title: "Hợp đồng dịch vụ vận chuyển hàng hóa",
        status: "ACTIVE",
        partiesJson: '[{"role":"SHIPPER","name":"Công ty Logistics JKL","address":"987 Đường Logistics, Quận 9, TP.HCM"},{"role":"CUSTOMER","name":"Công ty Thương mại MNO","address":"147 Đường Trade, Quận 10, TP.HCM"}]',
        startDate: new Date("2023-11-01"),
        endDate: new Date("2024-10-31"),
        systemId: "SYS-LOG-004",
        summary: "Hợp đồng cung cấp dịch vụ vận chuyển hàng hóa từ TP.HCM đến các tỉnh miền Tây và miền Đông",
        contractType: "Dịch vụ vận chuyển",
        riskLevel: "MEDIUM",
        keyTerms: "Vận chuyển 24/7, bảo hiểm hàng hóa, tracking real-time",
        favorableClauses: "Điều khoản bảo hiểm toàn bộ, cam kết thời gian giao hàng, hỗ trợ 24/7",
        unfavorableClauses: "Giới hạn trách nhiệm bồi thường, điều kiện đóng gói hàng hóa",
        paymentCurrency: "VND",
        aiProcessed: true,
        processingStatus: "COMPLETED",
        contractObject: "Dịch vụ vận chuyển hàng hóa đường bộ",
        effectiveDate: "01/11/2023",
        contractTerm: "12 tháng",
        totalValue: "800000000",
        paymentSchedule: "Thanh toán hàng tháng vào ngày 30, quyết toán cuối tháng",
        currency: "VND",
        paymentMethod: "Chuyển khoản ngân hàng",
        reminders: "Nhắc nhở thanh toán trước 3 ngày, báo cáo định kỳ hàng tháng",
        terminationConditions: "Chấm dứt khi vi phạm an toàn giao thông, không thanh toán đúng hạn",
        riskAssessment: "Rủi ro trung bình do phụ thuộc vào giao thông và thời tiết",
        complianceStatus: "COMPLIANT",
        legalReviewRequired: false,
        tags: "Logistics, Transportation, Delivery",
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        isDeleted: false
    },
    {
        contractNumber: "CTR-2024-005",
        title: "Hợp đồng bảo hiểm nhân thọ cho nhân viên",
        status: "PENDING",
        partiesJson: '[{"role":"INSURER","name":"Công ty Bảo hiểm PQR","address":"258 Đường Insurance, Quận 1, TP.HCM"},{"role":"EMPLOYER","name":"Công ty Công nghệ STU","address":"369 Đường Tech, Quận 3, TP.HCM"}]',
        startDate: new Date("2024-03-15"),
        endDate: new Date("2025-03-14"),
        systemId: "SYS-INS-005",
        summary: "Hợp đồng bảo hiểm nhân thọ nhóm cho 150 nhân viên công ty công nghệ với các gói bảo hiểm đa dạng",
        contractType: "Bảo hiểm nhân thọ",
        riskLevel: "LOW",
        keyTerms: "Bảo hiểm nhóm, quyền lợi tử vong, bảo hiểm bệnh hiểm nghèo, bảo hiểm tai nạn",
        favorableClauses: "Điều khoản bảo hiểm rộng rãi, quyền lợi bổ sung, dịch vụ chăm sóc khách hàng",
        unfavorableClauses: "Giới hạn tuổi tham gia, điều kiện sức khỏe, thời gian chờ",
        paymentCurrency: "VND",
        aiProcessed: false,
        processingStatus: "PENDING",
        contractObject: "Bảo hiểm nhân thọ nhóm cho nhân viên",
        effectiveDate: "15/02/2024",
        contractTerm: "12 tháng",
        totalValue: "450000000",
        paymentSchedule: "Thanh toán hàng quý, phí bảo hiểm được trừ vào lương nhân viên",
        currency: "VND",
        paymentMethod: "Trừ lương và chuyển khoản",
        reminders: "Nhắc nhở gia hạn trước 60 ngày, báo cáo định kỳ hàng quý",
        terminationConditions: "Chấm dứt khi công ty đóng cửa, nhân viên nghỉ việc",
        riskAssessment: "Rủi ro thấp do đối tác bảo hiểm uy tín, danh mục khách hàng ổn định",
        complianceStatus: "PENDING_REVIEW",
        legalReviewRequired: true,
        tags: "Insurance, Life Insurance, Employee Benefits",
        createdBy: "system",
        updatedBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        isDeleted: false
    }
]

// Insert contracts
var result = db.contracts.insertMany(contracts)
print("Đã tạo " + result.insertedIds.length + " hợp đồng")

print("\n=== TEST GETALL ===")
// Test getAll - lấy tất cả hợp đồng
var allContracts = db.contracts.find({isDeleted: false}).toArray()
print("Tổng số hợp đồng: " + allContracts.length)

// Hiển thị danh sách hợp đồng
print("\n=== DANH SÁCH HỢP ĐỒNG ===")
allContracts.forEach(function(contract) {
    print("- " + contract.contractNumber + ": " + contract.title + " (" + contract.status + ")")
})

// Test phân trang
print("\n=== TEST PHÂN TRANG ===")
var pageSize = 3
var pageNumber = 0
var skip = pageNumber * pageSize

var paginatedContracts = db.contracts.find({isDeleted: false}).skip(skip).limit(pageSize).toArray()
print("Trang " + (pageNumber + 1) + " (kích thước " + pageSize + "):")
paginatedContracts.forEach(function(contract) {
    print("- " + contract.contractNumber + ": " + contract.title)
})

// Test tìm kiếm theo status
print("\n=== TEST TÌM KIẾM THEO STATUS ===")
var activeContracts = db.contracts.find({status: "ACTIVE", isDeleted: false}).toArray()
print("Số hợp đồng ACTIVE: " + activeContracts.length)
activeContracts.forEach(function(contract) {
    print("- " + contract.contractNumber + ": " + contract.title)
})

print("\n=== HOÀN THÀNH TEST ===")

