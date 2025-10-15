package com.devgo2003.docgo.file_service.service;

import com.devgo2003.docgo.file_service.dto.ContractDetailDto;
import com.devgo2003.docgo.file_service.dto.ContractDetailResponseDto;
import com.devgo2003.docgo.file_service.dto.ContractResponseDto;
import com.devgo2003.docgo.file_service.dto.ContractWithSummaryDto;
import com.devgo2003.docgo.file_service.entity.Contract;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Interface cho ContractQueryService
 * Cung cấp các method query và search cho contracts
 */
public interface IContractQueryService {

    /**
     * Lấy tất cả contracts với pagination và sorting
     * @param pageNumber Số trang
     * @param pageSize Kích thước trang
     * @param sortBy Danh sách trường sắp xếp
     * @param sortDirection Danh sách hướng sắp xếp
     * @param includeDeleted Bao gồm contracts đã xóa
     * @return Page ContractWithSummaryDto
     */
    Page<ContractWithSummaryDto> getAllContracts(int pageNumber, int pageSize, List<String> sortBy, List<String> sortDirection, boolean includeDeleted);

    /**
     * Lấy tất cả contracts cơ bản với pagination
     * @param pageNumber Số trang
     * @param pageSize Kích thước trang
     * @param sortBy Danh sách trường sắp xếp
     * @param sortDirection Danh sách hướng sắp xếp
     * @param searchTerm Từ khóa tìm kiếm
     * @param includeDeleted Bao gồm contracts đã xóa
     * @return Page Contract
     */
    Page<Contract> getAllContractsBasic(int pageNumber, int pageSize, List<String> sortBy, List<String> sortDirection, String searchTerm, boolean includeDeleted);

    /**
     * Lấy tất cả contracts với summary
     * @param pageNumber Số trang
     * @param pageSize Kích thước trang
     * @param sortBy Danh sách trường sắp xếp
     * @param sortDirection Danh sách hướng sắp xếp
     * @param searchTerm Từ khóa tìm kiếm
     * @param includeDeleted Bao gồm contracts đã xóa
     * @return Page ContractWithSummaryDto
     */
    Page<ContractWithSummaryDto> getAllContractsWithSummary(int pageNumber, int pageSize, List<String> sortBy, List<String> sortDirection, String searchTerm, boolean includeDeleted);

    /**
     * Lấy tất cả contracts với details
     * @param pageNumber Số trang
     * @param pageSize Kích thước trang
     * @param sortBy Danh sách trường sắp xếp
     * @param sortDirection Danh sách hướng sắp xếp
     * @param searchTerm Từ khóa tìm kiếm
     * @param includeDeleted Bao gồm contracts đã xóa
     * @return Page ContractDetailDto
     */
    Page<ContractDetailDto> getAllContractsWithDetails(int pageNumber, int pageSize, List<String> sortBy, List<String> sortDirection, String searchTerm, boolean includeDeleted);

    /**
     * Lấy tất cả contracts với format mới
     * @param pageNumber Số trang
     * @param pageSize Kích thước trang
     * @param sortBy Danh sách trường sắp xếp
     * @param sortDirection Danh sách hướng sắp xếp
     * @param searchTerm Từ khóa tìm kiếm
     * @param includeDeleted Bao gồm contracts đã xóa
     * @return Page ContractResponseDto
     */
    Page<ContractResponseDto> getAllContractsWithNewFormat(int pageNumber, int pageSize, List<String> sortBy, List<String> sortDirection, String searchTerm, boolean includeDeleted);

    /**
     * Lấy tất cả contracts với detail format
     * @param pageNumber Số trang
     * @param pageSize Kích thước trang
     * @param sortBy Danh sách trường sắp xếp
     * @param sortDirection Danh sách hướng sắp xếp
     * @param searchTerm Từ khóa tìm kiếm
     * @param includeDeleted Bao gồm contracts đã xóa
     * @return Page ContractDetailResponseDto
     */
    Page<ContractDetailResponseDto> getAllContractsWithDetailFormat(int pageNumber, int pageSize, List<String> sortBy, List<String> sortDirection, String searchTerm, boolean includeDeleted);

    /**
     * Lấy contracts theo trạng thái
     * @param status Trạng thái contract
     * @return List Contract
     */
    List<Contract> getContractsByStatus(String status);

    /**
     * Lấy contracts đang hoạt động
     * @return List Contract
     */
    List<Contract> getActiveContracts();

    /**
     * Lấy contract với summary
     * @param id ID của contract
     * @return ContractWithSummaryDto
     */
    ContractWithSummaryDto getContractWithSummary(String id);

    /**
     * Lấy contract với details
     * @param id ID của contract
     * @return ContractDetailDto
     */
    ContractDetailDto getContractWithDetails(String id);

    /**
     * Lấy contract với format mới
     * @param id ID của contract
     * @return ContractResponseDto
     */
    ContractResponseDto getContractWithNewFormat(String id);

    /**
     * Lấy contract với detail format
     * @param id ID của contract
     * @return ContractDetailResponseDto
     */
    ContractDetailResponseDto getContractWithDetailFormat(String id);

    /**
     * Kiểm tra contract number có tồn tại không
     * @param contractNumber Số contract
     * @return true nếu tồn tại, false nếu không
     */
    boolean existsByContractNumber(String contractNumber);

    /**
     * Kiểm tra system ID có tồn tại không
     * @param systemId System ID
     * @return true nếu tồn tại, false nếu không
     */
    boolean existsBySystemId(String systemId);
}
