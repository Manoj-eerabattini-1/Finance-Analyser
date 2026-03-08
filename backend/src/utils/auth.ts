import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (userId: Types.ObjectId): string => {
  const secret = process.env.JWT_SECRET || "secret";
  const expiresIn = process.env.JWT_EXPIRE || "7d";
  return jwt.sign({ userId }, secret, {
    expiresIn,
  } as any);
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      userId: string;
    };
    return decoded;
  } catch (error) {
    return null;
  }
};
