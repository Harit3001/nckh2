import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  apiFetch,
  getAccessToken,
  setTokens,
  clearTokens,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
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
      const res = await apiFetch("/auth/profile");

      if (res?.success && res?.data) {
        setUser(res.data);

        localStorage.setItem(
          "user",
          JSON.stringify(res.data)
        );

        return res.data;
      }

      setUser(null);
      localStorage.removeItem("user");

      return null;
    } catch (error) {
      if (
        error?.status === 401 ||
        error?.response?.status === 401
      ) {
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
      try {
        const res = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
          }),
        });

        if (
          !res?.success ||
          !res?.data
        ) {
          throw new Error(
            res?.message ||
            "Đăng nhập thất bại"
          );
        }

        const {
          accessToken,
          refreshToken,
        } = res.data;

        if (!accessToken) {
          throw new Error(
            "Backend không trả về accessToken"
          );
        }

        setTokens(
          accessToken,
          refreshToken
        );

        const profile =
          await fetchProfile();

        return (
          profile || res.data
        );
      } catch (error) {
        throw error;
      }
    },
    [fetchProfile]
  );

  const generateNonce = useCallback(
    async (addressWallet) => {
      if (!addressWallet) {
        throw new Error(
          "Địa chỉ ví không hợp lệ"
        );
      }

      try {
        const res = await apiFetch(
          "/auth/generate-nonce",
          {
            method: "POST",
            body: JSON.stringify({
              addressWallet,
            }),
          }
        );

        if (!res?.success) {
          throw new Error(
            res?.message ||
            "Không thể tạo nonce"
          );
        }

        return res;
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const loginWithWallet = useCallback(
    async (
      addressWallet,
      signature
    ) => {
      if (!addressWallet) {
        throw new Error(
          "Không tìm thấy địa chỉ ví"
        );
      }

      if (!signature) {
        throw new Error(
          "Không tìm thấy chữ ký"
        );
      }
      console.log(addressWallet);
      try {
        const res = await apiFetch(
          "/auth/verify-and-login",
          {
            method: "POST",
            body: JSON.stringify({
              addressWallet,
              signature,
            }),
          }
        );

        if (
          !res?.success ||
          !res?.data
        ) {
          throw new Error(
            res?.message ||
            "Đăng nhập bằng ví thất bại"
          );
        }

        const {
          accessToken,
          refreshToken,
        } = res.data;

        if (!accessToken) {
          throw new Error(
            "Backend không trả về accessToken"
          );
        }

        setTokens(
          accessToken,
          refreshToken
        );

        const profile =
          await fetchProfile();

        return (
          profile || res.data
        );
      } catch (error) {
        throw error;
      }
    },
    [fetchProfile]
  );

  const linkWallet = useCallback(
    async (
      addressWallet,
      signature
    ) => {
      if (!addressWallet) {
        throw new Error(
          "Không tìm thấy địa chỉ ví"
        );
      }

      if (!signature) {
        throw new Error(
          "Không tìm thấy chữ ký"
        );
      }

      try {
        const res = await apiFetch(
          "/auth/link-wallet",
          {
            method: "POST",
            body: JSON.stringify({
              addressWallet,
              signature,
            }),
          }
        );

        if (!res?.success) {
          throw new Error(
            res?.message ||
            "Liên kết ví thất bại"
          );
        }

        await fetchProfile();

        return res;
      } catch (error) {
        throw error;
      }
    },
    [fetchProfile]
  );

  const forgotPassword = useCallback(
    async (email) => {
      if (!email) {
        throw new Error(
          "Vui lòng nhập email"
        );
      }

      try {
        const res = await apiFetch(
          "/auth/forgot-password",
          {
            method: "POST",
            body: JSON.stringify({
              email,
            }),
          }
        );

        return res;
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const verifyResetPassword =
    useCallback(
      async (email, otp) => {
        if (!email) {
          throw new Error(
            "Email không được để trống"
          );
        }

        if (!otp) {
          throw new Error(
            "OTP không được để trống"
          );
        }

        try {
          const res =
            await apiFetch(
              "/auth/verify-reset-password",
              {
                method: "POST",
                body: JSON.stringify({
                  email,
                  otp,
                }),
              }
            );

          return res;
        } catch (error) {
          throw error;
        }
      },
      []
    );

  const updatePassword =
    useCallback(
      async (
        email,
        password,
        confirmPassword
      ) => {
        if (!email) {
          throw new Error(
            "Email không được để trống"
          );
        }

        if (!password) {
          throw new Error(
            "Mật khẩu không được để trống"
          );
        }

        if (
          password !== confirmPassword
        ) {
          throw new Error(
            "Mật khẩu xác nhận không khớp"
          );
        }

        try {
          const res =
            await apiFetch(
              "/auth/update-password",
              {
                method: "POST",
                body: JSON.stringify({
                  email,
                  password,
                  confirmPassword,
                }),
              }
            );

          return res;
        } catch (error) {
          throw error;
        }
      },
      []
    );

  const registerPatient =
    useCallback(async (payload) => {
      if (!payload) {
        throw new Error(
          "Dữ liệu đăng ký không hợp lệ"
        );
      }

      try {
        const res =
          await apiFetch(
            "/auth/register-patient",
            {
              method: "POST",
              body: JSON.stringify(
                payload
              ),
            }
          );

        return res;
      } catch (error) {
        throw error;
      }
    }, []);

  const registerDoctor =
    useCallback(async (payload) => {
      if (!payload) {
        throw new Error(
          "Dữ liệu đăng ký không hợp lệ"
        );
      }

      try {
        const res =
          await apiFetch(
            "/auth/register-doctor",
            {
              method: "POST",
              body: JSON.stringify(
                payload
              ),
            }
          );

        return res;
      } catch (error) {
        throw error;
      }
    }, []);

  const logout = useCallback(
    async () => {
      try {
        const token =
          getAccessToken();

        if (token) {
          await apiFetch(
            "/auth/logout",
            {
              method: "POST",
            }
          );
        }
      } catch (error) {
      } finally {
        clearTokens();
        localStorage.removeItem(
          "user"
        );
        setUser(null);
      }
    },
    []
  );

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}
