 
import { UserResponseController } from "@controllers/user-controller";
import { Router } from "express";

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
