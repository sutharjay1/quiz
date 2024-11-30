import { db } from '@db/index';
import type { Question, Quiz, UserResponse } from '@prisma/client';

export class QuizService {
	async getAllQuizzes(userId: string): Promise<Quiz[]> {
		return db.quiz.findMany({
			where: {
				user: {
					some: {
						id: userId,
					},
				},
			},
			include: {
				questions: true,
				responses: true,
			},
		});
	}

	async getQuizById(id: string, userId: string): Promise<Quiz | null> {
		return db.quiz.findFirst({
			where: {
				id,
				user: {
					some: {
						id: userId,
					},
				},
			},
			include: {
				questions: true,
				responses: true,
			},
		});
	}

	async createQuiz(
		userId: string,
		data: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<Quiz> {
		return db.quiz.create({
			data: {
				...data,
				user: {
					connect: {
						id: userId,
					},
				},
			},
		});
	}

	async updateQuiz(
		id: string,
		data: Partial<Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>>
	): Promise<Quiz | null> {
		return db.quiz
			.update({
				where: {
					id,
				},
				data,
			})
			.then((updatedQuiz) => updatedQuiz);
	}

	async deleteQuiz(id: string, userId: string): Promise<boolean> {
		const deleted = await db.quiz.deleteMany({
			where: {
				id,
				user: {
					some: {
						id: userId,
					},
				},
			},
		});
		return deleted.count > 0;
	}

	async getQuizResponses(quizId: string): Promise<UserResponse[]> {
		return db.userResponse.findMany({
			where: {
				quizId,
			},
		});
	}

	async getResponses(
		quizId: string,
		responseId: string
	): Promise<UserResponse | { totalCorrectAnswers: number }> {
		const result = await db.userResponse.findMany({
			where: {
				id: responseId,
				quizId,
			},
		});

		if (result.length === 0) {
			throw new Error('No response found for the given responseId');
		}

		const results: any = result[0]?.results ?? [];

		const totalCorrectAnswers = results?.filter(
			(item: any) => item.correct === true
		).length;

		return {
			...result[0],
			totalCorrectAnswers,
		};
	}

	async getQuizQuestions(quizId: string): Promise<Question[]> {
		return db.question.findMany({
			where: {
				quizId,
			},
		});
	}

	async abandonQuiz(
		quizId: string,
		email: string,
		userId: string
	): Promise<boolean> {
		try {
			const alreadyExists = await db.abandonEvent.findFirst({
				where: {
					quizId,
					email,
				},
			});

			if (alreadyExists) {
				await db.abandonEvent.update({
					where: {
						id: alreadyExists.id,
					},
					data: {
						count: alreadyExists.count + 1,
					},
				});

				return true;
			}

			const abandonEvent = await db.abandonEvent.create({
				data: {
					quizId,
					email,
					count: 1,
					userId: userId || '',
				},
			});

			return !!abandonEvent;
		} catch (error) {
			console.error('Error in abandonQuiz:', error);
			return false;
		}
	}

	async getAbandonInfo(quizId: string): Promise<any> {
		const abandonEvents = await db.abandonEvent.findMany({
			where: {
				quizId,
			},
		});
		return abandonEvents;
	}
}
