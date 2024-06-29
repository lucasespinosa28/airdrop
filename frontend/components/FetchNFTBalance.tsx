"use client";
import React from "react";
import { useReadContract } from "wagmi";


export function FetchNFTBalance({
  token, holderContract, limit,
}: {
  token: `0x${string}`;
  holderContract: `0x${string}`;
  limit: bigint;
}) {
  const { data, status } = useReadContract({
    abi: [
      {
        inputs: [
          { internalType: "address", name: "account", type: "address" },
          { internalType: "uint256", name: "id", type: "uint256" },
        ],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    address: token,
    functionName: "balanceOf",
    args: [holderContract, 1n],
  });
  return (
    <>
      {status == "success" && (
        <>
          <p>
            Balance:{data.toString()}/{limit.toString()}
          </p>
        </>
      )}
    </>
  );
}
