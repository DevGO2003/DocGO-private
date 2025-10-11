package com.devgo2003.docgo.document_service.util;

import com.devgo2003.docgo.document_service.common.response.PaginatedResponse;
import com.devgo2003.docgo.document_service.common.response.RequestInfo;
import com.devgo2003.docgo.document_service.common.response.ResultInfo;
import org.springframework.data.domain.Page;

import java.util.List;

public class PaginatedResponseUtil {

    public static <T> PaginatedResponse<T> buildPaginatedResponse(Page<T> page, int pageNumber, int pageSize, String searchTerm, String sortBy, String sortDirection) {
        RequestInfo requestInfo = RequestInfo.builder()
            .page(pageNumber)
            .size(pageSize)
            .searchTerm(searchTerm)
            .sortBy(List.of(sortBy))
            .sortDirection(List.of(sortDirection))
            .build();

        ResultInfo resultInfo = ResultInfo.builder()
            .page(page.getNumber())
            .size(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .first(page.isFirst())
            .last(page.isLast())
            .numberOfElements(page.getNumberOfElements())
            .empty(page.isEmpty())
            .build();

        return PaginatedResponse.<T>builder()
            .request(requestInfo)
            .result(resultInfo)
            .content(page.getContent())
            .build();
    }
}
