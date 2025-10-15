package com.devgo2003.docgo.file_service.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Embedded entity cho thông tin thanh toán trong ContractSummary
 */
@Getter
@Setter
public class ContractPaymentDetails {

    @Field("total_value")
    @NotNull(message = "Tổng giá trị không được để trống")
    @Pattern(regexp = "^[0-9]+(\\.[0-9]{1,2})?$", message = "Tổng giá trị phải là số dương với tối đa 2 chữ số thập phân")
    private String totalValue;

    @Field("schedule")
    @Size(max = 500, message = "Lịch thanh toán không được vượt quá 500 ký tự")
    private String schedule;

    @Field("currency")
    @Pattern(regexp = "^[A-Z]{3}$", message = "Mã tiền tệ phải là 3 ký tự chữ hoa")
    private String currency;

    @Field("payment_method")
    @Size(max = 100, message = "Phương thức thanh toán không được vượt quá 100 ký tự")
    private String paymentMethod;
}
