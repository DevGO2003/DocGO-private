package com.devgo2003.docgo.contract_service.controller;

import com.devgo2003.docgo.contract_service.entity.Comment;
import com.devgo2003.docgo.contract_service.service.CommentService;
import com.devgo2003.docgo.contract_service.dto.CommentCreateRequest;
import com.devgo2003.docgo.contract_service.common.response.RestResponse;
import com.devgo2003.docgo.contract_service.common.util.ResponseBuilder;
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
        summary = "Lấy danh sách tất cả bình luận", 
        description = """
        🔹 Đầu vào
        
        📄 pageNumber (tùy chọn, query)
        Loại: integer
        Mô tả: Số trang (mặc định: 0)
        
        📄 pageSize (tùy chọn, query)
        Loại: integer
        Mô tả: Kích thước trang (mặc định: 10)
        
        📄 sortBy (tùy chọn, query)
        Loại: string
        Mô tả: Trường sắp xếp (mặc định: createdAt)
        
        📄 sortDirection (tùy chọn, query)
        Loại: string
        Mô tả: Hướng sắp xếp: ASC hoặc DESC (mặc định: DESC)
        
        📄 searchTerm (tùy chọn, query)
        Loại: string
        Mô tả: Từ khóa tìm kiếm
        
        📄 includeDeleted (tùy chọn, query)
        Loại: boolean
        Mô tả: Bao gồm bản ghi đã xóa (mặc định: false)
        
        🔹 Đầu ra
        
        📝 data
        Loại: List<Comment>
        Mô tả: Danh sách bình luận
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1)
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK, 204: No Content)
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý
        
        ⏰ timestamp
        Loại: string
        Mô tả: Thời điểm xử lý request (ISO-8601)
        
        🔗 requestId
        Loại: string
        Mô tả: ID duy nhất của request
        
        📍 path
        Loại: string
        Mô tả: Đường dẫn API được gọi
        """
    )
    public ResponseEntity<RestResponse<List<Comment>>> getAllComments(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "false") boolean includeDeleted) {
        
        List<Comment> comments = commentService.getAllComments();
        
        if (comments.isEmpty()) {
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

    @GetMapping("/{id}")
    @Operation(
        summary = "Lấy chi tiết bình luận", 
        description = """
        🔹 Đầu vào
        
        🔗 id (bắt buộc, path)
        Loại: string
        Mô tả: ID của bình luận cần lấy
        
        🔹 Đầu ra
        
        📝 data
        Loại: Comment
        Mô tả: Thông tin chi tiết bình luận
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1)
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK, 404: Not Found)
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý
        
        ⏰ timestamp
        Loại: string
        Mô tả: Thời điểm xử lý request (ISO-8601)
        
        🔗 requestId
        Loại: string
        Mô tả: ID duy nhất của request
        
        📍 path
        Loại: string
        Mô tả: Đường dẫn API được gọi
        """
    )
    public ResponseEntity<RestResponse<Comment>> getComment(@PathVariable String id) {
        Optional<Comment> comment = commentService.getCommentById(id);
        
        if (comment.isEmpty()) {
            RestResponse<Comment> response = RestResponse.<Comment>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description("Không tìm thấy bình luận với ID: " + id)
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
            .description("Lấy chi tiết bình luận thành công.")
            .data(comment.get())
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping
    @Operation(
        summary = "Tạo bình luận mới", 
        description = """
        🔹 Đầu vào
        
        📄 comment (bắt buộc, body)
        Loại: CommentCreateRequest
        Mô tả: Thông tin bình luận cần tạo (contractId, authorId, authorName, authorEmail, content, commentType, parentCommentId)
        
        🔹 Đầu ra
        
        📝 data
        Loại: Comment
        Mô tả: Thông tin bình luận đã được tạo thành công
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1)
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (201: Created)
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý
        
        ⏰ timestamp
        Loại: string
        Mô tả: Thời điểm xử lý request (ISO-8601)
        
        🔗 requestId
        Loại: string
        Mô tả: ID duy nhất của request
        
        📍 path
        Loại: string
        Mô tả: Đường dẫn API được gọi
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
        
        return ResponseBuilder.success(comment, "Tạo comment thành công");
    }

    @GetMapping("/contracts/{contractId}/comments")
    @Operation(summary = "Lấy danh sách comment", description = "Lấy tất cả comment của contract")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByContractId(@PathVariable String contractId) {
        List<Comment> comments = commentService.getCommentsByContractId(contractId);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment nào cho contract này");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment thành công");
    }

    @GetMapping("/comments/{id}")
    @Operation(summary = "Lấy comment theo ID", description = "Lấy chi tiết comment")
    public ResponseEntity<RestResponse<Comment>> getCommentById(@PathVariable String id) {
        Optional<Comment> comment = commentService.getCommentById(id);
        
        if (comment.isEmpty()) {
            return ResponseBuilder.notFound("Không tìm thấy comment");
        }
        
        return ResponseBuilder.success(comment.get(), "Lấy comment thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/unresolved")
    @Operation(summary = "Lấy comment chưa resolved", description = "Lấy danh sách comment chưa được giải quyết")
    public ResponseEntity<RestResponse<List<Comment>>> getUnresolvedComments(@PathVariable String contractId) {
        List<Comment> comments = commentService.getUnresolvedCommentsByContractId(contractId);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment nào chưa resolved");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment unresolved thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/resolved")
    @Operation(summary = "Lấy comment đã resolved", description = "Lấy danh sách comment đã được giải quyết")
    public ResponseEntity<RestResponse<List<Comment>>> getResolvedComments(@PathVariable String contractId) {
        List<Comment> comments = commentService.getResolvedCommentsByContractId(contractId);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment nào đã resolved");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment resolved thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/pinned")
    @Operation(summary = "Lấy comment đã pinned", description = "Lấy danh sách comment đã được ghim")
    public ResponseEntity<RestResponse<List<Comment>>> getPinnedComments(@PathVariable String contractId) {
        List<Comment> comments = commentService.getPinnedCommentsByContractId(contractId);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment nào đã pinned");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment pinned thành công");
    }

    @GetMapping("/comments/author/{authorId}")
    @Operation(summary = "Lấy comment theo author ID", description = "Lấy danh sách comment của author")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByAuthorId(@PathVariable String authorId) {
        List<Comment> comments = commentService.getCommentsByAuthorId(authorId);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment nào của author này");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment của author thành công");
    }

    @GetMapping("/comments/parent/{parentCommentId}")
    @Operation(summary = "Lấy comment theo parent comment ID", description = "Lấy danh sách comment con")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByParentCommentId(@PathVariable String parentCommentId) {
        List<Comment> comments = commentService.getCommentsByParentCommentId(parentCommentId);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment con nào");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment con thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/type/{commentType}")
    @Operation(summary = "Lấy comment theo type", description = "Lấy danh sách comment theo loại")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByCommentType(
            @PathVariable String contractId,
            @PathVariable Comment.CommentType commentType) {
        List<Comment> comments = commentService.getCommentsByCommentType(contractId, commentType);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment nào với type này");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment theo type thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/priority/{priority}")
    @Operation(summary = "Lấy comment theo priority", description = "Lấy danh sách comment theo mức độ ưu tiên")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByPriority(
            @PathVariable String contractId,
            @PathVariable Comment.CommentPriority priority) {
        List<Comment> comments = commentService.getCommentsByPriority(contractId, priority);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment nào với priority này");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment theo priority thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/public")
    @Operation(summary = "Lấy comment public", description = "Lấy danh sách comment public")
    public ResponseEntity<RestResponse<List<Comment>>> getPublicComments(@PathVariable String contractId) {
        List<Comment> comments = commentService.getPublicCommentsByContractId(contractId);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment public nào");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment public thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/private")
    @Operation(summary = "Lấy comment private", description = "Lấy danh sách comment private")
    public ResponseEntity<RestResponse<List<Comment>>> getPrivateComments(@PathVariable String contractId) {
        List<Comment> comments = commentService.getPrivateCommentsByContractId(contractId);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment private nào");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment private thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/visibility/{visibility}")
    @Operation(summary = "Lấy comment theo visibility", description = "Lấy danh sách comment theo visibility")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByVisibility(
            @PathVariable String contractId,
            @PathVariable Comment.CommentVisibility visibility) {
        List<Comment> comments = commentService.getCommentsByVisibility(contractId, visibility);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment nào với visibility này");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment theo visibility thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/mentioned/{userId}")
    @Operation(summary = "Lấy comment đã mention user", description = "Lấy danh sách comment đã mention user")
    public ResponseEntity<RestResponse<List<Comment>>> getMentionedComments(
            @PathVariable String contractId,
            @PathVariable String userId) {
        List<Comment> comments = commentService.getMentionedCommentsByContractId(contractId, userId);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment nào mention user này");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment đã mention user thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/section/{sectionReference}")
    @Operation(summary = "Lấy comment theo section", description = "Lấy danh sách comment theo section reference")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsBySectionReference(
            @PathVariable String contractId,
            @PathVariable String sectionReference) {
        List<Comment> comments = commentService.getCommentsBySectionReference(contractId, sectionReference);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment nào cho section này");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment theo section thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/line/{lineNumber}")
    @Operation(summary = "Lấy comment theo line number", description = "Lấy danh sách comment theo line number")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByLineNumber(
            @PathVariable String contractId,
            @PathVariable Integer lineNumber) {
        List<Comment> comments = commentService.getCommentsByLineNumber(contractId, lineNumber);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment nào cho line này");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment theo line number thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/order-by-created")
    @Operation(summary = "Lấy comment sắp xếp theo thời gian tạo", description = "Lấy danh sách comment sắp xếp theo thời gian tạo")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsOrderByCreatedAt(@PathVariable String contractId) {
        List<Comment> comments = commentService.getCommentsByContractIdOrderByCreatedAt(contractId);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment nào");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment sắp xếp theo thời gian tạo thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/order-by-reaction")
    @Operation(summary = "Lấy comment sắp xếp theo reaction count", description = "Lấy danh sách comment sắp xếp theo reaction count")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsOrderByReactionCount(@PathVariable String contractId) {
        List<Comment> comments = commentService.getCommentsByContractIdOrderByReactionCount(contractId);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment nào");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment sắp xếp theo reaction count thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/order-by-reply")
    @Operation(summary = "Lấy comment sắp xếp theo reply count", description = "Lấy danh sách comment sắp xếp theo reply count")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsOrderByReplyCount(@PathVariable String contractId) {
        List<Comment> comments = commentService.getCommentsByContractIdOrderByReplyCount(contractId);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment nào");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment sắp xếp theo reply count thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/created-between")
    @Operation(summary = "Lấy comment theo thời gian tạo", description = "Lấy danh sách comment trong khoảng thời gian tạo")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByCreatedAtBetween(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<Comment> comments = commentService.getCommentsByCreatedAtBetween(startDate, endDate);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment nào trong khoảng thời gian này");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment theo thời gian tạo thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/resolved-between")
    @Operation(summary = "Lấy comment theo thời gian resolved", description = "Lấy danh sách comment trong khoảng thời gian resolved")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByResolvedAtBetween(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<Comment> comments = commentService.getCommentsByResolvedAtBetween(startDate, endDate);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment nào trong khoảng thời gian resolved này");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment theo thời gian resolved thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/high-reaction")
    @Operation(summary = "Lấy comment có reaction cao", description = "Lấy danh sách comment có reaction count cao")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsWithHighReactionCount(
            @PathVariable String contractId,
            @RequestParam Integer reactionCount) {
        List<Comment> comments = commentService.getCommentsWithHighReactionCount(reactionCount);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment nào có reaction count cao");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment có reaction count cao thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/with-replies")
    @Operation(summary = "Lấy comment có replies", description = "Lấy danh sách comment có replies")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsWithReplies(
            @PathVariable String contractId,
            @RequestParam Integer replyCount) {
        List<Comment> comments = commentService.getCommentsWithReplies(replyCount);
        
        if (comments.isEmpty()) {
            return ResponseBuilder.noContent("Không có comment nào có replies");
        }
        
        return ResponseBuilder.success(comments, "Lấy danh sách comment có replies thành công");
    }

    @PutMapping("/comments/{id}/resolve")
    @Operation(summary = "Resolve comment", description = "Đánh dấu comment đã được giải quyết")
    public ResponseEntity<RestResponse<Comment>> resolveComment(
            @PathVariable String id,
            @RequestParam String resolvedBy,
            @RequestParam String resolutionNote) {
        Comment comment = commentService.resolveComment(id, resolvedBy, resolutionNote);
        
        return ResponseBuilder.success(comment, "Resolve comment thành công");
    }

    @PutMapping("/comments/{id}/unresolve")
    @Operation(summary = "Unresolve comment", description = "Bỏ đánh dấu comment đã được giải quyết")
    public ResponseEntity<RestResponse<Comment>> unresolveComment(@PathVariable String id) {
        Comment comment = commentService.unresolveComment(id);
        
        return ResponseBuilder.success(comment, "Unresolve comment thành công");
    }

    @PutMapping("/comments/{id}/pin")
    @Operation(summary = "Pin comment", description = "Ghim comment")
    public ResponseEntity<RestResponse<Comment>> pinComment(
            @PathVariable String id,
            @RequestParam String pinnedBy) {
        Comment comment = commentService.pinComment(id, pinnedBy);
        
        return ResponseBuilder.success(comment, "Pin comment thành công");
    }

    @PutMapping("/comments/{id}/unpin")
    @Operation(summary = "Unpin comment", description = "Bỏ ghim comment")
    public ResponseEntity<RestResponse<Comment>> unpinComment(@PathVariable String id) {
        Comment comment = commentService.unpinComment(id);
        
        return ResponseBuilder.success(comment, "Unpin comment thành công");
    }

    @PutMapping("/comments/{id}/increment-reaction")
    @Operation(summary = "Tăng reaction count", description = "Tăng số lượng reaction")
    public ResponseEntity<RestResponse<Comment>> incrementReactionCount(@PathVariable String id) {
        Comment comment = commentService.incrementReactionCount(id);
        
        return ResponseBuilder.success(comment, "Tăng reaction count thành công");
    }

    @PutMapping("/comments/{id}/decrement-reaction")
    @Operation(summary = "Giảm reaction count", description = "Giảm số lượng reaction")
    public ResponseEntity<RestResponse<Comment>> decrementReactionCount(@PathVariable String id) {
        Comment comment = commentService.decrementReactionCount(id);
        
        return ResponseBuilder.success(comment, "Giảm reaction count thành công");
    }

    @PutMapping("/comments/{id}/increment-reply")
    @Operation(summary = "Tăng reply count", description = "Tăng số lượng reply")
    public ResponseEntity<RestResponse<Comment>> incrementReplyCount(@PathVariable String id) {
        Comment comment = commentService.incrementReplyCount(id);
        
        return ResponseBuilder.success(comment, "Tăng reply count thành công");
    }

    @PutMapping("/comments/{id}/decrement-reply")
    @Operation(summary = "Giảm reply count", description = "Giảm số lượng reply")
    public ResponseEntity<RestResponse<Comment>> decrementReplyCount(@PathVariable String id) {
        Comment comment = commentService.decrementReplyCount(id);
        
        return ResponseBuilder.success(comment, "Giảm reply count thành công");
    }

    @PutMapping("/comments/{id}/hide")
    @Operation(summary = "Ẩn comment", description = "Ẩn comment")
    public ResponseEntity<RestResponse<Comment>> hideComment(@PathVariable String id) {
        Comment comment = commentService.hideComment(id);
        
        return ResponseBuilder.success(comment, "Ẩn comment thành công");
    }

    @PutMapping("/comments/{id}/show")
    @Operation(summary = "Hiện comment", description = "Hiện comment")
    public ResponseEntity<RestResponse<Comment>> showComment(@PathVariable String id) {
        Comment comment = commentService.showComment(id);
        
        return ResponseBuilder.success(comment, "Hiện comment thành công");
    }

    @DeleteMapping("/comments/{id}")
    @Operation(summary = "Xóa comment", description = "Soft delete comment")
    public ResponseEntity<RestResponse<Void>> deleteComment(
            @PathVariable String id,
            @RequestParam String deletedBy) {
        commentService.deleteComment(id, deletedBy);
        
        return ResponseBuilder.success(null, "Xóa comment thành công");
    }

    @PutMapping("/comments/{id}/restore")
    @Operation(summary = "Khôi phục comment", description = "Khôi phục comment đã xóa")
    public ResponseEntity<RestResponse<Comment>> restoreComment(@PathVariable String id) {
        Comment comment = commentService.restoreComment(id);
        
        return ResponseBuilder.success(comment, "Khôi phục comment thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/count")
    @Operation(summary = "Đếm số comment", description = "Đếm số lượng comment")
    public ResponseEntity<RestResponse<Long>> countCommentsByContractId(@PathVariable String contractId) {
        long count = commentService.countCommentsByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số comment thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/count-by-status")
    @Operation(summary = "Đếm số comment theo status", description = "Đếm số lượng comment theo status")
    public ResponseEntity<RestResponse<Long>> countCommentsByContractIdAndStatus(
            @PathVariable String contractId,
            @RequestParam Comment.CommentStatus status) {
        long count = commentService.countCommentsByContractIdAndStatus(contractId, status);
        
        return ResponseBuilder.success(count, "Đếm số comment theo status thành công");
    }

    @GetMapping("/comments/author/{authorId}/count")
    @Operation(summary = "Đếm số comment của author", description = "Đếm số lượng comment của author")
    public ResponseEntity<RestResponse<Long>> countCommentsByAuthorId(@PathVariable String authorId) {
        long count = commentService.countCommentsByAuthorId(authorId);
        
        return ResponseBuilder.success(count, "Đếm số comment của author thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/count-unresolved")
    @Operation(summary = "Đếm số comment unresolved", description = "Đếm số lượng comment chưa resolved")
    public ResponseEntity<RestResponse<Long>> countUnresolvedCommentsByContractId(@PathVariable String contractId) {
        long count = commentService.countUnresolvedCommentsByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số comment unresolved thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/count-resolved")
    @Operation(summary = "Đếm số comment resolved", description = "Đếm số lượng comment đã resolved")
    public ResponseEntity<RestResponse<Long>> countResolvedCommentsByContractId(@PathVariable String contractId) {
        long count = commentService.countResolvedCommentsByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số comment resolved thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/count-pinned")
    @Operation(summary = "Đếm số comment pinned", description = "Đếm số lượng comment đã pinned")
    public ResponseEntity<RestResponse<Long>> countPinnedCommentsByContractId(@PathVariable String contractId) {
        long count = commentService.countPinnedCommentsByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số comment pinned thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/exists")
    @Operation(summary = "Kiểm tra có comment", description = "Kiểm tra contract có comment không")
    public ResponseEntity<RestResponse<Boolean>> existsCommentsByContractId(@PathVariable String contractId) {
        boolean exists = commentService.existsCommentsByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có comment thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/exists-unresolved")
    @Operation(summary = "Kiểm tra có comment unresolved", description = "Kiểm tra contract có comment unresolved không")
    public ResponseEntity<RestResponse<Boolean>> existsUnresolvedCommentsByContractId(@PathVariable String contractId) {
        boolean exists = commentService.existsUnresolvedCommentsByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có comment unresolved thành công");
    }

    @GetMapping("/contracts/{contractId}/comments/exists-pinned")
    @Operation(summary = "Kiểm tra có comment pinned", description = "Kiểm tra contract có comment pinned không")
    public ResponseEntity<RestResponse<Boolean>> existsPinnedCommentsByContractId(@PathVariable String contractId) {
        boolean exists = commentService.existsPinnedCommentsByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có comment pinned thành công");
    }
}
