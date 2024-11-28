import { Router } from "express";
import { QuizController } from "../controller/quiz-controller";

const router = Router();
const quizController = new QuizController();

router.post("/create", quizController.create.bind(quizController));

router.get("/quiz/:id", quizController.getById.bind(quizController));

router.post("/", quizController.getAll.bind(quizController));

router.put("/:id", quizController.update.bind(quizController));

router.delete("/:id", quizController.delete.bind(quizController));

export { router as quizRouter };
