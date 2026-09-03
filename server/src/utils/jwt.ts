import type { Payload } from "../types/payload.type";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
const ACCESS_TOKEN_EXPIRE = process.env.ACESS_TOKEN_EXPIRE as unknown as number;
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE as unknown as number;

export const generateAccessToken = (payload: Payload) => {
  return jwt.sign({ ...payload }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRE,
  });
};

export const generateRefreshToken = (payload: Payload) => {
  return jwt.sign({ ...payload }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRE,
  });
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as Payload;
  } catch {
    return false;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch {
    return false;
  }
};
