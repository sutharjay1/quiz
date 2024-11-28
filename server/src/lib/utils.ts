import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const generateToken = ({
  userId,
  email,
}: {
  userId: string;
  email: string;
}): string => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "1h" });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
