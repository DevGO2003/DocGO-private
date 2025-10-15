package com.devgo2003.docgo.file_service.controller;

import com.devgo2003.docgo.file_service.entity.CommentEntity;
import com.devgo2003.docgo.file_service.service.CommentService;
import com.devgo2003.docgo.file_service.common.response.RestResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/file-management-service/v1/files/{documentId}/comments")
@Tag(name = "💬 Comment Management", description = "API quản lý bình luận cho tài liệu")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    @Operation(
        summary = "Lấy danh sách bình luận",
        description = """
        ## 📖 Mô tả
        Lấy danh sách bình luận của một tài liệu với phân trang.

        ## 🔹 Đầu vào

        📄 documentId (bắt buộc, path)
        Loại: string
        Mô tả: ID của tài liệu
        
        📄 page (tùy chọn, query)
        Loại: integer
        Mô tả: Số trang (mặc định: 0)
        
        📄 size (tùy chọn, query)
        Loại: integer
        Mô tả: Kích thước trang (mặc định: 10)

        ## 🔹 Đầu ra

        📝 data
        Loại: Page<CommentEntity>
        Mô tả: Danh sách bình luận với phân trang
        """
    )
    public ResponseEntity<RestResponse<Page<CommentEntity>>> getCommentsByDocumentId(
            @Parameter(description = "ID của tài liệu", required = true) 
            @PathVariable String documentId,
            Pageable pageable) {
        Page<CommentEntity> comments = commentService.getCommentsByDocumentId(documentId, pageable);
        return ResponseEntity.ok(RestResponse.success(comments, "Comments retrieved successfully"));
    }

    @PostMapping
    @Operation(
        summary = "Thêm bình luận mới",
        description = """
        ## 📖 Mô tả
        Thêm bình luận mới cho một tài liệu.

        ## 🔹 Đầu vào

        📄 documentId (bắt buộc, path)
        Loại: string
        Mô tả: ID của tài liệu
        
        📄 comment (bắt buộc, body)
        Loại: CommentEntity
        Mô tả: Thông tin bình luận

        ## 🔹 Đầu ra

        📝 data
        Loại: CommentEntity
        Mô tả: Bình luận đã được tạo
        """
    )
    public ResponseEntity<RestResponse<CommentEntity>> addComment(
            @Parameter(description = "ID của tài liệu", required = true) 
            @PathVariable String documentId,
            @RequestBody CommentEntity comment) {
        CommentEntity createdComment = commentService.addComment(documentId, comment);
        return ResponseEntity.ok(RestResponse.success(createdComment, "Comment added successfully"));
    }

    @PutMapping("/{commentId}")
    @Operation(
        summary = "Cập nhật bình luận",
        description = """
        ## 📖 Mô tả
        Cập nhật nội dung bình luận.
        
        ## 🔹 Đầu vào
        
        📄 documentId (bắt buộc, path)
        Loại: string
        Mô tả: ID của tài liệu
        
        📄 commentId (bắt buộc, path)
        Loại: string
        Mô tả: ID của bình luận
        
        📄 comment (bắt buộc, body)
        Loại: CommentEntity
        Mô tả: Thông tin bình luận cập nhật
        
        ## 🔹 Đầu ra
        
        📝 data
        Loại: CommentEntity
        Mô tả: Bình luận đã được cập nhật
        """
    )
    public ResponseEntity<RestResponse<CommentEntity>> updateComment(
            @Parameter(description = "ID của tài liệu", required = true) 
            @PathVariable String documentId,
            @Parameter(description = "ID của bình luận", required = true) 
            @PathVariable String commentId,
            @RequestBody CommentEntity comment) {
        CommentEntity updatedComment = commentService.updateComment(documentId, commentId, comment);
        return ResponseEntity.ok(RestResponse.success(updatedComment, "Comment updated successfully"));
    }

    @DeleteMapping("/{commentId}")
    @Operation(
        summary = "Xóa bình luận",
        description = """
        ## 📖 Mô tả
        Xóa một bình luận.
        
        ## 🔹 Đầu vào
        
        📄 documentId (bắt buộc, path)
        Loại: string
        Mô tả: ID của tài liệu
        
        📄 commentId (bắt buộc, path)
        Loại: string
        Mô tả: ID của bình luận
        
        ## 🔹 Đầu ra
        
        📝 data
        Loại: null
        Mô tả: Bình luận đã được xóa
        """
    )
    public ResponseEntity<RestResponse<Void>> deleteComment(
            @Parameter(description = "ID của tài liệu", required = true) 
            @PathVariable String documentId,
            @Parameter(description = "ID của bình luận", required = true) 
            @PathVariable String commentId) {
        commentService.deleteComment(documentId, commentId);
        return ResponseEntity.ok(RestResponse.success(null, "Comment deleted successfully"));
    }
}