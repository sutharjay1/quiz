import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { P } from "@/components/ui/typography";
import ContinueWithGoogle from "@/features/auth/continue-with-google";
import { cn } from "@/lib/utils";
import { Link } from "react-router";

const SignIn = () => {
  return (
    <main
      className={cn(
        "relative z-10 flex h-screen items-center justify-center bg-background",
      )}
    >
      <Card className="overflow-hidden bg-sidebar transition-all hover:shadow-md">
        <CardHeader className="flex items-center justify-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-semibold"
          >
           QuizMaster
          </Link>
        </CardHeader>
        <CardContent className="mx-auto flex w-full items-center justify-center px-2 pt-4 sm:px-6 sm:pt-6">
          <ContinueWithGoogle />
        </CardContent>
        <CardFooter className="flex items-center justify-between bg-muted/50 px-6 py-4">
          <P className="text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Button
              asChild
              variant="link"
              className="h-auto px-1 text-xs font-medium text-primary"
            >
              <Link to="#">Terms of Service</Link>
            </Button>
            and{" "}
            <Button
              asChild
              variant="link"
              className="h-auto px-1 text-xs font-medium text-primary"
            >
              <Link to="#">Privacy Policy</Link>
            </Button>
            .
          </P>
        </CardFooter>
      </Card>
    </main>
  );
};

export default SignIn;
