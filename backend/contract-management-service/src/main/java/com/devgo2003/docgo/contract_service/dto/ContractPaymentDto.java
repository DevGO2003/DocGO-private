package com.devgo2003.docgo.contract_service.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractPaymentDto {
    private Long id;
    private Long contractId;
    private String paymentType;
    private BigDecimal amount;
    private String currency;
    private String paymentSchedule;
    private LocalDate dueDate;
    private String paymentMethod;
    private Boolean isPaid;
    private LocalDate paymentDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
