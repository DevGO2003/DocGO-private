package com.devgo2003.docgo.contract_service.service;

import com.devgo2003.docgo.contract_service.entity.UploadedFile;
import com.devgo2003.docgo.contract_service.entity.Contract;
import com.devgo2003.docgo.contract_service.model.FileUploadRequest;
import com.devgo2003.docgo.contract_service.model.FileUploadResponse;
import com.devgo2003.docgo.contract_service.model.ContractProcessingRequest;
import com.devgo2003.docgo.contract_service.model.ContractProcessingResult;
import com.devgo2003.docgo.contract_service.repository.UploadedFileRepository;
import com.devgo2003.docgo.contract_service.repository.ContractRepository;
import com.devgo2003.docgo.contract_service.service.event.ContractEventPublisher;
import com.devgo2003.docgo.contract_service.service.event.ContractEventPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.tika.Tika;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileUploadService {

    private final UploadedFileRepository uploadedFileRepository;
    private final ContractRepository contractRepository;
    private final ContractEventPublisher contractEventPublisher;
    private final KafkaTemplate<String, ContractProcessingRequest> kafkaTemplate;

    @Value("${app.upload.directory:uploads}")
    private String uploadDirectory;

    @Value("${app.kafka.topic.contract-processing:contract-processing-requests}")
    private String contractProcessingTopic;

    @Value("${app.kafka.topic.callback:contract-processing-results}")
    private String callbackTopic;

    public FileUploadResponse uploadFile(FileUploadRequest request) {
        try {
            MultipartFile file = request.getFile();
            
            // Tạo thư mục upload nếu chưa tồn tại
            Path uploadPath = Paths.get(uploadDirectory);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Tạo tên file duy nhất
            String originalFilename = file.getOriginalFilename();
            String fileExtension = FilenameUtils.getExtension(originalFilename);
            String storedFilename = UUID.randomUUID().toString() + "." + fileExtension;
            
            // Lưu file
            Path filePath = uploadPath.resolve(storedFilename);
            Files.copy(file.getInputStream(), filePath);

            // Phát hiện loại file
            Tika tika = new Tika();
            String detectedContentType = tika.detect(filePath.toFile());

            // Lưu thông tin file vào database
            UploadedFile uploadedFile = new UploadedFile();
            uploadedFile.setOriginalFilename(originalFilename);
            uploadedFile.setStoredFilename(storedFilename);
            uploadedFile.setFilePath(filePath.toString());
            uploadedFile.setFileSize(file.getSize());
            uploadedFile.setContentType(detectedContentType);
            uploadedFile.setFileExtension(fileExtension);
            uploadedFile.setUploadDate(LocalDateTime.now());
            uploadedFile.setIsContract(request.getIsContract());
            uploadedFile.setProcessingStatus(UploadedFile.ProcessingStatus.PENDING);

            uploadedFile = uploadedFileRepository.save(uploadedFile);

            // Nếu là hợp đồng, gửi yêu cầu xử lý AI
            if (request.getIsContract()) {
                sendContractProcessingRequest(uploadedFile);
            }

            // Tạo response
            FileUploadResponse response = new FileUploadResponse();
            response.setFileId(uploadedFile.getId());
            response.setOriginalFilename(uploadedFile.getOriginalFilename());
            response.setStoredFilename(uploadedFile.getStoredFilename());
            response.setFilePath(uploadedFile.getFilePath());
            response.setFileSize(uploadedFile.getFileSize());
            response.setContentType(uploadedFile.getContentType());
            response.setUploadDate(uploadedFile.getUploadDate());
            response.setIsContract(uploadedFile.getIsContract());
            response.setProcessingStatus(uploadedFile.getProcessingStatus().name());
            
            if (request.getIsContract()) {
                response.setMessage("File đã được upload và đang được xử lý AI để tóm tắt hợp đồng.");
            } else {
                response.setMessage("File đã được upload thành công.");
            }

            return response;

        } catch (IOException e) {
            log.error("Lỗi khi upload file: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể upload file: " + e.getMessage());
        }
    }

    private void sendContractProcessingRequest(UploadedFile uploadedFile) {
        try {
            ContractProcessingRequest request = new ContractProcessingRequest();
            request.setRequestId(UUID.randomUUID().toString());
            request.setFileId(uploadedFile.getId());
            request.setFilePath(uploadedFile.getFilePath());
            request.setOriginalFilename(uploadedFile.getOriginalFilename());
            request.setContentType(uploadedFile.getContentType());
            request.setFileSize(uploadedFile.getFileSize());
            request.setRequestTime(LocalDateTime.now());
            request.setServiceType("ai-processing");
            request.setCallbackTopic(callbackTopic);

            // Gửi message qua Kafka
            kafkaTemplate.send(contractProcessingTopic, request.getRequestId(), request);
            
            log.info("Đã gửi yêu cầu xử lý hợp đồng qua Kafka: {}", request.getRequestId());
            
            // Cập nhật trạng thái
            uploadedFile.setProcessingStatus(UploadedFile.ProcessingStatus.PROCESSING);
            uploadedFileRepository.save(uploadedFile);

        } catch (Exception e) {
            log.error("Lỗi khi gửi yêu cầu xử lý hợp đồng: {}", e.getMessage(), e);
            
            // Cập nhật trạng thái lỗi
            uploadedFile.setProcessingStatus(UploadedFile.ProcessingStatus.FAILED);
            uploadedFile.setErrorMessage("Lỗi khi gửi yêu cầu xử lý: " + e.getMessage());
            uploadedFileRepository.save(uploadedFile);
        }
    }

    public void processContractProcessingResult(ContractProcessingResult result) {
        try {
            UploadedFile uploadedFile = uploadedFileRepository.findById(result.getFileId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy file: " + result.getFileId()));

            if (result.getSuccess()) {
                // Tạo hoặc cập nhật hợp đồng
                Contract contract = createOrUpdateContract(uploadedFile, result);
                
                // Cập nhật trạng thái file
                uploadedFile.setProcessingStatus(UploadedFile.ProcessingStatus.COMPLETED);
                uploadedFile.setContractId(contract.getId());
                uploadedFile.setAiProcessingResult("Xử lý thành công");
                uploadedFileRepository.save(uploadedFile);

                log.info("Đã xử lý thành công hợp đồng: {}", contract.getId());

            } else {
                // Xử lý lỗi
                uploadedFile.setProcessingStatus(UploadedFile.ProcessingStatus.FAILED);
                uploadedFile.setErrorMessage(result.getErrorMessage());
                uploadedFileRepository.save(uploadedFile);

                log.error("Xử lý hợp đồng thất bại: {}", result.getErrorMessage());
            }

        } catch (Exception e) {
            log.error("Lỗi khi xử lý kết quả xử lý hợp đồng: {}", e.getMessage(), e);
        }
    }

    private Contract createOrUpdateContract(UploadedFile uploadedFile, ContractProcessingResult result) {
        // Tạo hợp đồng mới
        Contract contract = new Contract();
        contract.setContractNumber("CONTRACT-" + System.currentTimeMillis());
        contract.setTitle(uploadedFile.getOriginalFilename());
        contract.setStatus(Contract.ContractStatus.DRAFT);
        contract.setSummary(result.getSummary());
        contract.setContractType(result.getContractType());
        contract.setRiskLevel(result.getRiskLevel());
        contract.setKeyTerms(result.getKeyTerms());
        contract.setAiProcessed(true);
        contract.setProcessingStatus(Contract.ProcessingStatus.COMPLETED);

        contract = contractRepository.save(contract);
        
        // Publish event
        ContractEventPayload eventPayload = new ContractEventPayload(contract, "CONTRACT_CREATED");
        contractEventPublisher.publishEvent(eventPayload);
        
        return contract;
    }
}
