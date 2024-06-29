"use client";
import React from "react";
import { usePrivy } from "@privy-io/react-auth";

export function LogoutButton() {
  const { ready, authenticated, logout } = usePrivy();
  const disableLogout = !ready || (ready && !authenticated);

  return (
    <button disabled={disableLogout} onClick={logout}>
      <span className="text-red-600 w-full font-bold">Log out</span>
    </button>
  );
}
