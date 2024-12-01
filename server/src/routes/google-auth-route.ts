import { db } from "@db/index";
import { generateToken, verifyToken } from "@lib/utils";
import { User } from "@prisma/client";
import { Router } from "express";
import passport from "passport";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect("/login");
      }

      const token = generateToken({
        userId: (req.user as User).id,
        email: (req.user as User).email,
      });

      res.redirect(
        `${process.env.CLIENT_URL}/signin?auth=success&token=${token}`,
      );
    } catch (error) {
      console.error("Authentication callback error:", error);
      res.redirect(`${process.env.CLIENT_URL}/signin?auth=failed`);
    }
  },
);


router.get("/profile", async (req: any, res: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const token = authHeader.split(" ")[1]; 
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  const user = await db.user.findFirst({
    where: {
      id: decoded.userId,
    },
  });

  res.json({
    user,
  });
});

export { router as authRouter };
