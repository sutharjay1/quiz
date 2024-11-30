"use client";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { ImGoogle } from "react-icons/im";
import { useNavigate } from "react-router";
import { errorToast, successToast } from "../global/toast";
import { useCookies } from "react-cookie";

const ContinueWithGoogle = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [_, setCookie] = useCookies(["token", "isLoggedIn"]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get("auth");

    const checkAuth = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/auth/profile`,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (response.data?.user) {
          setUser(response.data.user);
          successToast("Login successful", {
            position: "top-center",
          });
          setCookie("isLoggedIn", "true", { path: "/" });
          setCookie("token", JSON.stringify(response.data), {
            path: "/",
          });
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Authentication check failed", error);
      }
    };

    if (authStatus === "success") {
      checkAuth();
    }
  }, [navigate, setUser]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      window.location.href = `${
        import.meta.env.VITE_SERVER_URL
      }/api/auth/google`;
    },
    onError: (error: any) => {
      console.error("Google login error:", error);
      errorToast(error.message, { position: "top-center" });
    },
  });

  const handleGoogleLogin = () => mutate();

  return (
    <Button
      variant="outline"
      className="flex gap-2 space-x-2 px-4"
      onClick={handleGoogleLogin}
      disabled={isPending}
    >
      <ImGoogle className="size-10" />
      {isPending ? "Connecting..." : "Continue with Google"}
    </Button>
  );
};

export default ContinueWithGoogle;
