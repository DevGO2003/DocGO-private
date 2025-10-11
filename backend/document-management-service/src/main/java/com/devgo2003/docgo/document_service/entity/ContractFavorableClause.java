package com.devgo2003.docgo.document_service.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Embedded entity cho điều khoản có lợi trong ContractSummary
 */
@Getter
@Setter
public class ContractFavorableClause {

    @Field("clause_name")
    @NotBlank(message = "Tên điều khoản có lợi không được để trống")
    @Size(max = 200, message = "Tên điều khoản có lợi không được vượt quá 200 ký tự")
    private String clauseName;

    @Field("description")
    @NotBlank(message = "Mô tả điều khoản có lợi không được để trống")
    @Size(max = 1000, message = "Mô tả điều khoản có lợi không được vượt quá 1000 ký tự")
    private String description;

    @Field("benefit_to")
    @Size(max = 100, message = "Có lợi cho không được vượt quá 100 ký tự")
    private String benefitTo;
}