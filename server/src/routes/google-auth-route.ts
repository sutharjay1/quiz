import { Router } from "express";
import passport from "passport";
import { db } from "../db";

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

      const existingUser = await db.user.findUnique({
        where: { email: (req.user as any).email! },
      });

      res.redirect(`${process.env.CLIENT_URL}/signin?auth=success`);
    } catch (error) {
      console.error("Authentication callback error:", error);
      res.redirect(`${process.env.CLIENT_URL}/signin?auth=failed`);
    }
  },
);

router.get("/profile", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      user: req.user,
    });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

export { router as authRouter };
