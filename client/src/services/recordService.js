import { apiFetch } from "./api";

export const recordService = {
  // Admin: Get all medical records
  async getAllRecords() {
    return await apiFetch("/media-record");
  },

  // Doctor: Create initial medical record
  async createRecord(payload) {
    return await apiFetch("/media-record", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Doctor: Get logged-in doctor's medical records
  async getDoctorRecords() {
    return await apiFetch("/media-record/doctor");
  },

  // Patient: Get logged-in patient's medical records
  async getPatientRecords() {
    return await apiFetch("/media-record/patient");
  },

  // Admin: Get records by hospital ID
  async getHospitalRecords(hospitalId) {
    return await apiFetch(`/media-record/hospital/${hospitalId}`);
  },

  // Get medical record by ID
  async getRecordById(id) {
    return await apiFetch(`/media-record/${id}`);
  },

  // Doctor: Add progress record (Bệnh án diễn tiến)
  async addProgressRecord(payload) {
    return await apiFetch("/medical-records/progress", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
