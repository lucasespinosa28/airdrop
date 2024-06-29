"use client";
import { backend_url, holderContract } from "@/utils/constants";
import React, { useEffect, useState } from "react";
import { FetchNFTBalance } from "./FetchNFTBalance";
import { FetchNFTMetadata } from "./FetchNFTMetadata";

interface AddContract {
  contract: `0x${string}`;
  amount: bigint;
  channel: string;
}
export function LastedCreation({ fid }: { fid: number }) {
  const [tokenContract, setTokenContract] = useState<AddContract | null>(null);
  useEffect(() => {
    async function getCreated() {
      const res = await fetch(backend_url("user", fid));
      if (!res.ok) {
        setTokenContract(null);
      } else {
        const contract = await res.json<AddContract>();
        console.log({ contract });
        setTokenContract(contract);
      }
    }
    getCreated();
  }, [fid]);
  if (tokenContract) {
    return (
      <div className="flex flex-col w-3/5 shadow font-bold">
        <span className="bg-yellow-400 m-2 rounded-lg text-purple-900 text-center w-12">
          1/1
        </span>
        <FetchNFTBalance
          token={tokenContract.contract as `0x${string}`}
          holderContract={holderContract}
          limit={tokenContract.amount}
        />
        <h1>contract: {tokenContract.contract}</h1>
        <h1>channel: {tokenContract.channel}</h1>
        <FetchNFTMetadata token={tokenContract.contract} />
      </div>
    );
  }
  return (
    <span className="bg-yellow-400 m-2 rounded-lg text-center w-12">0/1</span>
  );
}
