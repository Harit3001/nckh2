import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { updatePassword } = useAuth();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setError("");

        return () => {
            setError("");
        };
    }, [location.pathname]);

    const email = sessionStorage.getItem("resetEmail") || "";

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!email) {
            setError(
                "Phiên đặt lại mật khẩu không hợp lệ. Vui lòng xác thực OTP lại!"
            );
            return;
        }

        if (!password.trim()) {
            setError("Vui lòng nhập mật khẩu mới!");
            return;
        }

        if (password.trim().length < 6) {
            setError("Mật khẩu mới phải có ít nhất 6 ký tự!");
            return;
        }

        if (!confirmPassword.trim()) {
            setError("Vui lòng xác nhận mật khẩu mới!");
            return;
        }

        if (password.trim() !== confirmPassword.trim()) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            setLoading(true);

            await updatePassword(
                email.trim(),
                password.trim(),
                confirmPassword.trim()
            );

            setSubmitted(true);

            sessionStorage.removeItem("resetEmail");
            sessionStorage.removeItem("otpVerified");
        } catch (err) {
            console.error("Update password error:", err);

            setError(
                err.message || "Không thể kết nối đến máy chủ backend!"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-page">
            <span className="reset-bubble reset-b1"></span>
            <span className="reset-bubble reset-b2"></span>
            <span className="reset-bubble reset-b3"></span>

            <form
                className="reset-password-box"
                onSubmit={handleSubmit}
                noValidate
            >
                <h1>Đặt lại mật khẩu</h1>

                {submitted ? (
                    <>
                        <div className="reset-success-message">
                            <p className="reset-success-title">
                                Đặt lại mật khẩu thành công!
                            </p>

                            <p className="reset-success-description">
                                Mật khẩu của tài khoản{" "}
                                <strong>{email}</strong>{" "}
                                đã được cập nhật thành công.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="reset-password-button"
                            onClick={() => navigate("/login")}
                        >
                            Đăng nhập ngay
                        </button>
                    </>
                ) : (
                    <>
                        <div className="reset-form-group">
                            <input
                                type="email"
                                value={email}
                                placeholder="Email"
                                disabled
                            />
                        </div>

                        <div className="reset-form-group">
                            <input
                                type="password"
                                placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }}
                            />
                        </div>

                        <div className="reset-form-group">
                            <input
                                type="password"
                                placeholder="Xác nhận mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError("");
                                }}
                            />
                        </div>

                        {error && (
                            <p className="reset-error">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="reset-password-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Đang cập nhật..."
                                : "Cập nhật mật khẩu"}
                        </button>
                    </>
                )}

                <p className="reset-signup">
                    <Link to="/login">
                        Quay lại đăng nhập
                    </Link>
                </p>
            </form>
        </div>
    );
}
