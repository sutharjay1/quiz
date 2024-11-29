import type { Quiz, Question, UserResponse } from "@prisma/client";
import { db } from "../db";

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
    data: Omit<Quiz, "id" | "createdAt" | "updatedAt">,
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
    userId: string,
    data: Partial<Omit<Quiz, "id" | "createdAt" | "updatedAt">>,
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

  async getResponses(
    quizId: string,
    responseId: string,
  ): Promise<UserResponse | { totalCorrectAnswers: number }> {
    const result = await db.userResponse.findMany({
      where: {
        id: responseId,
        quizId,
      },
    });

    if (result.length === 0) {
      throw new Error("No response found for the given responseId");
    }

    const results: any = result[0]?.results ?? [];

    const totalCorrectAnswers = results?.filter(
      (item: any) => item.correct === true,
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

  async logAbandonEvent(userId: string, quizId: string): Promise<boolean> {
    const abandonEvent = await db.abandonEvent.create({
      data: {
        userId,
        quizId,
      },
    });
    return !!abandonEvent;
  }
}
