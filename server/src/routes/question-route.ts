import express from "express";
import { QuestionController } from "../controller/question-controller";

const router = express.Router();
const questionController = new QuestionController();

router.get("/:quizId", questionController.getAll.bind(questionController));
router.get("/:id", questionController.getById.bind(questionController));
router.post("/create", questionController.create.bind(questionController));
router.post("/check", questionController.check.bind(questionController));

router.put("/:id", questionController.update.bind(questionController));
router.delete("/:id", questionController.delete.bind(questionController));

export { router as questionRouter };
