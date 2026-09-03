import type { ErrorWithStatus } from "../types/err.type";
import type { Context, Next } from "hono";

export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error: unknown) {
    console.error("Error caught by handler:", error);

    let status = 500;
    let message = "Internal Server Error";
    
    if (error instanceof Error) {
      message = error.message;
      if ("status" in error && typeof (error as any).status === "number") {
        status = (error as any).status;
      }
    }

    console.error(`Returning ${status} - ${message}`);

    return c.json(
      {
        success: false,
        message,
        status,
      },
      status as any,
    );
  }
};
