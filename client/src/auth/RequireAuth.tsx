import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Standalone fallback guard. Replace with FitPilot's existing auth guard/store
 * if the project already has one.
 */
export function RequireAuth({ children }: PropsWithChildren) {
  const location = useLocation();
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
