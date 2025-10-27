package com.devgo2003.docgo.backend.user_service.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    
    @Size(min = 1, max = 50, message = "First name phải từ 1-50 ký tự")
    private String firstName;
    
    @Size(min = 1, max = 50, message = "Last name phải từ 1-50 ký tự")
    private String lastName;
    
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @Pattern(regexp = "^\\+?[0-9\\s-()]*$", message = "Số điện thoại không hợp lệ")
    @Size(max = 20, message = "Số điện thoại không được quá 20 ký tự")
    private String phone;
    
    @Size(max = 100, message = "Department không được quá 100 ký tự")
    private String department;
    
    @Size(max = 100, message = "Position không được quá 100 ký tự")
    private String position;
}
