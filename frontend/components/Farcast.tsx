"use client";
import React from "react";
import { type Farcaster } from "@privy-io/react-auth";
import Image from "next/image";

export function Farcast({ user }: { user: Farcaster; }) {
  return (
    <div className="flex bg-base flex-row w-3/5 shadow bg-purple-800	rounded-t-lg">
      <div className="avatar content-center">
        {user.pfp && (
          <Image
            className="w-16 rounded-full m-2 border-2 border-white"
            src={user.pfp}
            width={48}
            height={48}
            alt="Farcast avatar image" />
        )}
      </div>
      <div className="text-white font-semibold text-xl content-center">{user.displayName}&apos;s farcast</div>
    </div>
  );
}
