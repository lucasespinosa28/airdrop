"use client";
import React, { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWaitForTransactionReceipt } from "wagmi";
import { FetchNFTBalance } from "./FetchNFTBalance";
import { createZoraNFT } from "./createZoraNFT";
import { backend_url, holderContract } from "@/utils/constants";
import { Loading } from "./Loading";
import { SuccessAlert } from "./SuccessAlert";

export function MintAdmin({
  token, amount, metadata, channel,
}: {
  token: `0x${string}`;
  amount: bigint;
  metadata: string;
  channel: string;
}) {
  const { user } = usePrivy();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [hash, setHash] = useState<`0x${string}`>();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  return (
    <div className="flex flex-col justify-center items-center">
      <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-4"
        onClick={async () => {
          if (user?.farcaster?.fid) {
            const resMetadata = await fetch(
              backend_url("user", user?.farcaster?.fid),
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify({
                  contract: token,
                  amount: amount,
                  channel: channel,
                }),
              }
            );
            const contract = (await resMetadata.text()).replace(/"/g, "");
            setLoading(true);
            if (contract.includes(token)) {
              const result = await createZoraNFT(token, amount, metadata);
              setHash(result);
            }
            setLoading(false);
          }
        }}
      >
        Save and mint nfts
      </button>
      <>
        {isLoading == true &&  <Loading />}
        {(isConfirmed && hash) && (
          <>
             <SuccessAlert text="Contract is ready,please reload de page" hash={hash}/>
             <a className="bg-lime-500 hover:bg-lime-700 text-white font-bold py-2 px-4 rounded my-4" href="http://localhost:3000/">Reload</a>
          </>
        )}
      </>
    </div>
  );
}
