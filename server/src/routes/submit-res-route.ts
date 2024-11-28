import { Router } from "express";
import { UserResponseController } from "../controller/user-controller";

const router = Router();
const userResponseController = new UserResponseController();

router.post(
  "/submit-response",
  userResponseController.submitQuizResponse.bind(userResponseController),
);

router.post(
  "/mark-abandoned",
  userResponseController.markAbandoned.bind(userResponseController),
);

export { router as quizRouter };
