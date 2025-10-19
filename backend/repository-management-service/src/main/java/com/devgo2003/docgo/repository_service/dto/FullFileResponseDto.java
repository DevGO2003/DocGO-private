package com.devgo2003.docgo.repository_service.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class FullFileResponseDto {
    private String id;
    private Overview overview;
    private Contract contract;
    private Content content;
    private FileInfo file;
    private Storage storage;
    private Versioning versioning;
    private Metadata metadata;
    private Audit audit;
    private Object processing;

    @Data
    @Builder
    public static class Overview {
        private String title;
        private String status;
        private String documentType;
        private String contractType;
        private String category;
        private List<String> tags;
        private String ownerUserId;
        private String language;
        private String region;
        private Boolean isNew;
    }

    @Data
    @Builder
    public static class Contract {
        private LocalDateTime effectiveDate;
        private LocalDateTime expiryDate;
        private Double totalValue;
        private String currency;
        private String summary;
        private String project;
        private String department;
        private String priority;
        private String confidentiality;

        @Data
        @Builder
        public static class Workflow {
            private String currentStage;
            private List<Stage> stages;

            @Data
            @Builder
            public static class Stage {
                private String name;
                private String status;
                private LocalDateTime completedAt;
                private LocalDateTime startedAt;
                private String assignedTo;
            }
        }
        private Workflow workflow;

        @Data
        @Builder
        public static class Party {
            private String id;
            private String name;
            private String type;
            private String role;

            @Data
            @Builder
            public static class Contact {
                private String email;
                private String phone;
                private String address;
            }
            private Contact contact;

            @Data
            @Builder
            public static class Representative {
                private String name;
                private String position;
                private String email;
            }
            private Representative representative;
            private String taxCode;
        }
        private List<Party> parties;

        @Data
        @Builder
        public static class Payment {
            @Data
            @Builder
            public static class Schedule {
                private String milestone;
                private Integer percentage;
                private Double amount;
                private LocalDateTime dueDate;
                private String status;
            }
            private List<Schedule> schedule;
            private String method;
            private String paymentMethod;
        }
        private Payment payment;

        @Data
        @Builder
        public static class Clauses {
            @Data
            @Builder
            public static class KeyClause {
                private String name;
                private String description;
                private String content;
                private String importance;
                private String risk;
                private String advice;
            }
            private List<KeyClause> key;

            @Data
            @Builder
            public static class UnfavorableClause {
                private String name;
                private String description;
                private String content;
                private String risk;
                private String advice;
            }
            private List<UnfavorableClause> unfavorable;
            private String intellectualProperty;
            private String confidentiality;
            private String warranty;
            private String termination;
        }
        private Clauses clauses;

        @Data
        @Builder
        public static class Reminder {
            private String id;
            private String type;
            private String title;
            private String description;
            private String content;
            private LocalDateTime dueDate;
            private String status;
            private String priority;
        }
        private List<Reminder> reminders;

        @Data
        @Builder
        public static class Risk {
            private String riskLevel;

            @Data
            @Builder
            public static class Factor {
                private String type;
                private String description;
                private String content;
                private String probability;
                private String impact;
                private List<Party> riskToParties;
                private List<Party> beneficiaries;
            }
            private List<Factor> factors;

            @Data
            @Builder
            public static class MitigationProposal {
                private String description;
                private String content;
                private String cost;
                private String timeline;
                private String assignedTo;
            }
            private List<MitigationProposal> mitigationProposals;
            private String advice;
        }
        private Risk risk;

        @Data
        @Builder
        public static class Compliance {
            private List<String> regulations;
            private List<String> certifications;
            private LocalDateTime auditSchedule;
            private String complianceStatus;
            private String status;
            private List<String> issues;
            private List<String> recommendations;
        }
        private Compliance compliance;
    }

    @Data
    @Builder
    public static class Content {
        private String extractedText;
        private String summary;
        private List<String> keyTerms;

        @Data
        @Builder
        public static class Section {
            private String title;
            private String description;
            private String content;
            private Integer pageNumber;
        }
        private List<Section> sections;
        private String plaintext;

        @Data
        @Builder
        public static class Ocr {
            private String text;
            private String status;
        }
        private Ocr ocr;

        @Data
        @Builder
        public static class Classification {
            private Boolean isContract;
            private Double confidence;
            private String category;
            private String language;
        }
        private Classification classification;

        @Data
        @Builder
        public static class Processing {
            private String status;
            private String error;
        }
        private Processing processing;
        private Object jsonContent;
        private String jsonAnalysisStatus;
    }

    @Data
    @Builder
    public static class FileInfo {
        private String id;
        private String name;
        private String type;
        private Long size;

        @Data
        @Builder
        public static class Hash {
            private String md5;
            private String sha256;
        }
        private Hash hash;

        @Data
        @Builder
        public static class Permissions {
            private List<String> read;
            private List<String> write;
            private List<String> delete;
            private List<String> share;
        }
        private Permissions permissions;

        @Data
        @Builder
        public static class Security {
            private String encryption;
            private Boolean watermark;
            private Boolean digitalSignature;
            private Boolean accessLogging;
        }
        private Security security;
        private Integer version;
    }

    @Data
    @Builder
    public static class Storage {
        private String location;
        private List<String> backupLocations;

        @Data
        @Builder
        public static class RetentionPolicy {
            private String duration;
            private Boolean autoDelete;
            private String archiveAfter;
        }
        private RetentionPolicy retentionPolicy;

        @Data
        @Builder
        public static class AccessControl {
            private Boolean publicAccess;
            private List<String> restrictedUsers;
            private List<String> ipWhitelist;
        }
        private AccessControl accessControl;

        @Data
        @Builder
        public static class S3 {
            private String url;
            private String bucket;
            private String objectKey;
            private String region;
            private String contentType;
            private Long size;
            private String versionId;

            @Data
            @Builder
            public static class Checksum {
                private String originalMD5;
                private String archiveMD5;
            }
            private Checksum checksum;
        }
        private S3 s3;

        @Data
        @Builder
        public static class Local {
            private String path;
            private String filename;
            private String mimeType;
            private Long size;
            private LocalDateTime mtime;
            private String revision;
        }
        private Local local;
    }

    @Data
    @Builder
    public static class Versioning {
        @Data
        @Builder
        public static class CurrentVersionInfo {
            private String tag;
            private Integer number;
        }
        private CurrentVersionInfo currentVersionInfo;

        @Data
        @Builder
        public static class Version {
            private String version;
            private LocalDateTime createdAt;
            private String createdBy;
            private String changes;
            private String fileId;
        }
        private List<Version> versions;

        @Data
        @Builder
        public static class ChangeLog {
            private String version;
            private LocalDateTime date;
            private String author;
            private String changes;
        }
        private List<ChangeLog> changeLog;
        private String previousVersion;
        private String changeSummary;
        private List<String> changedFields;
        private Map<String, Object> diff;

        @Data
        @Builder
        public static class History {
            private Integer version;
            private String versionTag;
            private LocalDateTime changedAt;
            private String changedBy;
            private String changeType;
            private Storage storage;
        }
        private List<History> history;
    }

    @Data
    @Builder
    public static class Metadata {
        @Data
        @Builder
        public static class FileSystem {
            private LocalDateTime dateModified;
            private LocalDateTime dateAdded;
            private String mediaFilename;
            private String originalFilename;
            private String originalMD5;
            private Long originalFileSize;
            private String originalMimeType;
            private String archiveMD5;
            private Long archiveFileSize;
        }
        private FileSystem fileSystem;

        @Data
        @Builder
        public static class OriginalFile {
            private String dcFormat;
            private String dcTitle;
            private String dcCreator;
            private String dcDescription;
            private String dcSubject;
            private LocalDateTime xmpCreateDate;
            private String xmpCreatorTool;
            private LocalDateTime xmpModifyDate;
            private LocalDateTime xmpMetadataDate;
            private String pdfKeywords;
            private String pdfProducer;
            private String xmpDocumentID;
            private String xmpInstanceID;
            private Integer pdfaidPart;
            private String pdfaidConformance;
        }
        private OriginalFile originalFile;

        @Data
        @Builder
        public static class ArchivedFile {
            private String archivedPdfProducer;
            private LocalDateTime archivedMetadataDate;
            private LocalDateTime archivedModifyDate;
            private LocalDateTime archivedCreateDate;
            private String archivedCreatorTool;
            private String archivedFileID;
            private String archivedFormat;
            private String archivedTitle;
            private String archivedCreator;
            private LocalDateTime archivedXmpMetadataDate;
            private LocalDateTime archivedXmpModifyDate;
            private LocalDateTime archivedXmpCreateDate;
            private String archivedXmpCreatorTool;
            private String archivedXmpMMFileID;
            private Integer archivedPdfaidPart;
            private String archivedPdfaidConformance;
        }
        private ArchivedFile archivedFile;

        @Data
        @Builder
        public static class Technical {
            private String encoding;
            private String lineEnding;
            private Boolean bom;
            private String compression;
            private Integer pages;
            private Integer wordCount;
            private Integer characterCount;
        }
        private Technical technical;
    }

    @Data
    @Builder
    public static class Audit {
        private LocalDateTime createdAt;
        private String createdBy;
        private LocalDateTime lastModifiedAt;
        private String lastModifiedBy;
        private Integer version;

        @Data
        @Builder
        public static class ChangeHistory {
            private String action;
            private LocalDateTime timestamp;
            private String userId;
            private String details;
            private String ipAddress;
            private String userAgent;
        }
        private List<ChangeHistory> changeHistory;

        @Data
        @Builder
        public static class AccessLog {
            private String action;
            private LocalDateTime timestamp;
            private String userId;
            private String ipAddress;
            private String userAgent;
        }
        private List<AccessLog> accessLog;
        private LocalDateTime updatedAt;
        private String updatedBy;
        private LocalDateTime deletedAt;
        private String deletedBy;
        private Boolean isDeleted;
    }
}
