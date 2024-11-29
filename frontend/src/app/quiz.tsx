import PageHeader from "@/features/global/page-header";
import { QueryProvider } from "@/providers/query-provider";
import { QuizForm } from "../features/quiz/quiz-create-form";

const QuizNew = () => {
  return (
    <QueryProvider>
      <PageHeader title="Create New Quiz" className="text-left">
        <p className="text-muted-foreground">Enter the details below</p>
      </PageHeader>
      <QuizForm />
    </QueryProvider>
  );
};

export default QuizNew;
