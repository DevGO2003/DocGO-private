package com.devgo2003.docgo.contract_service.controller;

import com.devgo2003.docgo.contract_service.entity.Comment;
import com.devgo2003.docgo.contract_service.service.CommentService;
import com.devgo2003.docgo.contract_service.dto.CommentCreateRequest;
import com.devgo2003.docgo.contract_service.common.response.RestResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.UUID;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/contract-management-service/comments")
@Tag(name = "API Quản lý Bình luận", description = "Các API để quản lý bình luận và cộng tác trong hệ thống DocGO")
public class CommentController {

    private final CommentService commentService;
    private final HttpServletRequest request;

    public CommentController(CommentService commentService, HttpServletRequest request) {
        this.commentService = commentService;
        this.request = request;
    }

    @GetMapping
    @Operation(
        summary = "Lấy danh sách bình luận (hợp nhất)",
        description = "Hỗ trợ lọc qua query: contractId, authorId, status (RESOLVED|UNRESOLVED), visibility (PUBLIC|PRIVATE|PINNED), createdFrom, createdTo, resolvedFrom, resolvedTo, minReactionCount, minReplyCount; aggregate=count|exists. Các tham số phân trang/sắp xếp giữ nguyên: pageNumber, pageSize, sortBy, sortDirection."
    )
    public ResponseEntity<RestResponse<?>> getAllComments(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "false") boolean includeDeleted,
            @RequestParam(required = false) String contractId,
            @RequestParam(required = false) String authorId,
            @RequestParam(required = false) Comment.CommentStatus status,
            @RequestParam(required = false) Comment.CommentVisibility visibility,
            @RequestParam(required = false) Comment.CommentType type,
            @RequestParam(required = false) Comment.CommentPriority priority,
            @RequestParam(required = false) Boolean pinned,
            @RequestParam(required = false) Boolean unresolved,
            @RequestParam(required = false) String createdFrom,
            @RequestParam(required = false) String createdTo,
            @RequestParam(required = false) String resolvedFrom,
            @RequestParam(required = false) String resolvedTo,
            @RequestParam(required = false) Integer minReactionCount,
            @RequestParam(required = false) Integer minReplyCount,
            @RequestParam(required = false) String aggregate) {
        
        // Aggregate mode (count | exists)
        if (aggregate != null && !aggregate.isBlank()) {
            String agg = aggregate.toLowerCase();
            if ("count".equals(agg)) {
                long count;
                if (contractId != null && status != null) {
                    count = commentService.countCommentsByContractIdAndStatus(contractId, status);
                } else if (contractId != null && Boolean.TRUE.equals(unresolved)) {
                    count = commentService.countUnresolvedCommentsByContractId(contractId);
                } else if (contractId != null && status == Comment.CommentStatus.RESOLVED) {
                    count = commentService.countResolvedCommentsByContractId(contractId);
                } else if (contractId != null) {
                    count = commentService.countCommentsByContractId(contractId);
                } else if (authorId != null) {
                    count = commentService.countCommentsByAuthorId(authorId);
                } else {
                    // Fallback: count tất cả (không có API riêng) => dùng size danh sách
                    List<Comment> all = commentService.getAllComments();
                    count = all == null ? 0 : all.size();
                }
                RestResponse<Long> response = RestResponse.<Long>builder()
                        .apiVersion("v1")
                        .statusCode(200)
                        .shortMessage("Success")
                        .description("Đếm số bình luận thành công.")
                        .data(count)
                        .timestamp(ZonedDateTime.now())
                        .requestId(UUID.randomUUID().toString())
                        .path(request.getRequestURI())
                        .build();
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
            if ("exists".equals(agg)) {
                boolean exists = false;
                if (contractId != null && Boolean.TRUE.equals(unresolved)) {
                    exists = commentService.existsUnresolvedCommentsByContractId(contractId);
                } else if (contractId != null && Boolean.TRUE.equals(pinned)) {
                    exists = commentService.existsPinnedCommentsByContractId(contractId);
                } else if (contractId != null) {
                    exists = commentService.existsCommentsByContractId(contractId);
                }
                RestResponse<Boolean> response = RestResponse.<Boolean>builder()
                        .apiVersion("v1")
                        .statusCode(200)
                        .shortMessage("Success")
                        .description("Kiểm tra tồn tại bình luận thành công.")
                        .data(exists)
                        .timestamp(ZonedDateTime.now())
                        .requestId(UUID.randomUUID().toString())
                        .path(request.getRequestURI())
                        .build();
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
        }

        // List mode
        List<Comment> comments;
        if (authorId != null) {
            comments = commentService.getCommentsByAuthorId(authorId);
        } else if (contractId != null && Boolean.TRUE.equals(unresolved)) {
            comments = commentService.getUnresolvedCommentsByContractId(contractId);
        } else if (contractId != null && status == Comment.CommentStatus.RESOLVED) {
            comments = commentService.getResolvedCommentsByContractId(contractId);
        } else if (contractId != null && Boolean.TRUE.equals(pinned)) {
            comments = commentService.getPinnedCommentsByContractId(contractId);
        } else if (contractId != null && visibility == Comment.CommentVisibility.PUBLIC) {
            comments = commentService.getPublicCommentsByContractId(contractId);
        } else if (contractId != null && visibility == Comment.CommentVisibility.PRIVATE) {
            comments = commentService.getPrivateCommentsByContractId(contractId);
        } else if (contractId != null && type != null) {
            comments = commentService.getCommentsByCommentType(contractId, type);
        } else if (contractId != null && priority != null) {
            comments = commentService.getCommentsByPriority(contractId, priority);
        } else if (contractId != null && sortBy != null && sortBy.equalsIgnoreCase("reactionCount")) {
            comments = commentService.getCommentsByContractIdOrderByReactionCount(contractId);
        } else if (contractId != null && sortBy != null && sortBy.equalsIgnoreCase("replyCount")) {
            comments = commentService.getCommentsByContractIdOrderByReplyCount(contractId);
        } else if (contractId != null && sortBy != null && sortBy.equalsIgnoreCase("createdAt")) {
            comments = commentService.getCommentsByContractIdOrderByCreatedAt(contractId);
        } else if (createdFrom != null && createdTo != null) {
            try {
                LocalDateTime from = LocalDateTime.parse(createdFrom);
                LocalDateTime to = LocalDateTime.parse(createdTo);
                comments = commentService.getCommentsByCreatedAtBetween(from, to);
            } catch (Exception e) {
                comments = commentService.getAllComments();
            }
        } else if (resolvedFrom != null && resolvedTo != null) {
            try {
                LocalDateTime from = LocalDateTime.parse(resolvedFrom);
                LocalDateTime to = LocalDateTime.parse(resolvedTo);
                comments = commentService.getCommentsByResolvedAtBetween(from, to);
            } catch (Exception e) {
                comments = commentService.getAllComments();
            }
        } else if (minReactionCount != null) {
            comments = commentService.getCommentsWithHighReactionCount(minReactionCount);
        } else if (minReplyCount != null) {
            comments = commentService.getCommentsWithReplies(minReplyCount);
        } else if (contractId != null) {
            comments = commentService.getCommentsByContractId(contractId);
        } else {
            comments = commentService.getAllComments();
        }
        
        if (comments == null || comments.isEmpty()) {
            RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có bình luận nào.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách bình luận thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Removed duplicate getComment mapping to avoid ambiguous mapping with getCommentById

    @PostMapping
    @Operation(
        summary = "Tạo bình luận mới", 
        description = """
        "Đầu vào
        
        "" comment (bắt buộc, body)
        Loại: CommentCreateRequest
        mô tả: Thông tin bình luận cần tạo (contractId, authorId, authorName, authorEmail, content, commentType, parentCommentId)
        
        "Đầu ra
        
        "data
        Loại: Comment
        mô tả: Thông tin bình luận đã được tạo thành công
        
        "S apiVersion
        Loại: string
        mô tả: Phiên bản API (v1)
        
        "statusCode
        Loại: integer
        mô tả: mã trạng thái HTTP (201: Created)
        
        "< shortMessage
        Loại: string
        mô tả: Thông báo ngắn gọn về kết quả
        
        "- description
        Loại: string
        mô tả: mô tả chi tiết về kết quả xử lý
        
        ⏰ timestamp
        Loại: string
        mô tả: Thời điểm xử lý request (ISO-8601)
        
        "- requestId
        Loại: string
        mô tả: ID duy nhất của request
        
        "path
        Loại: string
        mô tả: Đường dẫn API được gọi
        """
    )
    public ResponseEntity<RestResponse<Comment>> createComment(@RequestBody CommentCreateRequest request) {
        Comment comment = commentService.createComment(request);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(201)
            .shortMessage("Created")
            .description("Tạo bình luận thành công.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(this.request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/contracts/{contractId}/comments")
    @Operation(summary = "Tạo comment mới", description = "Tạo comment mới cho contract")
    public ResponseEntity<RestResponse<Comment>> createComment(
            @PathVariable String contractId,
            @RequestParam String authorId,
            @RequestParam String authorName,
            @RequestParam String authorEmail,
            @RequestParam String content,
            @RequestParam Comment.CommentType commentType) {
        
        Comment comment = commentService.createComment(contractId, authorId, authorName, authorEmail, content, commentType);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(201)
            .shortMessage("Created")
            .description("Tạo comment thành công.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments")
    @Operation(summary = "Lấy danh sách comment", description = "Lấy tất cả comment của contract")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByContractId(@PathVariable String contractId) {
        List<Comment> comments = commentService.getCommentsByContractId(contractId);
        
        if (comments.isEmpty()) {
            RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có comment nào cho contract này.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy comment theo ID", description = "Lấy chi tiết comment")
    public ResponseEntity<RestResponse<Comment>> getCommentById(@PathVariable String id) {
        Optional<Comment> comment = commentService.getCommentById(id);
        
        if (comment.isEmpty()) {
            RestResponse<Comment> response = RestResponse.<Comment>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description("Không tìm thấy comment.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
                RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy comment thành công.")
            .data(comment.get())
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/unresolved")
    @Operation(summary = "Lấy comment chưa resolved", description = "Lấy danh sách comment chưa được giải quyết")
    public ResponseEntity<RestResponse<List<Comment>>> getUnresolvedComments(@PathVariable String contractId) {
        List<Comment> comments = commentService.getUnresolvedCommentsByContractId(contractId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment nào chưa resolved.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment unresolved thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/resolved")
    @Operation(summary = "Lấy comment đã resolved", description = "Lấy danh sách comment đã được giải quyết")
    public ResponseEntity<RestResponse<List<Comment>>> getResolvedComments(@PathVariable String contractId) {
        List<Comment> comments = commentService.getResolvedCommentsByContractId(contractId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment nào đã resolved.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment resolved thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/pinned")
    @Operation(summary = "Lấy comment đã pinned", description = "Lấy danh sách comment đã được ghim")
    public ResponseEntity<RestResponse<List<Comment>>> getPinnedComments(@PathVariable String contractId) {
        List<Comment> comments = commentService.getPinnedCommentsByContractId(contractId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment nào đã pinned.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment pinned thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/comments/author/{authorId}")
    @Operation(summary = "Lấy comment theo author ID", description = "Lấy danh sách comment của author")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByAuthorId(@PathVariable String authorId) {
        List<Comment> comments = commentService.getCommentsByAuthorId(authorId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment nào của author này.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment của author thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/comments/parent/{parentCommentId}")
    @Operation(summary = "Lấy comment theo parent comment ID", description = "Lấy danh sách comment con")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByParentCommentId(@PathVariable String parentCommentId) {
        List<Comment> comments = commentService.getCommentsByParentCommentId(parentCommentId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment con nào.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment con thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/type/{commentType}")
    @Operation(summary = "Lấy comment theo type", description = "Lấy danh sách comment theo loại")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByCommentType(
            @PathVariable String contractId,
            @PathVariable Comment.CommentType commentType) {
        List<Comment> comments = commentService.getCommentsByCommentType(contractId, commentType);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment nào với type này.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment theo type thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/priority/{priority}")
    @Operation(summary = "Lấy comment theo priority", description = "Lấy danh sách comment theo mức độ ưu tiên")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByPriority(
            @PathVariable String contractId,
            @PathVariable Comment.CommentPriority priority) {
        List<Comment> comments = commentService.getCommentsByPriority(contractId, priority);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment nào với priority này.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment theo priority thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/public")
    @Operation(summary = "Lấy comment public", description = "Lấy danh sách comment public")
    public ResponseEntity<RestResponse<List<Comment>>> getPublicComments(@PathVariable String contractId) {
        List<Comment> comments = commentService.getPublicCommentsByContractId(contractId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment public nào.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment public thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/private")
    @Operation(summary = "Lấy comment private", description = "Lấy danh sách comment private")
    public ResponseEntity<RestResponse<List<Comment>>> getPrivateComments(@PathVariable String contractId) {
        List<Comment> comments = commentService.getPrivateCommentsByContractId(contractId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment private nào.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment private thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/visibility/{visibility}")
    @Operation(summary = "Lấy comment theo visibility", description = "Lấy danh sách comment theo visibility")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByVisibility(
            @PathVariable String contractId,
            @PathVariable Comment.CommentVisibility visibility) {
        List<Comment> comments = commentService.getCommentsByVisibility(contractId, visibility);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment nào với visibility này.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment theo visibility thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/mentioned/{userId}")
    @Operation(summary = "Lấy comment đã mention user", description = "Lấy danh sách comment đã mention user")
    public ResponseEntity<RestResponse<List<Comment>>> getMentionedComments(
            @PathVariable String contractId,
            @PathVariable String userId) {
        List<Comment> comments = commentService.getMentionedCommentsByContractId(contractId, userId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment nào mention user này.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment đã mention user thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/section/{sectionReference}")
    @Operation(summary = "Lấy comment theo section", description = "Lấy danh sách comment theo section reference")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsBySectionReference(
            @PathVariable String contractId,
            @PathVariable String sectionReference) {
        List<Comment> comments = commentService.getCommentsBySectionReference(contractId, sectionReference);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment nào cho section này.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment theo section thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/line/{lineNumber}")
    @Operation(summary = "Lấy comment theo line number", description = "Lấy danh sách comment theo line number")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByLineNumber(
            @PathVariable String contractId,
            @PathVariable Integer lineNumber) {
        List<Comment> comments = commentService.getCommentsByLineNumber(contractId, lineNumber);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment nào cho line này.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment theo line number thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/order-by-created")
    @Operation(summary = "Lấy comment sắp xếp theo thời gian tạo", description = "Lấy danh sách comment sắp xếp theo thời gian tạo")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsOrderByCreatedAt(@PathVariable String contractId) {
        List<Comment> comments = commentService.getCommentsByContractIdOrderByCreatedAt(contractId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment nào.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment sắp xếp theo thời gian tạo thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/order-by-reaction")
    @Operation(summary = "Lấy comment sắp xếp theo reaction count", description = "Lấy danh sách comment sắp xếp theo reaction count")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsOrderByReactionCount(@PathVariable String contractId) {
        List<Comment> comments = commentService.getCommentsByContractIdOrderByReactionCount(contractId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment nào.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment sắp xếp theo reaction count thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/order-by-reply")
    @Operation(summary = "Lấy comment sắp xếp theo reply count", description = "Lấy danh sách comment sắp xếp theo reply count")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsOrderByReplyCount(@PathVariable String contractId) {
        List<Comment> comments = commentService.getCommentsByContractIdOrderByReplyCount(contractId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment nào.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment sắp xếp theo reply count thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/created-between")
    @Operation(summary = "Lấy comment theo thời gian tạo", description = "Lấy danh sách comment trong khoảng thời gian tạo")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByCreatedAtBetween(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<Comment> comments = commentService.getCommentsByCreatedAtBetween(startDate, endDate);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment nào trong khoảng thời gian này.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment theo thời gian tạo thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/resolved-between")
    @Operation(summary = "Lấy comment theo thời gian resolved", description = "Lấy danh sách comment trong khoảng thời gian resolved")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByResolvedAtBetween(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<Comment> comments = commentService.getCommentsByResolvedAtBetween(startDate, endDate);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment nào trong khoảng thời gian resolved này.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment theo thời gian resolved thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/high-reaction")
    @Operation(summary = "Lấy comment có reaction cao", description = "Lấy danh sách comment có reaction count cao")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsWithHighReactionCount(
            @PathVariable String contractId,
            @RequestParam Integer reactionCount) {
        List<Comment> comments = commentService.getCommentsWithHighReactionCount(reactionCount);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment nào có reaction count cao.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment có reaction count cao thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/with-replies")
    @Operation(summary = "Lấy comment có replies", description = "Lấy danh sách comment có replies")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsWithReplies(
            @PathVariable String contractId,
            @RequestParam Integer replyCount) {
        List<Comment> comments = commentService.getCommentsWithReplies(replyCount);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có comment nào có replies.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách comment có replies thành công.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}/resolve")
    @Operation(summary = "Resolve comment", description = "Đánh dấu comment đã được giải quyết")
    public ResponseEntity<RestResponse<Comment>> resolveComment(
            @PathVariable String id,
            @RequestParam String resolvedBy,
            @RequestParam String resolutionNote) {
        Comment comment = commentService.resolveComment(id, resolvedBy, resolutionNote);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Resolve comment thành công.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}/unresolve")
    @Operation(summary = "Unresolve comment", description = "Bỏ đánh dấu comment đã được giải quyết")
    public ResponseEntity<RestResponse<Comment>> unresolveComment(@PathVariable String id) {
        Comment comment = commentService.unresolveComment(id);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Unresolve comment thành công.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}/pin")
    @Operation(summary = "Pin comment", description = "Ghim comment")
    public ResponseEntity<RestResponse<Comment>> pinComment(
            @PathVariable String id,
            @RequestParam String pinnedBy) {
        Comment comment = commentService.pinComment(id, pinnedBy);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Pin comment thành công.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}/unpin")
    @Operation(summary = "Unpin comment", description = "Bỏ ghim comment")
    public ResponseEntity<RestResponse<Comment>> unpinComment(@PathVariable String id) {
        Comment comment = commentService.unpinComment(id);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Unpin comment thành công.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}/increment-reaction")
    @Operation(summary = "Tăng reaction count", description = "Tăng số lượng reaction")
    public ResponseEntity<RestResponse<Comment>> incrementReactionCount(@PathVariable String id) {
        Comment comment = commentService.incrementReactionCount(id);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Tăng reaction count thành công.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}/decrement-reaction")
    @Operation(summary = "Giảm reaction count", description = "Giảm số lượng reaction")
    public ResponseEntity<RestResponse<Comment>> decrementReactionCount(@PathVariable String id) {
        Comment comment = commentService.decrementReactionCount(id);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Giảm reaction count thành công.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}/increment-reply")
    @Operation(summary = "Tăng reply count", description = "Tăng số lượng reply")
    public ResponseEntity<RestResponse<Comment>> incrementReplyCount(@PathVariable String id) {
        Comment comment = commentService.incrementReplyCount(id);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Tăng reply count thành công.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}/decrement-reply")
    @Operation(summary = "Giảm reply count", description = "Giảm số lượng reply")
    public ResponseEntity<RestResponse<Comment>> decrementReplyCount(@PathVariable String id) {
        Comment comment = commentService.decrementReplyCount(id);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Giảm reply count thành công.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}/hide")
    @Operation(summary = "Ẩn comment", description = "Ẩn comment")
    public ResponseEntity<RestResponse<Comment>> hideComment(@PathVariable String id) {
        Comment comment = commentService.hideComment(id);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Ẩn comment thành công.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}/show")
    @Operation(summary = "Hiện comment", description = "Hiện comment")
    public ResponseEntity<RestResponse<Comment>> showComment(@PathVariable String id) {
        Comment comment = commentService.showComment(id);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Hiện comment thành công.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Cập nhật từng phần comment (rút gọn)", description = "Hỗ trợ: resolved/unresolved, pinned/unpinned, hide/show, + counters")
    public ResponseEntity<RestResponse<Comment>> patchComment(
            @PathVariable String id,
            @RequestBody java.util.Map<String, Object> body) {
        Comment updated = null;

        if (Boolean.TRUE.equals(body.get("resolve"))) {
            String resolvedBy = (String) body.getOrDefault("resolvedBy", "");
            String resolutionNote = (String) body.getOrDefault("resolutionNote", "");
            updated = commentService.resolveComment(id, resolvedBy, resolutionNote);
        }
        if (Boolean.TRUE.equals(body.get("unresolve"))) {
            updated = commentService.unresolveComment(id);
        }
        if (Boolean.TRUE.equals(body.get("pin"))) {
            String pinnedBy = (String) body.getOrDefault("pinnedBy", "");
            updated = commentService.pinComment(id, pinnedBy);
        }
        if (Boolean.TRUE.equals(body.get("unpin"))) {
            updated = commentService.unpinComment(id);
        }
        if (Boolean.TRUE.equals(body.get("hide"))) {
            updated = commentService.hideComment(id);
        }
        if (Boolean.TRUE.equals(body.get("show"))) {
            updated = commentService.showComment(id);
        }
        if (Boolean.TRUE.equals(body.get("incrementReaction"))) {
            updated = commentService.incrementReactionCount(id);
        }
        if (Boolean.TRUE.equals(body.get("decrementReaction"))) {
            updated = commentService.decrementReactionCount(id);
        }
        if (Boolean.TRUE.equals(body.get("incrementReply"))) {
            updated = commentService.incrementReplyCount(id);
        }
        if (Boolean.TRUE.equals(body.get("decrementReply"))) {
            updated = commentService.decrementReplyCount(id);
        }

        if (updated == null) {
            RestResponse<Comment> bad = RestResponse.<Comment>builder()
                .apiVersion("v1")
                .statusCode(400)
                .shortMessage("Bad Request")
                .description("Không có trường hợp lệ để cập nhật.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            return new ResponseEntity<>(bad, HttpStatus.OK);
        }

        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cập nhật comment thành công.")
            .data(updated)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/count")
    @Operation(summary = "Đếm comment (rút gọn)", description = "Thay thế các đường dẫn count-* bằng query aggregate=count")
    public ResponseEntity<RestResponse<Long>> countComments(
            @RequestParam(required = false) String contractId,
            @RequestParam(required = false) Comment.CommentStatus status,
            @RequestParam(required = false) Boolean unresolved,
            @RequestParam(required = false) String authorId) {
        long count;
        if (contractId != null && status != null) {
            count = commentService.countCommentsByContractIdAndStatus(contractId, status);
        } else if (contractId != null && Boolean.TRUE.equals(unresolved)) {
            count = commentService.countUnresolvedCommentsByContractId(contractId);
        } else if (contractId != null) {
            count = commentService.countCommentsByContractId(contractId);
        } else if (authorId != null) {
            count = commentService.countCommentsByAuthorId(authorId);
        } else {
            List<Comment> all = commentService.getAllComments();
            count = all == null ? 0 : all.size();
        }

        RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số comment thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/exists")
    @Operation(summary = "Kiểm tra tồn tại comment (rút gọn)", description = "Thay thế các đường dẫn exists-* bằng query aggregate=exists")
    public ResponseEntity<RestResponse<Boolean>> existsComments(
            @RequestParam(required = false) String contractId,
            @RequestParam(required = false) Boolean unresolved,
            @RequestParam(required = false) Boolean pinned) {
        boolean exists = false;
        if (contractId != null && Boolean.TRUE.equals(unresolved)) {
            exists = commentService.existsUnresolvedCommentsByContractId(contractId);
        } else if (contractId != null && Boolean.TRUE.equals(pinned)) {
            exists = commentService.existsPinnedCommentsByContractId(contractId);
        } else if (contractId != null) {
            exists = commentService.existsCommentsByContractId(contractId);
        }

        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra tồn tại comment thành công.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa comment", description = "Soft delete comment")
    public ResponseEntity<RestResponse<Void>> deleteComment(
            @PathVariable String id,
            @RequestParam String deletedBy) {
        commentService.deleteComment(id, deletedBy);
        
        RestResponse<Void> response = RestResponse.<Void>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Xóa comment thành công.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}/restore")
    @Operation(summary = "Khôi phục comment", description = "Khôi phục comment đã xóa")
    public ResponseEntity<RestResponse<Comment>> restoreComment(@PathVariable String id) {
        Comment comment = commentService.restoreComment(id);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Khôi phục comment thành công.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/count")
    @Operation(summary = "Đếm số comment", description = "Đếm số lượng comment")
    public ResponseEntity<RestResponse<Long>> countCommentsByContractId(@PathVariable String contractId) {
        long count = commentService.countCommentsByContractId(contractId);
        
        RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số comment thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/count-by-status")
    @Operation(summary = "Đếm số comment theo status", description = "Đếm số lượng comment theo status")
    public ResponseEntity<RestResponse<Long>> countCommentsByContractIdAndStatus(
            @PathVariable String contractId,
            @RequestParam Comment.CommentStatus status) {
        long count = commentService.countCommentsByContractIdAndStatus(contractId, status);
        
        RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số comment theo status thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/comments/author/{authorId}/count")
    @Operation(summary = "Đếm số comment của author", description = "Đếm số lượng comment của author")
    public ResponseEntity<RestResponse<Long>> countCommentsByAuthorId(@PathVariable String authorId) {
        long count = commentService.countCommentsByAuthorId(authorId);
        
        RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số comment của author thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/count-unresolved")
    @Operation(summary = "Đếm số comment unresolved", description = "Đếm số lượng comment chưa resolved")
    public ResponseEntity<RestResponse<Long>> countUnresolvedCommentsByContractId(@PathVariable String contractId) {
        long count = commentService.countUnresolvedCommentsByContractId(contractId);
        
        RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số comment unresolved thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/count-resolved")
    @Operation(summary = "Đếm số comment resolved", description = "Đếm số lượng comment đã resolved")
    public ResponseEntity<RestResponse<Long>> countResolvedCommentsByContractId(@PathVariable String contractId) {
        long count = commentService.countResolvedCommentsByContractId(contractId);
        
        RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số comment resolved thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/count-pinned")
    @Operation(summary = "Đếm số comment pinned", description = "Đếm số lượng comment đã pinned")
    public ResponseEntity<RestResponse<Long>> countPinnedCommentsByContractId(@PathVariable String contractId) {
        long count = commentService.countPinnedCommentsByContractId(contractId);
        
        RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số comment pinned thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/exists")
    @Operation(summary = "Kiểm tra có comment", description = "Kiểm tra contract có comment không")
    public ResponseEntity<RestResponse<Boolean>> existsCommentsByContractId(@PathVariable String contractId) {
        boolean exists = commentService.existsCommentsByContractId(contractId);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra có comment thành công.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/exists-unresolved")
    @Operation(summary = "Kiểm tra có comment unresolved", description = "Kiểm tra contract có comment unresolved không")
    public ResponseEntity<RestResponse<Boolean>> existsUnresolvedCommentsByContractId(@PathVariable String contractId) {
        boolean exists = commentService.existsUnresolvedCommentsByContractId(contractId);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra có comment unresolved thành công.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/exists-pinned")
    @Operation(summary = "Kiểm tra có comment pinned", description = "Kiểm tra contract có comment pinned không")
    public ResponseEntity<RestResponse<Boolean>> existsPinnedCommentsByContractId(@PathVariable String contractId) {
        boolean exists = commentService.existsPinnedCommentsByContractId(contractId);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra có comment pinned thành công.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}