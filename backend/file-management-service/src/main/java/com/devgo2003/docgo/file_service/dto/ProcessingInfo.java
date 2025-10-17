package com.devgo2003.docgo.file_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessingInfo {
    private String status;
    private String error;
    private boolean jsonAnalysisCompleted;
    private LocalDateTime jsonAnalysisTimestamp;
}
