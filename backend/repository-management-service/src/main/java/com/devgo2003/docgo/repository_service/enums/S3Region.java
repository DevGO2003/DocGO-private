package com.devgo2003.docgo.repository_service.enums;

public enum S3Region {
    US_EAST_1("us-east-1"),
    US_WEST_2("us-west-2"),
    EU_WEST_1("eu-west-1"),
    AP_SOUTHEAST_1("ap-southeast-1");

    private final String value;

    S3Region(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
