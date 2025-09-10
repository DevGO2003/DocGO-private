package com.devgo2003.docgo.auth_service.controller;

import com.devgo2003.docgo.auth_service.common.response.RestResponse;
import com.devgo2003.docgo.auth_service.model.AuthRequest;
import com.devgo2003.docgo.auth_service.model.AuthResponse;
import com.devgo2003.docgo.auth_service.model.LoginRequest;
import com.devgo2003.docgo.auth_service.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import java.time.ZonedDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/authentication-identity-service/auth")
@Tag(name = "API Xác thực và Ủy quyền", description = "Các API để đăng ký, đăng nhập và quản lý xác thực người dùng")
public class AuthController {

    private final AuthService authService;
    private final HttpServletRequest request;

    @Autowired
    public AuthController(AuthService authService, HttpServletRequest request) {
        this.authService = authService;
        this.request = request;
    }

    @Operation(
        summary = "Lấy danh sách tài khoản",
        description = """
        🔹 Đầu vào

        📄 pageNumber (tùy chọn, query)
        Loại: integer
        Mô tả: Số trang (bắt đầu từ 0).

        📄 pageSize (tùy chọn, query)
        Loại: integer
        Mô tả: Số lượng bản ghi mỗi trang (mặc định 10).

        📄 sortBy (tùy chọn, query)
        Loại: string
        Mô tả: Trường sắp xếp (mặc định: createdAt).

        📄 sortDirection (tùy chọn, query)
        Loại: string
        Mô tả: Hướng sắp xếp (ASC/DESC, mặc định: DESC).

        📄 searchTerm (tùy chọn, query)
        Loại: string
        Mô tả: Từ khóa tìm kiếm theo username, email, fullName.

        📄 includeDeleted (tùy chọn, query)
        Loại: boolean
        Mô tả: Có bao gồm tài khoản đã xóa không (mặc định: false).

        🔹 Đầu ra

        📝 data
        Loại: PaginatedResponse<User>
        Mô tả: Danh sách tài khoản với thông tin phân trang.

        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1).

        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK).

        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả.

        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý.

        🕒 timestamp
        Loại: ZonedDateTime
        Mô tả: Thời gian xử lý yêu cầu.

        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu.

        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi.
        """
    )
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RestResponse<Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "false") boolean includeDeleted,
            @RequestHeader("Authorization") String authorization) {
        
        // TODO: Implement get all users logic
        boolean hasData = false; // Placeholder until service implemented
        RestResponse<Object> response = RestResponse.<Object>builder()
                .apiVersion("v1")
                .statusCode(hasData ? HttpStatus.OK.value() : HttpStatus.NO_CONTENT.value())
                .shortMessage(hasData ? "Success" : "No Content")
                .description(hasData ? "Danh sách tài khoản đã được lấy thành công." : "Không có tài khoản nào.")
                .data(hasData ? new Object() : null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(
        summary = "Lấy thông tin người dùng hiện tại",
        description = "Trả về thông tin user dựa trên token hiện tại"
    )
    @GetMapping("/me")
    public ResponseEntity<RestResponse<AuthResponse.UserInfo>> me(Authentication authentication) {
        String username = authentication.getName();
        var userOpt = authService.findByUsername(username);
        RestResponse<AuthResponse.UserInfo> response = userOpt.map(u -> RestResponse.<AuthResponse.UserInfo>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.OK.value())
                .shortMessage("Success")
                .description("Lấy thông tin người dùng thành công.")
                .data(new AuthResponse.UserInfo(u.getUserId(), u.getUsername(), u.getEmail(), u.getRole().name()))
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build())
            .orElse(RestResponse.<AuthResponse.UserInfo>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.NOT_FOUND.value())
                .shortMessage("Not Found")
                .description("Không tìm thấy người dùng.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(
        summary = "Tạo tài khoản mới", 
        description = """
        🔹 Đầu vào
        
        👤 authRequest (bắt buộc, body)
        Loại: AuthRequest
        Mô tả: Thông tin tài khoản cần tạo (username, email, password).
        
        🔹 Đầu ra
        
        📝 data
        Loại: AuthResponse
        Mô tả: Thông tin tài khoản đã được tạo thành công.
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1).
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (201: Created).
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả.
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý.
        
        🕒 timestamp
        Loại: ZonedDateTime
        Mô tả: Thời gian xử lý yêu cầu.
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu.
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi.
        """
    )
    @PostMapping("/register")
    public ResponseEntity<RestResponse<AuthResponse>> createUser(@Valid @RequestBody AuthRequest authRequest) {
        AuthResponse created = authService.register(authRequest.getUsername(), authRequest.getEmail(), authRequest.getPassword());
        RestResponse<AuthResponse> response = RestResponse.<AuthResponse>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.CREATED.value())
                .shortMessage("Success")
                .description("Tài khoản đã được tạo thành công.")
                .data(created)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(
        summary = "Lấy thông tin đăng nhập", 
        description = """
        🔹 Đầu vào
        
        🔐 loginRequest (bắt buộc, body)
        Loại: LoginRequest
        Mô tả: Thông tin đăng nhập (username, password).
        
        🔹 Đầu ra
        
        📝 data
        Loại: AuthResponse
        Mô tả: Thông tin xác thực và token đăng nhập.
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1).
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK).
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả.
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý.
        
        🕒 timestamp
        Loại: ZonedDateTime
        Mô tả: Thời gian xử lý yêu cầu.
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu.
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi.
        """
    )
    @PostMapping("/login")
    public ResponseEntity<RestResponse<AuthResponse>> getUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse authResponse = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
        RestResponse<AuthResponse> response = RestResponse.<AuthResponse>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.OK.value())
                .shortMessage("Success")
                .description("Thông tin đăng nhập đã được xác thực thành công.")
                .data(authResponse)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(
        summary = "Cập nhật thông tin tài khoản", 
        description = """
        🔹 Đầu vào
        
        🆔 id (bắt buộc, path)
        Loại: Long
        Mô tả: ID của tài khoản cần cập nhật.
        
        👤 authRequest (bắt buộc, body)
        Loại: AuthRequest
        Mô tả: Thông tin mới cần cập nhật (username, email, password).
        
        🔹 Đầu ra
        
        📝 data
        Loại: AuthResponse
        Mô tả: Thông tin tài khoản đã được cập nhật.
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1).
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK).
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả.
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý.
        
        🕒 timestamp
        Loại: ZonedDateTime
        Mô tả: Thời gian xử lý yêu cầu.
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu.
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi.
        """
    )
    @PutMapping("/{id}")
    public ResponseEntity<RestResponse<AuthResponse>> updateUser(@PathVariable Long id, @Valid @RequestBody AuthRequest authRequest) {
        // TODO: Implement update user logic
        AuthResponse updatedUser = new AuthResponse(); // Placeholder
        RestResponse<AuthResponse> response = RestResponse.<AuthResponse>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.OK.value())
                .shortMessage("Success")
                .description("Thông tin tài khoản đã được cập nhật thành công.")
                .data(updatedUser)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(
        summary = "Xóa mềm tài khoản", 
        description = """
        🔹 Đầu vào
        
        🆔 id (bắt buộc, path)
        Loại: Long
        Mô tả: ID của tài khoản cần xóa mềm.
        
        🔹 Đầu ra
        
        📝 data
        Loại: null
        Mô tả: Không có dữ liệu trả về.
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1).
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK).
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả.
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý.
        
        🕒 timestamp
        Loại: ZonedDateTime
        Mô tả: Thời gian xử lý yêu cầu.
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu.
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi.
        """
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<RestResponse<Void>> softDeleteUser(@PathVariable Long id) {
        // TODO: Implement soft delete user logic
        RestResponse<Void> response = RestResponse.<Void>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.OK.value())
                .shortMessage("Success")
                .description("Tài khoản đã được xóa mềm thành công.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(
        summary = "Khôi phục tài khoản", 
        description = """
        🔹 Đầu vào
        
        🆔 id (bắt buộc, path)
        Loại: Long
        Mô tả: ID của tài khoản cần khôi phục.
        
        🔹 Đầu ra
        
        📝 data
        Loại: null
        Mô tả: Không có dữ liệu trả về.
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1).
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK).
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả.
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý.
        
        🕒 timestamp
        Loại: ZonedDateTime
        Mô tả: Thời gian xử lý yêu cầu.
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu.
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi.
        """
    )
    @PutMapping("/{id}/restore")
    public ResponseEntity<RestResponse<Void>> restoreUser(@PathVariable Long id) {
        // TODO: Implement restore user logic
        RestResponse<Void> response = RestResponse.<Void>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.OK.value())
                .shortMessage("Success")
                .description("Tài khoản đã được khôi phục thành công.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(
        summary = "Làm mới token", 
        description = """
        🔹 Đầu vào
        
        🆔 id (bắt buộc, path)
        Loại: Long
        Mô tả: ID của tài khoản cần làm mới token.
        
        🔑 refreshToken (bắt buộc, header)
        Loại: string
        Mô tả: Refresh token để tạo token mới.
        
        🔹 Đầu ra
        
        📝 data
        Loại: AuthResponse
        Mô tả: Thông tin xác thực và token mới.
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1).
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK).
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả.
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý.
        
        🕒 timestamp
        Loại: ZonedDateTime
        Mô tả: Thời gian xử lý yêu cầu.
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu.
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi.
        """
    )
    @PostMapping("/{id}/refresh")
    public ResponseEntity<RestResponse<AuthResponse>> refreshToken(@PathVariable Long id, @RequestHeader("Authorization") String refreshToken) {
        String token = refreshToken.replace("Bearer ", "");
        // For simplicity, re-issue access token from refresh subject
        var claims = authService.parseRefreshClaims(token);
        var username = claims.getSubject();
        var userOpt = authService.findByUsername(username);
        AuthResponse body;
        if (userOpt.isPresent()) {
            var user = userOpt.get();
            var userInfo = new AuthResponse.UserInfo(user.getUserId(), user.getUsername(), user.getEmail(), user.getRole().name());
            var access = authService.generateAccessFor(user);
            var newRefresh = authService.generateRefreshFor(user);
            body = new AuthResponse(true, "Token refreshed", access, userInfo, newRefresh);
        } else {
            body = new AuthResponse(false, "Invalid refresh token", null, null, null);
        }
        RestResponse<AuthResponse> response = RestResponse.<AuthResponse>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.OK.value())
                .shortMessage("Success")
                .description("Token đã được làm mới thành công.")
                .data(body)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(
        summary = "Đăng xuất", 
        description = """
        🔹 Đầu vào
        
        🆔 id (bắt buộc, path)
        Loại: Long
        Mô tả: ID của tài khoản cần đăng xuất.
        
        🔑 token (bắt buộc, header)
        Loại: string
        Mô tả: Token hiện tại cần vô hiệu hóa.
        
        🔹 Đầu ra
        
        📝 data
        Loại: null
        Mô tả: Không có dữ liệu trả về.
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1).
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK).
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả.
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý.
        
        🕒 timestamp
        Loại: ZonedDateTime
        Mô tả: Thời gian xử lý yêu cầu.
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu.
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi.
        """
    )
    @PostMapping("/{id}/logout")
    public ResponseEntity<RestResponse<Void>> logout(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        // Blacklist current access token until its expiry
        String raw = token.replace("Bearer ", "");
        try {
            var claims = authService.parseRefreshClaims(raw);
            var expiry = claims.getExpiration().toInstant();
            authService.blacklist(raw, expiry);
        } catch (Exception ignored) {}
        RestResponse<Void> response = RestResponse.<Void>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.OK.value())
                .shortMessage("Success")
                .description("Đăng xuất thành công.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(
        summary = "Thu hồi tất cả token của người dùng",
        description = "Tăng tokenVersion để vô hiệu hóa tất cả token hiện tại của user"
    )
    @PostMapping("/{id}/revoke")
    public ResponseEntity<RestResponse<Void>> revokeAll(@PathVariable Long id) {
        var userOpt = authService.findById(id);
        if (userOpt.isPresent()) {
            var user = userOpt.get();
            user.setTokenVersion(user.getTokenVersion() + 1);
            authService.save(user);
        }
        RestResponse<Void> response = RestResponse.<Void>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.OK.value())
                .shortMessage("Success")
                .description("Đã thu hồi tất cả token của người dùng.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(
        summary = "Xác thực token", 
        description = """
        🔹 Đầu vào
        
        🆔 id (bắt buộc, path)
        Loại: Long
        Mô tả: ID của tài khoản cần xác thực token.
        
        🔑 token (bắt buộc, header)
        Loại: string
        Mô tả: Token cần kiểm tra tính hợp lệ.
        
        🔹 Đầu ra
        
        📝 data
        Loại: null
        Mô tả: Không có dữ liệu trả về.
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1).
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK).
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả.
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý.
        
        🕒 timestamp
        Loại: ZonedDateTime
        Mô tả: Thời gian xử lý yêu cầu.
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu.
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi.
        """
    )
    @GetMapping("/{id}/validate")
    public ResponseEntity<RestResponse<Object>> validateToken(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        // TODO: Implement token validation logic
        RestResponse<Object> response = RestResponse.<Object>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.OK.value())
                .shortMessage("Success")
                .description("Token hợp lệ.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(
        summary = "Kiểm tra trạng thái dịch vụ", 
        description = """
        🔹 Đầu vào
        
        Không có tham số đầu vào.
        
        🔹 Đầu ra
        
        📝 data
        Loại: string
        Mô tả: Thông báo trạng thái dịch vụ.
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1).
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK).
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả.
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý.
        
        🕒 timestamp
        Loại: ZonedDateTime
        Mô tả: Thời gian xử lý yêu cầu.
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu.
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi.
        """
    )
    @GetMapping("/health")
    public ResponseEntity<RestResponse<String>> health() {
        RestResponse<String> response = RestResponse.<String>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.OK.value())
                .shortMessage("Success")
                .description("Dịch vụ xác thực đang hoạt động bình thường.")
                .data("Auth Service is running!")
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
