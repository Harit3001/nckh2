import type { Context } from "hono";
import { authService } from "../services/auth.service";
import type { Email, Payload } from "../types/payload.type";
import type {
  LoginSchema,
  RegisterPatientSchema,
  RegisterDoctorSchema,
} from "../validations/auth.validation";
import type { ForgotPassword, UpdatePassword } from "../types/auth.type";

export const authController = {
  login: async (c: Context) => {
    const { email, password } = c.get("validatedData") as LoginSchema;
    const token = await authService.login(email, password);

    return c.json(
      {
        success: true,
        status: 200,
        message: "login thành công",
        data: token,
      },
      200,
    );
  },

  registerPatient: async (c: Context) => {
    const {
      email,
      password,
      fullName,
      dob,
      bloodType,
      allergyInfo,
      nationalId,
    } = c.get("validatedData") as RegisterPatientSchema;
    const patient = await authService.registerPatient({
      email,
      password,
      fullName,
      dob,
      bloodType,
      allergyInfo,
      nationalId,
    });
    return c.json(
      {
        success: true,
        status: 201,
        message: "Đăng kí tài khoản thành công",
        data: patient,
      },
      201,
    );
  },

  registerDoctor: async (c: Context) => {
    const { email, fullName, password, doctorCode, speciality, hospitalId } =
      c.get("validatedData") as RegisterDoctorSchema;
    const doctor = await authService.registerDoctor({
      email,
      fullName,
      password,
      doctorCode,
      speciality,
      hospitalId,
    });

    return c.json(
      {
        success: true,
        status: 201,
        message: "Đăng kí tài khoản thành công",
        data: doctor,
      },
      201,
    );
  },

  logout: async (c: Context) => {
    const token = c.req.header("authorization")?.split(" ")[1];
    await authService.logout(token as string);

    return c.json(
      {
        success: true,
        status: 200,
        message: "Logout thành công",
      },
      200,
    );
  },

  refreshToken: async (c: Context) => {
    const token = c.req.header("authorization")?.split(" ")[1];
    const data = await authService.refreshToken(token as string);

    return c.json(
      {
        success: true,
        status: 200,
        message: "Token refreshed successfully",
        data: data,
      },
      200,
    );
  },

  profile: async (c: Context) => {
    const payload = c.get("user") as Payload;
    const { id, email, role } = payload;
    const user = await authService.profile(payload);
    return c.json(
      {
        success: true,
        status: 200,
        message: "Lấy dữ liệu thành công",
        data: {
          id,
          email,
          role,
          ...user,
        },
      },
      200,
    );
  },
  forgotPassword: async (c: Context) => {
    const data = c.get("validatedData") as Email;

    await authService.forgotPassword(data.email);

    return c.json(
      {
        success: true,
        status: 200,
        message: "Đã gửi mã OTP đến bạn",
      },
      200,
    );
  },
  verifyResetOtp: async (c: Context) => {
    const data = c.get("validatedData") as ForgotPassword;

    await authService.verifyResetOtp(data.email, data.otp);

    return c.json({
      success: true,
      status: 200,
      message: "verify otp thành công",
    });
  },
  updatePassword: async (c: Context) => {
    const data = c.get("validatedData") as UpdatePassword;

    await authService.updatePassword(
      data.email,
      data.password,
      data.confirmPassword,
    );

    return c.json({
      success: true,
      status: 200,
      message: "thay đổi password thành công",
    });
  },
  generateNonce: async (c: Context) => {
    const body = await c.req.json<{ addressWallet?: string }>();
    const addressWallet = body?.addressWallet;

    const result = await authService.generateNonce(addressWallet as string);

    if (result) {
      return c.json({
        success: true,
        status: 200,
        message: "Đã sinh nonce thành công",
        data: result,
      });
    }
  },
  linkerWallet: async (c: Context) => {
    const user = c.get("user") as Payload;

    const { addressWallet, signature } = await c.req.json<{
      addressWallet: string;
      signature: string;
    }>();

    const data = await authService.linkerWallet(
      addressWallet,
      signature,
      user.id,
    );

    return c.json(
      {
        success: true,
        status: 200,
        message: "Liên kết ví thành công",
        data: data,
      },
      200,
    );
  },
  verifyAndLogin: async (c: Context) => {
    const { addressWallet, signature } = await c.req.json<{
      addressWallet: string;
      signature: string;
    }>();

    const  { accessToken, refreshToken } = await authService.verifyAndLogin(addressWallet, signature);

    return c.json({
      success: true,
      status: 200,
      message: "Login thành công",
      data: {
        accessToken,
        refreshToken
      }
    }, 200);
  },
};
