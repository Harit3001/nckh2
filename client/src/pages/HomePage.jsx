import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAccount, useConnect, useSignTypedData, useSignMessage } from "wagmi";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";
import { EIP712_DOMAIN, EIP712_TYPES, PRIMARY_TYPE } from "../config/web3.js";

export default function HomePage() {
    const { user, loading: authLoading, generateNonce, linkWallet, refetchProfile } = useAuth();
    const { address, isConnected } = useAccount();
    const { connectors, connectAsync } = useConnect();
    const { signTypedDataAsync } = useSignTypedData();
    const { signMessageAsync } = useSignMessage();
    const [linkingWallet, setLinkingWallet] = useState(false);
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminError, setAdminError] = useState("");
    const [actionMsg, setActionMsg] = useState("");

    const fetchPendingDoctors = useCallback(async () => {
        if (user?.role !== "ADMIN") return;
        setAdminLoading(true);
        setAdminError("");
        try {
            const res = await apiFetch("/admin/doctors");
            if (res && res.data) {
                setPendingDoctors(Array.isArray(res.data) ? res.data : []);
            } else if (Array.isArray(res)) {
                setPendingDoctors(res);
            }
        } catch (err) {
            setAdminError(err.message || "Không thể tải danh sách bác sĩ");
        } finally {
            setAdminLoading(false);
        }
    }, [user?.role]);

    useEffect(() => {
        if (user?.role === "ADMIN") {
            fetchPendingDoctors();
        }
    }, [user?.role, fetchPendingDoctors]);

    const handleApproveDoctor = async (doctorId) => {
        setActionMsg("");
        try {
            await apiFetch(`/admin/doctors/${doctorId}/approve`, {
                method: "PATCH",
            });
            setActionMsg(`Đã phê duyệt thành công bác sĩ #${doctorId}`);
            fetchPendingDoctors();
        } catch (err) {
            alert(err.message || "Phê duyệt thất bại");
        }
    };

    if (authLoading) {
        return (
            <div className="home-page-container" style={{ padding: "60px 20px", textAlign: "center" }}>
                <p>Đang tải thông tin tài khoản...</p>
            </div>
        );
    }

    const getRoleBadge = (role) => {
        switch (role) {
            case "ADMIN":
                return <span className="badge badge-admin">Quản trị viên (Admin)</span>;
            case "DOCTOR":
                return <span className="badge badge-doctor">Bác sĩ (Doctor)</span>;
            case "PATIENT":
                return <span className="badge badge-patient">Bệnh nhân (Patient)</span>;
            default:
                return <span className="badge">{role}</span>;
        }
    };

    return (
        <div className="home-page-container">
            <div className="welcome-banner">
                <h1>Hệ thống Bệnh án Electronic Blockchain (NCKH)</h1>
                {user ? (
                    <div className="welcome-user-info">
                        <p className="welcome-sub">
                            Xin chào, <strong>{user.fullName || user.email}</strong>!
                        </p>
                        <div style={{ marginTop: "10px" }}>
                            {getRoleBadge(user.role)}
                        </div>
                    </div>
                ) : (
                    <p className="welcome-sub">
                        Chào mừng bạn đến với hệ thống. Vui lòng{" "}
                        <Link to="/login" className="link-highlight">
                            Đăng nhập
                        </Link>{" "}
                        hoặc{" "}
                        <Link to="/register" className="link-highlight">
                            Đăng ký
                        </Link>{" "}
                        để tiếp tục.
                    </p>
                )}
            </div>

            {user?.role === "DOCTOR" && (
                <div className="card-section doctor-status-card" style={{
                    marginBottom: "24px",
                    borderLeft: (user.isApproved === false || user.approved === false || user.status === "PENDING" || !user.isApproved)
                        ? "5px solid #ff9800"
                        : "5px solid #4caf50",
                    background: (user.isApproved === false || user.approved === false || user.status === "PENDING" || !user.isApproved)
                        ? "rgba(255, 152, 0, 0.05)"
                        : "rgba(76, 175, 80, 0.05)"
                }}>
                    <div className="card-header">
                        <h2>Trạng Thái Phê Duyệt Tài Khoản Bác Sĩ</h2>
                        {(user.isApproved === false || user.approved === false || user.status === "PENDING" || !user.isApproved) ? (
                            <span className="badge" style={{ backgroundColor: "#ff9800", color: "#fff", fontWeight: "bold", padding: "6px 12px", borderRadius: "20px" }}>
                                ⏳ ĐANG CHỜ ADMIN PHÊ DUYỆT
                            </span>
                        ) : (
                            <span className="badge" style={{ backgroundColor: "#4caf50", color: "#fff", fontWeight: "bold", padding: "6px 12px", borderRadius: "20px" }}>
                                ✅ ĐÃ ĐƯỢC PHÊ DUYỆT
                            </span>
                        )}
                    </div>

                    {(user.isApproved === false || user.approved === false || user.status === "PENDING" || !user.isApproved) ? (
                        <div style={{ padding: "10px 0" }}>
                            <p style={{ fontSize: "15px", color: "var(--ink-main, #333)", lineHeight: "1.6" }}>
                                ⚠️ Tài khoản Bác sĩ của bạn (Mã: <strong>{user.doctorCode || "BS..."}</strong>) đã được tạo thành công và đang nằm trong danh sách <strong>Chờ Quản trị viên (Admin) duyệt</strong>.
                            </p>
                            <div style={{
                                marginTop: "15px",
                                padding: "15px",
                                background: "#fff",
                                border: "1px solid #ffe0b2",
                                borderRadius: "8px",
                                fontSize: "14px"
                            }}>
                                <strong style={{ color: "#e65100" }}>📌 Các bước xử lý tài khoản Bác sĩ:</strong>
                                <ul style={{ marginTop: "8px", paddingLeft: "20px", lineHeight: "1.8", color: "#555" }}>
                                    <li>✅ Đăng ký thông tin tài khoản bác sĩ</li>
                                    <li>✅ Cập nhật chuyên khoa ({user.speciality || "Chưa cập nhật"}) & Mã bệnh viện (#{user.hospitalId || 1})</li>
                                    <li style={{ fontWeight: "bold", color: "#e65100" }}>⏳ Quản trị viên phê duyệt trên hệ thống (API: <code>PATCH /admin/doctors/{`{doctorId}`}/approve</code>)</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: "10px 0" }}>
                            <p style={{ fontSize: "15px", color: "#2e7d32", lineHeight: "1.6", fontWeight: "500" }}>
                                🎉 Tài khoản Bác sĩ của bạn đã được xác minh và phê duyệt chính thức bởi Quản trị viên. Bạn có đầy đủ quyền thao tác bệnh án trên hệ thống Blockchain!
                            </p>
                        </div>
                    )}
                </div>
            )}

            {user && (
                <div className="card-section profile-card">
                    <div className="card-header">
                        <h2>Thông tin tài khoản</h2>
                        <button className="btn-refresh" onClick={() => window.location.reload()}>
                            Làm mới
                        </button>
                    </div>

                    <div className="profile-grid">
                        <div className="profile-item">
                            <span className="label">ID Tài khoản:</span>
                            <span className="value">#{user.id}</span>
                        </div>
                        <div className="profile-item">
                            <span className="label">Email:</span>
                            <span className="value">{user.email}</span>
                        </div>
                        <div className="profile-item">
                            <span className="label">Vai trò:</span>
                            <span className="value">{getRoleBadge(user.role)}</span>
                        </div>
                        <div className="profile-item">
                            <span className="label">Địa chỉ ví Web3:</span>
                            <span className="value mono">
                                {user.walletAddress || user.addressWallet || "Chưa liên kết ví"}
                            </span>
                        </div>

                        {user.role === "PATIENT" && (
                            <>
                                {user.phid && (
                                    <div className="profile-item">
                                        <span className="label">Mã PHID:</span>
                                        <span className="value highlight-text">{user.phid}</span>
                                    </div>
                                )}
                                {user.dob && (
                                    <div className="profile-item">
                                        <span className="label">Ngày sinh:</span>
                                        <span className="value">
                                            {new Date(user.dob).toLocaleDateString("vi-VN")}
                                        </span>
                                    </div>
                                )}
                                {user.bloodType && (
                                    <div className="profile-item">
                                        <span className="label">Nhóm máu:</span>
                                        <span className="value badge-blood">{user.bloodType}</span>
                                    </div>
                                )}
                                {user.allergyInfo && (
                                    <div className="profile-item">
                                        <span className="label">Thông tin dị ứng:</span>
                                        <span className="value">{user.allergyInfo}</span>
                                    </div>
                                )}
                                {user.nationalIdHash && (
                                    <div className="profile-item">
                                        <span className="label">Mã CCCD (Hash):</span>
                                        <span className="value mono">{user.nationalIdHash}</span>
                                    </div>
                                )}
                            </>
                        )}

                        {user.role === "DOCTOR" && (
                            <>
                                {user.doctorCode && (
                                    <div className="profile-item">
                                        <span className="label">Mã Bác sĩ:</span>
                                        <span className="value highlight-text">{user.doctorCode}</span>
                                    </div>
                                )}
                                {user.speciality && (
                                    <div className="profile-item">
                                        <span className="label">Chuyên khoa:</span>
                                        <span className="value">{user.speciality}</span>
                                    </div>
                                )}
                                {user.hospitalId && (
                                    <div className="profile-item">
                                        <span className="label">ID Bệnh viện:</span>
                                        <span className="value">#{user.hospitalId}</span>
                                    </div>
                                )}
                                <div className="profile-item">
                                    <span className="label">Trạng thái Admin duyệt:</span>
                                    <span className="value" style={{ fontWeight: "bold", color: (user.isApproved === false || user.approved === false || user.status === "PENDING" || !user.isApproved) ? "#e65100" : "#2e7d32" }}>
                                        {(user.isApproved === false || user.approved === false || user.status === "PENDING" || !user.isApproved) ? "⏳ Đang chờ duyệt" : "✅ Đã phê duyệt"}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {!(user.walletAddress || user.addressWallet) && (
                        <div style={{ marginTop: "20px", paddingTop: "15px", borderTop: "1px solid var(--border-color, #eee)" }}>
                            <button
                                className="btn-approve"
                                disabled={linkingWallet}
                                onClick={async () => {
                                    setLinkingWallet(true);
                                    try {
                                        let targetAddress = address;
                                        if (!isConnected || !targetAddress) {
                                            const injectedConnector = connectors.find((c) => c.id === "metaMask" || c.id === "injected") || connectors[0];
                                            if (!injectedConnector) throw new Error("Không tìm thấy Connector ví Web3 khả dụng!");
                                            const resConnect = await connectAsync({ connector: injectedConnector });
                                            targetAddress = resConnect.accounts[0];
                                        }

                                        if (!targetAddress) throw new Error("Không lấy được địa chỉ ví Wagmi.");

                                        const nonceRes = await generateNonce(targetAddress);
                                        const nonce = nonceRes?.data?.nonce;
                                        if (!nonce) throw new Error("Không thể tạo nonce từ API.");

                                        let signature = "";
                                        try {
                                            signature = await signTypedDataAsync({
                                                domain: EIP712_DOMAIN,
                                                types: EIP712_TYPES,
                                                primaryType: PRIMARY_TYPE,
                                                message: {
                                                    wallet: targetAddress,
                                                    nonce: nonce,
                                                },
                                            });
                                        } catch (typedErr) {
                                            console.warn("Wagmi signTypedDataAsync failed, trying fallback signMessageAsync:", typedErr);
                                            signature = await signMessageAsync({ message: nonce });
                                        }

                                        if (!signature) throw new Error("Không tạo được chữ ký ví.");

                                        const res = await linkWallet(targetAddress, signature);
                                        alert(res?.message || "Liên kết ví thành công!");
                                        await refetchProfile();
                                    } catch (err) {
                                        console.error("Link wallet error:", err);
                                        alert(err.message || "Liên kết ví thất bại");
                                    } finally {
                                        setLinkingWallet(false);
                                    }
                                }}
                            >
                                🦊 {linkingWallet ? "Đang liên kết ví Wagmi..." : "Liên kết ví Ethereum (Wagmi)"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {user?.role === "ADMIN" && (
                <div className="card-section admin-section">
                    <div className="card-header">
                        <h2>Danh sách Bác sĩ chờ Phê duyệt (Admin)</h2>
                        <button className="btn-refresh" onClick={fetchPendingDoctors} disabled={adminLoading}>
                            {adminLoading ? "Đang tải..." : "Tải lại danh sách"}
                        </button>
                    </div>

                    {actionMsg && <p className="success-banner">{actionMsg}</p>}
                    {adminError && <p className="error-banner">{adminError}</p>}

                    {adminLoading ? (
                        <p style={{ marginTop: "15px" }}>Đang tải dữ liệu từ server Railway...</p>
                    ) : (
                        <div className="table-responsive">
                            {pendingDoctors.length === 0 ? (
                                <p style={{ color: "var(--ink-soft)", marginTop: "15px" }}>
                                    Hiện tại không có bác sĩ nào đang chờ phê duyệt.
                                </p>
                            ) : (
                                <table className="custom-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Email</th>
                                            <th>Mã BS</th>
                                            <th>Chuyên khoa</th>
                                            <th>Bệnh viện</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingDoctors.map((doc) => (
                                            <tr key={doc.id || doc.doctorId}>
                                                <td>#{doc.id || doc.doctorId}</td>
                                                <td>{doc.email || doc.user?.email}</td>
                                                <td>{doc.doctorCode || doc.code}</td>
                                                <td>{doc.speciality || "N/A"}</td>
                                                <td>#{doc.hospitalId || 1}</td>
                                                <td>
                                                    <button
                                                        className="btn-approve"
                                                        onClick={() => handleApproveDoctor(doc.id || doc.doctorId)}
                                                    >
                                                        Phê duyệt
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            )}

            {!user && (
                <div className="card-section guest-card">
                    <h2>Bắt đầu sử dụng</h2>
                    <p style={{ marginTop: "10px", color: "var(--ink-soft)", lineHeight: "1.6" }}>
                        Hệ thống Nghiên cứu Khoa học quản lý bệnh án trên nền tảng Blockchain.
                        Bạn có thể tạo tài khoản <strong>Bệnh nhân</strong> hoặc <strong>Bác sĩ</strong> để trải nghiệm các tính năng.
                    </p>
                    <div style={{ marginTop: "20px", display: "flex", gap: "15px" }}>
                        <Link to="/login" className="btn-primary-link">
                            Đăng nhập ngay
                        </Link>
                        <Link to="/register" className="btn-secondary-link">
                            Tạo tài khoản mới
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
