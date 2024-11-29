import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowRight,
  Calendar,
  FolderGit2,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { TiCog } from "react-icons/ti";
import { Link } from "react-router";

const getAllQuiz = async ({ userId }: { userId: string }) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/api/quiz/`,
      { userId },
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const AllQuiz = () => {
  const { user } = useUser();
  const { data: quizzes, isLoading: loadingQuizzes } = useQuery({
    queryKey: ["quizzes", user?.id],
    queryFn: () => getAllQuiz({ userId: user?.id as string }),
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  });

  return loadingQuizzes ? (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading quizzes...</p>
      </div>
    </div>
  ) : !quizzes?.length ? (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <FolderGit2 className="h-8 w-8 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No quizzes found</h3>
        <p className="text-sm text-muted-foreground">
          Create your first quiz to get started
        </p>
        <Button asChild className="mt-4">
          <Link to="/quizzes/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Quiz
          </Link>
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex flex-1 flex-col space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Your Quizzes</h2>
        <Button asChild>
          <Link to="/quizzes/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Quiz
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {quizzes.map((quiz: any) => {
          const totalResults = quiz?.fields?.reduce(
            (acc: number, field: any) => acc + field?.results?.length,
            0,
          );

          return (
            <Card
              className="overflow-hidden transition-all hover:shadow-md"
              key={quiz.id}
            >
              <CardHeader className="pb-4 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="truncate pr-4 text-lg font-semibold">
                    {quiz.name}
                  </h3>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="rounded-xl px-2 py-1.5"
                      asChild
                    >
                      <Link
                        to={`/quiz/${quiz.id}/settings`}
                        className="cursor-pointer"
                      >
                        <TiCog
                          className="h-7 w-7 font-bold"
                          strokeWidth={1.08}
                        />
                        <span className="sr-only">Settings</span>
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3" />
                  <time dateTime={quiz.createdAt}>
                    {new Date(quiz.createdAt).toLocaleDateString()}
                  </time>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {totalResults} responses
                </p>
              </CardContent>
              <CardFooter className="flex items-center justify-between bg-muted/50 px-6 py-4">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="group ml-auto"
                >
                  <Link to={`/quiz/${quiz.id}`} className="flex items-center">
                    View Quiz
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-700 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AllQuiz;
