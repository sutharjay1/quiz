import { db } from "../db";
import { UserResponse } from "@prisma/client";

export class UserResponseService {
  async storeUserResponse(
    quizId: string,
    userId: string,
    name: string,
    email: string,
    answers: Record<string, number>,
  ): Promise<UserResponse> {
    return db.userResponse.create({
      data: {
        quizId,
        userId,
        name,
        email,
        answers,
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
