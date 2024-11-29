import type { Request, Response } from "express";
import { QuizService } from "../services/quiz-service";
import type { Quiz } from "@prisma/client";

export class QuizController {
  private quizService: QuizService;

  constructor() {
    this.quizService = new QuizService();
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const quizzes: Quiz[] = await this.quizService.getAllQuizzes(
        req.body.userId,
      );
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching quizzes", error });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const quiz: Quiz | null = await this.quizService.getQuizById(
        id,
        req.body.userId,
      );
      if (quiz) {
        res.json(quiz);
      } else {
        res.status(404).json({ message: "Quiz not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching quiz", error });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    const { name, description, userId } = req.body;
    try {
      const newQuiz: Quiz = await this.quizService.createQuiz(userId, {
        name,
        description,
      });
      res.status(201).json(newQuiz);
    } catch (error) {
      res.status(400).json({ message: "Error creating quiz", error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
      const updatedQuiz: Quiz | null = await this.quizService.updateQuiz(
        id,
        req.body.userId,
        { name, description },
      );
      if (updatedQuiz) {
        res.json(updatedQuiz);
      } else {
        res.status(404).json({ message: "Quiz not found" });
      }
    } catch (error) {
      res.status(400).json({ message: "Error updating quiz", error });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const deleted: boolean = await this.quizService.deleteQuiz(
        id,
        req.body.userId,
      );
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Quiz not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting quiz", error });
    }
  }

  async getResponses(req: Request, res: Response): Promise<void> {
    const { id, responseId } = req.params;
    try {
      const responses = await this.quizService.getResponses(id, responseId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching responses", error });
    }
  }
}

export default new QuizController();
