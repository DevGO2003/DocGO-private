package com.devgo2003.docgo.file_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OcrInfo {
    private String text;
    private String status;
}
