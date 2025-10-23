package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum AWS S3 Region - LENIENT MODE
 * Default: US_EAST_1 (AWS default region)
 */
@Getter
public enum S3Region {
    US_EAST_1("us-east-1", "US East (N. Virginia)"),
    US_EAST_2("us-east-2", "US East (Ohio)"),
    US_WEST_1("us-west-1", "US West (N. California)"),
    US_WEST_2("us-west-2", "US West (Oregon)"),
    EU_WEST_1("eu-west-1", "Europe (Ireland)"),
    EU_CENTRAL_1("eu-central-1", "Europe (Frankfurt)"),
    AP_SOUTHEAST_1("ap-southeast-1", "Asia Pacific (Singapore)"),
    AP_SOUTHEAST_2("ap-southeast-2", "Asia Pacific (Sydney)"),
    AP_NORTHEAST_1("ap-northeast-1", "Asia Pacific (Tokyo)"),
    AP_NORTHEAST_2("ap-northeast-2", "Asia Pacific (Seoul)"),
    AP_SOUTH_1("ap-south-1", "Asia Pacific (Mumbai)"),
    SA_EAST_1("sa-east-1", "South America (São Paulo)"),
    CA_CENTRAL_1("ca-central-1", "Canada (Central)"),
    ME_SOUTH_1("me-south-1", "Middle East (Bahrain)"),
    AF_SOUTH_1("af-south-1", "Africa (Cape Town)"),
    UNKNOWN("unknown", "Unknown Region");

    private final String regionCode;
    private final String displayName;

    S3Region(String regionCode, String displayName) {
        this.regionCode = regionCode;
        this.displayName = displayName;
    }

    public static S3Region fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return US_EAST_1;
        }
        
        try {
            return S3Region.valueOf(value.trim().toUpperCase().replace("-", "_"));
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid S3 region '" + value + "', returning US_EAST_1");
            return US_EAST_1;
        }
    }
}
