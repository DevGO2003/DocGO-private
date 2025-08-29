package com.devgo2003.docgo.contract_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "contract_parties")
@Getter
@Setter
public class ContractParty extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "party_name")
    private String partyName;

    @Column(name = "party_role")
    private String partyRole;

    @Column(name = "representative")
    private String representative;

    @Column(name = "tax_code")
    private String taxCode;

    @Column(name = "contact_info")
    private String contactInfo;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "business_license")
    private String businessLicense;

    @Enumerated(EnumType.STRING)
    @Column(name = "party_type")
    private PartyType partyType;

    @Column(name = "is_primary")
    private Boolean isPrimary;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationship with Contract
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", insertable = false, updatable = false)
    private Contract contract;

    public enum PartyType {
        INDIVIDUAL,
        ORGANIZATION
    }
}
