import { useState } from "react";
import { Link } from "react-router-dom";
import ConnectButton from "../common/ConnectButton";

export default function LoginForm({
  email,
  password,
  errors = {},
  loading = false,
  walletLoading = false,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onWalletLogin,
  onManualWalletLogin,
  onGenerateNonce,
  onVerifyAndLogin,
  onTabSwitch,
}) {
  const globalError = errors.message || errors.Message;

  const [activeTab, setActiveTab] = useState("email");
  const [showManualInputs, setShowManualInputs] = useState(false);

  const [manualAddress, setManualAddress] = useState("");
  const [manualNonce, setManualNonce] = useState("");
  const [manualSig, setManualSig] = useState("");
  const [nonceLoading, setNonceLoading] = useState(false);
  const [manualError, setManualError] = useState("");

  const handleGetNonceClick = async () => {
    if (!manualAddress.trim()) {
      setManualError("Vui lòng nhập địa chỉ ví (0x...)");
      return;
    }
    setManualError("");
    try {
      setNonceLoading(true);
      const res = await onGenerateNonce(manualAddress.trim());
      if (res?.data?.nonce) {
        setManualNonce(res.data.nonce);
      } else {
        setManualNonce(res?.message || "Không có nonce trả về");
      }
    } catch (err) {
      setManualError(err.message || "Lỗi sinh nonce");
    } finally {
      setNonceLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualAddress.trim() || !manualSig.trim()) {
      setManualError("Vui lòng nhập đầy đủ Địa chỉ ví và Chữ ký!");
      return;
    }
    onManualWalletLogin(manualAddress.trim(), manualSig.trim());
  };

  return (
    <div className="login-page">
      <span className="bubble b1"></span>
      <span className="bubble b2"></span>
      <span className="bubble b3"></span>
      <span className="bubble b4"></span>
      <span className="bubble b5"></span>

      <div className="login-box">
        <h1>Đăng nhập</h1>

        <div className="login-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === "email" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("email");
              if (onTabSwitch) onTabSwitch("email");
            }}
          >
            📧 Email & Mật khẩu
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "wallet" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("wallet");
              if (onTabSwitch) onTabSwitch("wallet");
            }}
          >
            🦊 Ví Web3 (Wagmi)
          </button>
        </div>

        {activeTab === "email" && (
          <form onSubmit={onSubmit} noValidate>
            <div className="form-group">
              <input
                type="email"
                placeholder="Địa chỉ Email"
                value={email}
                onChange={onEmailChange}
              />
              {errors.email && <p className="error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={onPasswordChange}
              />
              {errors.password && <p className="error">{errors.password}</p>}
            </div>

            {globalError && <p className="error global-error">{globalError}</p>}

            <div className="remember">
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>

            <button
              type="submit"
              className="btn-primary-submit"
              disabled={loading || walletLoading}
            >
              {loading ? "Đang xử lý..." : "Đăng nhập với Email"}
            </button>
          </form>
        )}

        {activeTab === "wallet" && (
          <div className="wallet-box-container">
            <ConnectButton
              onGenerateNonce={onGenerateNonce}
              onVerifyAndLogin={onVerifyAndLogin || onWalletLogin}
              className="btn-metamask-primary"
            />

            {globalError && (
              <p className="error global-error" style={{ marginTop: "12px" }}>
                {globalError}
              </p>
            )}

            <div className="wallet-divider">
              <span>HOẶC ĐĂNG NHẬP THỦ CÔNG</span>
            </div>

            {!showManualInputs ? (
              <button
                type="button"
                className="btn-manual-toggle"
                onClick={() => setShowManualInputs(true)}
              >
                ⌨️ Nhập Địa chỉ Ví & Chữ ký thủ công
              </button>
            ) : (
              <form
                onSubmit={handleManualSubmit}
                noValidate
                style={{ display: "flex", flexDirection: "column", gap: "12px" }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <input
                    type="text"
                    placeholder="1. Địa chỉ ví (addressWallet 0x...)"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={handleGetNonceClick}
                    disabled={nonceLoading}
                    style={{
                      height: "38px",
                      padding: "0 14px",
                      fontSize: "13px",
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.35)",
                      color: "#fff",
                      borderRadius: "8px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {nonceLoading ? "Đang sinh..." : "Tạo Nonce"}
                  </button>

                  {manualNonce && (
                    <div
                      className="nonce-display-badge"
                      style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      Nonce: {manualNonce}
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <input
                    type="text"
                    placeholder="2. Chữ ký (Signature 0x...)"
                    value={manualSig}
                    onChange={(e) => setManualSig(e.target.value)}
                  />
                </div>

                {(manualError || globalError) && (
                  <p className="error" style={{ fontSize: "13px", marginTop: "4px" }}>
                    {manualError || globalError}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn-primary-submit"
                  disabled={walletLoading}
                  style={{ height: "44px", marginTop: "4px" }}
                >
                  {walletLoading ? "Đang xác thực..." : "Xác nhận & Đăng nhập ví"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowManualInputs(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "12.5px",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  Thu gọn nhập thủ công
                </button>
              </form>
            )}
          </div>
        )}

        <p className="signup">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}
