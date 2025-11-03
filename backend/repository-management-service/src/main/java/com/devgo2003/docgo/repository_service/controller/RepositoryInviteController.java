package com.devgo2003.docgo.repository_service.controller;

import com.devgo2003.docgo.repository_service.dto.RepositoryInviteDTO;
import com.devgo2003.docgo.repository_service.service.IRepositoryInviteService;
import com.devgo2003.docgo.repository_service.common.response.RestResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/repository-management-service")
@RequiredArgsConstructor
public class RepositoryInviteController {

    private final IRepositoryInviteService inviteService;

    // Create invite link (Personal repository only)
    @PostMapping("/repositories/{repositoryId}/invites")
    public ResponseEntity<RestResponse<RepositoryInviteDTO>> createInvite(
            @PathVariable String repositoryId,
            @RequestBody CreateInviteRequest request,
            @RequestHeader("X-User-ID") String currentUserId
    ) {
        RepositoryInviteDTO invite = inviteService.createInvite(
            repositoryId,
            currentUserId,
            request.getExpiresInDays()
        );
        return ResponseEntity.ok(RestResponse.success(invite));
    }

    // Get all invites for a repository
    @GetMapping("/repositories/{repositoryId}/invites")
    public ResponseEntity<RestResponse<List<RepositoryInviteDTO>>> getRepositoryInvites(
            @PathVariable String repositoryId,
            @RequestHeader("X-User-ID") String currentUserId
    ) {
        List<RepositoryInviteDTO> invites = inviteService.getRepositoryInvites(repositoryId, currentUserId);
        return ResponseEntity.ok(RestResponse.success(invites));
    }

    // Get invite info by token (public - no auth needed)
    @GetMapping("/invites/{token}")
    public ResponseEntity<RestResponse<RepositoryInviteDTO>> getInviteByToken(
            @PathVariable String token
    ) {
        RepositoryInviteDTO invite = inviteService.getInviteByToken(token);
        return ResponseEntity.ok(RestResponse.success(invite));
    }

    // Accept invite (user clicks on invite link)
    @PostMapping("/invites/{token}/accept")
    public ResponseEntity<RestResponse<Void>> acceptInvite(
            @PathVariable String token,
            @RequestHeader("X-User-ID") String currentUserId
    ) {
        inviteService.acceptInvite(token, currentUserId);
        return ResponseEntity.ok(RestResponse.success(null));
    }

    // Revoke invite
    @DeleteMapping("/invites/{inviteId}")
    public ResponseEntity<RestResponse<Void>> revokeInvite(
            @PathVariable String inviteId,
            @RequestHeader("X-User-ID") String currentUserId
    ) {
        inviteService.revokeInvite(inviteId, currentUserId);
        return ResponseEntity.ok(RestResponse.success(null));
    }

    @Data
    public static class CreateInviteRequest {
        private Integer expiresInDays = 7; // Default 7 days
    }
}
