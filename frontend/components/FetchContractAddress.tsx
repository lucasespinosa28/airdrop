"use client";
import React, { useEffect, useState } from "react";
import { useTransactionReceipt } from "wagmi";
import { MintAdmin } from "./MintAdmin";

export function FetchContractAddress({
  hash, amount, metadata, channel,
}: {
  hash: `0x${string}`;
  amount: bigint;
  metadata: string;
  channel: string;
}) {
  const { data, status } = useTransactionReceipt({ hash });
  const [token, setToken] = useState<`0x${string}` | null>(null);
  useEffect(() => {
    if (data != undefined && data?.logs.length > 0) {
      data.logs.forEach((element) => {
        if (element.topics[0] ===
          "0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498")
          setToken(element.address);
      });
    }
  }, [data]);
  return (
    <>
      {status == "success" && token && (
        <>
          <MintAdmin
            amount={amount}
            token={token}
            channel={channel}
            metadata={metadata} />
        </>
      )}
    </>
  );
}
