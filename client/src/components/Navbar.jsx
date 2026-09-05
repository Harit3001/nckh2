import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const getRoleText = (user) => {
        if (!user) return "";
        if (user.role === "ADMIN") return "Admin";
        if (user.role === "DOCTOR") {
            const isPending = user.isApproved === false || user.approved === false || user.status === "PENDING";
            return isPending ? "Bác sĩ (Chờ duyệt)" : "Bác sĩ";
        }
        if (user.role === "PATIENT") return "Bệnh nhân";
        return user.role;
    };

    return (
        <header className="navbar-container">
            <div className="navbar-inner">
                <Link to="/home" className="navbar-brand">
                    <span>NCKH</span> Blockchain
                </Link>
                <nav className="navbar-nav">
                    <Link to="/home">Trang chủ</Link>
                    {user ? (
                        <div className="user-menu">
                            <span className="user-name">
                                {user.fullName || user.email}{" "}
                                <small className="role-tag" style={{
                                    backgroundColor: user.role === "DOCTOR" && (user.isApproved === false || user.approved === false || user.status === "PENDING")
                                        ? "rgba(255, 152, 0, 0.2)"
                                        : undefined,
                                    color: user.role === "DOCTOR" && (user.isApproved === false || user.approved === false || user.status === "PENDING")
                                        ? "#ff9800"
                                        : undefined,
                                    border: user.role === "DOCTOR" && (user.isApproved === false || user.approved === false || user.status === "PENDING")
                                        ? "1px solid #ff9800"
                                        : undefined
                                }}>
                                    ({getRoleText(user)})
                                </small>
                            </span>
                            <button onClick={handleLogout} className="btn-logout">
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <div className="auth-links">
                            <Link to="/login" className="nav-link">Đăng nhập</Link>
                            <Link to="/register" className="nav-link nav-btn">Đăng ký</Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}
