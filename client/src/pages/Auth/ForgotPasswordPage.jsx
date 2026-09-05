import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { forgotPassword, verifyResetPassword } = useAuth();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setError("");
        setSuccessMsg("");
        return () => {
            setError("");
            setSuccessMsg("");
        };
    }, [location.pathname]);

    const handleSendOtp = async (e) => {
        e.preventDefault();

        setError("");
        setSuccessMsg("");

        if (!email.trim()) {
            setError("Vui lòng nhập email!");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Email không đúng định dạng!");
            return;
        }

        try {
            setLoading(true);
            const res = await forgotPassword(email.trim());

            sessionStorage.setItem("resetEmail", email.trim());
            setOtpSent(true);
            setSuccessMsg(res?.message || "Đã gửi mã OTP đến email của bạn. Vui lòng kiểm tra hộp thư!");
        } catch (err) {
            console.error(err);
            setError(err.message || "Có lỗi xảy ra khi gửi yêu cầu khôi phục mật khẩu!");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        setError("");
        setSuccessMsg("");

        if (!otp.trim()) {
            setError("Vui lòng nhập mã OTP!");
            return;
        }

        if (otp.trim().length !== 6) {
            setError("Mã OTP phải có 6 chữ số!");
            return;
        }

        try {
            setLoading(true);
            const res = await verifyResetPassword(email.trim(), otp.trim());

            if (res && res.success) {
                sessionStorage.setItem("otpVerified", "true");
                navigate("/reset-password");
            } else {
                setError(res?.message || "Xác thực OTP thất bại");
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Mã OTP không đúng hoặc đã hết hạn!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <span className="bubble b1"></span>
            <span className="bubble b2"></span>
            <span className="bubble b3"></span>

            <form
                className="forgot-password-box"
                onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
                noValidate
            >
                <h1>Quên mật khẩu</h1>
                <p className="forgot-password-subtext">
                    {otpSent
                        ? "Vui lòng nhập mã OTP 6 chữ số vừa được gửi đến email của bạn."
                        : "Nhập địa chỉ email đăng ký để nhận mã xác thực OTP khôi phục mật khẩu."}
                </p>

                <div className="form-group">
                    <input
                        type="email"
                        placeholder="Nhập địa chỉ Email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setError("");
                            setSuccessMsg("");
                        }}
                        disabled={otpSent}
                    />
                </div>

                {otpSent && (
                    <div className="form-group">
                        <input
                            type="text"
                            className="otp-input"
                            placeholder="MÃ OTP"
                            value={otp}
                            maxLength={6}
                            onChange={(e) => {
                                setOtp(e.target.value);
                                setError("");
                            }}
                        />
                    </div>
                )}

                {successMsg && (
                    <p className="success-text">
                        ✅ {successMsg}
                    </p>
                )}

                {error && (
                    <p className="error global-error">
                        ⚠️ {error}
                    </p>
                )}

                <button
                    type="submit"
                    className="btn-primary-submit"
                    disabled={loading}
                    style={{ marginTop: "16px" }}
                >
                    {loading
                        ? "Đang xử lý..."
                        : otpSent
                            ? "Xác nhận OTP"
                            : "Gửi mã OTP"}
                </button>

                <p className="signup">
                    <Link to="/login">
                        ← Quay lại trang Đăng nhập
                    </Link>
                </p>
            </form>
        </div>
    );
}
