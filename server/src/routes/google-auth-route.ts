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
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/signin?auth=failed`,
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(`${process.env.CLIENT_URL}/signin?auth=failed`);
      }

      res.cookie("auth", "success", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.redirect(`${process.env.CLIENT_URL}/signin`);
    } catch (error) {
      console.error("Authentication callback error:", error);
      res.redirect(`${process.env.CLIENT_URL}/signin?auth=failed`);
    }
  },
);

router.get("/profile", (req, res) => {
  console.log(`Checking /profile`);
  console.log({ user: req.user });

  res.header("Access-Control-Allow-Credentials", "true");

  if (req.isAuthenticated()) {
    res.json({
      user: req.user,
      authenticated: true,
    });
  } else {
    res.status(401).json({
      message: "Not authenticated",
      authenticated: false,
    });
  }
});
export { router as authRouter };
