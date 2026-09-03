import { createRoute, z } from "@hono/zod-openapi";
import {
  loginSchema,
  registerPatientSchema,
  registerDoctorSchema,
} from "../validations/auth.validation";

const tokenResponseSchema = z.object({
  accessToken: z.string().describe("JWT Access Token"),
  refreshToken: z.string().describe("JWT Refresh Token"),
});

const patientResponseSchema = z.object({
  id: z.string().describe("Patient ID"),
  userId: z.string().describe("User ID"),
  phid: z.string().describe("Patient Health ID"),
  dob: z.string().describe("Date of Birth"),
  bloodType: z.string().describe("Blood Type"),
  allergyInfo: z.string().describe("Allergy Information"),
  nationalIdHash: z.string().describe("National ID"),
  createdAt: z.string().describe("Created At"),
  updatedAt: z.string().describe("Updated At"),
});

const doctorResponseSchema = z.object({
  id: z.string().describe("Doctor ID"),
  userId: z.string().describe("User ID"),
  doctorCode: z.string().describe("Doctor Code"),
  speciality: z.string().describe("Specialty"),
  hospitalId: z.number().describe("Hospital ID"),
  verificationStatus: z.string().describe("Verification Status"),
  createdAt: z.string().describe("Created At"),
  updatedAt: z.string().describe("Updated At"),
});

const errorResponseSchema = z.object({
  success: z.boolean().describe("Success flag"),
  status: z.number().describe("HTTP Status Code"),
  message: z.string().describe("Error message"),
});

export const loginRoute = createRoute({
  method: "post",
  path: "/login",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema,
        },
      },
      description: "Login with email and password",
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            status: z.literal(200),
            message: z.string(),
            data: tokenResponseSchema,
          }),
        },
      },
      description: "Login successful",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Invalid credentials or validation error",
    },
  },
});

export const registerPatientRoute = createRoute({
  method: "post",
  path: "/register-patient",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerPatientSchema,
        },
      },
      description: "Register a new patient account",
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            status: z.literal(201),
            message: z.string(),
            data: patientResponseSchema,
          }),
        },
      },
      description: "Patient registration successful",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Invalid data or email already exists",
    },
  },
});

export const registerDoctorRoute = createRoute({
  method: "post",
  path: "/register-doctor",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerDoctorSchema,
        },
      },
      description: "Register a new doctor account",
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            status: z.literal(201),
            message: z.string(),
            data: doctorResponseSchema,
          }),
        },
      },
      description: "Doctor registration successful",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Invalid data or email already exists",
    },
  },
});

export const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  tags: ["Authentication"],
  security: [{ Bearer: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            status: z.literal(200),
            message: z.string(),
          }),
        },
      },
      description: "Logout successful",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - Invalid or missing token",
    },
  },
});

export const refreshTokenRoute = createRoute({
  method: "post",
  path: "/refresh-token",
  tags: ["Authentication"],
  security: [{ Bearer: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            status: z.literal(200),
            message: z.string(),
            data: tokenResponseSchema,
          }),
        },
      },
      description: "Token refreshed successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - Invalid or missing token",
    },
  },
});

export const profileRoute = createRoute({
  method: "get",
  path: "/profile",
  tags: ["Authentication"],
  security: [{ Bearer: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            status: z.literal(200),
            message: z.string(),
            data: z.object({
              id: z.string(),
              email: z.string(),
              role: z.string(),
            }),
          }),
        },
      },
      description: "Get user profile successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - Invalid or missing token",
    },
  },
});
