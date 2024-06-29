"use client";
import React from "react";
import { useReadContract } from "wagmi";
import { MetadataCard } from "./MetadataCard";

export function FetchNFTMetadata({ token }: { token: `0x${string}`; }) {
  const { data, status } = useReadContract({
    abi: [
      {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "uri",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    address: token,
    functionName: "uri",
    args: [1n],
  });
  return (
    <>
      {status == "success" && (
        <>
          <MetadataCard url={data} contract={token} />
        </>
      )}
    </>
  );
}
