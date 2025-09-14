package com.devgo2003.docgo.auth_service.controller;

import com.devgo2003.docgo.auth_service.entity.SessionMongo;
import com.devgo2003.docgo.auth_service.entity.SessionStatus;
import com.devgo2003.docgo.auth_service.service.SessionService;
import com.devgo2003.docgo.auth_service.common.response.RestResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/authentication-identity-service/sessions")
@RequiredArgsConstructor
@Tag(name = "Session Management", description = "API quản lý phiên đăng nhập")
public class SessionController {
    
    private final SessionService sessionService;
    
    @GetMapping
    @Operation(summary = "Lấy danh sách phiên đăng nhập", description = "Lấy danh sách phiên đăng nhập với phân trang và sắp xếp")
    public ResponseEntity<RestResponse<Page<SessionMongo>>> getAllSessions(
            @Parameter(description = "Số trang (mặc định: 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang (mặc định: 10)") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Trường sắp xếp (mặc định: createdAt)") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Hướng sắp xếp (mặc định: DESC)") @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        log.info("Getting all sessions - page: {}, size: {}, sortBy: {}, sortDirection: {}", page, size, sortBy, sortDirection);
        
        Page<SessionMongo> sessions = sessionService.getAllSessions(page, size, sortBy, sortDirection);
        
