// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {HealthcareRegistry} from "../src/HealthcareRegistry.sol";
import {ConsentRegistry} from "../src/ConsentRegistry.sol";

contract ConsentRegistryTest is Test {
    HealthcareRegistry healthcare;
    ConsentRegistry consent;

    uint256 internal constant PATIENT_PRIVATE_KEY = 0xA11CE;
    address internal patient;
    address internal doctor;
    address internal relayer;
    address internal systemAdmin;

    bytes32 internal constant PHID = keccak256("PATIENT-001");
    bytes32 internal constant HOSPITAL_CODE = keccak256("HOSPITAL-001");
    bytes32 internal constant LICENSE_HASH = keccak256("LICENSE-001");
    bytes32 internal constant RECORD_TYPE = keccak256("GENERAL_RECORD");

    // Khớp 100% với GRANT_TYPEHASH trong ConsentRegistry.sol
    bytes32 internal constant GRANT_TYPEHASH =
        keccak256(
            "GrantAccess(bytes32 phid,address grantee,uint8 scopeKind,bytes32 scopeRef,uint8 permissions,uint64 expiresAt,uint256 nonce,uint256 deadline)"
        );

    function setUp() public {
        doctor = makeAddr("doctor");
        relayer = makeAddr("relayer");
        systemAdmin = address(this);
        patient = vm.addr(PATIENT_PRIVATE_KEY);

        // 1. Khởi tạo HealthcareRegistry
        healthcare = new HealthcareRegistry();
        healthcare.initialize(systemAdmin);

        healthcare.registerHospital(HOSPITAL_CODE, systemAdmin);
        healthcare.registerDoctor(doctor, LICENSE_HASH, HOSPITAL_CODE);
        healthcare.registerPatient(PHID, patient, address(0));

        // 2. Khởi tạo ConsentRegistry
        consent = new ConsentRegistry();
        consent.initialize(address(healthcare), systemAdmin);
    }

    function _hashGrantAccess(
        bytes32 phid,
        address grantee,
        ConsentRegistry.ScopeKind kind,
        bytes32 scopeRef,
        uint8 permissions,
        uint64 expiresAt,
        uint256 nonce,
        uint256 deadline
    ) internal view returns (bytes32) {
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

        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("ConsentRegistry")),
                keccak256(bytes("1")),
                block.chainid,
                address(consent)
            )
        );

        return keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
    }

    function test_GrantAccessByValidEIP712Signature() public {
        uint256 nonce = consent.nonces(PHID);
        uint256 deadline = block.timestamp + 1 days;
        uint64 expiresAt = uint64(block.timestamp + 7 days);

        bytes32 digest = _hashGrantAccess(
            PHID,
            doctor,
            ConsentRegistry.ScopeKind.AllRecords,
            bytes32(0),
            consent.PERM_READ(),
            expiresAt,
            nonce,
            deadline
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PATIENT_PRIVATE_KEY, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(relayer);
        consent.grantAccessBySig(
            PHID,
            doctor,
            ConsentRegistry.ScopeKind.AllRecords,
            bytes32(0),
            consent.PERM_READ(),
            expiresAt,
            deadline,
            signature
        );

        assertEq(consent.nonces(PHID), 1);

        bool allowed = consent.isAllowed(
            PHID,
            doctor,
            1,
            RECORD_TYPE,
            consent.PERM_READ()
        );
        assertTrue(allowed);
    }
}