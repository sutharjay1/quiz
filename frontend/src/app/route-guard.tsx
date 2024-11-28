import React from "react";
import { useCookies } from "react-cookie";
import { Navigate, Outlet } from "react-router";

interface RouteGuardProps {
  redirectTo: string;
  isPrivate: boolean;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ redirectTo, isPrivate }) => {
  const [cookies] = useCookies(["token"]);

  const isLoggedIn = !!cookies.token;

  if (isPrivate && !isLoggedIn) {
    return <Navigate to={redirectTo} />;
  }

  if (!isPrivate && isLoggedIn) {
    return <Navigate to={redirectTo} />;
  }

  return <Outlet />;
};

export const PrivateRoute: React.FC = () => (
  <RouteGuard redirectTo="/signin" isPrivate={true} />
);

export const GuestRoute: React.FC = () => (
  <RouteGuard redirectTo="/dashboard" isPrivate={false} />
);
