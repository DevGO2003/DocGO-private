package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WorkflowDto {
    private String currentStage;
    private String nextStage;
    private List<StageDto> stages;
    private List<ApprovalDto> approvals;
    private String status;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StageDto {
        private String name;
        private String status;
        private LocalDateTime completedAt;
        private String assignedTo;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ApprovalDto {
        private String approver;
        private String status;
        private LocalDateTime approvedAt;
        private String comments;
    }
}
