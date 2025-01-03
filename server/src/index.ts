import { db } from "@db/index";
import { quizRouter } from "@routes/create-quiz-route";
import { authRouter } from "@routes/google-auth-route";
import { questionRouter } from "@routes/question-route";
import cors from "cors";
import "dotenv/config";
import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { errorHandler, notFound } from "./middleware";
import type { MessageResponse } from "./types/message-response";

const app = express();
const PORT: number = 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log({
        accessToken,
        refreshToken,
      });
      try {
        const existingUser = await db.user.findUnique({
          where: { email: profile.emails![0].value },
        });

        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = await db.user.create({
          data: {
            email: profile.emails![0].value,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value ?? "",
            quizId: undefined,
          },
          select: {
            id: true,
            avatar: true,
            email: true,
            name: true,
            quiz: true,
          },
        });

        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

app.get<{}, MessageResponse>("/", (_, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use(
  cors({
    origin: [
      "https://quiz-sutharjay.vercel.app",
      "http://localhost:5173",
      "https://quiz-hwxi.onrender.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Set-Cookie"],
  }),
);

app.use("/api/auth", authRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/quiz/questions", questionRouter);

app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
