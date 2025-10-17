package com.devgo2003.docgo.file_service.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import com.devgo2003.docgo.file_service.controller.ContractController;
import com.devgo2003.docgo.file_service.controller.FileController;
import com.devgo2003.docgo.file_service.script.ContractTypeMigrationScript;
import com.devgo2003.docgo.file_service.script.SampleDataSeeder;
import com.devgo2003.docgo.file_service.script.TagMigrationScript;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.util.StreamUtils;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@WebMvcTest(
        controllers = FileController.class,
        excludeFilters = {
                
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = ContractController.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = ContractTypeMigrationScript.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = SampleDataSeeder.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = TagMigrationScript.class),
                @ComponentScan.Filter(type = FilterType.REGEX, pattern = "com\\.devgo2003\\.docgo\\.file_service\\.service\\..*"),
                @ComponentScan.Filter(type = FilterType.REGEX, pattern = "com\\.devgo2003\\.docgo\\.file_service\\.repository\\..*"),
                @ComponentScan.Filter(type = FilterType.REGEX, pattern = "com\\.devgo2003\\.docgo\\.file_service\\.script\\..*")
        }
)
@org.springframework.test.context.ActiveProfiles("test")
public class DocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private com.devgo2003.docgo.file_service.service.FileStorageService fileStorageService;
    @MockBean private com.devgo2003.docgo.file_service.service.FileService documentService;
    @MockBean private com.devgo2003.docgo.file_service.repository.FileRepository documentRepository;
    @MockBean private com.devgo2003.docgo.file_service.service.ApprovalService approvalService;
    @MockBean private com.devgo2003.docgo.file_service.service.ContractService contractService;
    @MockBean private ContractController contractController;
    @MockBean private ContractTypeMigrationScript contractTypeMigrationScript;
    @MockBean private SampleDataSeeder sampleDataSeeder;
    @MockBean private TagMigrationScript tagMigrationScript;

    @Test
    void getOne_shouldMatchSampleJson_whenIdIsSample() throws Exception {
        String samplePath = "/home/thaigo/DocGO-Private/documents/architecture/api-response-sample.json";
        String expected = Files.readString(Paths.get(samplePath));

        mockMvc.perform(get("/api/v1/file-management-service/files/DOC-2024-004-NEW"))
                .andExpect(status().isOk())
                .andExpect(content().json(expected, true));
    }
}


