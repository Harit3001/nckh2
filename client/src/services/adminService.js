import { apiFetch } from "./api";

export const adminService = {
  async getPendingDoctors() {
    return await apiFetch("/admin/doctors");
  },

  async approveDoctor(doctorId) {
    return await apiFetch(`/admin/doctors/${doctorId}/approve`, {
      method: "PATCH",
    });
  },
};
