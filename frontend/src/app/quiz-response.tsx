"use client";

import { UserResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { useParams } from "react-router";
import { useQuiz } from "@/hooks/use-quiz";
import { useEffect } from "react";
import { getQuizInfo } from "@/features/quiz/dynamic-form-quiz-route";

const getQuizQuestions = async (quizId: string): Promise<UserResponse[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/api/quiz/responses/${quizId}`,
    { withCredentials: true },
  );
  return response.data;
};

export default function QuizResponse() {
  const params = useParams();
  const quizId = params.quizId as string;

  const { setQuiz } = useQuiz();
  useEffect(() => {
    if (quizId) {
      getQuizInfo(quizId).then((data) => {
        setQuiz(data);
      });
    }
  }, [quizId]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => getQuizQuestions(quizId),
    enabled: !!quizId,
  });

  if (isLoading) return <div className="text-center">Loading...</div>;
  if (error)
    return (
      <div className="text-center text-red-500">
        Error: {(error as Error).message}
      </div>
    );
  if (!data) return <div className="text-center">No data available</div>;

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader className="pt-6">
        <CardTitle>Quiz Responses</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {data.map((response, index) => (
            <AccordionItem key={response.id} value={`item-${index}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex w-full justify-between">
                  <span>{response.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {response.email}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p className="font-semibold">
                    Total Correct Answers: {response.totalCorrectAnswers}
                  </p>
                  {response.results.map((_, qIndex) => {
                    const isCorrect = Object.entries(
                      response?.results[qIndex]!,
                    )[0][1];

                    return (
                      <div key={qIndex} className="flex items-center space-x-2">
                        {isCorrect ? (
                          <CheckCircle2 className="text-green-500" />
                        ) : (
                          <XCircle className="text-red-500" />
                        )}
                        <span>Question {qIndex + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
