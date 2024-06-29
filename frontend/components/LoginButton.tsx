"use client";
import React from "react";
import { usePrivy } from "@privy-io/react-auth";

export function LoginButton() {
  const { ready, authenticated, login } = usePrivy();
  const disableLogin = !ready || (ready && authenticated);

  return (
    <>
      <button
        className="bg-lime-500 m-2 hover:bg-lime-600 text-white font-semibold py-2 px-4 rounded"
        disabled={disableLogin}
        onClick={login}
      >
        Connect Account
      </button>
    </>
  );
}
