package com.devgo2003.docgo.file_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class S3Info {
    private String url;
    private String bucket;
    private String objectKey;
    private String region;
    private String contentType;
    private Long size;
    private String versionId;
    private ChecksumInfo checksum;
    private String type;
    
    // 🆕 NEW FIELDS
    private S3Encryption encryption;      // 🆕 NEW NESTED OBJECT
    private S3Lifecycle lifecycle;        // 🆕 NEW NESTED OBJECT
    private S3Replication replication;   // 🆕 NEW NESTED OBJECT
}
