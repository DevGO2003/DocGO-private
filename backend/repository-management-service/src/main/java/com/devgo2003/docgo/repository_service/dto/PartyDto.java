package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PartyDto {
    private String id;
    private String name;
    private String type;
    private String role;
    private ContactDto contact;
    private RepresentativeDto representative;
    private String taxCode;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ContactDto {
        private String email;
        private String phone;
        private String address;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class RepresentativeDto {
        private String name;
        private String position;
        private String email;
    }
}

