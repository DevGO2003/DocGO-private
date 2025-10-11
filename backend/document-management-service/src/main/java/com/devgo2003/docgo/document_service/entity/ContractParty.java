package com.devgo2003.docgo.document_service.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Embedded entity cho thông tin các bên trong ContractSummary
 */
@Getter
@Setter
public class ContractParty {

    @Field("role")
    @NotBlank(message = "Vai trò không được để trống")
    @Size(max = 200, message = "Vai trò không được vượt quá 200 ký tự")
    private String role;

    @Field("name")
    @NotBlank(message = "Tên công ty không được để trống")
    @Size(max = 200, message = "Tên công ty không được vượt quá 200 ký tự")
    private String name;

    @Field("representative")
    @Size(max = 200, message = "Người đại diện không được vượt quá 200 ký tự")
    private String representative;

    @Field("tax_code")
    @Size(max = 20, message = "Mã số thuế không được vượt quá 20 ký tự")
    private String taxCode;

    @Field("contact")
    @Size(max = 200, message = "Thông tin liên hệ không được vượt quá 200 ký tự")
    private String contact;

    @Field("address")
    @Size(max = 500, message = "Địa chỉ không được vượt quá 500 ký tự")
    private String address;

    @Field("business_license")
    @Size(max = 50, message = "Giấy phép kinh doanh không được vượt quá 50 ký tự")
    private String businessLicense;
}
