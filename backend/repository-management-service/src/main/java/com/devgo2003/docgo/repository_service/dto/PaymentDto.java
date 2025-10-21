package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentDto {
    private Double totalValue;
    private String currency;
    private List<ScheduleDto> schedule;
    private String method;
    private String paymentMethod;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ScheduleDto {
        private String milestone;
        private Integer percentage;
        private Double amount;
        private LocalDateTime dueDate;
        private String status;
    }
}

