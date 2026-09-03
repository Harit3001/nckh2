import { prisma } from "../libs/prisma";
import { createError } from "../utils/err";

export const adminService = {
  getAllDoctorInactive: async () => {
    const doctors = await prisma.user.findMany({
      where: {
        status: "PENDING_APPROVAL",
        role: "DOCTOR",
      },
    });

    return doctors;
  },

  approveDoctor: async (doctorId: number, adminId: number) => {
    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
    });

    if (!doctor) {
      throw createError("Bác sĩ này không tồn tại", 404);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: doctor.userId,
      },
    });

    if (!user) {
      throw createError("Tài khoản bác sĩ không tồn tại", 404);
    }

    if (user.status !== "PENDING_APPROVAL") {
      throw createError("Bác sĩ này đã được xử lý", 400);
    }

    const newDoctor = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          status: "ACTIVE",
        },
      });

      return await tx.doctor.update({
        where: {
          id: doctorId,
        },
        data: {
          approvedAt: new Date(),
          approveBy: adminId,
        },
      });
    });

    return newDoctor;
  },
};
