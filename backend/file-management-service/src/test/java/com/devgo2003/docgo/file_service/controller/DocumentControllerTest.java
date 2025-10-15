package com.devgo2003.docgo.file_service.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.util.StreamUtils;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@WebMvcTest(controllers = DocumentController.class)
@org.springframework.test.context.ActiveProfiles("test")
public class DocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private com.devgo2003.docgo.file_service.service.FileStorageService fileStorageService;
    @MockBean private com.devgo2003.docgo.file_service.service.DocumentService documentService;
    @MockBean private com.devgo2003.docgo.file_service.repository.DocumentRepository documentRepository;
    @MockBean private com.devgo2003.docgo.file_service.controller.ApprovalController approvalController;

    @Test
    void getOne_shouldMatchSampleJson_whenIdIsSample() throws Exception {
        String samplePath = "/home/thaigo/DocGO-Private/documents/architecture/api-response-sample.json";
        String expected = Files.readString(Paths.get(samplePath));

        mockMvc.perform(get("/api/v1/file-management-service/v1/files/DOC-2024-004-NEW"))
                .andExpect(status().isOk())
                .andExpect(content().json(expected, true));
    }
}


