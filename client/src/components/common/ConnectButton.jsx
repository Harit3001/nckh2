import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSignTypedData, useSignMessage } from "wagmi";
import { EIP712_DOMAIN, EIP712_TYPES, PRIMARY_TYPE } from "../../config/web3.js";

export const ConnectButton = ({
  onSuccessLogin,
  onGenerateNonce,
  onVerifyAndLogin,
  onError,
  className = "btn-metamask-primary",
  showDisconnect = false,
}) => {
  const { address, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { signTypedDataAsync } = useSignTypedData();
  const { signMessageAsync } = useSignMessage();

  const [loading, setLoading] = useState(false);

  const handleWalletAuth = async () => {
    setLoading(true);
    try {
      let targetAddress = address;

      if (!isConnected || !targetAddress) {
        const injectedConnector =
          connectors.find((c) => c.id === "metaMask" || c.id === "injected") ||
          connectors[0];
        if (!injectedConnector) {
          throw new Error("Không tìm thấy Connector ví nào khả dụng.");
        }
        const connectRes = await connectAsync({ connector: injectedConnector });
        targetAddress = connectRes.accounts[0];
      }

      if (!targetAddress) {
        throw new Error("Không thể lấy địa chỉ ví từ MetaMask/Wagmi.");
      }

      if (!onGenerateNonce || !onVerifyAndLogin) {
        return;
      }

      const nonceRes = await onGenerateNonce(targetAddress);
      const nonce = nonceRes?.data?.nonce;
      if (!nonce) {
        throw new Error(nonceRes?.message || "Không thể sinh nonce từ hệ thống API.");
      }

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
        if (typedErr?.code === 4001 || typedErr?.message?.includes("User rejected")) {
          throw new Error("Bạn đã hủy thao tác ký xác thực trên ví!");
        }
        signature = await signMessageAsync({ message: nonce });
      }

      if (!signature) {
        throw new Error("Không thể tạo chữ ký xác thực.");
      }

      await onVerifyAndLogin(targetAddress, signature);
      if (onSuccessLogin) {
        onSuccessLogin();
      }
    } catch (err) {
      const msg = err?.message || "Lỗi đăng nhập bằng ví Wagmi";
      if (onError) {
        onError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (isConnected && address && showDisconnect) {
    return (
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          type="button"
          className={className}
          onClick={handleWalletAuth}
          disabled={loading}
        >
          🦊 {loading ? "Đang xác thực..." : `Ví: ${formatAddress(address)} (Ký & Đăng nhập)`}
        </button>
        <button
          type="button"
          onClick={() => disconnect()}
          style={{
            padding: "8px 12px",
            fontSize: "12px",
            background: "rgba(255, 99, 71, 0.2)",
            border: "1px solid rgba(255, 99, 71, 0.4)",
            color: "#ff6347",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Ngắt kết nối
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleWalletAuth}
      disabled={loading || isConnectPending}
    >
      🦊 {loading || isConnectPending ? "Đang kết nối Wagmi..." : "Đăng nhập bằng ví (Wagmi Web3)"}
    </button>
  );
};

export default ConnectButton;
