package com.devgo2003.docgo.repository_service.controller;

import com.devgo2003.docgo.repository_service.common.response.RestResponse;
import com.devgo2003.docgo.repository_service.dto.request.CommentRequest;
import com.devgo2003.docgo.repository_service.dto.response.CommentResponse;
import com.devgo2003.docgo.repository_service.dto.response.CommentListResponse;
import com.devgo2003.docgo.repository_service.service.core.IFileCommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/repository-management-service/files/{fileId}/comments")
@Tag(name = "Repository Management - Comments", description = "API quản lý bình luận cho tệp")
public class RepositoryCommentController {

    private final IFileCommentService commentService;

    @Autowired
    public RepositoryCommentController(IFileCommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách bình luận cho tệp")
    public ResponseEntity<RestResponse<List<CommentResponse>>> getFileComments(
            @Parameter(description = "ID của file", required = true)
            @PathVariable String fileId,
            @Parameter(description = "Số trang (bắt đầu từ 0)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang")
            @RequestParam(defaultValue = "20") int size) {
        
        String requestId = UUID.randomUUID().toString();
        
        try {
            if (page < 0 || size <= 0) {
                List<CommentResponse> comments = commentService.getCommentsByFileId(fileId);
                return ResponseEntity.ok(RestResponse.<List<CommentResponse>>builder()
                        .apiVersion("v1")
                        .statusCode(200)
                        .shortMessage("Success")
                        .description("Lấy danh sách bình luận thành công")
                        .data(comments)
                        .timestamp(Instant.now())
                        .requestId(requestId)
                        .path("/api/v1/repository-management-service/files/" + fileId + "/comments")
                        .build());
            }

            Pageable pageable = PageRequest.of(page, size);
            CommentListResponse commentList = commentService.getCommentsByFileIdPaginated(fileId, pageable);
            
            return ResponseEntity.ok(RestResponse.<List<CommentResponse>>builder()
                    .apiVersion("v1")
                    .statusCode(200)
                    .shortMessage("Success")
                    .description("Lấy danh sách bình luận thành công (phân trang)")
                    .data(commentList.getComments())
                    .timestamp(Instant.now())
                    .requestId(requestId)
                    .path("/api/v1/repository-management-service/files/" + fileId + "/comments")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(RestResponse.<List<CommentResponse>>builder()
                            .apiVersion("v1")
                            .statusCode(500)
                            .shortMessage("Internal Server Error")
                            .description("Lỗi khi lấy danh sách bình luận: " + e.getMessage())
                            .data(null)
                            .timestamp(Instant.now())
                            .requestId(requestId)
                            .path("/api/v1/repository-management-service/files/" + fileId + "/comments")
                            .build());
        }
    }

    @PostMapping
    @Operation(summary = "Thêm bình luận cho tệp")
    public ResponseEntity<RestResponse<CommentResponse>> addComment(
            @Parameter(description = "ID của file", required = true)
            @PathVariable String fileId,
            @Parameter(description = "Nội dung bình luận", required = true)
            @Valid @RequestBody CommentRequest request,
            @Parameter(description = "ID người dùng (từ token)")
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        
        String requestId = UUID.randomUUID().toString();
        
        try {
            // Sử dụng userId từ header hoặc từ request
            String actorId = userId != null ? userId : request.getAuthorId();
            
            CommentResponse comment = commentService.addComment(fileId, request, actorId);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(RestResponse.<CommentResponse>builder()
                            .apiVersion("v1")
                            .statusCode(201)
                            .shortMessage("Created")
                            .description("Thêm bình luận thành công")
                            .data(comment)
                            .timestamp(Instant.now())
                            .requestId(requestId)
                            .path("/api/v1/repository-management-service/files/" + fileId + "/comments")
                            .build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(RestResponse.<CommentResponse>builder()
                            .apiVersion("v1")
                            .statusCode(400)
                            .shortMessage("Bad Request")
                            .description("Lỗi khi thêm bình luận: " + e.getMessage())
                            .data(null)
                            .timestamp(Instant.now())
                            .requestId(requestId)
                            .path("/api/v1/repository-management-service/files/" + fileId + "/comments")
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(RestResponse.<CommentResponse>builder()
                            .apiVersion("v1")
                            .statusCode(500)
                            .shortMessage("Internal Server Error")
                            .description("Lỗi hệ thống: " + e.getMessage())
                            .data(null)
                            .timestamp(Instant.now())
                            .requestId(requestId)
                            .path("/api/v1/repository-management-service/files/" + fileId + "/comments")
                            .build());
        }
    }

    @GetMapping("/{commentId}")
    @Operation(summary = "Lấy thông tin chi tiết một bình luận")
    public ResponseEntity<RestResponse<CommentResponse>> getComment(
            @Parameter(description = "ID của file", required = true)
            @PathVariable String fileId,
            @Parameter(description = "ID của comment", required = true)
            @PathVariable String commentId) {
        
        String requestId = UUID.randomUUID().toString();
        
        try {
            CommentResponse comment = commentService.getCommentById(commentId)
                    .orElseThrow(() -> new RuntimeException("Comment not found: " + commentId));
            
            return ResponseEntity.ok(RestResponse.<CommentResponse>builder()
                    .apiVersion("v1")
                    .statusCode(200)
                    .shortMessage("Success")
                    .description("Lấy thông tin bình luận thành công")
                    .data(comment)
                    .timestamp(Instant.now())
                    .requestId(requestId)
                    .path("/api/v1/repository-management-service/files/" + fileId + "/comments/" + commentId)
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(RestResponse.<CommentResponse>builder()
                            .apiVersion("v1")
                            .statusCode(404)
                            .shortMessage("Not Found")
                            .description(e.getMessage())
                            .data(null)
                            .timestamp(Instant.now())
                            .requestId(requestId)
                            .path("/api/v1/repository-management-service/files/" + fileId + "/comments/" + commentId)
                            .build());
        }
    }

    @PutMapping("/{commentId}")
    @Operation(summary = "Cập nhật bình luận")
    public ResponseEntity<RestResponse<CommentResponse>> updateComment(
            @Parameter(description = "ID của file", required = true)
            @PathVariable String fileId,
            @Parameter(description = "ID của comment", required = true)
            @PathVariable String commentId,
            @Parameter(description = "Nội dung bình luận mới", required = true)
            @Valid @RequestBody CommentRequest request,
            @Parameter(description = "ID người dùng (từ token)")
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        
        String requestId = UUID.randomUUID().toString();
        
        try {
            String actorId = userId != null ? userId : request.getAuthorId();
            
            CommentResponse comment = commentService.updateComment(commentId, request, actorId);
            
            return ResponseEntity.ok(RestResponse.<CommentResponse>builder()
                    .apiVersion("v1")
                    .statusCode(200)
                    .shortMessage("Success")
                    .description("Cập nhật bình luận thành công")
                    .data(comment)
                    .timestamp(Instant.now())
                    .requestId(requestId)
                    .path("/api/v1/repository-management-service/files/" + fileId + "/comments/" + commentId)
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(RestResponse.<CommentResponse>builder()
                            .apiVersion("v1")
                            .statusCode(400)
                            .shortMessage("Bad Request")
                            .description("Lỗi khi cập nhật bình luận: " + e.getMessage())
                            .data(null)
                            .timestamp(Instant.now())
                            .requestId(requestId)
                            .path("/api/v1/repository-management-service/files/" + fileId + "/comments/" + commentId)
                            .build());
        }
    }

    @DeleteMapping("/{commentId}")
    @Operation(summary = "Xóa bình luận (soft delete)")
    public ResponseEntity<RestResponse<String>> deleteComment(
            @Parameter(description = "ID của file", required = true)
            @PathVariable String fileId,
            @Parameter(description = "ID của comment", required = true)
            @PathVariable String commentId,
            @Parameter(description = "ID người dùng (từ token)")
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        
        String requestId = UUID.randomUUID().toString();
        
        try {
            String actorId = userId != null ? userId : "system";
            
            commentService.deleteComment(commentId, actorId);
            
            return ResponseEntity.ok(RestResponse.<String>builder()
                    .apiVersion("v1")
                    .statusCode(200)
                    .shortMessage("Success")
                    .description("Xóa bình luận thành công")
                    .data("Comment deleted: " + commentId)
                    .timestamp(Instant.now())
                    .requestId(requestId)
                    .path("/api/v1/repository-management-service/files/" + fileId + "/comments/" + commentId)
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(RestResponse.<String>builder()
                            .apiVersion("v1")
                            .statusCode(400)
                            .shortMessage("Bad Request")
                            .description("Lỗi khi xóa bình luận: " + e.getMessage())
                            .data(null)
                            .timestamp(Instant.now())
                            .requestId(requestId)
                            .path("/api/v1/repository-management-service/files/" + fileId + "/comments/" + commentId)
                            .build());
        }
    }

    @GetMapping("/count")
    @Operation(summary = "Đếm số lượng bình luận của file")
    public ResponseEntity<RestResponse<Long>> countComments(
            @Parameter(description = "ID của file", required = true)
            @PathVariable String fileId) {
        
        String requestId = UUID.randomUUID().toString();
        
        try {
            Long count = commentService.countCommentsByFileId(fileId);
            
            return ResponseEntity.ok(RestResponse.<Long>builder()
                    .apiVersion("v1")
                    .statusCode(200)
                    .shortMessage("Success")
                    .description("Đếm số lượng bình luận thành công")
                    .data(count)
                    .timestamp(Instant.now())
                    .requestId(requestId)
                    .path("/api/v1/repository-management-service/files/" + fileId + "/comments/count")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(RestResponse.<Long>builder()
                            .apiVersion("v1")
                            .statusCode(500)
                            .shortMessage("Internal Server Error")
                            .description("Lỗi khi đếm bình luận: " + e.getMessage())
                            .data(null)
                            .timestamp(Instant.now())
                            .requestId(requestId)
                            .path("/api/v1/repository-management-service/files/" + fileId + "/comments/count")
                            .build());
        }
    }
}