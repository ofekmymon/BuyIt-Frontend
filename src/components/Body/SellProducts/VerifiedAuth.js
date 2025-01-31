import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "../../../hooks/useUser";

export default function ProtectedRoutes() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user.verified ? (
    <Outlet />
  ) : (
    <Navigate to="/profile-details?option=Verify Account" />
  );
}
