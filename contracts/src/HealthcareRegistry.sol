// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @title HealthcareRegistry
/// @notice Nguồn sự thật về danh tính:
///         - Bệnh viện
///         - Bác sĩ
///         - Ví bệnh nhân
///         - Người giám hộ được ủy quyền
///
/// @dev Contract được thiết kế để ConsentRegistry và EMRRegistry
///      có thể gọi:
///      - isActiveDoctor()
///      - consentSignerOf()
///      - hospitalOf()
contract HealthcareRegistry is Initializable, AccessControlUpgradeable {
    // =============================================================
    //                           ROLES
    // =============================================================

    /// @notice Quản trị viên cấp hệ thống.
    bytes32 public constant SYSTEM_ADMIN_ROLE = keccak256("SYSTEM_ADMIN_ROLE");

    /// @notice Quản trị viên bệnh viện.
    bytes32 public constant HOSPITAL_ADMIN_ROLE = keccak256("HOSPITAL_ADMIN_ROLE");

    // =============================================================
    //                          STATUS
    // =============================================================

    enum Status {
        None,
        Active,
        Suspended,
        Revoked
    }

    // =============================================================
    //                          STRUCTS
    // =============================================================

    /// @notice Thông tin bệnh viện/cơ sở khám chữa bệnh.
    struct Hospital {
        bytes32 code;
        Status status;
        uint64 since;
    }

    /// @notice Thông tin bác sĩ.
    struct Doctor {
        bytes32 hospitalCode;
        /// @dev Hash có salt của số chứng chỉ hành nghề.
        ///      Không lưu số chứng chỉ gốc trên blockchain.
        bytes32 licenseHash;
        Status status;
        uint64 since;
    }

    // =============================================================
    //                          STORAGE
    // =============================================================

    /// @notice hospitalCode => Hospital
    mapping(bytes32 => Hospital) public hospitals;

    /// @notice doctor wallet => Doctor
    mapping(address => Doctor) public doctors;

    /// @notice PHID => Patient wallet
    ///
    /// @dev address(0) có nghĩa là bệnh nhân chưa liên kết ví.
    mapping(bytes32 => address) public patientWallet;

    /// @notice PHID => Guardian wallet
    mapping(bytes32 => address) public patientGuardian;

    // =============================================================
    //                           EVENTS
    // =============================================================

    event HospitalRegistered(bytes32 indexed code, address indexed admin);
    event HospitalStatusChanged(bytes32 indexed code, Status oldStatus, Status newStatus);
    event DoctorRegistered(address indexed doctor, bytes32 indexed hospitalCode);
    event DoctorStatusChanged(address indexed doctor, Status oldStatus, Status newStatus);
    event PatientRegistered(bytes32 indexed phid, address wallet, address guardian);
    event PatientWalletLinked(bytes32 indexed phid, address indexed wallet);
    event PatientGuardianUpdated(bytes32 indexed phid, address indexed oldGuardian, address indexed newGuardian);

    // =============================================================
    //                         MODIFIERS
    // =============================================================

    /// @notice Chỉ Hospital Admin của hospitalCode mới được gọi.
    ///
    /// @dev Role được tạo từ:
    ///      keccak256(HOSPITAL_ADMIN_ROLE, hospitalCode)
    modifier onlyHospitalAdminOf(bytes32 hospitalCode) {
        require(hasRole(_hospitalAdminRole(hospitalCode), msg.sender), "not hospital admin");
        _;
    }

    // =============================================================
    //                        INITIALIZER
    // =============================================================

    /// @notice Khởi tạo contract.
    ///
    /// @param systemAdmin Địa chỉ quản trị hệ thống đầu tiên.
    function initialize(address systemAdmin) external initializer {
        require(systemAdmin != address(0), "invalid system admin");

        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, systemAdmin);
        _grantRole(SYSTEM_ADMIN_ROLE, systemAdmin);
    }

    // =============================================================
    //                    HOSPITAL FUNCTIONS
    // =============================================================

    /// @notice Đăng ký một bệnh viện/cơ sở khám chữa bệnh.
    ///
    /// @param hospitalCode Mã cơ sở KCB.
    /// @param hospitalAdmin Ví quản trị của bệnh viện.
    function registerHospital(bytes32 hospitalCode, address hospitalAdmin) external onlyRole(SYSTEM_ADMIN_ROLE) {
        require(hospitalCode != bytes32(0), "invalid hospital code");
        require(hospitalAdmin != address(0), "invalid hospital admin");
        require(hospitals[hospitalCode].status == Status.None, "hospital exists");

        hospitals[hospitalCode] = Hospital({
            code: hospitalCode,
            status: Status.Active,
            since: uint64(block.timestamp)
        });

        _grantRole(_hospitalAdminRole(hospitalCode), hospitalAdmin);

        emit HospitalRegistered(hospitalCode, hospitalAdmin);
    }

    /// @notice Thay đổi trạng thái bệnh viện.
    ///
    /// @dev Khi bệnh viện không Active,
    ///      toàn bộ bác sĩ thuộc bệnh viện đó
    ///      sẽ không còn được coi là active bởi isActiveDoctor().
    function setHospitalStatus(bytes32 hospitalCode, Status newStatus) external onlyRole(SYSTEM_ADMIN_ROLE) {
        Hospital storage hospital = hospitals[hospitalCode];

        require(hospital.status != Status.None, "hospital not found");

        Status oldStatus = hospital.status;
        require(oldStatus != newStatus, "same status");

        hospital.status = newStatus;

        emit HospitalStatusChanged(hospitalCode, oldStatus, newStatus);
    }

    /// @notice Cấp quyền Hospital Admin mới.
    function grantHospitalAdmin(bytes32 hospitalCode, address admin) external onlyRole(SYSTEM_ADMIN_ROLE) {
        require(hospitals[hospitalCode].status != Status.None, "hospital not found");
        require(admin != address(0), "invalid admin");

        _grantRole(_hospitalAdminRole(hospitalCode), admin);
    }

    /// @notice Thu hồi quyền Hospital Admin.
    function revokeHospitalAdmin(bytes32 hospitalCode, address admin) external onlyRole(SYSTEM_ADMIN_ROLE) {
        _revokeRole(_hospitalAdminRole(hospitalCode), admin);
    }

    // =============================================================
    //                     DOCTOR FUNCTIONS
    // =============================================================

    /// @notice Admin bệnh viện đăng ký bác sĩ
    ///         thuộc chính bệnh viện của mình.
    ///
    /// @param doctor Ví Ethereum của bác sĩ.
    /// @param licenseHash Hash có salt của chứng chỉ hành nghề.
    /// @param hospitalCode Mã bệnh viện.
    function registerDoctor(address doctor, bytes32 licenseHash, bytes32 hospitalCode)
        external
        onlyHospitalAdminOf(hospitalCode)
    {
        require(doctor != address(0), "invalid doctor");
        require(licenseHash != bytes32(0), "invalid license hash");
        require(doctors[doctor].status == Status.None, "doctor exists");
        require(hospitals[hospitalCode].status == Status.Active, "hospital inactive");

        doctors[doctor] = Doctor({
            hospitalCode: hospitalCode,
            licenseHash: licenseHash,
            status: Status.Active,
            since: uint64(block.timestamp)
        });

        emit DoctorRegistered(doctor, hospitalCode);
    }

    /// @notice Thay đổi trạng thái bác sĩ.
    ///
    /// Hospital Admin chỉ được thay đổi
    /// bác sĩ thuộc bệnh viện của mình.
    function setDoctorStatus(address doctor, Status newStatus) external {
        Doctor storage d = doctors[doctor];

        require(d.status != Status.None, "doctor not found");

        require(
            hasRole(SYSTEM_ADMIN_ROLE, msg.sender) ||
                hasRole(_hospitalAdminRole(d.hospitalCode), msg.sender),
            "not authorized"
        );

        Status oldStatus = d.status;
        require(oldStatus != newStatus, "same status");

        d.status = newStatus;

        emit DoctorStatusChanged(doctor, oldStatus, newStatus);
    }

    // =============================================================
    //                     PATIENT FUNCTIONS
    // =============================================================

    /// @notice Đăng ký định danh bệnh nhân.
    ///
    /// @param phid Patient Hashed Identifier.
    /// @param wallet Ví bệnh nhân.
    /// @param guardian Người giám hộ được ủy quyền.
    ///
    /// @dev Có thể để wallet = address(0)
    ///      nếu bệnh nhân chỉ sử dụng guardian.
    function registerPatient(bytes32 phid, address wallet, address guardian) external onlyRole(SYSTEM_ADMIN_ROLE) {
        require(phid != bytes32(0), "invalid phid");
        require(patientWallet[phid] == address(0) && patientGuardian[phid] == address(0), "patient exists");
        require(wallet != address(0) || guardian != address(0), "wallet or guardian required");

        patientWallet[phid] = wallet;
        patientGuardian[phid] = guardian;

        emit PatientRegistered(phid, wallet, guardian);
    }

    /// @notice Liên kết ví cho bệnh nhân.
    ///
    /// @dev Trong thiết kế này,
    ///      nếu có patientWallet thì wallet đó
    ///      sẽ là consent signer chính.
    function linkPatientWallet(bytes32 phid, address wallet) external onlyRole(SYSTEM_ADMIN_ROLE) {
        require(wallet != address(0), "invalid wallet");
        require(patientWallet[phid] != address(0) || patientGuardian[phid] != address(0), "patient not found");

        patientWallet[phid] = wallet;

        emit PatientWalletLinked(phid, wallet);
    }

    /// @notice Cập nhật người giám hộ.
    function updatePatientGuardian(bytes32 phid, address newGuardian) external onlyRole(SYSTEM_ADMIN_ROLE) {
        require(patientWallet[phid] != address(0) || patientGuardian[phid] != address(0), "patient not found");

        address oldGuardian = patientGuardian[phid];
        patientGuardian[phid] = newGuardian;

        emit PatientGuardianUpdated(phid, oldGuardian, newGuardian);
    }

    // =============================================================
    //                       VIEW FUNCTIONS
    // =============================================================

    /// @notice Kiểm tra bác sĩ còn hoạt động hay không.
    ///
    /// @dev Kiểm tra đồng thời:
    ///      1. Bác sĩ Active.
    ///      2. Bệnh viện Active.
    function isActiveDoctor(address doctor) external view returns (bool) {
        Doctor storage d = doctors[doctor];

        return d.status == Status.Active && hospitals[d.hospitalCode].status == Status.Active;
    }

    /// @notice Trả về bệnh viện mà bác sĩ trực thuộc.
    ///
    /// @dev Hàm này được EMRRegistry sử dụng.
    function hospitalOf(address doctor) external view returns (bytes32) {
        return doctors[doctor].hospitalCode;
    }

    /// @notice Ai có quyền ký consent cho bệnh nhân.
    ///
    /// @dev Ưu tiên:
    ///      1. Ví bệnh nhân.
    ///      2. Guardian nếu chưa có ví bệnh nhân.
    function consentSignerOf(bytes32 phid) external view returns (address) {
        address wallet = patientWallet[phid];

        return wallet != address(0) ? wallet : patientGuardian[phid];
    }

    /// @notice Lấy thông tin bác sĩ.
    function getDoctor(address doctor)
        external
        view
        returns (bytes32 hospitalCode, bytes32 licenseHash, Status status, uint64 since)
    {
        Doctor storage d = doctors[doctor];

        return (d.hospitalCode, d.licenseHash, d.status, d.since);
    }

    /// @notice Kiểm tra bệnh viện còn hoạt động.
    function isActiveHospital(bytes32 hospitalCode) external view returns (bool) {
        return hospitals[hospitalCode].status == Status.Active;
    }

    // =============================================================
    //                      INTERNAL FUNCTIONS
    // =============================================================

    /// @dev Tạo role riêng cho từng bệnh viện.
    ///
    /// Ví dụ:
    /// HOSPITAL_ADMIN_ROLE + Hospital A
    /// !=
    /// HOSPITAL_ADMIN_ROLE + Hospital B
    function _hospitalAdminRole(bytes32 hospitalCode) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(HOSPITAL_ADMIN_ROLE, hospitalCode));
    }
}