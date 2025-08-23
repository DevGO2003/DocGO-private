package com.devgo2003.docgo.auth_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@RestController
@Tag(name = "Root", description = "Root endpoint và redirect")
public class RootController {

    @Operation(
        summary = "Root endpoint", 
        description = "Tự động redirect sang /docs để hiển thị API documentation"
    )
    @GetMapping("/")
    public void redirectToDocs(HttpServletResponse response) throws IOException {
        response.sendRedirect("/docs");
    }
}
