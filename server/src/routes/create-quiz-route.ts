import { QuizController } from "@controllers/quiz-controller.ts";
import { Router } from "express";

const router = Router();
const quizController = new QuizController();

router.post("/create", quizController.create.bind(quizController));

router.get("/:id", quizController.getById.bind(quizController));

router.get(
  "/responses/:id/:responseId",
  quizController.getResponses.bind(quizController),
);

router.post("/abandon", quizController.abandon.bind(quizController));

router.get(
  "/abandon/:quizId",
  quizController.getAbandonInfo.bind(quizController),
);

router.get(
  "/responses/:id",
  quizController.getQuizResponses.bind(quizController),
);

router.post("/", quizController.getAll.bind(quizController));

router.put("/:id", quizController.update.bind(quizController));

router.delete("/:id", quizController.delete.bind(quizController));

export { router as quizRouter };
