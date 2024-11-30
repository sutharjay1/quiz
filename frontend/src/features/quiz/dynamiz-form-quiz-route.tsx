import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useQuiz } from "@/hooks/use-quiz";
import { useUser } from "@/hooks/use-user";
import { Question } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Check, Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useParams } from "react-router";
import { z } from "zod";
import { errorToast, successToast } from "../global/toast";

const getQuizQuestions = async (quizId: string) => {
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/api/quiz/questions/${quizId}`,
    { withCredentials: true },
  );
  return response.data;
};

export const getQuizInfo = async (quizId: string) => {
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/api/quiz/${quizId}`,
    { withCredentials: true },
  );
  return response.data;
};

const deleteQuizQuestion = async (questionId: string) => {
  const response = await axios.delete(
    `${import.meta.env.VITE_SERVER_URL}/api/quiz/questions/${questionId}`,
    { withCredentials: true },
  );
  return response.data;
};

const quizQuestionSchema = z.object({
  quizId: z.string().min(1, { message: "Quiz ID is required" }),
  text: z
    .string()
    .min(3, { message: "Question must be at least 3 characters" })
    .max(500, { message: "Question is too long" }),
  options: z
    .array(
      z
        .string()
        .min(1, { message: "Option text is required" })
        .max(200, { message: "Option is too long" }),
    )
    .min(2, { message: "At least 2 options are required" })
    .max(5, { message: "Maximum 5 options allowed" }),
  correct: z.string().min(0, { message: "Please select the correct answer" }),
});

type QuizQuestionSchemaType = z.infer<typeof quizQuestionSchema>;

const createQuizQuestion = async (
  data: QuizQuestionSchemaType & { userId: string },
) => {
  const response = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/api/quiz/questions/create`,
    data,
    { withCredentials: true },
  );
  return response.data;
};

export default function DynamicQuizForm() {
  const params = useParams();
  const quizId = params?.quizId as string;
  const { user } = useUser();
  const { setQuiz } = useQuiz();
  const [correctOption, setCorrectOption] = useState<number>(0);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (quizId) {
      getQuizInfo(quizId).then((data) => {
        setQuiz(data);
      });
    }
  }, [quizId]);

  const {
    data: questions,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["questions", quizId],
    queryFn: () => getQuizQuestions(quizId),
    enabled: !!quizId,
  });

  const form = useForm<QuizQuestionSchemaType>({
    resolver: zodResolver(quizQuestionSchema),
    defaultValues: {
      quizId: quizId || "",
      text: "",
      options: ["", ""],
      correct: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    //@ts-ignore
    name: "options",
  });

  const createOrUpdateQuestionMutation = useMutation({
    mutationFn: async (data: QuizQuestionSchemaType) => {
      if (!quizId || !user?.id) {
        throw new Error("Quiz ID or User not found");
      }

      if (editingQuestionId) {
        return axios.put(
          `${import.meta.env.VITE_SERVER_URL}/api/quiz/questions/${editingQuestionId}`,
          { ...data, userId: user.id },
          { withCredentials: true },
        );
      }

      return createQuizQuestion({ ...data, userId: user.id });
    },
    onSuccess: () => {
      successToast(editingQuestionId ? "Question Updated" : "Question Added", {
        position: "top-center",
      });

      setEditingQuestionId(null);
      setCorrectOption(0);
      form.reset();
      refetch();
    },
    onError: (error: Error) => {
      errorToast(error.message, {
        position: "top-center",
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      return deleteQuizQuestion(questionId).then(() => refetch());
    },
    onSuccess: () => {
      successToast("Question Deleted", {
        position: "top-center",
      });
    },
    onError: (error: Error) => {
      errorToast(error.message, {
        position: "top-center",
      });
    },
  });

  const handleSubmit = async (data: QuizQuestionSchemaType) => {
    const formData = {
      ...data,
      correct: form.getValues().options[correctOption],
    };

    try {
      await createOrUpdateQuestionMutation
        .mutateAsync(formData)
        .then(() => refetch());
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleCorrectOptionSelect = (index: number) => {
    setCorrectOption(index);
    form.setValue("correct", form.getValues().options[index]);
  };

  const handleEdit = (question: Question) => {
    form.reset({
      quizId,
      text: question.text,
      options: question.options,
      correct: question.correct.toString(),
    });
    setCorrectOption(
      question.options.findIndex((option) => option === question.correct),
    );
    setEditingQuestionId(question.id);
  };

  return (
    <div className="mx-auto flex w-full flex-1 flex-col space-y-4 md:flex-row md:p-6">
      <h1 className="mb-4 text-center text-3xl font-bold">Question Manager</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="w-full">
          <CardHeader className="pt-6">
            <CardTitle>Create a new question</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Text</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your question here"
                        />
                      </FormControl>
                      <FormDescription>
                        Write a clear and concise question
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormLabel>Answer Options</FormLabel>
                  <FormDescription>
                    Add between 2-5 options and select the correct answer
                  </FormDescription>

                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Controller
                        control={form.control}
                        name={`options.${index}`}
                        render={({ field: inputField }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                {...inputField}
                                placeholder={`Option ${index + 1}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant={
                          correctOption === index ? "default" : "outline"
                        }
                        size="icon"
                        onClick={() => handleCorrectOptionSelect(index)}
                      >
                        <Check
                          className={
                            correctOption === index ? "text-white" : ""
                          }
                        />
                        <span className="sr-only">Set as correct answer</span>
                      </Button>

                      {fields.length > 2 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            remove(index);
                            if (correctOption === index) {
                              handleCorrectOptionSelect(0);
                            }
                          }}
                        >
                          <Trash2 />
                          <span className="sr-only">Remove option</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {fields.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append("")}
                    className="mt-2 w-full"
                  >
                    <Plus className="mr-2" />
                    Add Option
                  </Button>
                )}

                <Button type="submit" className="mt-2 w-full">
                  {editingQuestionId ? "Update Question" : "Add Question"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="mt-6 w-full">
          <CardHeader className="pt-6">
            <CardTitle>Preview Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {questions?.length > 0 ? (
                <div className="space-y-6">
                  {questions.map(
                    (question: Question, questionIndex: number) => (
                      <div key={question.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">
                            {`${questionIndex + 1}. ${question.text}`}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="secondary"
                              size="icon"
                              onClick={() => handleEdit(question)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit question</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() =>
                                deleteQuestionMutation.mutate(question.id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete question</span>
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`flex items-center gap-3 rounded-md p-3 ${
                                question.correct.toString() === option
                                  ? "bg-green-100 dark:bg-green-900"
                                  : "bg-gray-100 dark:bg-gray-800"
                              }`}
                            >
                              <div
                                className={`h-4 w-4 rounded-full ${
                                  question.correct.toString() === option
                                    ? "bg-green-500"
                                    : "bg-gray-300 dark:bg-gray-600"
                                }`}
                              />
                              <span
                                className={`text-sm ${
                                  question.correct.toString() === option
                                    ? "font-semibold"
                                    : "font-normal"
                                }`}
                              >
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
                        {questionIndex < questions.length - 1 && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  No questions available yet.
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
