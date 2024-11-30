import { QuestionController } from "@controllers/question-controller.ts";
import express from "express";

const router = express.Router();
const questionController = new QuestionController();

router.get("/:quizId", questionController.getAll.bind(questionController));
router.get("/:id", questionController.getById.bind(questionController));
router.get(
  "/quiz/:id",
  questionController.getByIdWithoutAnswers.bind(questionController),
);
router.post("/create", questionController.create.bind(questionController));
router.post("/check", questionController.check.bind(questionController));

router.put("/:id", questionController.update.bind(questionController));
router.delete("/:id", questionController.delete.bind(questionController));

export { router as questionRouter };
