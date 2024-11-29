import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Question, UserResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CheckCircle, XCircle } from "lucide-react";
import { useParams } from "react-router";

const getQuizQuestions = async (quizId: string): Promise<Question[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_SERVER_URL}/api/quiz/questions/${quizId}`,
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch quiz questions:", error);
    throw error;
  }
};

const getUserResponses = async (
  quizId: string,
  responseId: string,
): Promise<UserResponse> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_SERVER_URL}/api/quiz/responses/${quizId}/${responseId}`,
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user responses:", error);
    throw error;
  }
};

export default function QuizResult() {
  const params = useParams();
  const quizId = params?.quizId as string;
  const responseId = params?.responseId as string;

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

  const { data: responses } = useQuery({
    queryKey: ["responses", responseId, quizId],
    queryFn: () => getUserResponses(quizId, responseId),
    enabled: !!responseId,
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return <ErrorState error={error as Error} />;
  }
  const totalQuestions = questions?.length || 0;

  const questionOption = questions?.map((question) => question.options);

  const scorePercentage = totalQuestions
    ? (Number(responses?.totalCorrectAnswers) / totalQuestions) * 100
    : 0;

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">Quiz Results</h1>
      <Card className="mb-8 bg-sidebar">
        <CardHeader className="pt-6">
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>
            <div className="flex items-center justify-between">
              <span>
                You got {responses?.totalCorrectAnswers} out of {totalQuestions}{" "}
                questions correct
              </span>
              <span
                className={`font-bold ${
                  scorePercentage >= 70
                    ? "text-green-600"
                    : scorePercentage >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {scorePercentage}%
              </span>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="space-y-6">
        {questions?.map((question: Question, questionIndex: number) => {
          const questionOption = question.options.map((option) => option);
          const isCorrect =
            Object.entries(responses?.results[questionIndex]!)[0][1] &&
            questionOption[0].toString() ===
              Object.entries(responses?.results[questionIndex]!)[0][0];

          return (
            <Card key={question.id}>
              <CardHeader className="pt-6">
                <CardTitle className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle className="text-green-500" />
                  ) : (
                    <XCircle className="text-red-500" />
                  )}
                  {question.text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup defaultValue={question.correct.toString()}>
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="mb-2 flex items-center space-x-2"
                    >
                      <RadioGroupItem
                        value={option}
                        id={`question-${question.id}-option-${optionIndex}`}
                        disabled
                      />
                      <Label
                        htmlFor={`question-${question.id}-option-${optionIndex}`}
                        className={`w-full ${
                          isCorrect
                            ? "font-bold text-green-600"
                            : !isCorrect
                              ? "font-bold text-red-600"
                              : ""
                        }`}
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Skeleton className="mx-auto mb-8 h-10 w-2/3" />
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pt-6">
              <Skeleton className="h-6 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="container mx-auto max-w-2xl py-8 text-center">
      <h1 className="mb-4 text-3xl font-bold text-red-600">Error</h1>
      <p className="text-lg">Error fetching questions: {error.message}</p>
    </div>
  );
}
