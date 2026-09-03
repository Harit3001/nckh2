// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title AuditAnchor
/// @notice Neo các batch Audit Log lên blockchain bằng Merkle Root.
///
/// @dev Audit log thực tế nằm ở PostgreSQL.
///
///      PostgreSQL
///           │
///           │ Batch logs
///           ▼
///      Merkle Tree
///           │
///           ▼
///      Merkle Root
///           │
///           ▼
///      AuditAnchor
///
/// Blockchain không lưu toàn bộ log.
/// Chỉ lưu Merkle Root của từng batch.
contract AuditAnchor is AccessControl {
    // =============================================================
    //                           ROLES
    // =============================================================

    /// @notice Quản trị hệ thống.
    bytes32 public constant SYSTEM_ADMIN_ROLE = keccak256("SYSTEM_ADMIN_ROLE");

    /// @notice Role được phép neo Audit Batch.
    ///
    /// Thông thường Backend / Indexer / Relayer
    /// sẽ có role này.
    bytes32 public constant AUDIT_ANCHOR_ROLE = keccak256("AUDIT_ANCHOR_ROLE");

    // =============================================================
    //                          STRUCTS
    // =============================================================

    /// @notice Metadata của một Audit Batch.
    struct Batch {
        /// @notice Merkle Root của batch.
        bytes32 merkleRoot;
        /// @notice Timestamp của log đầu tiên.
        uint64 fromTs;
        /// @notice Timestamp của log cuối cùng.
        uint64 toTs;
        /// @notice Tổng số log trong batch.
        uint32 entryCount;
        /// @notice Hospital sở hữu batch.
        bytes32 hospitalCode;
    }

    // =============================================================
    //                          STORAGE
    // =============================================================

    /// @notice batchId => Batch
    mapping(uint256 => Batch) public batches;

    /// @notice Tổng số batch đã neo.
    uint256 public batchCount;

    // =============================================================
    //                           EVENTS
    // =============================================================

    event AuditBatchAnchored(
        uint256 indexed batchId,
        bytes32 indexed hospitalCode,
        bytes32 merkleRoot,
        uint64 fromTs,
        uint64 toTs,
        uint32 entryCount
    );

    // =============================================================
    //                        CONSTRUCTOR
    // =============================================================

    /// @param systemAdmin System administrator đầu tiên.
    constructor(address systemAdmin) {
        require(systemAdmin != address(0), "invalid admin");

        _grantRole(DEFAULT_ADMIN_ROLE, systemAdmin);
        _grantRole(SYSTEM_ADMIN_ROLE, systemAdmin);
        _grantRole(AUDIT_ANCHOR_ROLE, systemAdmin);
    }

    // =============================================================
    //                       ANCHOR BATCH
    // =============================================================

    /// @notice Neo một batch audit log lên blockchain.
    ///
    /// @param hospitalCode Mã bệnh viện.
    /// @param merkleRoot Root của Merkle Tree.
    /// @param fromTs Timestamp log đầu tiên.
    /// @param toTs Timestamp log cuối cùng.
    /// @param entryCount Số lượng log trong batch.
    ///
    /// @return batchId ID batch vừa được tạo.
    function anchorBatch(
        bytes32 hospitalCode,
        bytes32 merkleRoot,
        uint64 fromTs,
        uint64 toTs,
        uint32 entryCount
    ) external onlyRole(AUDIT_ANCHOR_ROLE) returns (uint256 batchId) {
        // ---------------------------------------------------------
        // Validation
        // ---------------------------------------------------------

        require(hospitalCode != bytes32(0), "invalid hospital code");
        require(merkleRoot != bytes32(0), "invalid merkle root");
        require(entryCount > 0, "empty batch");
        require(fromTs <= toTs, "invalid timestamp range");

        // ---------------------------------------------------------
        // Create batch
        // ---------------------------------------------------------

        batchId = ++batchCount;

        batches[batchId] = Batch({
            merkleRoot: merkleRoot,
            fromTs: fromTs,
            toTs: toTs,
            entryCount: entryCount,
            hospitalCode: hospitalCode
        });

        // ---------------------------------------------------------
        // Event
        // ---------------------------------------------------------

        emit AuditBatchAnchored(batchId, hospitalCode, merkleRoot, fromTs, toTs, entryCount);
    }

    // =============================================================
    //                       VERIFY ENTRY
    // =============================================================

    /// @notice Xác minh một Audit Log
    ///         có thuộc Batch đã neo hay không.
    ///
    /// @param batchId ID của Batch.
    /// @param leaf Hash của Audit Log.
    /// @param proof Merkle Proof.
    ///
    /// @return true nếu Audit Log thuộc Batch.
    function verifyEntry(uint256 batchId, bytes32 leaf, bytes32[] calldata proof) external view returns (bool) {
        Batch storage batch = batches[batchId];

        // ---------------------------------------------------------
        // Batch must exist
        // ---------------------------------------------------------

        if (batch.merkleRoot == bytes32(0)) {
            return false;
        }

        // ---------------------------------------------------------
        // Leaf must be valid
        // ---------------------------------------------------------

        if (leaf == bytes32(0)) {
            return false;
        }

        // ---------------------------------------------------------
        // Verify Merkle Proof
        // ---------------------------------------------------------

        return MerkleProof.verify(proof, batch.merkleRoot, leaf);
    }

    // =============================================================
    //                       VIEW FUNCTIONS
    // =============================================================

    /// @notice Kiểm tra Batch có tồn tại hay không.
    function batchExists(uint256 batchId) external view returns (bool) {
        return batches[batchId].merkleRoot != bytes32(0);
    }

    /// @notice Lấy metadata của một batch.
    function getBatch(uint256 batchId)
        external
        view
        returns (
            bytes32 merkleRoot,
            uint64 fromTs,
            uint64 toTs,
            uint32 entryCount,
            bytes32 hospitalCode
        )
    {
        Batch storage batch = batches[batchId];

        return (batch.merkleRoot, batch.fromTs, batch.toTs, batch.entryCount, batch.hospitalCode);
    }

    // =============================================================
    //                       ROLE MANAGEMENT
    // =============================================================

    /// @notice Cấp quyền neo Audit Batch.
    function grantAuditAnchorRole(address account) external onlyRole(SYSTEM_ADMIN_ROLE) {
        require(account != address(0), "invalid account");
        _grantRole(AUDIT_ANCHOR_ROLE, account);
    }

    /// @notice Thu hồi quyền neo Audit Batch.
    function revokeAuditAnchorRole(address account) external onlyRole(SYSTEM_ADMIN_ROLE) {
        _revokeRole(AUDIT_ANCHOR_ROLE, account);
    }
}