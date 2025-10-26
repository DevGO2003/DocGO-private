package com.devgo2003.docgo.repository_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * CommentRequest - DTO for creating/updating comments
 * 
 * Contains information required to create or update a comment
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequest {
    
    @NotBlank(message = "Nội dung comment không được để trống")
    @Size(min = 1, max = 2000, message = "Nội dung comment phải từ 1-2000 ký tự")
    private String content;
    
    @NotBlank(message = "Tên tác giả không được để trống")
    @Size(max = 255, message = "Tên tác giả không được vượt quá 255 ký tự")
    private String author;
    
    // AuthorId sẽ được lấy từ token/session, không cần validate
    private String authorId;
}
