package com.devgo2003.docgo.document_service.client;

import com.devgo2003.docgo.document_service.dto.ContractSummaryCreateRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.HashMap;
import java.util.Map;

/**
 * Client để gọi automation-service
 * Tích hợp với AI service để generate contract summary
 */
@Component
@Slf4j
public class AutomationServiceClient {

    // FIXME: RestTemplate bean not found, creating instance directly
    // This is a temporary workaround until Spring can properly detect RestTemplateConfig
    private final RestTemplate restTemplate = new RestTemplate();
    private final String automationServiceUrl;

    public AutomationServiceClient(@Value("${automation.service.url:http://localhost:8003}") String automationServiceUrl) {
        this.automationServiceUrl = automationServiceUrl;
    }

    /**
     * Gọi automation-service để generate contract summary
     * @param fileId ID của file
     * @param fileContent Nội dung file
     * @return ContractSummaryCreateRequest từ AI response
     */
    public ContractSummaryCreateRequest generateContractSummary(String fileId, String fileContent) {
        try {
            log.info("Calling automation-service to generate contract summary for fileId: {}", fileId);

            // Prepare request payload
            Map<String, Object> requestPayload = new HashMap<>();
            requestPayload.put("fileId", fileId);
            requestPayload.put("fileContent", fileContent);
            requestPayload.put("analysisType", "contract_summary");

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestPayload, headers);

            // Call automation-service API
            String apiUrl = automationServiceUrl + "/api/v1/automation-service/v1/contracts/analyze";
            
            ResponseEntity<Map> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("Successfully received contract summary from automation-service");
                return parseAiResponse(response.getBody());
            } else {
                log.error("Failed to get contract summary from automation-service. Status: {}", response.getStatusCode());
                throw new RuntimeException("Failed to generate contract summary from AI service");
            }

        } catch (RestClientException e) {
            log.error("Error calling automation-service: {}", e.getMessage(), e);
            throw new RuntimeException("Error calling automation-service: " + e.getMessage(), e);
        }
    }

    /**
     * Parse AI response thành ContractSummaryCreateRequest
     * @param aiResponse Response từ AI service
     * @return ContractSummaryCreateRequest
     */
    private ContractSummaryCreateRequest parseAiResponse(Map<String, Object> aiResponse) {
        try {
            // TODO: Implement parsing logic based on actual AI response format
            // For now, return a basic structure
            log.info("Parsing AI response: {}", aiResponse);
            
            // This is a placeholder implementation
            // In real implementation, you would parse the AI response and map it to ContractSummaryCreateRequest
            return ContractSummaryCreateRequest.builder()
                .contractNumber("AI-GENERATED")
                .title("AI Generated Contract Summary")
                .build();
                
        } catch (Exception e) {
            log.error("Error parsing AI response: {}", e.getMessage(), e);
            throw new RuntimeException("Error parsing AI response: " + e.getMessage(), e);
        }
    }

    /**
     * Kiểm tra automation-service có sẵn sàng không
     * @return true nếu service available, false nếu không
     */
    public boolean isServiceAvailable() {
        try {
            String healthUrl = automationServiceUrl + "/health";
            ResponseEntity<String> response = restTemplate.getForEntity(healthUrl, String.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.warn("Automation service is not available: {}", e.getMessage());
            return false;
        }
    }
}
