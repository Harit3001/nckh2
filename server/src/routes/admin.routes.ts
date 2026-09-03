import { adminController } from "../controllers/admin.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { Hono } from "hono";

const adminRoute = new Hono();

adminRoute.get(
  "/doctors",
  authMiddleware,
  adminMiddleware,
  adminController.getAllDoctorInactive,
);

adminRoute.patch(
  "/doctors/:doctorId/approve",
  authMiddleware,
  adminMiddleware,
  adminController.approveDoctor,
);

export default adminRoute;
