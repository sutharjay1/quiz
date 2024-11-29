"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { P } from "@/components/ui/typography";
import { errorToast, successToast } from "@/features/global/toast";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const deleteQuiz = async ({ quizId }: { quizId: string }) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/quiz/${quizId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting quiz:", error);
    throw error;
  }
};

const DeleteQuiz = () => {
  const params = useParams();
  const quizId = params?.quizId as string;
  const router = useNavigate();

  const { mutateAsync: deleteQuizMutation, isPending } = useMutation({
    mutationFn: async (data: { quizId: string }) => {
      try {
        const result = await deleteQuiz({ quizId: data.quizId });
        if (!result) {
          throw new Error("Failed to create quiz");
        }
        return result;
      } catch (error) {
        console.error("Mutation error:", error);
        throw error;
      }
    },
  });

  const handleDeleteQuiz = async () => {
    const loadId = toast.loading("Deleting quiz...", {
      position: "bottom-right",
    });

    try {
      const result = await deleteQuizMutation({ quizId });

      if (result) {
        successToast("Quiz Deleted", {
          description: "Your quiz has been deleted successfully.",
        });
        router("/quizzes");
      }
    } catch (error) {
      if (error instanceof Error) {
        errorToast(error.message, {
          description:
            error.message === "Quiz already exists in this account"
              ? "Change the quiz name and try again."
              : "Please try again",
        });
      } else {
        errorToast("Something went wrong. Please try again.", {
          position: "top-center",
        });
      }
    } finally {
      toast.dismiss(loadId);
    }
  };

  return (
    <Card className="flex w-full flex-col items-start justify-start rounded-lg bg-sidebar pt-6 shadow-lg">
      <CardHeader className="pb-0 pt-6">
        <CardTitle className="flex w-fit items-start justify-start text-2xl font-semibold text-red-600">
          Danger Zone
        </CardTitle>
      </CardHeader>

      <CardContent className="w-full space-y-2 pt-0">
        <div>
          <h3 className="text-left font-medium">
            Permanently delete this quiz
          </h3>
          <P className="mt-2 text-sm text-muted-foreground">
            Permanently remove your quiz and all of its contents from the
            response platform. This action is not reversible — please continue
            with caution.
          </P>
        </div>
      </CardContent>

      <CardFooter className="flex w-full items-center justify-start space-x-4 pt-0">
        <Button
          variant="destructive"
          className="w-fit"
          onClick={handleDeleteQuiz}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
          ) : (
            "Delete this quiz"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DeleteQuiz;
