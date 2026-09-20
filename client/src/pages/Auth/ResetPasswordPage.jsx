import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { useAuth } from "../../context/AuthContext";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { updatePassword } = useAuth();
    const { setWalletPassword, ready: privyReady, authenticated: privyAuthenticated } = usePrivy();

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

    const handleSetPrivyPassword = () => {
        try {
            if (setWalletPassword) {
                setWalletPassword();
            }
        } catch (err) {
            console.error("Privy setWalletPassword error:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        const otpVerified = sessionStorage.getItem("otpVerified") === "true";

        if (!email || !otpVerified) {
            setError(
                "Phiên đặt lại mật khẩu không hợp lệ hoặc chưa xác thực OTP. Vui lòng quay lại và thực hiện lại!"
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

            // Tự động gọi Privy setWalletPassword nếu khả dụng và được ủy quyền
            if (privyReady && privyAuthenticated && typeof setWalletPassword === "function") {
                try {
                    await setWalletPassword();
                } catch (privyErr) {
                    console.warn("Privy wallet password update skipped or cancelled:", privyErr);
                }
            }

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

                        {privyReady && typeof setWalletPassword === "function" && (
                            <button
                                type="button"
                                className="reset-password-button"
                                style={{ marginBottom: "12px", background: "linear-[#676FFF,#4B52C0]" }}
                                onClick={handleSetPrivyPassword}
                            >
                                🔐 Cập nhật mật khẩu ví Privy
                            </button>
                        )}

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

                        {privyReady && typeof setWalletPassword === "function" && (
                            <button
                                type="button"
                                className="reset-password-button"
                                style={{ marginTop: "10px", background: "rgba(103, 111, 255, 0.15)", border: "1px solid #676FFF", color: "#676FFF" }}
                                onClick={handleSetPrivyPassword}
                            >
                                🔒 Đổi mật khẩu ví Privy (usePrivy)
                            </button>
                        )}
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

