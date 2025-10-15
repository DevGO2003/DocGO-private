package com.devgo2003.docgo.file_service.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContractMetadata {
    private LocalDateTime effectiveDate;
    private LocalDateTime expiryDate;
    private Double totalValue;
    private String currency;
}


