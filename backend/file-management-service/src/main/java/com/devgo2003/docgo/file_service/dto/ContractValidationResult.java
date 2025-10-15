package com.devgo2003.docgo.file_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractValidationResult {
    private boolean valid;
    private List<String> errors;
    private List<String> warnings;
    private String summary;
    
    public static ContractValidationResult success() {
        return ContractValidationResult.builder()
                .valid(true)
                .summary("Validation successful")
                .build();
    }
    
    public static ContractValidationResult failure(List<String> errors) {
        return ContractValidationResult.builder()
                .valid(false)
                .errors(errors)
                .summary("Validation failed with " + errors.size() + " error(s)")
                .build();
    }
    
    public static ContractValidationResult failure(List<String> errors, List<String> warnings) {
        return ContractValidationResult.builder()
                .valid(false)
                .errors(errors)
                .warnings(warnings)
                .summary("Validation failed with " + errors.size() + " error(s) and " + warnings.size() + " warning(s)")
                .build();
    }
}
