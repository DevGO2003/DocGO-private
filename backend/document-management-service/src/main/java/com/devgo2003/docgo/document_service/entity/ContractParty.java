package com.devgo2003.docgo.document_service.entity;

import lombok.Getter;
import lombok.Setter;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * Entity cho thông tin các bên trong hợp đồng
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "contract_parties")
public class ContractParty {

    @Id
    private String id;

    @Field("contract_id")
    @NotBlank(message = "Contract ID không được để trống")
    private String contractId;

    @Field("party_name")
    @NotBlank(message = "Tên bên không được để trống")
    @Size(max = 200, message = "Tên bên không được vượt quá 200 ký tự")
    private String partyName;

    @Field("party_type")
    @NotBlank(message = "Loại bên không được để trống")
    @Size(max = 50, message = "Loại bên không được vượt quá 50 ký tự")
    private String partyType;

    @Field("contact_person")
    @Size(max = 200, message = "Người liên hệ không được vượt quá 200 ký tự")
    private String contactPerson;

    @Field("phone")
    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    private String phone;

    @Field("email")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    private String email;

    @Field("tax_code")
    @Size(max = 20, message = "Mã số thuế không được vượt quá 20 ký tự")
    private String taxCode;

    @Field("address")
    @Size(max = 500, message = "Địa chỉ không được vượt quá 500 ký tự")
    private String address;

    @Field("business_license")
    @Size(max = 50, message = "Giấy phép kinh doanh không được vượt quá 50 ký tự")
    private String businessLicense;

    @Field("is_primary")
    private Boolean isPrimary = false;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    // Additional fields for backward compatibility
    @Field("role")
    @Size(max = 100, message = "Vai trò không được vượt quá 100 ký tự")
    private String role;

    @Field("name")
    @Size(max = 200, message = "Tên không được vượt quá 200 ký tự")
    private String name;

    @Field("representative")
    @Size(max = 200, message = "Người đại diện không được vượt quá 200 ký tự")
    private String representative;

    @Field("contact")
    @Size(max = 500, message = "Thông tin liên hệ không được vượt quá 500 ký tự")
    private String contact;

    @Field("tax_id")
    @Size(max = 20, message = "Mã số thuế không được vượt quá 20 ký tự")
    private String taxId;

    @Field("registration_number")
    @Size(max = 50, message = "Số đăng ký không được vượt quá 50 ký tự")
    private String registrationNumber;

    @Field("bank_account")
    @Size(max = 50, message = "Số tài khoản ngân hàng không được vượt quá 50 ký tự")
    private String bankAccount;

    @Field("bank_name")
    @Size(max = 200, message = "Tên ngân hàng không được vượt quá 200 ký tự")
    private String bankName;

    @Field("swift_code")
    @Size(max = 20, message = "Mã SWIFT không được vượt quá 20 ký tự")
    private String swiftCode;

    @Field("iban")
    @Size(max = 50, message = "Mã IBAN không được vượt quá 50 ký tự")
    private String iban;

    @Field("website")
    @Size(max = 200, message = "Website không được vượt quá 200 ký tự")
    private String website;

    @Field("industry")
    @Size(max = 100, message = "Ngành nghề không được vượt quá 100 ký tự")
    private String industry;

    @Field("notes")
    @Size(max = 1000, message = "Ghi chú không được vượt quá 1000 ký tự")
    private String notes;

    @Field("created_by")
    private String createdBy;

    @Field("updated_by")
    private String updatedBy;

    @Field("is_deleted")
    private Boolean isDeleted = false;
}
