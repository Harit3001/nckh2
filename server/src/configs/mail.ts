import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMail = async (email: string, otp: string) => {
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: [email],
    subject: "Mã OTP đặt lại mật khẩu",
    html: `
      <div>
        <h2>Đặt lại mật khẩu</h2>

        <p>Mã OTP của bạn là:</p>

        <h1>${otp}</h1>

        <p>Mã OTP có hiệu lực trong 5 phút.</p>

        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(error.message);
  }

  return data;
};
