import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { GuestRoute, PrivateRoute } from "./app/route-guard";
import SignIn from "./app/signin";
import { Layout } from "./features/global/layout";
import Loading from "./features/global/loading";
import { useUser } from "./hooks/use-user";
import Result from "./app/result";

const Submit = lazy(() => import("./app/submit"));
const Home = lazy(() => import("./app/home"));
const Dashboard = lazy(() => import("./app/dashboard"));
const QuizNew = lazy(() => import("./app/quiz"));
const AllQuiz = lazy(() => import("./features/quiz/all-quiz"));
const DeleteQuiz = lazy(() => import("./features/quiz/delete-quiz"));
const DynamicQuizForm = lazy(
  () => import("./features/quiz/dynamiz-form-quiz-route"),
);

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

const AppContent = () => {
  const location = useLocation();
  const { user } = useUser();

  const noLayoutRoutes = ["/", "/signin", "/submit"];

  const isNoLayout = noLayoutRoutes.some((path) =>
    location.pathname.startsWith(path),
  );

  console.log({
    user,
    isNoLayout,
  });

  return (
    <div className="font-poppins flex h-full min-h-screen w-full flex-col text-muted-foreground">
      <main className="font-poppins w-full flex-1">
        {isNoLayout && !user ? (
          <Suspense fallback={<Loading />}>
            <AppRouter />
          </Suspense>
        ) : (
          <Layout>
            <Suspense fallback={<Loading />}>
              <AppRouter />
            </Suspense>
          </Layout>
        )}
      </main>
    </div>
  );
};

const AppRouter = () => (
  <Routes>
    <Route index element={<Home />} />

    <Route path="/submit/:quizId" element={<Submit />} />
    <Route path="/submit/:quizId/:responseId" element={<Result />} />

    <Route element={<GuestRoute />}>
      <Route path="/signin" element={<SignIn />} />
    </Route>

    <Route element={<PrivateRoute />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/quizzes/new" element={<QuizNew />} />
      <Route path="/quiz/:quizId" element={<DynamicQuizForm />} />
      <Route path="/quizzes" element={<AllQuiz />} />
      <Route path="/quiz/:quizId/settings" element={<DeleteQuiz />} />
    </Route>
  </Routes>
);

export default App;
