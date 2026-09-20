import { apiFetch, setTokens, clearTokens, getAccessToken } from "./api";

export const authService = {
  async login(email, password) {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res?.data?.accessToken) {
      setTokens(res.data.accessToken, res.data.refreshToken);
    }
    return res;
  },

  async registerPatient(payload) {
    return await apiFetch("/auth/register-patient", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async registerDoctor(payload) {
    return await apiFetch("/auth/register-doctor", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getProfile() {
    return await apiFetch("/auth/profile");
  },

  async logout() {
    try {
      const token = getAccessToken();
      if (token) {
        await apiFetch("/auth/logout", { method: "POST" });
      }
    } catch (err) {
      console.warn("Logout API warning:", err);
    } finally {
      clearTokens();
    }
  },

  async refreshToken() {
    return await apiFetch("/auth/refresh-token", { method: "POST" });
  },

  async forgotPassword(email) {
    return await apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async verifyResetPassword(email, otp) {
    return await apiFetch("/auth/verify-reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  },

  async updatePassword(email, password, confirmPassword) {
    return await apiFetch("/auth/update-password", {
      method: "POST",
      body: JSON.stringify({ email, password, confirmPassword }),
    });
  },

  async generateNonce(addressWallet) {
    return await apiFetch("/auth/generate-nonce", {
      method: "POST",
      body: JSON.stringify({ addressWallet }),
    });
  },

  async linkWallet(addressWallet, signature) {
    return await apiFetch("/auth/link-wallet", {
      method: "POST",
      body: JSON.stringify({ addressWallet, signature }),
    });
  },

  async loginWithWallet(addressWallet, signature) {
    const res = await apiFetch("/auth/verify-and-login", {
      method: "POST",
      body: JSON.stringify({ addressWallet, signature }),
    });
    if (res?.data?.accessToken) {
      setTokens(res.data.accessToken, res.data.refreshToken);
    }
    return res;
  },
};
