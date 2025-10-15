package com.devgo2003.docgo.file_service.dto;

import com.devgo2003.docgo.file_service.enums.ContractCategory;
import com.devgo2003.docgo.file_service.enums.ContractStatus;
import com.devgo2003.docgo.file_service.enums.ContractType;
 

import java.util.List;

/**
 * DTO cho response của Category API
 */
public class CategoryResponse {
    
    private List<CategoryItem> categories;
    
    private List<String> mainCategories;
    
    private int totalCount;
    
    public CategoryResponse() {}
    
    public CategoryResponse(List<CategoryItem> categories, List<String> mainCategories, int totalCount) {
        this.categories = categories;
        this.mainCategories = mainCategories;
        this.totalCount = totalCount;
    }
    
    // Getters and Setters
    public List<CategoryItem> getCategories() {
        return categories;
    }
    
    public void setCategories(List<CategoryItem> categories) {
        this.categories = categories;
    }
    
    public List<String> getMainCategories() {
        return mainCategories;
    }
    
    public void setMainCategories(List<String> mainCategories) {
        this.mainCategories = mainCategories;
    }
    
    public int getTotalCount() {
        return totalCount;
    }
    
    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }
    
    /**
     * Inner class cho Category Item
     */
    public static class CategoryItem {
        
        private String value;
        
        private String displayName;
        
        private String mainCategory;
        
        private String subCategory;
        
        private String specificCategory;
        
        private String description;
        
        public CategoryItem() {}
        
        public CategoryItem(String value, String displayName, String mainCategory, 
                           String subCategory, String specificCategory, String description) {
            this.value = value;
            this.displayName = displayName;
            this.mainCategory = mainCategory;
            this.subCategory = subCategory;
            this.specificCategory = specificCategory;
            this.description = description;
        }
        
        // Getters and Setters
        public String getValue() {
            return value;
        }
        
        public void setValue(String value) {
            this.value = value;
        }
        
        public String getDisplayName() {
            return displayName;
        }
        
        public void setDisplayName(String displayName) {
            this.displayName = displayName;
        }
        
        public String getMainCategory() {
            return mainCategory;
        }
        
        public void setMainCategory(String mainCategory) {
            this.mainCategory = mainCategory;
        }
        
        public String getSubCategory() {
            return subCategory;
        }
        
        public void setSubCategory(String subCategory) {
            this.subCategory = subCategory;
        }
        
        public String getSpecificCategory() {
            return specificCategory;
        }
        
        public void setSpecificCategory(String specificCategory) {
            this.specificCategory = specificCategory;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
        
        /**
         * Tạo CategoryItem từ ContractCategory
         */
        public static CategoryItem fromContractCategory(ContractCategory category) {
            return new CategoryItem(
                category.name(),
                category.getDisplayName(),
                category.getMainCategory(),
                category.getSubCategory(),
                category.getSpecificCategory(),
                category.getDisplayName()
            );
        }
    }
    
    /**
     * DTO cho Status Response
     */
    public static class StatusResponse {
        
        private List<StatusItem> statuses;
        
        private int totalCount;
        
        public StatusResponse() {}
        
        public StatusResponse(List<StatusItem> statuses, int totalCount) {
            this.statuses = statuses;
            this.totalCount = totalCount;
        }
        
        // Getters and Setters
        public List<StatusItem> getStatuses() {
            return statuses;
        }
        
        public void setStatuses(List<StatusItem> statuses) {
            this.statuses = statuses;
        }
        
        public int getTotalCount() {
            return totalCount;
        }
        
        public void setTotalCount(int totalCount) {
            this.totalCount = totalCount;
        }
        
        /**
         * Inner class cho Status Item
         */
        public static class StatusItem {
            
            private String value;
            
            private String displayName;
            
            private String description;
            
            private boolean editable;
            
            private boolean active;
            
            private boolean finalStatus;
            
            public StatusItem() {}
            
            public StatusItem(String value, String displayName, String description, 
                             boolean editable, boolean active, boolean finalStatus) {
                this.value = value;
                this.displayName = displayName;
                this.description = description;
                this.editable = editable;
                this.active = active;
                this.finalStatus = finalStatus;
            }
            
            // Getters and Setters
            public String getValue() {
                return value;
            }
            
            public void setValue(String value) {
                this.value = value;
            }
            
            public String getDisplayName() {
                return displayName;
            }
            
            public void setDisplayName(String displayName) {
                this.displayName = displayName;
            }
            
            public String getDescription() {
                return description;
            }
            
            public void setDescription(String description) {
                this.description = description;
            }
            
            public boolean isEditable() {
                return editable;
            }
            
            public void setEditable(boolean editable) {
                this.editable = editable;
            }
            
            public boolean isActive() {
                return active;
            }
            
            public void setActive(boolean active) {
                this.active = active;
            }
            
            public boolean isFinalStatus() {
                return finalStatus;
            }
            
            public void setFinalStatus(boolean finalStatus) {
                this.finalStatus = finalStatus;
            }
            
            /**
             * Tạo StatusItem từ ContractStatus
             */
            public static StatusItem fromContractStatus(ContractStatus status) {
                return new StatusItem(
                    status.getValue(),
                    status.getDisplayName(),
                    status.getDescription(),
                    status.isEditable(),
                    status.isActive(),
                    status.isFinal()
                );
            }
        }
    }
    
    /**
     * DTO cho Type Response
     */
    public static class TypeResponse {
        
        private List<TypeItem> types;
        
        private List<String> groups;
        
        private int totalCount;
        
        public TypeResponse() {}
        
        public TypeResponse(List<TypeItem> types, List<String> groups, int totalCount) {
            this.types = types;
            this.groups = groups;
            this.totalCount = totalCount;
        }
        
        // Getters and Setters
        public List<TypeItem> getTypes() {
            return types;
        }
        
        public void setTypes(List<TypeItem> types) {
            this.types = types;
        }
        
        public List<String> getGroups() {
            return groups;
        }
        
        public void setGroups(List<String> groups) {
            this.groups = groups;
        }
        
        public int getTotalCount() {
            return totalCount;
        }
        
        public void setTotalCount(int totalCount) {
            this.totalCount = totalCount;
        }
        
        /**
         * Inner class cho Type Item
         */
        public static class TypeItem {
            
            private String value;
            
            private String displayName;
            
            private String description;
            
            private String group;
            
            public TypeItem() {}
            
            public TypeItem(String value, String displayName, String description, String group) {
                this.value = value;
                this.displayName = displayName;
                this.description = description;
                this.group = group;
            }
            
            // Getters and Setters
            public String getValue() {
                return value;
            }
            
            public void setValue(String value) {
                this.value = value;
            }
            
            public String getDisplayName() {
                return displayName;
            }
            
            public void setDisplayName(String displayName) {
                this.displayName = displayName;
            }
            
            public String getDescription() {
                return description;
            }
            
            public void setDescription(String description) {
                this.description = description;
            }
            
            public String getGroup() {
                return group;
            }
            
            public void setGroup(String group) {
                this.group = group;
            }
            
            /**
             * Tạo TypeItem từ ContractType
             */
            public static TypeItem fromContractType(ContractType type) {
                return new TypeItem(
                    type.getValue(),
                    type.getDisplayName(),
                    type.getDescription(),
                    type.getGroup()
                );
            }
        }
    }
}

