import { Navigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "./Layout";

export function ProtectedLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EFE8] flex items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
}
