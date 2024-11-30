import type { Request, Response } from 'express';
import type { Question } from '@prisma/client';
import { QuizQuestionService } from '@services/question-service';
import { db } from '@db/index';

export class QuestionController {
	private questionService: QuizQuestionService;

	constructor() {
		this.questionService = new QuizQuestionService();
	}

	async getAll(req: Request, res: Response): Promise<void> {
		const { quizId } = req.params;

		try {
			const questions: Question[] =
				await this.questionService.getQuizQuestions(quizId);
			res.json(questions);
		} catch (error) {
			res.status(500).json({
				message: 'Error fetching questions',
				error,
			});
		}
	}

	async getById(req: Request, res: Response): Promise<void> {
		const { id } = req.params;

		try {
			const question: Question | null =
				await this.questionService.getQuestionById(id);

			if (question) {
				res.json(question);
			} else {
				res.status(404).json({ message: 'Question not found' });
			}
		} catch (error) {
			res.status(500).json({ message: 'Error fetching question', error });
		}
	}

	async create(req: Request, res: Response): Promise<void> {
		const { text, options, correct, quizId } = req.body;

		try {
			const newQuestion: Question =
				await this.questionService.createQuestion(quizId, {
					text,
					options,
					correct,
					quizId,
				});

			res.status(201).json(newQuestion);
		} catch (error) {
			console.log(error);
			res.status(400).json({ message: 'Error creating question', error });
		}
	}

	async check(req: Request, res: Response): Promise<void> {
		const { quizId, questionIds, answers, name, email } = req.body;

		try {
			const existingResponse = await db.userResponse.findFirst({
				where: {
					quizId,
					email,
				},
			});

			if (existingResponse) {
				res.status(403).json({
					message: 'You have already submitted this quiz',
				});
				return;
			}

			const data = await this.questionService.checkAnswer({
				quizId,
				questionIds,
				answers,
				name,
				email,
			});
			res.json({ data });
		} catch (error) {
			res.status(400).json({ message: 'Error checking answer', error });
		}
	}

	async update(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const { text, options, correct } = req.body;

		try {
			const updatedQuestion: Question | null =
				await this.questionService.updateQuestion(id, {
					text,
					options,
					correct,
				});

			if (updatedQuestion) {
				res.json(updatedQuestion);
			} else {
				res.status(404).json({ message: 'Question not found' });
			}
		} catch (error) {
			res.status(400).json({ message: 'Error updating question', error });
		}
	}

	async getByIdWithoutAnswers(req: Request, res: Response): Promise<void> {
		const { id } = req.params;

		try {
			const question: Omit<
				Question,
				'correct' | 'createdAt' | 'updatedAt'
			>[] = await this.questionService.getQuestionsByQuizIdWithoutAnswers(
				id
			);

			if (question) {
				res.json(question);
			} else {
				res.status(404).json({ message: 'Question not found' });
			}
		} catch (error) {
			res.status(500).json({ message: 'Error fetching question', error });
		}
	}

	async delete(req: Request, res: Response): Promise<void> {
		const { id } = req.params;

		try {
			const deleted: boolean = await this.questionService.deleteQuestion(
				id
			);

			if (deleted) {
				res.status(204).send();
			} else {
				res.status(404).json({ message: 'Question not found' });
			}
		} catch (error) {
			res.status(500).json({ message: 'Error deleting question', error });
		}
	}
}

export default new QuestionController();
