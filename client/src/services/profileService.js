import { apiFetch } from "./api";

export const profileService = {
  async updatePatientProfile(data) {
    return await apiFetch("/profile/patient", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async updateDoctorProfile(data) {
    return await apiFetch("/profile/doctor", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};
