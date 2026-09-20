import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useConnect, useSignTypedData } from "wagmi";
import LoginForm from "../../components/auth/LoginForm.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { EIP712_DOMAIN, EIP712_TYPES, PRIMARY_TYPE } from "../../config/web3.js";
import { getAddress } from "viem";
export default function LoginPage() {
    const navigate = useNavigate();

    const { login, generateNonce, loginWithWallet } = useAuth();
    const { address, isConnected } = useAccount();
    const { connectAsync, connectors } = useConnect();
    const { signTypedDataAsync } = useSignTypedData();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [walletLoading, setWalletLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("email");

    const [errors, setErrors] = useState({
        email: "",
        password: "",
        message: "",
    });

    const handleEmailChange = (e) => {
        const val = typeof e === "string" ? e : e?.target?.value ?? "";
        setEmail(val);
        setErrors((prev) => ({ ...prev, email: "", message: "" }));
    };

    const handlePasswordChange = (e) => {
        const val = typeof e === "string" ? e : e?.target?.value ?? "";
        setPassword(val);
        setErrors((prev) => ({ ...prev, password: "", message: "" }));
    };

    const handleSubmit = async (event) => {
        event?.preventDefault();

        const newErrors = { email: "", password: "", message: "" };

        if (!email.trim()) {
            newErrors.email = "Vui lòng nhập email";
        }

        if (!password) {
            newErrors.password = "Vui lòng nhập mật khẩu";
        }

        if (newErrors.email || newErrors.password) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);
            setErrors({ email: "", password: "", message: "" });
            await login(email.trim(), password);
            navigate("/home");
        } catch (error) {
            let message = error?.message || "Đăng nhập thất bại";
            if (typeof message !== "string") {
                message = "Email hoặc mật khẩu không chính xác";
            }
            setErrors({ email: "", password: "", message });
        } finally {
            setLoading(false);
        }
    };

    const getMetaMaskConnector = () => {
        if (!connectors?.length) return null;
        return (
            connectors.find((c) => c?.id?.toLowerCase().includes("metamask") || c?.name?.toLowerCase().includes("metamask")) ||
            connectors.find((c) => c?.id === "injected") ||
            connectors[0]
        );
    };

    const connectWallet = async () => {
        const connector = getMetaMaskConnector();
        if (!connector) {
            throw new Error("Không tìm thấy connector MetaMask. Vui lòng cài đặt extension MetaMask!");
        }

        try {
            const result = await connectAsync({ connector });
            const walletAddress = result?.accounts?.[0];
            if (!walletAddress) {
                throw new Error("Không lấy được địa chỉ ví từ MetaMask!");
            }
            return walletAddress;
        } catch (error) {
            if (error?.code === 4001) {
                throw new Error("Bạn đã từ chối kết nối MetaMask.");
            }
            throw error;
        }
    };

    const handleVerifyAndLogin = async (arg1, arg2) => {
        let walletAddress = "";
        let signature = "";

        if (typeof arg1 === "string") {
            walletAddress = arg1;
            signature = arg2 || "";
        } else if (arg1 && typeof arg1 === "object") {
            walletAddress = arg1.addressWallet || arg1.walletAddress || "";
            signature = arg1.signature || "";
        }

        try {
            setWalletLoading(true);
            setErrors({ email: "", password: "", message: "" });

            if (!walletAddress) throw new Error("Vui lòng nhập/chọn địa chỉ ví!");
            if (!signature) throw new Error("Vui lòng nhập/tạo chữ ký!");

            await loginWithWallet(walletAddress, signature);
            navigate("/home");
        } catch (error) {
            let message = error?.message || "Xác thực ví thất bại";
            const lower = String(message).toLowerCase();

            if (lower.includes("chưa được liên kết") || lower.includes("walletnotlinked") || lower.includes("wallet not linked")) {
                message = "Ví Web3 này hiện CHƯA ĐƯỢC LIÊN KẾT với tài khoản nào. Vui lòng đăng nhập bằng Email/Password trước, sau đó bấm 'Liên kết ví Ethereum' tại Trang chủ!";
            } else if (lower.includes("nonce")) {
                message = "Nonce không hợp lệ hoặc đã hết hạn (quá 5 phút). Vui lòng sinh nonce mới và thử lại.";
            } else if (lower.includes("chữ kí không hợp lệ") || lower.includes("chữ ký không hợp lệ") || lower.includes("invalid signature")) {
                message = "Chữ ký EIP-712 không hợp lệ hoặc không tương ứng với ví này.";
            }

            setErrors({ email: "", password: "", message });
            throw error;
        } finally {
            setWalletLoading(false);
        }
    };

    const handleWalletLogin = async () => {
        try {
            setWalletLoading(true);
            setErrors({
                email: "",
                password: "",
                message: "",
            });

            let walletAddress = address ? getAddress(address) : "";

            if (!isConnected || !walletAddress) {
                walletAddress = await connectWallet();
            }

            console.log(walletAddress);
            const nonceResponse =
                await generateNonce(walletAddress);

            const nonce =
                nonceResponse?.data?.nonce;

            if (!nonce) {
                throw new Error(
                    "Backend không trả về nonce"
                );
            }

            const signature =
                await signTypedDataAsync({
                    domain: EIP712_DOMAIN,
                    types: EIP712_TYPES,
                    primaryType: PRIMARY_TYPE,

                    message: {
                        wallet: walletAddress,
                        nonce,
                    },
                });
            console.log(signature);
            await loginWithWallet(
                walletAddress,
                signature
            );

            navigate("/home");

        } catch (error) {

            let message =
                error?.message ||
                "Đăng nhập bằng ví thất bại";

            if (
                error?.code === 4001 ||
                message
                    .toLowerCase()
                    .includes("user rejected")
            ) {
                message =
                    "Bạn đã từ chối ký xác thực trên MetaMask.";
            }

            setErrors({
                email: "",
                password: "",
                message,
            });

        } finally {
            setWalletLoading(false);
        }
    };

    const handleGenerateNonce = async (walletAddress) => {
        try {
            if (!walletAddress) throw new Error("Vui lòng nhập địa chỉ ví!");
            return await generateNonce(walletAddress.trim());
        } catch (error) {
            setErrors((prev) => ({
                ...prev,
                message: error?.message || "Không thể tạo nonce",
            }));
            throw error;
        }
    };

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        setErrors({ email: "", password: "", message: "" });
    };

    return (
        <LoginForm
            email={email}
            password={password}
            errors={errors}
            loading={loading}
            walletLoading={walletLoading}
            activeTab={activeTab}
            onEmailChange={handleEmailChange}
            onPasswordChange={handlePasswordChange}
            onSubmit={handleSubmit}
            onWalletLogin={handleWalletLogin}
            onManualWalletLogin={handleVerifyAndLogin}
            onGenerateNonce={handleGenerateNonce}
            onVerifyAndLogin={handleVerifyAndLogin}
            onTabSwitch={handleTabSwitch}
            walletAddress={address || ""}
            walletConnected={isConnected}
        />
    );
}
