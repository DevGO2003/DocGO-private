package com.devgo2003.docgo.file_service.api;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public class ApiDocument {
  public String id;
  public Overview overview;
  public Contract contract;
  public Content content;
  public FileMinimal file;
  public Storage storage;
  public Versioning versioning;
  public Metadata metadata;
  public Audit audit;

  public static class Overview {
    public String title;
    public String status;
    public String documentType;
    public String contractType;
    public String category;
    public List<String> tags;
    public String ownerUserId;
    public boolean isNew;
  }

  public static class Contract {
    public OffsetDateTime effectiveDate;
    public OffsetDateTime expiryDate;
    public BigDecimal totalValue;
    public String currency;
    public String summary;
    public List<Party> parties;
    public Payment payment;
    public Clauses clauses;
    public List<Reminder> reminders;
    public Risk risk;
    public Compliance compliance;
  }

  public static class Party {
    public String name;
    public String role;
    public String representative;
    public String taxCode;
    public String contact;
    public String address;
  }

  public static class Payment {
    public BigDecimal totalValue;
    public String currency;
    public String schedule;
    public String method;
  }

  public static class ClauseKey {
    public String name;
    public String description;
    public String importance;
    public String risk;
  }

  public static class Clauses {
    public List<ClauseKey> key;
    public List<String> unfavorable;
  }

  public static class Reminder {
    public OffsetDateTime date;
    public String title;
    public String description;
  }

  public static class Risk {
    public String level;
    public List<String> factors;
    public List<String> mitigations;
  }

  public static class Compliance {
    public String status;
    public List<String> issues;
    public List<String> recommendations;
  }

  public static class Ocr {
    public String text;
    public String status;
  }

  public static class Processing {
    public String status;
    public String error;
  }

  public static class Content {
    public String plaintext;
    public Ocr ocr;
    public Object classification;
    public Processing processing;
  }

  public static class FileMinimal {
    public String id;
    public String name;
    public String type;
    public Integer size;
    public Integer version;
  }

  public static class Checksum {
    public String originalMD5;
    public String archiveMD5;
  }

  public static class StorageS3 {
    public String url;
    public String bucket;
    public String objectKey;
    public String region;
    public String contentType;
    public Integer size;
    public String versionId;
    public Checksum checksum;
  }

  public static class StorageLocal {
    public String path;
    public String filename;
    public String mimeType;
    public Integer size;
    public OffsetDateTime mtime;
    public String revision;
  }

  public static class Storage {
    public StorageS3 s3;
    public StorageLocal local;
  }

  public static class VersionHistoryItem {
    public Integer version;
    public String versionTag;
    public OffsetDateTime changedAt;
    public String changedBy;
    public String changeType;
    public Map<String, Map<String, String>> storage;
  }

  public static class Versioning {
    public Integer currentVersion;
    public String versionTag;
    public Integer previousVersion;
    public String changeSummary;
    public List<String> changedFields;
    public Map<String, Object> diff;
    public List<VersionHistoryItem> history;
  }

  public static class FileSystemMetadata {
    public OffsetDateTime dateModified;
    public OffsetDateTime dateAdded;
    public String mediaFilename;
    public String originalFilename;
    public String originalMD5;
    public Integer originalFileSize;
    public String originalMimeType;
    public String archiveMD5;
    public Integer archiveFileSize;
  }

  public static class Metadata {
    public FileSystemMetadata fileSystem;
    public Map<String, Object> originalDocument;
    public Map<String, Object> archivedDocument;
  }

  public static class Audit {
    public OffsetDateTime createdAt;
    public String createdBy;
    public OffsetDateTime updatedAt;
    public String updatedBy;
    public OffsetDateTime deletedAt;
    public String deletedBy;
    public boolean isDeleted;
    public Integer version;
  }
}



