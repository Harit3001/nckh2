export const API_URL = import.meta.env.VITE_API_URL || "https://work-flow-production-a826.up.railway.app";
export const API_BASE = API_URL;

export const getAccessToken = () => localStorage.getItem("accessToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");

export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export async function apiFetch(endpoint, options = {}, isRetry = false) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const token = getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("Không thể kết nối đến máy chủ backend (" + API_BASE + "). Vui lòng kiểm tra lại mạng!");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.status === 401 && !isRetry && getRefreshToken() && endpoint !== "/auth/login" && endpoint !== "/auth/refresh-token") {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getRefreshToken()}`
        }
      });
      const refreshData = await refreshRes.json();
      if (refreshRes.ok && refreshData?.data?.accessToken) {
        setTokens(refreshData.data.accessToken, refreshData.data.refreshToken || getRefreshToken());
        return apiFetch(endpoint, options, true);
      }
    } catch {
      clearTokens();
    }
  }

  if (!response.ok) {
    const errorMsg =
      data?.message ||
      data?.error ||
      `Yêu cầu thất bại (Mã lỗi ${response.status})`;

    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
