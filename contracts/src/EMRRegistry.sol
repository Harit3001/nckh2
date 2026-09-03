// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

// =============================================================
//                        INTERFACES
// =============================================================

/// @notice Interface tối thiểu của HealthcareRegistry.
interface IHealthcareRegistryForEMR {
    function isActiveDoctor(address doctor) external view returns (bool);
    function hospitalOf(address doctor) external view returns (bytes32);
}

/// @notice Interface tối thiểu của ConsentRegistry.
interface IConsentRegistry {
    function isAllowed(
        bytes32 phid,
        address grantee,
        uint256 recordId,
        bytes32 recordType,
        uint8 needed
    ) external view returns (bool);
}

// =============================================================
//                         CONTRACT
// =============================================================

/// @title EMRRegistry
/// @notice Sổ cái bệnh án theo mô hình append-only.
///
/// @dev Contract không lưu nội dung bệnh án.
///
///      Dữ liệu thực tế:
///          Encrypt
///             ↓
///          IPFS
///             ↓
///          CID
///
///      Blockchain lưu:
///          - PHID
///          - Record Type
///          - Hospital
///          - Chain Hash
///          - Metadata
///
///      CID và dataHash từng version được phát qua event
///      để Indexer dựng lại lịch sử.
contract EMRRegistry is Initializable, PausableUpgradeable, AccessControlUpgradeable {
    // =============================================================
    //                           ROLES
    // =============================================================

    bytes32 public constant SYSTEM_ADMIN_ROLE = keccak256("SYSTEM_ADMIN_ROLE");

    // =============================================================
    //                        PERMISSIONS
    // =============================================================

    /// @notice Permission APPEND phải khớp ConsentRegistry.
    uint8 public constant PERM_APPEND = 1 << 1;

    // =============================================================
    //                          STRUCTS
    // =============================================================

    /// @notice Metadata của một bệnh án.
    ///
    /// @dev chainHash là hash tích lũy
    ///      của toàn bộ các version.
    struct Record {
        bytes32 phid;
        bytes32 recordType;
        bytes32 hospitalCode;
        /// @notice Hash tích lũy của lịch sử version.
        bytes32 chainHash;
        /// @notice Bác sĩ tạo Record đầu tiên.
        address createdBy;
        /// @notice Thời điểm tạo.
        uint64 createdAt;
        /// @notice Tổng số phiên bản.
        uint32 versionCount;
    }

    // =============================================================
    //                          STORAGE
    // =============================================================

    IHealthcareRegistryForEMR public registry;
    IConsentRegistry public consent;

    /// @notice recordId => Record
    mapping(uint256 => Record) public records;

    /// @notice ID của record tiếp theo.
    uint256 public nextRecordId;

    // =============================================================
    //                           EVENTS
    // =============================================================

    /// @notice Event tạo bệnh án đầu tiên.
    ///
    /// @dev dataHash và CID không được lưu
    ///      trong Record storage.
    event RecordCreated(
        uint256 indexed recordId,
        bytes32 indexed phid,
        address indexed doctor,
        bytes32 recordType,
        bytes32 dataHash,
        bytes cid,
        uint64 timestamp
    );

    /// @notice Event thêm phiên bản mới.
    event RecordAppended(
        uint256 indexed recordId,
        address indexed doctor,
        uint32 version,
        bytes32 dataHash,
        bytes cid,
        bytes32 chainHash,
        uint64 timestamp
    );

    event HealthcareRegistryUpdated(address indexed oldRegistry, address indexed newRegistry);
    event ConsentRegistryUpdated(address indexed oldConsent, address indexed newConsent);

    // =============================================================
    //                        INITIALIZER
    // =============================================================

    function initialize(address healthcareRegistry, address consentRegistry, address systemAdmin) external initializer {
        require(healthcareRegistry != address(0), "invalid healthcare registry");
        require(consentRegistry != address(0), "invalid consent registry");
        require(systemAdmin != address(0), "invalid admin");

        __Pausable_init();
        __AccessControl_init();

        registry = IHealthcareRegistryForEMR(healthcareRegistry);
        consent = IConsentRegistry(consentRegistry);

        _grantRole(DEFAULT_ADMIN_ROLE, systemAdmin);
        _grantRole(SYSTEM_ADMIN_ROLE, systemAdmin);
    }

    // =============================================================
    //                       CREATE RECORD
    // =============================================================

    /// @notice Tạo bệnh án mới.
    ///
    /// @dev Theo kiến trúc hiện tại:
    ///
    ///      1. Bác sĩ phải Active.
    ///      2. dataHash không được rỗng.
    ///      3. CID được đưa vào event.
    ///      4. chainHash ban đầu = dataHash.
    ///
    /// Lưu ý:
    /// createRecord() trong tài liệu không kiểm tra
    /// ConsentRegistry.
    function createRecord(bytes32 phid, bytes32 recordType, bytes32 dataHash, bytes calldata cid)
        external
        whenNotPaused
        returns (uint256 recordId)
    {
        // ---------------------------------------------------------
        // Validate doctor
        // ---------------------------------------------------------

        require(registry.isActiveDoctor(msg.sender), "not an active doctor");

        // ---------------------------------------------------------
        // Validate PHID
        // ---------------------------------------------------------

        require(phid != bytes32(0), "invalid phid");

        // ---------------------------------------------------------
        // Validate record type
        // ---------------------------------------------------------

        require(recordType != bytes32(0), "invalid record type");

        // ---------------------------------------------------------
        // Validate data hash
        // ---------------------------------------------------------

        require(dataHash != bytes32(0), "empty hash");

        // ---------------------------------------------------------
        // Create ID
        // ---------------------------------------------------------

        recordId = ++nextRecordId;

        // ---------------------------------------------------------
        // Save record
        // ---------------------------------------------------------

        records[recordId] = Record({
            phid: phid,
            recordType: recordType,
            hospitalCode: registry.hospitalOf(msg.sender),
            chainHash: dataHash, // Version đầu tiên.
            createdBy: msg.sender,
            createdAt: uint64(block.timestamp),
            versionCount: 1
        });

        // ---------------------------------------------------------
        // Emit history event
        // ---------------------------------------------------------

        emit RecordCreated(recordId, phid, msg.sender, recordType, dataHash, cid, uint64(block.timestamp));
    }

    // =============================================================
    //                       APPEND VERSION
    // =============================================================

    /// @notice Thêm một phiên bản mới vào bệnh án.
    ///
    /// @dev Không có hàm update hoặc delete version.
    ///
    ///      Version 1
    ///          ↓
    ///      Version 2
    ///          ↓
    ///      Version 3
    ///
    /// Chỉ append.
    function appendVersion(uint256 recordId, bytes32 dataHash, bytes calldata cid) external whenNotPaused {
        // ---------------------------------------------------------
        // Load record
        // ---------------------------------------------------------

        Record storage record = records[recordId];

        // ---------------------------------------------------------
        // Validate record exists
        // ---------------------------------------------------------

        require(record.createdAt != 0, "unknown record");

        // ---------------------------------------------------------
        // Validate doctor
        // ---------------------------------------------------------

        require(registry.isActiveDoctor(msg.sender), "not an active doctor");

        // ---------------------------------------------------------
        // Validate data hash
        // ---------------------------------------------------------

        require(dataHash != bytes32(0), "empty hash");

        // ---------------------------------------------------------
        // Check APPEND consent
        // ---------------------------------------------------------

        require(
            consent.isAllowed(record.phid, msg.sender, recordId, record.recordType, PERM_APPEND),
            "no append permission"
        );

        // ---------------------------------------------------------
        // Update chain hash
        // ---------------------------------------------------------
        //
        // Ví dụ:
        //
        // Version 1:
        // H1
        //
        // Version 2:
        // H12 = hash(H1, H2)
        //
        // Version 3:
        // H123 = hash(H12, H3)
        // ---------------------------------------------------------

        record.chainHash = keccak256(abi.encode(record.chainHash, dataHash));

        // ---------------------------------------------------------
        // Increase version
        // ---------------------------------------------------------

        record.versionCount += 1;

        // ---------------------------------------------------------
        // Emit history event
        // ---------------------------------------------------------

        emit RecordAppended(recordId, msg.sender, record.versionCount, dataHash, cid, record.chainHash, uint64(block.timestamp));
    }

    // =============================================================
    //                      VERIFY CHAIN
    // =============================================================

    /// @notice Xác minh toàn vẹn lịch sử bệnh án.
    ///
    /// @dev Client/Indexer cung cấp danh sách dataHash:
    ///
    ///      [H1, H2, H3, ...]
    ///
    /// Contract tính lại chainHash:
    ///
    ///      H1
    ///       ↓
    ///      hash(H1, H2)
    ///       ↓
    ///      hash(H12, H3)
    ///
    /// Sau đó so sánh với chainHash lưu on-chain.
    ///
    /// @dev Đáp ứng yêu cầu FR-BC-02 trong tài liệu.
    function verifyChain(uint256 recordId, bytes32[] calldata versionHashes) external view returns (bool) {
        Record storage record = records[recordId];

        // ---------------------------------------------------------
        // Record must exist
        // ---------------------------------------------------------

        if (record.createdAt == 0) {
            return false;
        }

        // ---------------------------------------------------------
        // Empty array is invalid
        // ---------------------------------------------------------

        if (versionHashes.length == 0) {
            return false;
        }

        // ---------------------------------------------------------
        // Version count must match
        // ---------------------------------------------------------

        if (versionHashes.length != record.versionCount) {
            return false;
        }

        // ---------------------------------------------------------
        // Calculate accumulated hash
        // ---------------------------------------------------------

        bytes32 accumulator = versionHashes[0];

        for (uint256 i = 1; i < versionHashes.length; i++) {
            accumulator = keccak256(abi.encode(accumulator, versionHashes[i]));
        }

        // ---------------------------------------------------------
        // Compare final hash
        // ---------------------------------------------------------

        return accumulator == record.chainHash;
    }

    // =============================================================
    //                        VIEW FUNCTIONS
    // =============================================================

    /// @notice Kiểm tra Record có tồn tại không.
    function exists(uint256 recordId) external view returns (bool) {
        return records[recordId].createdAt != 0;
    }

    /// @notice Lấy toàn bộ metadata của Record.
    function getRecord(uint256 recordId)
        external
        view
        returns (
            bytes32 phid,
            bytes32 recordType,
            bytes32 hospitalCode,
            bytes32 chainHash,
            address createdBy,
            uint64 createdAt,
            uint32 versionCount
        )
    {
        Record storage record = records[recordId];

        return (
            record.phid,
            record.recordType,
            record.hospitalCode,
            record.chainHash,
            record.createdBy,
            record.createdAt,
            record.versionCount
        );
    }

    // =============================================================
    //                       ADMIN FUNCTIONS
    // =============================================================

    function pause() external onlyRole(SYSTEM_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(SYSTEM_ADMIN_ROLE) {
        _unpause();
    }

    /// @notice Cập nhật HealthcareRegistry.
    function setHealthcareRegistry(address newRegistry) external onlyRole(SYSTEM_ADMIN_ROLE) {
        require(newRegistry != address(0), "invalid registry");

        address oldRegistry = address(registry);
        registry = IHealthcareRegistryForEMR(newRegistry);

        emit HealthcareRegistryUpdated(oldRegistry, newRegistry);
    }

    /// @notice Cập nhật ConsentRegistry.
    function setConsentRegistry(address newConsent) external onlyRole(SYSTEM_ADMIN_ROLE) {
        require(newConsent != address(0), "invalid consent registry");

        address oldConsent = address(consent);
        consent = IConsentRegistry(newConsent);

        emit ConsentRegistryUpdated(oldConsent, newConsent);
    }
}