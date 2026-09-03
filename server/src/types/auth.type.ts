export type ForgotPassword = {
    email: string,
    otp: string
};

export type UpdatePassword = {
    email: string,
    password: string,
    confirmPassword: string
}