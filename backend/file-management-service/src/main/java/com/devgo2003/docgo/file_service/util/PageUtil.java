package com.devgo2003.docgo.file_service.util;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;

/**
 * Utility class for pagination operations
 */
public class PageUtil {

    /**
     * Convert List to Page with pagination parameters
     */
    public static <T> Page<T> createPageFromList(List<T> list, int pageNumber, int pageSize, String sortBy, String sortDirection) {
        if (list == null || list.isEmpty()) {
            return Page.empty();
        }

        // Create sort
        Sort sort = createSort(sortBy, sortDirection);
        
        // Create pageable
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        
        // Calculate pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), list.size());
        
        // Get sublist
        List<T> pageContent = list.subList(start, end);
        
        // Create page
        return new PageImpl<>(pageContent, pageable, list.size());
    }

    /**
     * Create Sort object from sort parameters
     */
    private static Sort createSort(String sortBy, String sortDirection) {
        if (sortBy == null || sortBy.trim().isEmpty()) {
            return Sort.unsorted();
        }
        
        Sort.Direction direction = Sort.Direction.ASC;
        if (sortDirection != null && sortDirection.equalsIgnoreCase("desc")) {
            direction = Sort.Direction.DESC;
        }
        
        return Sort.by(direction, sortBy);
    }

    /**
     * Convert List to Page without sorting (for simple cases)
     */
    public static <T> Page<T> createPageFromList(List<T> list, int pageNumber, int pageSize) {
        return createPageFromList(list, pageNumber, pageSize, null, null);
    }
}
