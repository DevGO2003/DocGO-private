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
@Tag(name = "API Quáº£n lÃ½ BÃ¬nh luáº­n", description = "CÃ¡c API Ä‘á»ƒ quáº£n lÃ½ bÃ¬nh luáº­n vÃ  cá»™ng tÃ¡c trong há»‡ thá»‘ng DocGO")
public class CommentController {

    private final CommentService commentService;
    private final HttpServletRequest request;

    public CommentController(CommentService commentService, HttpServletRequest request) {
        this.commentService = commentService;
        this.request = request;
    }

    @GetMapping
    @Operation(
        summary = "Láº¥y danh sÃ¡ch táº¥t cáº£ bÃ¬nh luáº­n", 
        description = """
        ðŸ”¹ Äáº§u vÃ o
        
        ðŸ“„ pageNumber (tÃ¹y chá»n, query)
        Loáº¡i: integer
        MÃ´ táº£: Sá»‘ trang (máº·c Ä‘á»‹nh: 0)
        
        ðŸ“„ pageSize (tÃ¹y chá»n, query)
        Loáº¡i: integer
        MÃ´ táº£: KÃ­ch thÆ°á»›c trang (máº·c Ä‘á»‹nh: 10)
        
        ðŸ“„ sortBy (tÃ¹y chá»n, query)
        Loáº¡i: string
        MÃ´ táº£: TrÆ°á»ng sáº¯p xáº¿p (máº·c Ä‘á»‹nh: createdAt)
        
        ðŸ“„ sortDirection (tÃ¹y chá»n, query)
        Loáº¡i: string
        MÃ´ táº£: HÆ°á»›ng sáº¯p xáº¿p: ASC hoáº·c DESC (máº·c Ä‘á»‹nh: DESC)
        
        ðŸ“„ searchTerm (tÃ¹y chá»n, query)
        Loáº¡i: string
        MÃ´ táº£: Tá»« khÃ³a tÃ¬m kiáº¿m
        
        ðŸ“„ includeDeleted (tÃ¹y chá»n, query)
        Loáº¡i: boolean
        MÃ´ táº£: Bao gá»“m báº£n ghi Ä‘Ã£ xÃ³a (máº·c Ä‘á»‹nh: false)
        
        ðŸ”¹ Äáº§u ra
        
        ðŸ“ data
        Loáº¡i: List<Comment>
        MÃ´ táº£: Danh sÃ¡ch bÃ¬nh luáº­n
        
        ðŸ“Š apiVersion
        Loáº¡i: string
        MÃ´ táº£: PhiÃªn báº£n API (v1)
        
        ðŸ”¢ statusCode
        Loáº¡i: integer
        MÃ´ táº£: MÃ£ tráº¡ng thÃ¡i HTTP (200: OK, 204: No Content)
        
        ðŸ“‹ shortMessage
        Loáº¡i: string
        MÃ´ táº£: ThÃ´ng bÃ¡o ngáº¯n gá»n vá» káº¿t quáº£
        
        ðŸ“– description
        Loáº¡i: string
        MÃ´ táº£: MÃ´ táº£ chi tiáº¿t vá» káº¿t quáº£ xá»­ lÃ½
        
        â° timestamp
        Loáº¡i: string
        MÃ´ táº£: Thá»i Ä‘iá»ƒm xá»­ lÃ½ request (ISO-8601)
        
        ðŸ”— requestId
        Loáº¡i: string
        MÃ´ táº£: ID duy nháº¥t cá»§a request
        
        ðŸ“ path
        Loáº¡i: string
        MÃ´ táº£: ÄÆ°á»ng dáº«n API Ä‘Æ°á»£c gá»i
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
                .description("KhÃ´ng cÃ³ bÃ¬nh luáº­n nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch bÃ¬nh luáº­n thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Láº¥y chi tiáº¿t bÃ¬nh luáº­n", 
        description = """
        ðŸ”¹ Äáº§u vÃ o
        
        ðŸ”— id (báº¯t buá»™c, path)
        Loáº¡i: string
        MÃ´ táº£: ID cá»§a bÃ¬nh luáº­n cáº§n láº¥y
        
        ðŸ”¹ Äáº§u ra
        
        ðŸ“ data
        Loáº¡i: Comment
        MÃ´ táº£: ThÃ´ng tin chi tiáº¿t bÃ¬nh luáº­n
        
        ðŸ“Š apiVersion
        Loáº¡i: string
        MÃ´ táº£: PhiÃªn báº£n API (v1)
        
        ðŸ”¢ statusCode
        Loáº¡i: integer
        MÃ´ táº£: MÃ£ tráº¡ng thÃ¡i HTTP (200: OK, 404: Not Found)
        
        ðŸ“‹ shortMessage
        Loáº¡i: string
        MÃ´ táº£: ThÃ´ng bÃ¡o ngáº¯n gá»n vá» káº¿t quáº£
        
        ðŸ“– description
        Loáº¡i: string
        MÃ´ táº£: MÃ´ táº£ chi tiáº¿t vá» káº¿t quáº£ xá»­ lÃ½
        
        â° timestamp
        Loáº¡i: string
        MÃ´ táº£: Thá»i Ä‘iá»ƒm xá»­ lÃ½ request (ISO-8601)
        
        ðŸ”— requestId
        Loáº¡i: string
        MÃ´ táº£: ID duy nháº¥t cá»§a request
        
        ðŸ“ path
        Loáº¡i: string
        MÃ´ táº£: ÄÆ°á»ng dáº«n API Ä‘Æ°á»£c gá»i
        """
    )
    public ResponseEntity<RestResponse<Comment>> getComment(@PathVariable String id) {
        Optional<Comment> comment = commentService.getCommentById(id);
        
        if (comment.isEmpty()) {
            RestResponse<Comment> response = RestResponse.<Comment>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description("KhÃ´ng tÃ¬m tháº¥y bÃ¬nh luáº­n vá»›i ID: " + id)
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
            .description("Láº¥y chi tiáº¿t bÃ¬nh luáº­n thÃ nh cÃ´ng.")
            .data(comment.get())
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping
    @Operation(
        summary = "Táº¡o bÃ¬nh luáº­n má»›i", 
        description = """
        ðŸ”¹ Äáº§u vÃ o
        
        ðŸ“„ comment (báº¯t buá»™c, body)
        Loáº¡i: CommentCreateRequest
        MÃ´ táº£: ThÃ´ng tin bÃ¬nh luáº­n cáº§n táº¡o (contractId, authorId, authorName, authorEmail, content, commentType, parentCommentId)
        
        ðŸ”¹ Äáº§u ra
        
        ðŸ“ data
        Loáº¡i: Comment
        MÃ´ táº£: ThÃ´ng tin bÃ¬nh luáº­n Ä‘Ã£ Ä‘Æ°á»£c táº¡o thÃ nh cÃ´ng
        
        ðŸ“Š apiVersion
        Loáº¡i: string
        MÃ´ táº£: PhiÃªn báº£n API (v1)
        
        ðŸ”¢ statusCode
        Loáº¡i: integer
        MÃ´ táº£: MÃ£ tráº¡ng thÃ¡i HTTP (201: Created)
        
        ðŸ“‹ shortMessage
        Loáº¡i: string
        MÃ´ táº£: ThÃ´ng bÃ¡o ngáº¯n gá»n vá» káº¿t quáº£
        
        ðŸ“– description
        Loáº¡i: string
        MÃ´ táº£: MÃ´ táº£ chi tiáº¿t vá» káº¿t quáº£ xá»­ lÃ½
        
        â° timestamp
        Loáº¡i: string
        MÃ´ táº£: Thá»i Ä‘iá»ƒm xá»­ lÃ½ request (ISO-8601)
        
        ðŸ”— requestId
        Loáº¡i: string
        MÃ´ táº£: ID duy nháº¥t cá»§a request
        
        ðŸ“ path
        Loáº¡i: string
        MÃ´ táº£: ÄÆ°á»ng dáº«n API Ä‘Æ°á»£c gá»i
        """
    )
    public ResponseEntity<RestResponse<Comment>> createComment(@RequestBody CommentCreateRequest request) {
        Comment comment = commentService.createComment(request);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(201)
            .shortMessage("Created")
            .description("Táº¡o bÃ¬nh luáº­n thÃ nh cÃ´ng.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(this.request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/contracts/{contractId}/comments")
    @Operation(summary = "Táº¡o comment má»›i", description = "Táº¡o comment má»›i cho contract")
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
            .description("Táº¡o comment thÃ nh cÃ´ng.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments")
    @Operation(summary = "Láº¥y danh sÃ¡ch comment", description = "Láº¥y táº¥t cáº£ comment cá»§a contract")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByContractId(@PathVariable String contractId) {
        List<Comment> comments = commentService.getCommentsByContractId(contractId);
        
        if (comments.isEmpty()) {
            RestResponse<List<Comment>> response = RestResponse.<List<Comment>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ comment nÃ o cho contract nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch comment thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/comments/{id}")
    @Operation(summary = "Láº¥y comment theo ID", description = "Láº¥y chi tiáº¿t comment")
    public ResponseEntity<RestResponse<Comment>> getCommentById(@PathVariable String id) {
        Optional<Comment> comment = commentService.getCommentById(id);
        
        if (comment.isEmpty()) {
            RestResponse<Comment> response = RestResponse.<Comment>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description("KhÃ´ng tÃ¬m tháº¥y comment.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y comment thÃ nh cÃ´ng.")
            .data(comment.get())
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/unresolved")
    @Operation(summary = "Láº¥y comment chÆ°a resolved", description = "Láº¥y danh sÃ¡ch comment chÆ°a Ä‘Æ°á»£c giáº£i quyáº¿t")
    public ResponseEntity<RestResponse<List<Comment>>> getUnresolvedComments(@PathVariable String contractId) {
        List<Comment> comments = commentService.getUnresolvedCommentsByContractId(contractId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment nÃ o chÆ°a resolved.")
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
            .description("Láº¥y danh sÃ¡ch comment unresolved thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/resolved")
    @Operation(summary = "Láº¥y comment Ä‘Ã£ resolved", description = "Láº¥y danh sÃ¡ch comment Ä‘Ã£ Ä‘Æ°á»£c giáº£i quyáº¿t")
    public ResponseEntity<RestResponse<List<Comment>>> getResolvedComments(@PathVariable String contractId) {
        List<Comment> comments = commentService.getResolvedCommentsByContractId(contractId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment nÃ o Ä‘Ã£ resolved.")
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
            .description("Láº¥y danh sÃ¡ch comment resolved thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/pinned")
    @Operation(summary = "Láº¥y comment Ä‘Ã£ pinned", description = "Láº¥y danh sÃ¡ch comment Ä‘Ã£ Ä‘Æ°á»£c ghim")
    public ResponseEntity<RestResponse<List<Comment>>> getPinnedComments(@PathVariable String contractId) {
        List<Comment> comments = commentService.getPinnedCommentsByContractId(contractId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment nÃ o Ä‘Ã£ pinned.")
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
            .description("Láº¥y danh sÃ¡ch comment pinned thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/comments/author/{authorId}")
    @Operation(summary = "Láº¥y comment theo author ID", description = "Láº¥y danh sÃ¡ch comment cá»§a author")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByAuthorId(@PathVariable String authorId) {
        List<Comment> comments = commentService.getCommentsByAuthorId(authorId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment nÃ o cá»§a author nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch comment cá»§a author thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/comments/parent/{parentCommentId}")
    @Operation(summary = "Láº¥y comment theo parent comment ID", description = "Láº¥y danh sÃ¡ch comment con")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByParentCommentId(@PathVariable String parentCommentId) {
        List<Comment> comments = commentService.getCommentsByParentCommentId(parentCommentId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment con nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch comment con thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/type/{commentType}")
    @Operation(summary = "Láº¥y comment theo type", description = "Láº¥y danh sÃ¡ch comment theo loáº¡i")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByCommentType(
            @PathVariable String contractId,
            @PathVariable Comment.CommentType commentType) {
        List<Comment> comments = commentService.getCommentsByCommentType(contractId, commentType);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment nÃ o vá»›i type nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch comment theo type thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/priority/{priority}")
    @Operation(summary = "Láº¥y comment theo priority", description = "Láº¥y danh sÃ¡ch comment theo má»©c Ä‘á»™ Æ°u tiÃªn")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByPriority(
            @PathVariable String contractId,
            @PathVariable Comment.CommentPriority priority) {
        List<Comment> comments = commentService.getCommentsByPriority(contractId, priority);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment nÃ o vá»›i priority nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch comment theo priority thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/public")
    @Operation(summary = "Láº¥y comment public", description = "Láº¥y danh sÃ¡ch comment public")
    public ResponseEntity<RestResponse<List<Comment>>> getPublicComments(@PathVariable String contractId) {
        List<Comment> comments = commentService.getPublicCommentsByContractId(contractId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment public nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch comment public thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/private")
    @Operation(summary = "Láº¥y comment private", description = "Láº¥y danh sÃ¡ch comment private")
    public ResponseEntity<RestResponse<List<Comment>>> getPrivateComments(@PathVariable String contractId) {
        List<Comment> comments = commentService.getPrivateCommentsByContractId(contractId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment private nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch comment private thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/visibility/{visibility}")
    @Operation(summary = "Láº¥y comment theo visibility", description = "Láº¥y danh sÃ¡ch comment theo visibility")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByVisibility(
            @PathVariable String contractId,
            @PathVariable Comment.CommentVisibility visibility) {
        List<Comment> comments = commentService.getCommentsByVisibility(contractId, visibility);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment nÃ o vá»›i visibility nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch comment theo visibility thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/mentioned/{userId}")
    @Operation(summary = "Láº¥y comment Ä‘Ã£ mention user", description = "Láº¥y danh sÃ¡ch comment Ä‘Ã£ mention user")
    public ResponseEntity<RestResponse<List<Comment>>> getMentionedComments(
            @PathVariable String contractId,
            @PathVariable String userId) {
        List<Comment> comments = commentService.getMentionedCommentsByContractId(contractId, userId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment nÃ o mention user nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch comment Ä‘Ã£ mention user thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/section/{sectionReference}")
    @Operation(summary = "Láº¥y comment theo section", description = "Láº¥y danh sÃ¡ch comment theo section reference")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsBySectionReference(
            @PathVariable String contractId,
            @PathVariable String sectionReference) {
        List<Comment> comments = commentService.getCommentsBySectionReference(contractId, sectionReference);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment nÃ o cho section nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch comment theo section thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/line/{lineNumber}")
    @Operation(summary = "Láº¥y comment theo line number", description = "Láº¥y danh sÃ¡ch comment theo line number")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByLineNumber(
            @PathVariable String contractId,
            @PathVariable Integer lineNumber) {
        List<Comment> comments = commentService.getCommentsByLineNumber(contractId, lineNumber);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment nÃ o cho line nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch comment theo line number thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/order-by-created")
    @Operation(summary = "Láº¥y comment sáº¯p xáº¿p theo thá»i gian táº¡o", description = "Láº¥y danh sÃ¡ch comment sáº¯p xáº¿p theo thá»i gian táº¡o")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsOrderByCreatedAt(@PathVariable String contractId) {
        List<Comment> comments = commentService.getCommentsByContractIdOrderByCreatedAt(contractId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch comment sáº¯p xáº¿p theo thá»i gian táº¡o thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/order-by-reaction")
    @Operation(summary = "Láº¥y comment sáº¯p xáº¿p theo reaction count", description = "Láº¥y danh sÃ¡ch comment sáº¯p xáº¿p theo reaction count")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsOrderByReactionCount(@PathVariable String contractId) {
        List<Comment> comments = commentService.getCommentsByContractIdOrderByReactionCount(contractId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch comment sáº¯p xáº¿p theo reaction count thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/order-by-reply")
    @Operation(summary = "Láº¥y comment sáº¯p xáº¿p theo reply count", description = "Láº¥y danh sÃ¡ch comment sáº¯p xáº¿p theo reply count")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsOrderByReplyCount(@PathVariable String contractId) {
        List<Comment> comments = commentService.getCommentsByContractIdOrderByReplyCount(contractId);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch comment sáº¯p xáº¿p theo reply count thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/created-between")
    @Operation(summary = "Láº¥y comment theo thá»i gian táº¡o", description = "Láº¥y danh sÃ¡ch comment trong khoáº£ng thá»i gian táº¡o")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByCreatedAtBetween(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<Comment> comments = commentService.getCommentsByCreatedAtBetween(startDate, endDate);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment nÃ o trong khoáº£ng thá»i gian nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch comment theo thá»i gian táº¡o thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/resolved-between")
    @Operation(summary = "Láº¥y comment theo thá»i gian resolved", description = "Láº¥y danh sÃ¡ch comment trong khoáº£ng thá»i gian resolved")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsByResolvedAtBetween(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<Comment> comments = commentService.getCommentsByResolvedAtBetween(startDate, endDate);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment nÃ o trong khoáº£ng thá»i gian resolved nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch comment theo thá»i gian resolved thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/high-reaction")
    @Operation(summary = "Láº¥y comment cÃ³ reaction cao", description = "Láº¥y danh sÃ¡ch comment cÃ³ reaction count cao")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsWithHighReactionCount(
            @PathVariable String contractId,
            @RequestParam Integer reactionCount) {
        List<Comment> comments = commentService.getCommentsWithHighReactionCount(reactionCount);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment nÃ o cÃ³ reaction count cao.")
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
            .description("Láº¥y danh sÃ¡ch comment cÃ³ reaction count cao thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/with-replies")
    @Operation(summary = "Láº¥y comment cÃ³ replies", description = "Láº¥y danh sÃ¡ch comment cÃ³ replies")
    public ResponseEntity<RestResponse<List<Comment>>> getCommentsWithReplies(
            @PathVariable String contractId,
            @RequestParam Integer replyCount) {
        List<Comment> comments = commentService.getCommentsWithReplies(replyCount);
        
        if (comments.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ comment nÃ o cÃ³ replies.")
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
            .description("Láº¥y danh sÃ¡ch comment cÃ³ replies thÃ nh cÃ´ng.")
            .data(comments)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/comments/{id}/resolve")
    @Operation(summary = "Resolve comment", description = "ÄÃ¡nh dáº¥u comment Ä‘Ã£ Ä‘Æ°á»£c giáº£i quyáº¿t")
    public ResponseEntity<RestResponse<Comment>> resolveComment(
            @PathVariable String id,
            @RequestParam String resolvedBy,
            @RequestParam String resolutionNote) {
        Comment comment = commentService.resolveComment(id, resolvedBy, resolutionNote);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Resolve comment thÃ nh cÃ´ng.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/comments/{id}/unresolve")
    @Operation(summary = "Unresolve comment", description = "Bá» Ä‘Ã¡nh dáº¥u comment Ä‘Ã£ Ä‘Æ°á»£c giáº£i quyáº¿t")
    public ResponseEntity<RestResponse<Comment>> unresolveComment(@PathVariable String id) {
        Comment comment = commentService.unresolveComment(id);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Unresolve comment thÃ nh cÃ´ng.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/comments/{id}/pin")
    @Operation(summary = "Pin comment", description = "Ghim comment")
    public ResponseEntity<RestResponse<Comment>> pinComment(
            @PathVariable String id,
            @RequestParam String pinnedBy) {
        Comment comment = commentService.pinComment(id, pinnedBy);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Pin comment thÃ nh cÃ´ng.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/comments/{id}/unpin")
    @Operation(summary = "Unpin comment", description = "Bá» ghim comment")
    public ResponseEntity<RestResponse<Comment>> unpinComment(@PathVariable String id) {
        Comment comment = commentService.unpinComment(id);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Unpin comment thÃ nh cÃ´ng.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/comments/{id}/increment-reaction")
    @Operation(summary = "TÄƒng reaction count", description = "TÄƒng sá»‘ lÆ°á»£ng reaction")
    public ResponseEntity<RestResponse<Comment>> incrementReactionCount(@PathVariable String id) {
        Comment comment = commentService.incrementReactionCount(id);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("TÄƒng reaction count thÃ nh cÃ´ng.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/comments/{id}/decrement-reaction")
    @Operation(summary = "Giáº£m reaction count", description = "Giáº£m sá»‘ lÆ°á»£ng reaction")
    public ResponseEntity<RestResponse<Comment>> decrementReactionCount(@PathVariable String id) {
        Comment comment = commentService.decrementReactionCount(id);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Giáº£m reaction count thÃ nh cÃ´ng.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/comments/{id}/increment-reply")
    @Operation(summary = "TÄƒng reply count", description = "TÄƒng sá»‘ lÆ°á»£ng reply")
    public ResponseEntity<RestResponse<Comment>> incrementReplyCount(@PathVariable String id) {
        Comment comment = commentService.incrementReplyCount(id);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("TÄƒng reply count thÃ nh cÃ´ng.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/comments/{id}/decrement-reply")
    @Operation(summary = "Giáº£m reply count", description = "Giáº£m sá»‘ lÆ°á»£ng reply")
    public ResponseEntity<RestResponse<Comment>> decrementReplyCount(@PathVariable String id) {
        Comment comment = commentService.decrementReplyCount(id);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Giáº£m reply count thÃ nh cÃ´ng.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/comments/{id}/hide")
    @Operation(summary = "áº¨n comment", description = "áº¨n comment")
    public ResponseEntity<RestResponse<Comment>> hideComment(@PathVariable String id) {
        Comment comment = commentService.hideComment(id);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("áº¨n comment thÃ nh cÃ´ng.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/comments/{id}/show")
    @Operation(summary = "Hiá»‡n comment", description = "Hiá»‡n comment")
    public ResponseEntity<RestResponse<Comment>> showComment(@PathVariable String id) {
        Comment comment = commentService.showComment(id);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Hiá»‡n comment thÃ nh cÃ´ng.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/comments/{id}")
    @Operation(summary = "XÃ³a comment", description = "Soft delete comment")
    public ResponseEntity<RestResponse<Void>> deleteComment(
            @PathVariable String id,
            @RequestParam String deletedBy) {
        commentService.deleteComment(id, deletedBy);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("XÃ³a comment thÃ nh cÃ´ng.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/comments/{id}/restore")
    @Operation(summary = "KhÃ´i phá»¥c comment", description = "KhÃ´i phá»¥c comment Ä‘Ã£ xÃ³a")
    public ResponseEntity<RestResponse<Comment>> restoreComment(@PathVariable String id) {
        Comment comment = commentService.restoreComment(id);
        
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("KhÃ´i phá»¥c comment thÃ nh cÃ´ng.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/count")
    @Operation(summary = "Äáº¿m sá»‘ comment", description = "Äáº¿m sá»‘ lÆ°á»£ng comment")
    public ResponseEntity<RestResponse<Long>> countCommentsByContractId(@PathVariable String contractId) {
        long count = commentService.countCommentsByContractId(contractId);
        
        RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ comment thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/count-by-status")
    @Operation(summary = "Äáº¿m sá»‘ comment theo status", description = "Äáº¿m sá»‘ lÆ°á»£ng comment theo status")
    public ResponseEntity<RestResponse<Long>> countCommentsByContractIdAndStatus(
            @PathVariable String contractId,
            @RequestParam Comment.CommentStatus status) {
        long count = commentService.countCommentsByContractIdAndStatus(contractId, status);
        
        RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ comment theo status thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/comments/author/{authorId}/count")
    @Operation(summary = "Äáº¿m sá»‘ comment cá»§a author", description = "Äáº¿m sá»‘ lÆ°á»£ng comment cá»§a author")
    public ResponseEntity<RestResponse<Long>> countCommentsByAuthorId(@PathVariable String authorId) {
        long count = commentService.countCommentsByAuthorId(authorId);
        
        RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ comment cá»§a author thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/count-unresolved")
    @Operation(summary = "Äáº¿m sá»‘ comment unresolved", description = "Äáº¿m sá»‘ lÆ°á»£ng comment chÆ°a resolved")
    public ResponseEntity<RestResponse<Long>> countUnresolvedCommentsByContractId(@PathVariable String contractId) {
        long count = commentService.countUnresolvedCommentsByContractId(contractId);
        
        RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ comment unresolved thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/count-resolved")
    @Operation(summary = "Äáº¿m sá»‘ comment resolved", description = "Äáº¿m sá»‘ lÆ°á»£ng comment Ä‘Ã£ resolved")
    public ResponseEntity<RestResponse<Long>> countResolvedCommentsByContractId(@PathVariable String contractId) {
        long count = commentService.countResolvedCommentsByContractId(contractId);
        
        RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ comment resolved thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/count-pinned")
    @Operation(summary = "Äáº¿m sá»‘ comment pinned", description = "Äáº¿m sá»‘ lÆ°á»£ng comment Ä‘Ã£ pinned")
    public ResponseEntity<RestResponse<Long>> countPinnedCommentsByContractId(@PathVariable String contractId) {
        long count = commentService.countPinnedCommentsByContractId(contractId);
        
        RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ comment pinned thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/exists")
    @Operation(summary = "Kiá»ƒm tra cÃ³ comment", description = "Kiá»ƒm tra contract cÃ³ comment khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsCommentsByContractId(@PathVariable String contractId) {
        boolean exists = commentService.existsCommentsByContractId(contractId);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ comment thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/exists-unresolved")
    @Operation(summary = "Kiá»ƒm tra cÃ³ comment unresolved", description = "Kiá»ƒm tra contract cÃ³ comment unresolved khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsUnresolvedCommentsByContractId(@PathVariable String contractId) {
        boolean exists = commentService.existsUnresolvedCommentsByContractId(contractId);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ comment unresolved thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/comments/exists-pinned")
    @Operation(summary = "Kiá»ƒm tra cÃ³ comment pinned", description = "Kiá»ƒm tra contract cÃ³ comment pinned khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsPinnedCommentsByContractId(@PathVariable String contractId) {
        boolean exists = commentService.existsPinnedCommentsByContractId(contractId);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ comment pinned thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}

