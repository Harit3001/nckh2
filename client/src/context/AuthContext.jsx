import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authService } from "../services/authService";
import { getAccessToken, clearTokens } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const res = await authService.getProfile();
      if (res?.success && res?.data) {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
        return res.data;
      }
      setUser(null);
      localStorage.removeItem("user");
      return null;
    } catch (error) {
      if (error?.status === 401 || error?.response?.status === 401) {
        clearTokens();
        localStorage.removeItem("user");
        setUser(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = useCallback(
    async (email, password) => {
      const res = await authService.login(email, password);
      if (!res?.success || !res?.data) {
        throw new Error(res?.message || "Đăng nhập thất bại");
      }
      const profile = await fetchProfile();
      return profile || res.data;
    },
    [fetchProfile]
  );

  const generateNonce = useCallback(async (addressWallet) => {
    if (!addressWallet) throw new Error("Địa chỉ ví không hợp lệ");
    const res = await authService.generateNonce(addressWallet);
    if (!res?.success) {
      throw new Error(res?.message || "Không thể tạo nonce");
    }
    return res;
  }, []);

  const loginWithWallet = useCallback(
    async (addressWallet, signature) => {
      if (!addressWallet || !signature) {
        throw new Error("Thông tin đăng nhập ví không đầy đủ");
      }
      const res = await authService.loginWithWallet(addressWallet, signature);
      if (!res?.success || !res?.data) {
        throw new Error(res?.message || "Đăng nhập bằng ví thất bại");
      }
      const profile = await fetchProfile();
      return profile || res.data;
    },
    [fetchProfile]
  );

  const linkWallet = useCallback(
    async (addressWallet, signature) => {
      if (!addressWallet || !signature) {
        throw new Error("Thông tin liên kết ví không đầy đủ");
      }
      const res = await authService.linkWallet(addressWallet, signature);
      if (!res?.success) {
        throw new Error(res?.message || "Liên kết ví thất bại");
      }
      await fetchProfile();
      return res;
    },
    [fetchProfile]
  );

  const forgotPassword = useCallback(async (email) => {
    if (!email) throw new Error("Vui lòng nhập email");
    return await authService.forgotPassword(email);
  }, []);

  const verifyResetPassword = useCallback(async (email, otp) => {
    if (!email || !otp) throw new Error("Thông tin xác thực OTP không đầy đủ");
    return await authService.verifyResetPassword(email, otp);
  }, []);

  const updatePassword = useCallback(async (email, password, confirmPassword) => {
    if (!email || !password) throw new Error("Vui lòng điền đầy đủ thông tin");
    if (password !== confirmPassword) throw new Error("Mật khẩu xác nhận không khớp");
    return await authService.updatePassword(email, password, confirmPassword);
  }, []);

  const registerPatient = useCallback(async (payload) => {
    if (!payload) throw new Error("Dữ liệu đăng ký không hợp lệ");
    return await authService.registerPatient(payload);
  }, []);

  const registerDoctor = useCallback(async (payload) => {
    if (!payload) throw new Error("Dữ liệu đăng ký không hợp lệ");
    return await authService.registerDoctor(payload);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearTokens();
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    generateNonce,
    loginWithWallet,
    linkWallet,
    forgotPassword,
    verifyResetPassword,
    updatePassword,
    registerPatient,
    registerDoctor,
    logout,
    refetchProfile: fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
