import { adminService } from "../services/admin.service";
import type { Payload } from "../types/payload.type";
import type { Context } from "hono";

export const adminController = {
  getAllDoctorInactive: async (c: Context) => {
    const doctors = await adminService.getAllDoctorInactive();

    return c.json({
      success: true,
      status: 200,
      message: "Lấy danh sách thành công",
      data: doctors,
    });
  },

  approveDoctor: async (c: Context) => {
    const admin = c.get("user") as Payload;

    const doctorId = Number(c.req.param("doctorId"));

    const doctor = await adminService.approveDoctor(doctorId, admin.id);

    return c.json({
      success: true,
      status: 200,
      message: "Duyệt thành công",
      data: doctor,
    });
  },
};
