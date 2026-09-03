import bcrypt from 'bcrypt';

export const hashOTP = async (OTP: string) => {
  return await bcrypt.hash(OTP, 10);
};

export const compareOTP = async (OTP: string, hashedOTP: string) => {
  return await bcrypt.compare(OTP, hashedOTP);
};