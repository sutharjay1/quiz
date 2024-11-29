import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { errorToast, successToast } from "@/features/global/toast";
import { useQuiz } from "@/hooks/use-quiz";
import { useUser } from "@/hooks/use-user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { generateSlug } from "random-word-slugs";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

export async function createQuiz(data: {
  name: string;
  description: string;
  userId: string;
}) {
  const response = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/api/quiz/create`,
    data,
    {
      withCredentials: true,
    },
  );
  return response.data;
}

const quizSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Quiz name is required" })
    .max(20, { message: "Quiz name is too long" }),
  description: z
    .string()
    .max(100, { message: "Description is too long" })
    .optional(),
});

const QuizForm = () => {
  const { user } = useUser();
  const router = useNavigate();
  const { setQuiz } = useQuiz();

  const { mutateAsync: createQuizMutation, isPending: loadingQuiz } =
    useMutation({
      mutationFn: async (data: {
        name: string;
        description: string;
        userId: string;
      }) => {
        try {
          const result = await createQuiz(data);
          if (!result) {
            throw new Error("Failed to create quiz");
          }
          return result;
        } catch (error) {
          console.error("Mutation error:", error);
          throw error;
        }
      },
      onSuccess: (data) => {
        successToast("Quiz Created", {});

        if (data) {
          setQuiz(data);
          router(`/quiz/${data.id}`);
        }
      },
      onError: (error) => {
        if (error instanceof Error) {
          errorToast(error.message, {
            description:
              error.message === "Quiz already exists in this account"
                ? "Try using a different quiz name."
                : "An unexpected error occurred. Please try again.",
          });
        } else {
          errorToast("Something went wrong", {
            position: "top-center",
          });
        }
      },
    });

  const form = useForm<z.infer<typeof quizSchema>>({
    mode: "onChange",
    resolver: zodResolver(quizSchema),
    defaultValues: {
      name: generateSlug(2),
      description: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof quizSchema>) => {
    if (!user?.id) {
      errorToast("Authentication Error", {
        description: "Please log in to create a quiz.",
        position: "top-center",
      });
      return;
    }

    const loadId = toast.loading("Creating quiz...", {
      position: "bottom-right",
    });

    try {
      await createQuizMutation({
        name: values.name,
        description: values.description || "",
        userId: user.id,
      });
    } catch (error) {
      if (error instanceof Error) {
        errorToast(error.message, {
          description:
            error.message === "Quiz already exists in this account"
              ? "Change the quiz name and try again."
              : "Please try again",
        });
      } else {
        errorToast("Something went wrong", {
          position: "top-center",
        });
      }
    } finally {
      toast.dismiss(loadId);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="z-50 flex flex-col gap-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quiz name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Quiz name"
                  className="border-transparent bg-muted shadow-none"
                  disabled={loadingQuiz}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Description (optional)"
                  className="border-transparent bg-muted shadow-none"
                  disabled={loadingQuiz}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-4 flex flex-1 gap-x-2 sm:flex-row sm:gap-x-2 sm:space-y-0 md:justify-end">
          <Button
            variant="shine"
            className="w-fit sm:order-1 md:w-min md:self-center"
            type="submit"
            disabled={loadingQuiz || !user?.id}
          >
            {loadingQuiz ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Quiz"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { QuizForm };
