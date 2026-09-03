import { hashPassword } from "./../utils/hashPassword";
import { prisma } from "../libs/prisma";
import type { Doctor } from "../types/doctor.type";
import type { Patient } from "../types/patient";
import type { Payload } from "../types/payload.type";
import { createError } from "../utils/err";
import { comparePassword } from "../utils/hashPassword";
import { isAddress, getAddress, verifyTypedData } from "viem";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { randomInt } from "node:crypto";
import { sendMail } from "../configs/mail";
import { compareOTP, hashOTP } from "../utils/hashOTP";
import crypto from "crypto";

export const EIP712_DOMAIN = {
  name: "My Web3 App",
  version: "1",
} as const;

export const EIP712_TYPES = {
  Login: [
    { name: "wallet", type: "address" },
    { name: "nonce", type: "string" },
  ],
} as const;

export const authService = {
  login: async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) throw createError("Email or password is incorrect", 401);
    if (user.status == "PENDING_APPROVAL")
      throw createError("Tài khoản chưa được duyệt", 403);
    const isMatched = await comparePassword(password, user.passwordHash);

    if (!isMatched) throw createError("Email or password is incorrect", 401);

    const payLoad: Payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      jti: crypto.randomUUID(),
    };

    const accessToken = generateAccessToken(payLoad);
    const refreshToken = generateRefreshToken(payLoad);

    await prisma.refreshToken.create({
      data: {
        jti: payLoad.jti,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  },
  registerPatient: async (data: Patient) => {
    const {
      email,
      password,
      fullName,
      dob,
      bloodType,
      allergyInfo,
      nationalId,
    } = data;
    const exitEmail = await prisma.user.findFirst({
      where: { email },
    });
    if (exitEmail) throw createError("Email đã tồn tại", 400);

    const exitNationalId = await prisma.patient.findFirst({
      where: { nationalIdHash: nationalId },
    });
    if (exitNationalId) throw createError("Số CMND/CCCD đã tồn tại", 409);

    const hashed = await hashPassword(password);

    const patient = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashed,
          fullName: fullName,
          role: "PATIENT",
          status: "PENDING",
        },
      });
      return await tx.patient.create({
        data: {
          userId: user.id,
          phid: `PH${user.id.toString().padStart(6, "0")}`,
          dob: dob,
          bloodType,
          allergyInfo,
          nationalIdHash: nationalId,
        },
      });
    });
    return patient;
  },
  registerDoctor: async (data: Doctor) => {
    const { email, fullName, password, doctorCode, speciality, hospitalId } =
      data;
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createError("Email đã tồn tại", 409);
    }

    const doctor = await prisma.doctor.findUnique({
      where: { doctorCode },
    });

    if (doctor) throw createError("Bác sĩ này đã tồn tại", 409);

    const hospital = await prisma.hospital.findUnique({
      where: {
        id: hospitalId,
      },
    });

    if (!hospital) throw createError("bệnh viện này không tồn tại", 404);

    const passwordHash = await hashPassword(password);

    const newDoctor = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          fullName,
          passwordHash,
          role: "DOCTOR",
          status: "PENDING_APPROVAL",
        },
      });
      return await tx.doctor.create({
        data: {
          userId: user.id,
          doctorCode,
          speciality,
          hospitalId,
        },
      });
    });
    return newDoctor;
  },
  logout: async (token: string) => {
    if (!token) {
      throw createError("Thiếu refresh token", 409);
    }
    try {
      const payload = verifyRefreshToken(token) as Payload;

      const storedToken = await prisma.refreshToken.findUnique({
        where: {
          jti: payload.jti,
        },
      });

      if (!storedToken) {
        throw createError("Refresh token không hợp lệ", 401);
      }

      await prisma.refreshToken.delete({
        where: {
          jti: payload.jti,
        },
      });
      return true;
    } catch (err) {
      if (
        err instanceof JsonWebTokenError ||
        err instanceof TokenExpiredError
      ) {
        throw createError("Refresh token không hợp lệ", 401);
      }
      throw err;
    }
  },

  refreshToken: async (token: string) => {
    if (!token) {
      throw createError("Thiếu refresh token", 409);
    }
    try {
      const verifyToken = verifyRefreshToken(token) as Payload;

      const storedToken = await prisma.refreshToken.findUnique({
        where: {
          jti: verifyToken.jti,
        },
      });

      if (!storedToken) {
        throw createError("Refresh token không hợp lệ", 401);
      }

      const user = await prisma.user.findUnique({
        where: {
          id: verifyToken.id,
        },
      });

      if (!user) {
        throw createError("Người dùng không tồn tại", 404);
      }

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        jti: crypto.randomUUID(),
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      await prisma.$transaction(async (tx) => {
        await tx.refreshToken.delete({
          where: {
            jti: verifyToken.jti,
          },
        });

        await tx.refreshToken.create({
          data: {
            jti: payload.jti,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch (err) {
      if (
        err instanceof JsonWebTokenError ||
        err instanceof TokenExpiredError
      ) {
        throw createError("Refresh token không hợp lệ", 401);
      }
      throw err;
    }
  },
  profile: async (data: Payload) => {
    const { id, role } = data;
    if (role === "PATIENT") {
      const patient = await prisma.patient.findUnique({
        where: {
          userId: id,
        },
      });
      return patient;
    } else if (role === "DOCTOR") {
      const doctor = await prisma.doctor.findUnique({
        where: {
          userId: id,
        },
      });
      return doctor;
    }
    throw createError("Role không hợp lệ", 403);
  },
  forgotPassword: async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw createError("email này không tồn tại", 404);

    try {
      const otp = randomInt(100000, 1000000).toString();

      const otpHash = await hashOTP(otp);

      await prisma.$transaction(async (tx) => {
        await tx.passwordResetToken.deleteMany({
          where: {
            userId: user.id,
          },
        });

        await tx.passwordResetToken.create({
          data: {
            userId: user.id,
            otpHash,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        });
      });

      const sendmail = await sendMail(email, otp);

      return sendmail;
    } catch (error) {
      throw error;
    }
  },
  verifyResetOtp: async (email: string, otp: string) => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw createError("Người dùng này không tồn tại", 404);
    }

    const OTPReset = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!OTPReset) {
      throw createError("Vui lòng gửi yêu cầu để nhận OTP", 404);
    }

    if (OTPReset.usedAt) {
      throw createError("Mã OTP này đã được sử dụng", 400);
    }

    if (OTPReset.expiresAt < new Date()) {
      throw createError("Mã OTP này đã hết hạn", 400);
    }

    if (OTPReset.verifiedAt) {
      throw createError("OTP đã được xác thực", 400);
    }

    const isOTP = await compareOTP(otp, OTPReset.otpHash);

    if (!isOTP) {
      throw createError("Mã OTP không chính xác", 400);
    }

    const updateOTP = await prisma.passwordResetToken.update({
      where: {
        id: OTPReset.id,
      },
      data: {
        verifiedAt: new Date(),
      },
    });

    return updateOTP;
  },
  updatePassword: async (
    email: string,
    password: string,
    confirmPassword: string,
  ) => {
    if (password !== confirmPassword)
      throw createError("Mật khẩu không khớp", 400);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw createError("Người dùng này không tồn tại", 404);

    const verifyOTP = await prisma.passwordResetToken.findFirst({
      where: { userId: user.id },
    });

    if (!verifyOTP || !verifyOTP.verifiedAt)
      throw createError("vui lòng verify OTP", 400);

    if (verifyOTP.expiresAt < new Date())
      throw createError("đã hết thời gian đổi mật khẩu", 400);

    if (verifyOTP.usedAt) {
      throw createError("Mã OTP đã được sử dụng", 400);
    }
    const newPassword = await hashPassword(password);

    await prisma.$transaction(async (tx) => {
      // Đổi mật khẩu
      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          passwordHash: newPassword,
        },
      });

      // Đánh dấu OTP đã sử dụng
      await tx.passwordResetToken.update({
        where: {
          id: verifyOTP.id,
        },
        data: {
          usedAt: new Date(),
        },
      });

      // Đăng xuất tất cả thiết bị
      await tx.refreshToken.deleteMany({
        where: {
          userId: user.id,
        },
      });
    });

    return true;
  },
  generateNonce: async (addressWallet: string) => {
    if (!addressWallet || !isAddress(addressWallet))
      throw createError("Địa chỉ ví không hợp lệ", 400);
    const formatAddress = getAddress(addressWallet);

    const nonce = crypto.randomBytes(16).toString("hex");

    const data = await prisma.walletNonce.upsert({
      where: {
        walletAddress: formatAddress.toLowerCase(),
      },
      update: {
        nonce: nonce,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
      create: {
        walletAddress: formatAddress.toLowerCase(),
        nonce,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    return { nonce: data.nonce };
  },
  linkerWallet: async (
    addressWallet: string,
    signature: string,
    userId: number,
  ) => {
    if (!addressWallet || !isAddress(addressWallet)) {
      throw createError("Địa chỉ ví không hợp lệ", 400);
    }
    if (!signature || !signature.startsWith("0x")) {
      throw createError("Chữ ký không hợp lệ", 400);
    }
    const formatAddress = getAddress(addressWallet);
    const lowerAddress = formatAddress.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.walletAddress) {
      throw createError("Tài khoản của bạn đã liên kết với ví rồi", 400);
    }

    const walletOnce = await prisma.user.findFirst({
      where: { walletAddress: lowerAddress },
    });

    if (walletOnce)
      throw createError("Ví này đã được liên kết với tài khoản khác", 400);

    const storedNonce = await prisma.walletNonce.findUnique({
      where: { walletAddress: lowerAddress },
    });

    if (!storedNonce) {
      throw createError("Nonce không hợp lệ", 400);
    }

    if (storedNonce.expiresAt < new Date()) {
      await prisma.walletNonce.delete({
        where: { walletAddress: lowerAddress },
      });
      throw createError("Nonce đã hết hạn, vui lòng thử lại", 400);
    }

    const isValid = await verifyTypedData({
      address: formatAddress as `0x${string}`,
      domain: EIP712_DOMAIN,
      types: EIP712_TYPES,
      primaryType: "Login",
      message: {
        wallet: formatAddress as `0x${string}`,
        nonce: storedNonce.nonce,
      },
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      throw createError("Chữ ký không hợp lệ", 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          walletAddress: lowerAddress,
        },
      });

      await tx.walletNonce.delete({
        where: {
          walletAddress: lowerAddress,
        },
      });
    });

    return { walletAddress: lowerAddress };
  },
  verifyAndLogin: async (addressWallet: string, signature: string) => {
    if (!addressWallet || isAddress(addressWallet))
      throw createError("Địa chỉ ví không hợp lệ", 400);
    if (!signature || !signature.startsWith("0x")) {
      throw createError("Chữ ký không hợp lệ", 400);
    }
    const formatAddress = getAddress(addressWallet);
    const lowerAddress = formatAddress.toLowerCase();

    const storeNonce = await prisma.walletNonce.findUnique({
      where: { walletAddress: lowerAddress },
    });

    if (!storeNonce)
      throw createError("Đăng nhập không hợp lệ hoặc đã hết hạn", 400);

    if (storeNonce.expiresAt < new Date()) {
      await prisma.walletNonce.delete({
        where: {
          walletAddress: lowerAddress,
        },
      });
      throw createError("nonce đã hết hạn vui lòng thử lại", 400);
    }
    const isValid = await verifyTypedData({
      address: formatAddress as `0x${string}`,
      domain: EIP712_DOMAIN,
      types: EIP712_TYPES,
      primaryType: "Login",

      message: {
        wallet: formatAddress as `0x${string}`,
        nonce: storeNonce.nonce,
      },
      signature: signature as `0x${string}`,
    });

    if (!isValid) throw createError("Chữ kí không hợp lệ");

    const user = await prisma.user.findFirst({
      where: { walletAddress: lowerAddress },
    });
    if (!user) throw createError("Ví hiện tại chưa được liên kết", 400);

    await prisma.walletNonce.delete({
      where: {
        walletAddress: lowerAddress,
      },
    });

    const payLoad: Payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      jti: crypto.randomUUID(),
    };

    const accessToken = generateAccessToken(payLoad);
    const refreshToken = generateRefreshToken(payLoad);

    await prisma.refreshToken.create({
      data: {
        jti: payLoad.jti,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  },
};
