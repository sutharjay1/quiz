import type { UserResponse } from '@prisma/client';
import { db } from '../db';

export class UserResponseService {
	async storeUserResponse(
		quizId: string,
		name: string,
		email: string,
		answers: Record<string, number>
	): Promise<UserResponse> {
		return db.userResponse.create({
			data: {
				quizId,
				results: JSON.stringify(answers),
				name,
				email,
			},
		});
	}

	async markAbandoned(userResponseId: string): Promise<UserResponse> {
		return db.userResponse.update({
			where: { id: userResponseId },
			data: { abandoned: true },
		});
	}
}
