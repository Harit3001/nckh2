import { prisma } from "../libs/prisma";
import { createError } from "../utils/err";
import { verifyAccessToken } from "../utils/jwt";
import type { Context, Next } from "hono";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export const authMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) {
    throw createError("token không tồn tại ở header", 401);
  }

  try {
    const verifyToken = verifyAccessToken(token);

    if (!verifyToken) {
      throw createError("token không hợp lệ", 401);
    }
    const user = await prisma.user.findUnique({
      where: {
        id: verifyToken.id,
      },
      omit: {
        passwordHash: true,
      }
    }); 

    if(!user) {
      throw createError("Người dùng không tồn tại", 404);
    }

    c.set('user', user);
    return next();
  } catch (error) {
    if(error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      throw createError("Token không hợp lệ hoặc đã hết hạn", 401);
    }
    throw error
  }
};
