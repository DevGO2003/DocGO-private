package com.devgo2003.docgo.repository_service.service.mapper;

import com.devgo2003.docgo.repository_service.dto.FullFileResponseDto;
import com.devgo2003.docgo.repository_service.dto.OverviewDto;
import com.devgo2003.docgo.repository_service.entity.FileEntity;

import java.util.Map;

/**
 * IFileMapper - File Mapping Interface
 * 
 * Strategy: Clean separation of concerns
 * - Interface defines contract
 * - Implementation handles complex mapping logic
 * - Easy to test and extend
 */
public interface IFileMapper {
    
    /**
     * Map FileEntity to FullFileResponseDto
     * @param entity FileEntity from database
     * @return FullFileResponseDto for API response
     */
    FullFileResponseDto toFullResponseDto(FileEntity entity);
    
    /**
     * Map overview section to OverviewDto
     * @param map Raw overview data
     * @return Typed OverviewDto
     */
    OverviewDto mapOverview(Map<String, Object> map);
}
