package com.devgo2003.docgo.repository_service.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import com.devgo2003.docgo.repository_service.service.FileService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = RepositoryController.class)
@org.springframework.test.context.ActiveProfiles("test")
public class FileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean 
    private FileService fileService;

    @Test
    void testEndpoint_shouldReturnSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/repository-management-service/files/test"))
                .andExpect(status().isOk());
    }
}


