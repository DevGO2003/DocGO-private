package com.devgo2003.docgo.document_service.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Embedded entity cho điều khoản chính trong ContractSummary
 */
@Getter
@Setter
public class ContractKeyClause {

    @Field("name")
    @NotBlank(message = "Tên điều khoản không được để trống")
    @Size(max = 200, message = "Tên điều khoản không được vượt quá 200 ký tự")
    private String name;

    @Field("description")
    @NotBlank(message = "Mô tả điều khoản không được để trống")
    @Size(max = 1000, message = "Mô tả điều khoản không được vượt quá 1000 ký tự")
    private String description;

    @Field("source")
    @Size(max = 100, message = "Nguồn điều khoản không được vượt quá 100 ký tự")
    private String source;
}
