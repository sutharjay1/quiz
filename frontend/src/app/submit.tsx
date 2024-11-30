import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errorToast, successToast } from "@/features/global/toast";
import { useUser } from "@/hooks/use-user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { z } from "zod";

const getQuizQuestions = async (quizId: string) => {
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/api/quiz/questions/quiz/${quizId}`,
    { withCredentials: true },
  );
  return response.data;
};

const logAbandonment = async (
  quizId: string,
  email: string,
  userId: string,
) => {
  await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/api/quiz/abandon`,
    { quizId, email, userId },
    { withCredentials: true },
  );
};

const submitQuizAnswers = async (
  quizId: string,
  name: string,
  email: string,
  answers: { questionId: string; answer: string }[],
) => {
  const response = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/api/quiz/questions/check`,
    {
      quizId,
      name,
      email,
      questionIds: answers.map((answer) => answer.questionId),
      answers: answers.map((answer) => answer.answer),
    },
    { withCredentials: true },
  );
  return response.data;
};

const basicInfoSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
});

const Submit = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const quizId = params?.quizId as string;
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const { user } = useUser();

  const currentQuestionIndex = parseInt(searchParams.get("q") || "0");

  const form = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: { name: "", email: "" },
  });

  const {
    data: questions,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["questions", quizId],
    queryFn: () => getQuizQuestions(quizId),
    enabled: !!quizId,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!quizId || Object.keys(answers).length === 0) {
        throw new Error("Quiz ID or answers are missing");
      }

      const userInfo = form.getValues();
      const formattedAnswers = Object.keys(answers).map((questionId) => ({
        questionId,
        answer: answers[questionId],
      }));

      return submitQuizAnswers(
        quizId,
        userInfo.name,
        userInfo.email,
        formattedAnswers,
      );
    },
    onSuccess: (data) => {
      successToast("Your answers have been submitted!", {
        position: "top-center",
      });
      window.location.href = `/submit/${quizId}/${data.data.id}`;
    },
    onError: (error: Error) => {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        errorToast(errorMessage, {
          position: "top-center",
        });
      } else {
        errorToast(error.message || "Something went wrong.", {
          position: "top-center",
        });
      }
    },
  });

  const hasStartedQuiz = useRef(false);

  useEffect(() => {
    const handleAbandon = (event: BeforeUnloadEvent) => {
      if (!isSubmitting && quizId && showQuiz && hasStartedQuiz.current) {
        event.preventDefault();
        event.returnValue = "";

        try {
          logAbandonment(quizId, form.getValues("email"), user?.id.toString()!)
            .then(() => {
              errorToast("You have abandoned the quiz", {
                position: "top-center",
              });
            })
            .catch((err) => {
              console.error("Failed to log abandonment:", err);
            });
        } catch (error) {
          console.error("Failed to log abandonment:", error);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        !isSubmitting &&
        quizId &&
        showQuiz &&
        hasStartedQuiz.current
      ) {
        logAbandonment(quizId, form.getValues("email"), user?.id.toString()!)
          .then(() =>
            errorToast("You have abandoned the quiz", {
              position: "top-center",
            }),
          )
          .catch((err) => {
            console.error("Failed to log abandonment:", err);
          });
      }
    };

    window.addEventListener("beforeunload", handleAbandon);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleAbandon);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isSubmitting, quizId, showQuiz, user?.id]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  const handleFormSubmit = () => {
    setShowQuiz(true);
    hasStartedQuiz.current = true;
    navigate(`/submit/${quizId}?q=0`);
  };

  const handleNextQuestion = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      navigate(`/submit/${quizId}?q=${currentQuestionIndex + 1}`);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      navigate(`/submit/${quizId}?q=${currentQuestionIndex - 1}`);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync();
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p>Loading quiz questions...</p>;
  if (isError) return <p>Error: {(error as Error).message}</p>;

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-bold">Submit Your Quiz Answers</h2>
      <p className="mt-2">Quiz ID: {quizId}</p>

      {!showQuiz ? (
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="w-full max-w-md space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              {...form.register("name")}
              placeholder="Enter your name"
              className="mt-1"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              {...form.register("email")}
              placeholder="Enter your email"
              className="mt-1"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <Button type="submit" className="mt-4 w-full">
            Proceed to Quiz
          </Button>
        </form>
      ) : (
        <div className="mt-4 w-full max-w-xl">
          {questions && questions.length > 0 && (
            <div key={questions[currentQuestionIndex].id} className="space-y-4">
              <div className="font-bold">
                {questions[currentQuestionIndex].text}
              </div>
              <div className="space-y-2">
                {questions[currentQuestionIndex].options.map(
                  (option: string, optionIndex: number) => (
                    <div
                      key={optionIndex}
                      className="flex items-center gap-2 rounded-md bg-gray-50 p-2"
                    >
                      <input
                        type="radio"
                        id={`answer-${questions[currentQuestionIndex].id}-${optionIndex}`}
                        name={`question-${questions[currentQuestionIndex].id}`}
                        value={option}
                        onChange={() =>
                          handleAnswerChange(
                            questions[currentQuestionIndex].id,
                            option,
                          )
                        }
                        checked={
                          answers[questions[currentQuestionIndex].id] === option
                        }
                      />
                      <label
                        htmlFor={`answer-${questions[currentQuestionIndex].id}-${optionIndex}`}
                      >
                        {option}
                      </label>
                    </div>
                  ),
                )}
              </div>

              <div className="mt-4 flex justify-between">
                {currentQuestionIndex > 0 && (
                  <Button variant="outline" onClick={handlePreviousQuestion}>
                    Previous
                  </Button>
                )}

                {currentQuestionIndex < questions.length - 1 ? (
                  <Button
                    onClick={handleNextQuestion}
                    disabled={!answers[questions[currentQuestionIndex].id]}
                    className="ml-auto"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting ||
                      Object.keys(answers).length !== questions.length
                    }
                    className="ml-auto"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Quiz"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Submit;