        return ResponseEntity.ok(RestResponse.<Page<SessionMongo>>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách phiên đăng nhập thành công")
                .data(sessions)
                .build());
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin phiên đăng nhập", description = "Lấy thông tin chi tiết phiên đăng nhập theo ID")
    public ResponseEntity<RestResponse<SessionMongo>> getSessionById(
            @Parameter(description = "ID phiên đăng nhập") @PathVariable String id) {
        
        log.info("Getting session by id: {}", id);
        
        return sessionService.getSessionById(id)
                .map(session -> ResponseEntity.ok(RestResponse.<SessionMongo>builder()
                        .statusCode(200)
                        .shortMessage("Success")
                        .description("Đã lấy thông tin phiên đăng nhập thành công")
                        .data(session)
                        .build()))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/token/{sessionToken}")
    @Operation(summary = "Lấy phiên đăng nhập theo token", description = "Lấy thông tin phiên đăng nhập theo session token")
    public ResponseEntity<RestResponse<SessionMongo>> getSessionByToken(
            @Parameter(description = "Session token") @PathVariable String sessionToken) {
        
        log.info("Getting session by token: {}", sessionToken);
        
        return sessionService.getSessionByToken(sessionToken)
                .map(session -> ResponseEntity.ok(RestResponse.<SessionMongo>builder()
                        .statusCode(200)
                        .shortMessage("Success")
                        .description("Đã lấy thông tin phiên đăng nhập thành công")
                        .data(session)
                        .build()))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Lấy phiên đăng nhập của người dùng", description = "Lấy danh sách phiên đăng nhập của người dùng")
    public ResponseEntity<RestResponse<List<SessionMongo>>> getUserSessions(
            @Parameter(description = "ID người dùng") @PathVariable String userId) {
        
        log.info("Getting sessions for user: {}", userId);
        
        List<SessionMongo> sessions = sessionService.getUserSessions(userId);
        
        return ResponseEntity.ok(RestResponse.<List<SessionMongo>>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách phiên đăng nhập của người dùng thành công")
                .data(sessions)
                .build());
    }
    
    @GetMapping("/user/{userId}/active")
    @Operation(summary = "Lấy phiên đăng nhập hoạt động của người dùng", description = "Lấy danh sách phiên đăng nhập đang hoạt động của người dùng")
    public ResponseEntity<RestResponse<List<SessionMongo>>> getActiveUserSessions(
            @Parameter(description = "ID người dùng") @PathVariable String userId) {
        
        log.info("Getting active sessions for user: {}", userId);
        
        List<SessionMongo> sessions = sessionService.getActiveUserSessions(userId);
        
        return ResponseEntity.ok(RestResponse.<List<SessionMongo>>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách phiên đăng nhập hoạt động của người dùng thành công")
                .data(sessions)
                .build());
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Lấy phiên đăng nhập theo trạng thái", description = "Lấy danh sách phiên đăng nhập theo trạng thái")
    public ResponseEntity<RestResponse<List<SessionMongo>>> getSessionsByStatus(
            @Parameter(description = "Trạng thái phiên đăng nhập") @PathVariable SessionStatus status) {
        
        log.info("Getting sessions by status: {}", status);
        
        List<SessionMongo> sessions = sessionService.getSessionsByStatus(status);
        
        return ResponseEntity.ok(RestResponse.<List<SessionMongo>>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách phiên đăng nhập theo trạng thái thành công")
                .data(sessions)
                .build());
    }
    
    @GetMapping("/ip/{ipAddress}")
    @Operation(summary = "Lấy phiên đăng nhập theo IP", description = "Lấy danh sách phiên đăng nhập theo địa chỉ IP")
    public ResponseEntity<RestResponse<List<SessionMongo>>> getSessionsByIp(
            @Parameter(description = "Địa chỉ IP") @PathVariable String ipAddress) {
        
        log.info("Getting sessions by IP: {}", ipAddress);
        
        List<SessionMongo> sessions = sessionService.getSessionsByIpAddress(ipAddress);
        
        return ResponseEntity.ok(RestResponse.<List<SessionMongo>>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách phiên đăng nhập theo IP thành công")
                .data(sessions)
                .build());
    }
    
    @GetMapping("/device")
    @Operation(summary = "Lấy phiên đăng nhập theo thiết bị", description = "Lấy danh sách phiên đăng nhập theo thông tin thiết bị")
    public ResponseEntity<RestResponse<List<SessionMongo>>> getSessionsByDevice(
            @Parameter(description = "Thông tin thiết bị") @RequestParam String deviceInfo) {
        
        log.info("Getting sessions by device: {}", deviceInfo);
        
        List<SessionMongo> sessions = sessionService.getSessionsByDevice(deviceInfo);
        
        return ResponseEntity.ok(RestResponse.<List<SessionMongo>>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách phiên đăng nhập theo thiết bị thành công")
                .data(sessions)
                .build());
    }
    
    @PostMapping
    @Operation(summary = "Tạo phiên đăng nhập mới", description = "Tạo phiên đăng nhập mới cho người dùng")
    public ResponseEntity<RestResponse<SessionMongo>> createSession(
            @Parameter(description = "ID người dùng") @RequestParam String userId,
            @Parameter(description = "Thông tin thiết bị") @RequestParam String deviceInfo,
            @Parameter(description = "Địa chỉ IP") @RequestParam String ipAddress,
            @Parameter(description = "User Agent") @RequestParam String userAgent) {
        
        log.info("Creating new session for user: {}", userId);
        
        SessionMongo session = sessionService.createSession(userId, deviceInfo, ipAddress, userAgent);
        
        return ResponseEntity.ok(RestResponse.<SessionMongo>builder()
                .statusCode(201)
                .shortMessage("Created")
                .description("Đã tạo phiên đăng nhập thành công")
                .data(session)
                .build());
    }
    
    @PutMapping("/{id}/activity")
    @Operation(summary = "Cập nhật hoạt động phiên đăng nhập", description = "Cập nhật thời gian hoạt động cuối của phiên đăng nhập")
    public ResponseEntity<RestResponse<SessionMongo>> updateSessionActivity(
            @Parameter(description = "ID phiên đăng nhập") @PathVariable String id) {
        
        log.info("Updating session activity: {}", id);
        
        SessionMongo updatedSession = sessionService.updateSessionActivity(id);
        
        return ResponseEntity.ok(RestResponse.<SessionMongo>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã cập nhật hoạt động phiên đăng nhập thành công")
                .data(updatedSession)
                .build());
    }
    
    @PutMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái phiên đăng nhập", description = "Cập nhật trạng thái phiên đăng nhập")
    public ResponseEntity<RestResponse<SessionMongo>> updateSessionStatus(
            @Parameter(description = "ID phiên đăng nhập") @PathVariable String id,
            @Parameter(description = "Trạng thái mới") @RequestParam SessionStatus status) {
        
        log.info("Updating session status: {} to {}", id, status);
        
        SessionMongo updatedSession = sessionService.updateSessionStatus(id, status);
        
        return ResponseEntity.ok(RestResponse.<SessionMongo>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã cập nhật trạng thái phiên đăng nhập thành công")
                .data(updatedSession)
                .build());
    }
    
    @PutMapping("/{id}/extend")
    @Operation(summary = "Gia hạn phiên đăng nhập", description = "Gia hạn thời gian hết hạn của phiên đăng nhập")
    public ResponseEntity<RestResponse<SessionMongo>> extendSession(
            @Parameter(description = "ID phiên đăng nhập") @PathVariable String id,
            @Parameter(description = "Số giờ gia hạn") @RequestParam int hours) {
        
        log.info("Extending session: {} by {} hours", id, hours);
        
        SessionMongo updatedSession = sessionService.extendSession(id, hours);
        
        return ResponseEntity.ok(RestResponse.<SessionMongo>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã gia hạn phiên đăng nhập thành công")
                .data(updatedSession)
                .build());
    }
    
    @PutMapping("/{id}/terminate")
    @Operation(summary = "Kết thúc phiên đăng nhập", description = "Kết thúc phiên đăng nhập")
    public ResponseEntity<RestResponse<Void>> terminateSession(
            @Parameter(description = "ID phiên đăng nhập") @PathVariable String id) {
        
        log.info("Terminating session: {}", id);
        
        sessionService.terminateSession(id);
        
        return ResponseEntity.ok(RestResponse.<Void>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã kết thúc phiên đăng nhập thành công")
                .data(null)
                .build());
    }
    
    @PutMapping("/user/{userId}/terminate-all")
    @Operation(summary = "Kết thúc tất cả phiên đăng nhập của người dùng", description = "Kết thúc tất cả phiên đăng nhập của người dùng")
    public ResponseEntity<RestResponse<Void>> terminateUserSessions(
            @Parameter(description = "ID người dùng") @PathVariable String userId) {
        
        log.info("Terminating all sessions for user: {}", userId);
        
        sessionService.terminateUserSessions(userId);
        
        return ResponseEntity.ok(RestResponse.<Void>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã kết thúc tất cả phiên đăng nhập của người dùng thành công")
                .data(null)
                .build());
    }
    
    @PutMapping("/ip/{ipAddress}/terminate")
    @Operation(summary = "Kết thúc phiên đăng nhập theo IP", description = "Kết thúc tất cả phiên đăng nhập từ địa chỉ IP")
    public ResponseEntity<RestResponse<Void>> terminateSessionsByIp(
            @Parameter(description = "Địa chỉ IP") @PathVariable String ipAddress) {
        
        log.info("Terminating sessions by IP: {}", ipAddress);
        
        sessionService.terminateSessionsByIp(ipAddress);
        
        return ResponseEntity.ok(RestResponse.<Void>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã kết thúc phiên đăng nhập theo IP thành công")
                .data(null)
                .build());
    }
    
    @GetMapping("/validate/{sessionToken}")
    @Operation(summary = "Kiểm tra tính hợp lệ phiên đăng nhập", description = "Kiểm tra phiên đăng nhập có hợp lệ không")
    public ResponseEntity<RestResponse<Boolean>> validateSession(
            @Parameter(description = "Session token") @PathVariable String sessionToken) {
        
        log.info("Validating session: {}", sessionToken);
        
        boolean isValid = sessionService.isSessionValid(sessionToken);
        
        return ResponseEntity.ok(RestResponse.<Boolean>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã kiểm tra tính hợp lệ phiên đăng nhập thành công")
                .data(isValid)
                .build());
    }
    
    @GetMapping("/refresh-validate/{refreshToken}")
    @Operation(summary = "Kiểm tra tính hợp lệ refresh token", description = "Kiểm tra refresh token có hợp lệ không")
    public ResponseEntity<RestResponse<Boolean>> validateRefreshToken(
            @Parameter(description = "Refresh token") @PathVariable String refreshToken) {
        
        log.info("Validating refresh token: {}", refreshToken);
        
        boolean isValid = sessionService.isRefreshTokenValid(refreshToken);
        
        return ResponseEntity.ok(RestResponse.<Boolean>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã kiểm tra tính hợp lệ refresh token thành công")
                .data(isValid)
                .build());
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa phiên đăng nhập", description = "Xóa phiên đăng nhập khỏi hệ thống")
    public ResponseEntity<RestResponse<Void>> deleteSession(
            @Parameter(description = "ID phiên đăng nhập") @PathVariable String id) {
        
        log.info("Deleting session: {}", id);
        
        sessionService.deleteSession(id);
        
        return ResponseEntity.ok(RestResponse.<Void>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã xóa phiên đăng nhập thành công")
                .data(null)
                .build());
    }
    
    @PostMapping("/cleanup/expired")
    @Operation(summary = "Dọn dẹp phiên đăng nhập hết hạn", description = "Dọn dẹp các phiên đăng nhập đã hết hạn")
    public ResponseEntity<RestResponse<Void>> cleanupExpiredSessions() {
        
        log.info("Cleaning up expired sessions");
        
        sessionService.cleanupExpiredSessions();
        
        return ResponseEntity.ok(RestResponse.<Void>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã dọn dẹp phiên đăng nhập hết hạn thành công")
                .data(null)
                .build());
    }
    
    @PostMapping("/cleanup/inactive")
    @Operation(summary = "Dọn dẹp phiên đăng nhập không hoạt động", description = "Dọn dẹp các phiên đăng nhập không hoạt động")
    public ResponseEntity<RestResponse<Void>> cleanupInactiveSessions(
            @Parameter(description = "Số giờ không hoạt động") @RequestParam int hours) {
        
        log.info("Cleaning up inactive sessions older than {} hours", hours);
        
        sessionService.cleanupInactiveSessions(hours);
        
        return ResponseEntity.ok(RestResponse.<Void>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã dọn dẹp phiên đăng nhập không hoạt động thành công")
                .data(null)
                .build());
    }
}
