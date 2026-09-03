import type { Payload } from "../types/payload.type";
import { createError } from "../utils/err";
import type { Context, Next } from "hono";

export const adminMiddleware = async (c: Context, next: Next) => {
    const user = c.get('user') as Payload;
    if(user.role !== "ADMIN"){
        throw createError("bạn không phải là admin", 403);
    }
    await next();
}
