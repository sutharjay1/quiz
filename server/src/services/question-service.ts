import { db } from "@db/index";
import type { Question, UserResponse } from "@prisma/client";

export class QuizQuestionService {
  async getQuizQuestions(quizId: string): Promise<Question[]> {
    try {
      const result = await db.question.findMany({
        where: {
          quizId,
        },
        include: {
          quiz: {
            include: {
              questions: {
                select: {
                  options: true,
                  correct: true,
                  text: true,
                },
              },
              responses: true,
            },
          },
        },
      });

      return result;
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      throw new Error("Could not fetch quiz questions. Please try again.");
    }
  }

  async getQuestionById(questionId: string): Promise<Question | null> {
    try {
      return await db.question.findUnique({
        where: {
          id: questionId,
        },
      });
    } catch (error) {
      console.error(`Error fetching question with ID ${questionId}:`, error);
      throw new Error("Could not fetch the question. Please try again.");
    }
  }

  async createQuestion(
    quizId: string,
    data: Omit<Question, "id" | "createdAt" | "updatedAt">,
  ): Promise<Question> {
    try {
      return await db.question.create({
        data: {
          text: data.text.toString(),
          correct: data.correct,
          options: data.options,
          quiz: {
            connect: { id: quizId },
          },
        },
      });
    } catch (error) {
      console.error("Error creating a new question:", error);
      throw new Error("Could not create the question. Please try again.");
    }
  }

  async updateQuestion(
    questionId: string,
    data: Partial<Omit<Question, "id" | "createdAt" | "updatedAt">>,
  ): Promise<Question | null> {
    try {
      return await db.question.update({
        where: {
          id: questionId,
        },
        data,
      });
    } catch (error) {
      console.error(`Error updating question with ID ${questionId}:`, error);
      throw new Error("Could not update the question. Please try again.");
    }
  }

  async checkAnswer({
    quizId,
    questionIds,
    answers,
    email,
    name,
  }: {
    quizId: string;
    questionIds: string[];
    answers: string[];
    email: string;
    name: string;
  }): Promise<UserResponse> {
    try {
      if (!quizId) {
        throw new Error("Quiz ID is required");
      }

      if (!Array.isArray(questionIds) || !Array.isArray(answers)) {
        throw new Error(
          "Invalid data format: questionIds and answers must be arrays",
        );
      }

      if (questionIds.length !== answers.length) {
        throw new Error("Mismatch between question IDs and answers");
      }

      const results = await Promise.all(
        questionIds.map(async (questionId, index) => {
          const answer = answers[index];

          if (!questionId || !answer) {
            console.error(`Invalid questionId or answer at index ${index}`);
            return false;
          }

          const question = await db.question.findUnique({
            where: {
              id: questionId,
              quizId,
            },
          });

          if (!question) {
            console.error(`Question with ID ${questionId} not found`);
            return false;
          }

          const isCorrect = question.correct === answer;
          return isCorrect;
        }),
      );

      const userResponse = await db.userResponse.create({
        data: {
          quizId,
          results: answers.map((answer, index) => {
            return { [answer]: results[index] };
          }),
          name: name,
          email: email,
          abandoned: false,
        },
      });

      return userResponse;
    } catch (error) {
      console.error(
        `Error checking answers for quiz with ID ${quizId}:`,
        error,
      );

      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Could not check the answers. Please try again.");
      }
    }
  }

  async getQuestionsByQuizIdWithoutAnswers(
    quizId: string,
  ): Promise<Omit<Question, "correct" | "createdAt" | "updatedAt">[]> {
    try {
      if (!quizId) {
        throw new Error("Quiz ID is required.");
      }

      const questions = await db.question.findMany({
        where: {
          quizId: quizId,
        },
        select: {
          id: true,
          text: true,
          options: true,
          quizId: true,
        },
      });

      if (questions.length === 0) {
        throw new Error(`No questions found for quiz ID "${quizId}".`);
      }

      return questions;
    } catch (error) {
      console.error(
        `Error fetching questions for quiz ID "${quizId}":`,
        error instanceof Error ? error.message : String(error),
      );
      throw new Error("Could not fetch the questions. Please try again.");
    }
  }

  async deleteQuestion(questionId: string): Promise<boolean> {
    try {
      const deleted = await db.question.delete({
        where: {
          id: questionId,
        },
      });
      return !!deleted;
    } catch (error) {
      console.error(`Error deleting question with ID ${questionId}:`, error);
      throw new Error("Could not delete the question. Please try again.");
    }
  }
}
