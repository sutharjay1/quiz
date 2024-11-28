import cors from "cors";
import "dotenv/config";
import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "./db";
import { errorHandler, notFound } from "./middleware";
import { quizRouter } from "./routes/create-quiz-route";
import { authRouter } from "./routes/google-auth-route";
import type { MessageResponse } from "./types/message-response";
import { questionRouter } from "./routes/question-route";

const app = express();
const PORT: number = 3000;
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  }),
);
app.use(express.json());
app.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
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
      try {
        const existingUser = await db.user.findUnique({
          where: { email: profile.emails![0].value },
        });

        if (existingUser) {
          return done(null, existingUser);
        }

        console.log({
          profile,
        });

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

app.use("/api/auth", authRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/quiz/questions", questionRouter);

app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
