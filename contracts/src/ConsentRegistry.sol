// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

/// @dev Interface tối thiểu của HealthcareRegistry
interface IHealthcareRegistry {
    function isActiveDoctor(address doctor) external view returns (bool);
    function consentSignerOf(bytes32 phid) external view returns (address);
}

/// @title ConsentRegistry
/// @notice Quản lý sự đồng ý của bệnh nhân.
///
/// @dev Các quyền:
///      READ   = 1
///      APPEND = 2
///
///      Có cả hai:
///      READ | APPEND = 3
contract ConsentRegistry is Initializable, EIP712Upgradeable, PausableUpgradeable, AccessControlUpgradeable {
    // =============================================================
    //                           ROLES
    // =============================================================

    bytes32 public constant SYSTEM_ADMIN_ROLE = keccak256("SYSTEM_ADMIN_ROLE");

    // =============================================================
    //                        PERMISSIONS
    // =============================================================

    uint8 public constant PERM_READ = 1 << 0;
    uint8 public constant PERM_APPEND = 1 << 1;

    // =============================================================
    //                         ENUMS
    // =============================================================

    enum ScopeKind {
        AllRecords,
        ByRecordType,
        SingleRecord
    }

    // =============================================================
    //                         STRUCTS
    // =============================================================

    /// @notice Một quyền truy cập bệnh án.
    ///
    /// @dev expiresAt = 0:
    ///      quyền không có thời hạn.
    ///
    /// @dev revokedAt = 0:
    ///      quyền chưa bị thu hồi.
    struct Grant {
        uint64 grantedAt;
        uint64 expiresAt;
        uint64 revokedAt;
        uint8 permissions;
    }

    // =============================================================
    //                          STORAGE
    // =============================================================

    IHealthcareRegistry public registry;

    /// @notice grantKey => Grant
    mapping(bytes32 => Grant) private _grants;

    /// @notice PHID => nonce
    ///
    /// Dùng để chống replay attack.
    mapping(bytes32 => uint256) public nonces;

    // =============================================================
    //                        EIP-712
    // =============================================================

    bytes32 private constant GRANT_TYPEHASH =
        keccak256(
            "GrantAccess("
            "bytes32 phid,"
            "address grantee,"
            "uint8 scopeKind,"
            "bytes32 scopeRef,"
            "uint8 permissions,"
            "uint64 expiresAt,"
            "uint256 nonce,"
            "uint256 deadline"
            ")"
        );

    // =============================================================
    //                           EVENTS
    // =============================================================

    event AccessGranted(
        bytes32 indexed phid,
        address indexed grantee,
        ScopeKind kind,
        bytes32 scopeRef,
        uint8 permissions,
        uint64 expiresAt
    );

    event AccessRevoked(
        bytes32 indexed phid,
        address indexed grantee,
        ScopeKind kind,
        bytes32 scopeRef,
        uint64 revokedAt
    );

    event RegistryUpdated(address indexed oldRegistry, address indexed newRegistry);

    // =============================================================
    //                        INITIALIZER
    // =============================================================

    function initialize(address healthcareRegistry, address systemAdmin) external initializer {
        require(healthcareRegistry != address(0), "invalid registry");
        require(systemAdmin != address(0), "invalid admin");

        __EIP712_init("ConsentRegistry", "1");
        __Pausable_init();
        __AccessControl_init();

        registry = IHealthcareRegistry(healthcareRegistry);

        _grantRole(DEFAULT_ADMIN_ROLE, systemAdmin);
        _grantRole(SYSTEM_ADMIN_ROLE, systemAdmin);
    }

    // =============================================================
    //                    ACCESS MANAGEMENT
    // =============================================================

    /// @notice Backend chuyển tiếp consent
    ///         mà bệnh nhân đã ký bằng EIP-712.
    ///
    /// @dev Backend có thể là bất kỳ relayer nào.
    ///      Bảo mật nằm ở chữ ký bệnh nhân,
    ///      không nằm ở msg.sender.
    function grantAccessBySig(
        bytes32 phid,
        address grantee,
        ScopeKind kind,
        bytes32 scopeRef,
        uint8 permissions,
        uint64 expiresAt,
        uint256 deadline,
        bytes calldata signature
    ) external whenNotPaused {
        // ---------------------------------------------------------
        // Basic validation
        // ---------------------------------------------------------

        require(phid != bytes32(0), "invalid phid");
        require(grantee != address(0), "invalid grantee");
        require(permissions != 0, "no permission");
        require(_validPermissions(permissions), "invalid permission bits");

        // ---------------------------------------------------------
        // Deadline validation
        // ---------------------------------------------------------

        require(block.timestamp <= deadline, "signature expired");

        // ---------------------------------------------------------
        // Grant expiry validation
        // ---------------------------------------------------------

        require(expiresAt == 0 || expiresAt > block.timestamp, "bad expiry");

        // ---------------------------------------------------------
        // Doctor validation
        // ---------------------------------------------------------

        require(registry.isActiveDoctor(grantee), "grantee not active");

        // ---------------------------------------------------------
        // Nonce
        // ---------------------------------------------------------

        uint256 nonce = nonces[phid]++;

        // ---------------------------------------------------------
        // EIP-712 digest
        // ---------------------------------------------------------

        bytes32 structHash = keccak256(
            abi.encode(
                GRANT_TYPEHASH,
                phid,
                grantee,
                kind,
                scopeRef,
                permissions,
                expiresAt,
                nonce,
                deadline
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);

        // ---------------------------------------------------------
        // Signature verification
        // ---------------------------------------------------------

        address signer = ECDSA.recover(digest, signature);

        require(signer == registry.consentSignerOf(phid), "invalid consent signature");

        // ---------------------------------------------------------
        // Save grant
        // ---------------------------------------------------------

        bytes32 grantKey = _key(phid, grantee, kind, scopeRef);

        _grants[grantKey] = Grant({
            grantedAt: uint64(block.timestamp),
            expiresAt: expiresAt,
            revokedAt: 0,
            permissions: permissions
        });

        emit AccessGranted(phid, grantee, kind, scopeRef, permissions, expiresAt);
    }

    /// @notice Thu hồi quyền truy cập.
    ///
    /// @dev Cố tình KHÔNG có whenNotPaused.
    ///
    /// Lý do:
    /// Hệ thống có thể tạm dừng việc cấp quyền,
    /// nhưng bệnh nhân vẫn phải có khả năng
    /// thu hồi quyền ngay lập tức.
    function revokeAccess(bytes32 phid, address grantee, ScopeKind kind, bytes32 scopeRef) external {
        require(msg.sender == registry.consentSignerOf(phid), "not consent owner");

        bytes32 grantKey = _key(phid, grantee, kind, scopeRef);
        Grant storage grant = _grants[grantKey];

        require(grant.grantedAt != 0 && grant.revokedAt == 0, "no active grant");

        grant.revokedAt = uint64(block.timestamp);

        emit AccessRevoked(phid, grantee, kind, scopeRef, uint64(block.timestamp));
    }

    // =============================================================
    //                     PERMISSION CHECK
    // =============================================================

    /// @notice Hàm quyết định quyền truy cập.
    ///
    /// @dev Thứ tự kiểm tra:
    ///
    /// 1. SingleRecord
    /// 2. ByRecordType
    /// 3. AllRecords
    /// 4. Emergency Access
    ///
    /// Backend gọi hàm này trước READ.
    /// EMRRegistry gọi hàm này trước APPEND.
    function isAllowed(bytes32 phid, address grantee, uint256 recordId, bytes32 recordType, uint8 needed)
        public
        view
        returns (bool)
    {
        // ---------------------------------------------------------
        // Doctor must still be active
        // ---------------------------------------------------------

        if (!registry.isActiveDoctor(grantee)) {
            return false;
        }

        // ---------------------------------------------------------
        // Permission requested must be valid
        // ---------------------------------------------------------

        if (needed == 0 || !_validPermissions(needed)) {
            return false;
        }

        // ---------------------------------------------------------
        // 1. SingleRecord
        // ---------------------------------------------------------

        if (_ok(_key(phid, grantee, ScopeKind.SingleRecord, bytes32(recordId)), needed)) {
            return true;
        }

        // ---------------------------------------------------------
        // 2. ByRecordType
        // ---------------------------------------------------------

        if (_ok(_key(phid, grantee, ScopeKind.ByRecordType, recordType), needed)) {
            return true;
        }

        // ---------------------------------------------------------
        // 3. AllRecords
        // ---------------------------------------------------------

        if (_ok(_key(phid, grantee, ScopeKind.AllRecords, bytes32(0)), needed)) {
            return true;
        }

        // ---------------------------------------------------------
        // 4. Emergency access
        // ---------------------------------------------------------
        //
        // Tài liệu kiến trúc có đề cập
        // "_emergencyActive(phid, grantee)"
        // nhưng chưa định nghĩa struct/storage/hàm
        // của emergency access.
        //
        // Hiện tại trả về false.
        //
        // Có thể thay thế bằng EmergencyRegistry
        // hoặc emergency grant ở phiên bản sau.
        // ---------------------------------------------------------

        return _emergencyActive(phid, grantee);
    }

    // =============================================================
    //                     GRANT VIEW
    // =============================================================

    /// @notice Xem thông tin một grant.
    function getGrant(bytes32 phid, address grantee, ScopeKind kind, bytes32 scopeRef)
        external
        view
        returns (Grant memory)
    {
        return _grants[_key(phid, grantee, kind, scopeRef)];
    }

    /// @notice Kiểm tra trực tiếp
    ///         một grant có hợp lệ hay không.
    function isGrantActive(bytes32 phid, address grantee, ScopeKind kind, bytes32 scopeRef, uint8 needed)
        external
        view
        returns (bool)
    {
        return _ok(_key(phid, grantee, kind, scopeRef), needed);
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

    /// @notice Cập nhật địa chỉ HealthcareRegistry.
    ///
    /// @dev Chỉ nên dùng khi deploy upgrade/migration.
    function setHealthcareRegistry(address newRegistry) external onlyRole(SYSTEM_ADMIN_ROLE) {
        require(newRegistry != address(0), "invalid registry");

        address oldRegistry = address(registry);
        registry = IHealthcareRegistry(newRegistry);

        emit RegistryUpdated(oldRegistry, newRegistry);
    }

    // =============================================================
    //                    INTERNAL FUNCTIONS
    // =============================================================

    /// @dev Tạo khóa duy nhất cho một grant.
    function _key(bytes32 phid, address grantee, ScopeKind kind, bytes32 scopeRef) internal pure returns (bytes32) {
        return keccak256(abi.encode(phid, grantee, kind, scopeRef));
    }

    /// @dev Kiểm tra grant còn hiệu lực
    ///      và chứa đủ permission cần thiết.
    function _ok(bytes32 grantKey, uint8 needed) internal view returns (bool) {
        Grant storage grant = _grants[grantKey];

        return
            grant.grantedAt != 0 &&
            grant.revokedAt == 0 &&
            (grant.expiresAt == 0 || grant.expiresAt > block.timestamp) &&
            (grant.permissions & needed) == needed;
    }

    /// @dev Placeholder cho Emergency Access.
    ///
    /// Tài liệu có nhắc đến emergency access
    /// nhưng chưa cung cấp implementation.
    function _emergencyActive(bytes32, address) internal pure returns (bool) {
        return false;
    }

    /// @dev Chỉ chấp nhận các bit:
    ///
    /// READ   = 1
    /// APPEND = 2
    ///
    /// READ | APPEND = 3
    function _validPermissions(uint8 permissions) internal pure returns (bool) {
        uint8 validMask = PERM_READ | PERM_APPEND;

        return permissions != 0 && (permissions & ~validMask) == 0;
    }
}