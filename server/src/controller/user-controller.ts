import type { UserResponse } from '@prisma/client';
import { UserResponseService } from '@services/user-service';
import type { Request, Response } from 'express';

export class UserResponseController {
	private userResponseService: UserResponseService;

	constructor() {
		this.userResponseService = new UserResponseService();
	}

	async submitQuizResponse(req: Request, res: Response): Promise<void> {
		const { quizId, name, email, answers } = req.body;

		if (!quizId || !name || !email || !answers) {
			res.status(400).json({
				message:
					'Missing required fields: quizId, name, email, answers',
			});
			return;
		}

		try {
			const userResponse: UserResponse =
				await this.userResponseService.storeUserResponse(
					quizId,
					name,
					email,
					answers
				);

			res.status(201).json(userResponse);
		} catch (error) {
			res.status(500).json({
				message: 'Error storing user response',
				error,
			});
		}
	}

	async markAbandoned(req: Request, res: Response): Promise<void> {
		const { userResponseId } = req.body;

		if (!userResponseId) {
			res.status(400).json({ message: 'Missing userResponseId' });
			return;
		}

		try {
			const abandonedResponse =
				await this.userResponseService.markAbandoned(userResponseId);
			res.json(abandonedResponse);
		} catch (error) {
			res.status(500).json({
				message: 'Error marking response as abandoned',
				error,
			});
		}
	}
}

export default new UserResponseController();
