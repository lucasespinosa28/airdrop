"use client";
import Link from "next/link";
import {
  ENTRYPOINT_ADDRESS_V06,
  createSmartAccountClient,
} from "permissionless";
import { privateKeyToSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";
import { useCallback, useEffect, useState } from "react";
import { createPublicClient, encodeFunctionData, http } from "viem";
import { baseSepolia } from "viem/chains";
import {
  useReadContract,
  useTransactionReceipt,
  useWaitForTransactionReceipt,
} from "wagmi";
import { abi } from "./abi";
import { generatePrivateKey } from "viem/accounts";

const privateKey = generatePrivateKey();
const holderContract = "0x33Eba8FAAE6C4384e19A087aD19167a0D0Df8864";
const rpc_url =
  "https://api.developer.coinbase.com/rpc/v1/base-sepolia/O69gR1ZwN5XzwFe9gyz0vjrNvJIQ7rgs";

const publicClient = createPublicClient({
  transport: http(rpc_url),
});

const cloudPaymaster = createPimlicoPaymasterClient({
  chain: baseSepolia,
  transport: http(rpc_url),
  entryPoint: ENTRYPOINT_ADDRESS_V06,
});

const createContractDeterministic = encodeFunctionData({
  abi: abi,
  functionName: "createContractDeterministic",
  args: [
    "0x777777C338d93e2C7adf08D102d45CA7CC4Ed021",
    "ipfs://DUMMY/contract.json",
    Date.now().toString(),
    {
      royaltyMintSchedule: 0,
      royaltyBPS: 1000,
      royaltyRecipient: holderContract,
    },
    holderContract,
    [
      "0xe72878b40000000000000000000000000000000000000000000000000000000000000000",
      "0x674cbae60000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000ffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000017697066733a2f2f44554d4d592f746f6b656e2e6a736f6e000000000000000000",
      "0x8ec998a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000d34872be0cdb6b09d45fca067b07f04a1a9ae1ae0000000000000000000000000000000000000000000000000000000000000004",
      "0xd904b94a0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000d34872be0cdb6b09d45fca067b07f04a1a9ae1ae000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c434db7eee00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000583d98c6fa793b9eff80674f9dca1bbc7cc6f9f200000000000000000000000000000000000000000000000000000000",
      "0xafed7e9e0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003e8000000000000000000000000583d98c6fa793b9eff80674f9dca1bbc7cc6f9f2",
    ],
  ],
});

//createContractDeterministic
async function createZoraContract() {
  const simpleAccount = await privateKeyToSimpleSmartAccount(publicClient, {
    privateKey: privateKey,
    factoryAddress: "0x9406Cc6185a346906296840746125a0E44976454",
    entryPoint: ENTRYPOINT_ADDRESS_V06,
  });

  const smartAccountClient = createSmartAccountClient({
    account: simpleAccount,
    chain: baseSepolia,
    bundlerTransport: http(rpc_url),
    middleware: {
      sponsorUserOperation: cloudPaymaster.sponsorUserOperation,
    },
  });
  const txHash = await smartAccountClient.sendTransaction({
    account: smartAccountClient.account,
    to: holderContract,
    data: createContractDeterministic,
    value: 0n,
  });
  return txHash;
}

//createContractDeterministic
async function createZoraNFT(contract: `0x${string}`) {
  console.log("createZoraNFT")
  const simpleAccount = await privateKeyToSimpleSmartAccount(publicClient, {
    privateKey: privateKey,
    factoryAddress: "0x9406Cc6185a346906296840746125a0E44976454",
    entryPoint: ENTRYPOINT_ADDRESS_V06,
  });

  const smartAccountClient = createSmartAccountClient({
    account: simpleAccount,
    chain: baseSepolia,
    bundlerTransport: http(rpc_url),
    middleware: {
      sponsorUserOperation: cloudPaymaster.sponsorUserOperation,
    },
  });
  const txHash = await smartAccountClient.sendTransaction({
    account: smartAccountClient.account,
    to: holderContract,
    data: encodeFunctionData({
      abi,
      functionName: "adminMint",
      args: [contract, 1n, 1000n, "0x0"],
    }),
    value: 0n,
  });

  return txHash;
}

export default function Home() {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [hash, setHash] = useState<`0x${string}`>();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Link href="/dashboard">Dashboard</Link>
      <h1>Home page</h1>
      <button
        onClick={async () => {
          setLoading(true);
          const result = await createZoraContract();
          setHash(result);
        }}
      >
        Create Contract
      </button>
      {isLoading == true && <h1>loading</h1>}
      {hash && (
        <>
          <p>{`🔍 View on Etherscan: https://sepolia.basescan.org/tx/${hash}`}</p>
          {isConfirming && <div>Waiting for confirmation...</div>}
          {isConfirmed && (
            <>
              <FetchContractAddress hash={hash} />
            </>
          )}
        </>
      )}
    </main>
  );
}

function FetchContractAddress({ hash }: { hash: `0x${string}` }) {
  const { data, status } = useTransactionReceipt({ hash });
  const [token, setToken] = useState<`0x${string}` | null>(null);
  useEffect(() => {
    if (data != undefined && data?.logs.length > 0) {
      data.logs.forEach((element) => {
        if (
          element.topics[0] ===
          "0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498"
        )
          setToken(element.address);
      });
    }
  }, [data]);
  return (
    <>
      {status == "pending" && <p>pending</p>}
      {status == "error" && <p>error</p>}
      {status == "success" && token && (
        <>
          <p>success</p>
          <p>contract: {token}</p>
          <MintAdmin token={token} />
        </>
      )}
    </>
  );
}

function MintAdmin({ token }: { token: `0x${string}` }) {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [hash, setHash] = useState<`0x${string}`>();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  return (
    <>
      <button
        onClick={async () => {
          setLoading(true);
          const result = await createZoraNFT(token);
          setHash(result);
        }}
      >
        Mint nft
      </button>
      <>
        {isLoading == true && <h1>loading</h1>}
        {hash && (
          <p>{`🔍 View on Etherscan: https://sepolia.basescan.org/tx/${hash}`}</p>
        )}
        {isConfirming && <div>Waiting for confirmation...</div>}
        {isConfirmed && (
          <>
            <FetchNFTBalance token={token} holderContract={holderContract} />
          </>
        )}
      </>
    </>
  );
}

function FetchNFTBalance({
  token,
  holderContract,
}: {
  token: `0x${string}`;
  holderContract: `0x${string}`;
}) {
  const { data, status } = useReadContract({
    abi,
    address: token,
    functionName: "balanceOf",
    args: [holderContract, 1n],
  });
  return (
    <>
      {status == "pending" && <p>pending</p>}
      {status == "error" && <p>balance error</p>}
      {status == "success" && (
        <>
          <p>Balance:{data.toString()}</p>
          <p>success</p>
        </>
      )}
    </>
  );
}
