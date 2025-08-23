package com.devgo2003.docgo.contract_service.service;

import com.devgo2003.docgo.contract_service.model.ContractProcessingResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContractProcessingConsumer {

    private final FileUploadService fileUploadService;

    @KafkaListener(topics = "${app.kafka.topic.callback:contract-processing-results}", 
                   groupId = "${app.kafka.consumer.group-id:contract-service-group}")
    public void consumeContractProcessingResult(ContractProcessingResult result) {
        try {
            log.info("Nhận được kết quả xử lý hợp đồng: {}", result.getRequestId());
            
            // Xử lý kết quả
            fileUploadService.processContractProcessingResult(result);
            
        } catch (Exception e) {
            log.error("Lỗi khi xử lý kết quả xử lý hợp đồng: {}", e.getMessage(), e);
        }
    }
}
