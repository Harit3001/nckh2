import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ message: "Email là bắt buộc" })
    .email("Email không hợp lệ")
    .trim()
    .toLowerCase(),
  password: z
    .string({ message: "Mật khẩu là bắt buộc" })
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(50, "Mật khẩu không được vượt quá 50 ký tự"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerPatientSchema = z.object({
  email: z
    .string({ message: "Email là bắt buộc" })
    .email("Email không hợp lệ")
    .trim()
    .toLowerCase(),
  password: z
    .string({ message: "Mật khẩu là bắt buộc" })
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(50, "Mật khẩu không được vượt quá 50 ký tự"),
  fullName: z
    .string({ message: "Họ tên là bắt buộc" })
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(100, "Họ tên không được vượt quá 100 ký tự")
    .trim(),
  dob: z
    .string({ message: "Ngày sinh là bắt buộc" })
    .refine(
      (date) => !isNaN(new Date(date).getTime()),
      "Ngày sinh không hợp lệ",
    )
    .transform((date) => new Date(date))
    .refine(
      (date) => date < new Date(),
      "Ngày sinh không được trong tương lai",
    ),
  bloodType: z
    .string({ message: "Nhóm máu là bắt buộc" })
    .regex(
      /^(O|A|B|AB)[+-]$/,
      "Nhóm máu không hợp lệ (O+, O-, A+, A-, B+, B-, AB+, AB-)",
    )
    .trim()
    .toUpperCase(),
  allergyInfo: z
    .string({ message: "Thông tin dị ứng là bắt buộc" })
    .max(500, "Thông tin dị ứng không được vượt quá 500 ký tự")
    .trim(),
  nationalId: z
    .string({ message: "Số CMND/CCCD là bắt buộc" })
    .regex(/^\d{9}$|^\d{12}$/, "Số CMND/CCCD không hợp lệ (9 hoặc 12 chữ số)")
    .trim(),
});

export type RegisterPatientSchema = z.infer<typeof registerPatientSchema>;

export const registerDoctorSchema = z.object({
  email: z
    .string({ message: "Email là bắt buộc" })
    .email("Email không hợp lệ")
    .trim()
    .toLowerCase(),
  fullName: z
    .string({ message: "Họ tên là bắt buộc" })
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(100, "Họ tên không được vượt quá 100 ký tự")
    .trim(),
  password: z
    .string({ message: "Mật khẩu là bắt buộc" })
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(50, "Mật khẩu không được vượt quá 50 ký tự"),
  doctorCode: z
    .string({ message: "Mã bác sĩ là bắt buộc" })
    .regex(/^BS\d{6,}$/, "Mã bác sĩ không hợp lệ (BS + ít nhất 6 số)")
    .trim(),
  speciality: z
    .string({ message: "Chuyên khoa là bắt buộc" })
    .min(2, "Chuyên khoa phải có ít nhất 2 ký tự")
    .max(50, "Chuyên khoa không được vượt quá 50 ký tự")
    .trim(),
  hospitalId: z
    .number({ message: "ID bệnh viện phải là số" })
    .int("ID bệnh viện phải là số nguyên")
    .positive("ID bệnh viện phải là số dương"),
});

export type RegisterDoctorSchema = z.infer<typeof registerDoctorSchema>;

export const Email = z.object({
  email: z
    .string({ message: "email phải tồn tại" })
    .email("Email không hợp lệ")
    .min(1, "email không được để trống"),
});

export type Email = z.infer<typeof Email>;

export const ForgotPassword = z.object({
  email: z
    .string({ message: "email phải tồn tại" })
    .email("Email không hợp lệ")
    .min(1, "email không được để trống"),
  otp: z
    .string({ message: "mã OTP phải tồn tại" })
    .length(6, { message: "mã otp phải có 6 kí tự" }),
});

export type ForgotPassword = z.infer<typeof ForgotPassword>;

export const UpdatePassword = z.object({
  email: z
    .string({ message: "email phải tồn tại" })
    .email("Email không hợp lệ")
    .min(1, "email không được để trống"),
  password: z
    .string({ message: "Mật khẩu là bắt buộc" })
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(50, "Mật khẩu không được vượt quá 50 ký tự"),
  confirmPassword: z
    .string({ message: "Mật khẩu là bắt buộc" })
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(50, "Mật khẩu không được vượt quá 50 ký tự"),
});

export type UpdatePassword = z.infer<typeof UpdatePassword>;
