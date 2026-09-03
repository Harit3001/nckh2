import type { ErrorWithStatus } from "../types/err.type";

export const createError = (message: string, status?: number) : ErrorWithStatus => {
    const error: ErrorWithStatus = new Error(message);
    if (status) {
        error.status = status;
    }
    return error;
}         
