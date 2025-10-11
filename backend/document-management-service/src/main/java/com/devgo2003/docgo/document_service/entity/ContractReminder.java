package com.devgo2003.docgo.document_service.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Embedded entity cho nhắc nhở trong ContractSummary
 */
@Getter
@Setter
public class ContractReminder {

    @Field("type")
    @NotBlank(message = "Loại nhắc nhở không được để trống")
    @Size(max = 100, message = "Loại nhắc nhở không được vượt quá 100 ký tự")
    private String type;

    @Field("date")
    @Size(max = 50, message = "Ngày nhắc nhở không được vượt quá 50 ký tự")
    private String date;

    @Field("content")
    @NotBlank(message = "Nội dung nhắc nhở không được để trống")
    @Size(max = 500, message = "Nội dung nhắc nhở không được vượt quá 500 ký tự")
    private String content;
}