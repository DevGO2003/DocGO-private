package com.devgo2003.docgo.file_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Clauses {
    private List<KeyClause> key;
    private List<String> unfavorable;
}
