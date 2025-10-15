package com.devgo2003.docgo.file_service.common.handler;

import com.devgo2003.docgo.file_service.common.response.RestResponse;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.time.ZonedDateTime;
import java.util.UUID;

@ControllerAdvice
public class RestResponseAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        // Luôn kiểm tra trong beforeBodyWrite theo kiểu thực tế của body
        return true;
    }

    @Override
    public Object beforeBodyWrite(
            Object body,
            MethodParameter returnType,
            MediaType selectedContentType,
            Class<? extends HttpMessageConverter<?>> selectedConverterType,
            ServerHttpRequest request,
            ServerHttpResponse response) {

        if (body instanceof RestResponse<?> rest) {
            // apiVersion
            if (rest.getApiVersion() == null || rest.getApiVersion().isEmpty()) {
                rest.setApiVersion("v1");
            }
            // timestamp
            if (rest.getTimestamp() == null) {
                rest.setTimestamp(ZonedDateTime.now());
            }
            // requestId
            if (rest.getRequestId() == null || rest.getRequestId().isEmpty()) {
                rest.setRequestId(UUID.randomUUID().toString());
            }
            // path
            if (rest.getPath() == null || rest.getPath().isEmpty()) {
                try {
                    if (request instanceof ServletServerHttpRequest servletRequest) {
                        String path = servletRequest.getServletRequest().getRequestURI();
                        rest.setPath(path);
                    }
                } catch (Exception ignored) {
                }
            }
            return rest;
        }
        return body;
    }
}


