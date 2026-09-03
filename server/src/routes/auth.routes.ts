import { Hono } from "hono";
import { authController } from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validation.middleware";
import {
  loginSchema,
  registerPatientSchema,
  registerDoctorSchema,
  Email,
  ForgotPassword,
  UpdatePassword,
} from "../validations/auth.validation";
import { authMiddleware } from "../middlewares/auth.middleware";

const authRoutes = new Hono();

authRoutes.post("/login", validateBody(loginSchema), authController.login);
authRoutes.post(
  "/register-patient",
  validateBody(registerPatientSchema),
  authController.registerPatient,
);

authRoutes.post(
  "/register-doctor",
  validateBody(registerDoctorSchema),
  authController.registerDoctor,
);
authRoutes.post("/logout", authMiddleware, authController.logout);
authRoutes.post("/refresh-token", authMiddleware, authController.refreshToken);
authRoutes.get("/profile", authMiddleware, authController.profile);

authRoutes.post(
  "/forgot-password",
  validateBody(Email),
  authController.forgotPassword,
);
authRoutes.post(
  "/verify-reset-password",
  validateBody(ForgotPassword),
  authController.verifyResetOtp,
);
authRoutes.post(
  "/update-password",
  validateBody(UpdatePassword),
  authController.updatePassword,
);
authRoutes.post("/genrate-nonce", authController.generateNonce);

authRoutes.post(
  "/generate-nonce",
  authController.generateNonce
);

authRoutes.post(
  "/link-wallet",
  authMiddleware,
  authController.linkerWallet
);

authRoutes.post(
  "/verify-and-login",
  authController.verifyAndLogin
);

export default authRoutes;
