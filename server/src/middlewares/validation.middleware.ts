import type { Context, Next } from "hono";
import { ZodSchema, ZodError } from "zod";
import { createError } from "../utils/err";

export const validateBody = (schema: ZodSchema) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validatedData = schema.parse(body);
      c.set("validatedData", validatedData);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors
          .map((err) => `${err.path.join(".") || "body"}: ${err.message}`)
          .join("; ");
        console.error("Validation Error:", errorMessages);
        throw createError(`Validation Error: ${errorMessages}`, 400);
      }
      console.error("Request body parsing error:", error);
      throw createError("Invalid JSON format", 400);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return async (c: Context, next: Next) => {
    try {
      const query = c.req.query();
      const validatedData = schema.parse(query);
      c.set("validatedQuery", validatedData);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join("; ");
        console.error("Validation Error:", errorMessages);
        throw createError(`Validation Error: ${errorMessages}`, 400);
      }
      throw createError("Lỗi validation", 400);
    }
  };
};
