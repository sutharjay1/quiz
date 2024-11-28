import { verifyToken } from "../lib/utils";
import type { JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import type { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User | undefined;
    }
  }
}

export class AuthMiddleware {
  async authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({
          message: "Authorization header is missing",
        });
        return;
      }

      const [bearer, token] = authHeader.split(" ");

      if (bearer !== "Bearer" || !token) {
        res.status(401).json({
          message: "Invalid authorization format",
        });
        return;
      }

      try {
        const decoded = verifyToken(token) as JwtPayload;

        if (!decoded || !decoded.userId || !decoded.email) {
          res.status(401).json({ message: "Invalid token payload" });
          return;
        }

        req.user = {
          userId: decoded.userId,
          email: decoded.email,
        };

        next();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? `Invalid token: ${error.message}`
            : "Invalid token";
        res.status(401).json({ message: errorMessage });
        return;
      }
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export const authMiddleware = new AuthMiddleware();
