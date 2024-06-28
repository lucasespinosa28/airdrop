"use client";
import Providers from "@/compoments/Providers";
import Link from "next/link";
import Image from "next/image";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { LogoutButton } from "./LogoutButton";
import { LoginButton } from "./LoginButton";
import { usePrivy } from "@privy-io/react-auth";
import { SubmitHandler, useForm } from "react-hook-form";
import { UploadButton } from "@/utils/uploadthing";
import { generatePrivateKey } from "viem/accounts";
import { createPublicClient, encodeFunctionData, http } from "viem";
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";
import {
  ENTRYPOINT_ADDRESS_V06,
  createSmartAccountClient,
} from "permissionless";
import { baseSepolia } from "viem/chains";
import { privateKeyToSimpleSmartAccount } from "permissionless/accounts";
import {
  useWaitForTransactionReceipt,
  useTransactionReceipt,
  useReadContract,
} from "wagmi";
import { abi } from "./abi";

const privateKey = generatePrivateKey();
const holderContract = "0xb6e270859be3258fdf609faa66cc9aa0eebb3a27";
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

const createContractDeterministic = (
  nameRequired: string,
  metadata: string,
  royaltyRecipient: `0x${string}`
) =>
  encodeFunctionData({
    abi: abi,
    functionName: "createContractDeterministic",
    args: [
      "0x777777C338d93e2C7adf08D102d45CA7CC4Ed021",
      metadata,
      nameRequired,
      {
        royaltyMintSchedule: 0,
        royaltyBPS: 1000,
        royaltyRecipient: royaltyRecipient,
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
async function createZoraContract(
  nameRequired: string,
  metadata: string,
  royaltyRecipient: `0x${string}`
) {
  console.log();
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
    data: createContractDeterministic(nameRequired, metadata, royaltyRecipient),
    value: 0n,
  });
  return txHash;
}

type Metadata = {
  id: number;
  name: string;
  warpcast: string;
  image: string;
  minted: number;
  limit: number;
  ethereum: number;
  gas: number;
  plataform: string;
};

let metadataCards: Metadata[] = [
  {
    name: "Ninja",
    warpcast: "/base",
    image: "/mock/ninja.png",
    minted: 0,
    limit: 1e4,
    ethereum: 0.01,
    gas: 0.001,
    plataform: "Zora",
    id: 0,
  },
  {
    name: "Frog",
    warpcast: "/base",
    image: "/mock/frog.png",
    minted: 0,
    limit: 1e4,
    ethereum: 0.01,
    gas: 0.001,
    plataform: "Zora",
    id: 1,
  },
  {
    name: "Honey",
    warpcast: "/base",
    image: "/mock/honey.png",
    minted: 0,
    limit: 1e4,
    ethereum: 0.01,
    gas: 0.001,
    plataform: "Zora",
    id: 2,
  },
  {
    name: "Knight",
    warpcast: "/base",
    image: "/mock/knight.png",
    minted: 0,
    limit: 1e4,
    ethereum: 0.01,
    gas: 0.001,
    plataform: "Zora",
    id: 3,
  },
  {
    name: "Punk",
    warpcast: "/base",
    image: "/mock/punk.png",
    minted: 0,
    limit: 1e4,
    ethereum: 0.01,
    gas: 0.001,
    plataform: "Zora",
    id: 4,
  },
  {
    name: "Robot",
    warpcast: "/base",
    image: "/mock/robot.png",
    minted: 0,
    limit: 1e4,
    ethereum: 0.01,
    gas: 0.001,
    plataform: "Zora",
    id: 5,
  },
];

type Inputs = {
  royaltyRecipient: `0x${string}`;
  nameRequired: string;
  descriptionRequired: string;
  channelRequired: string;
  amountRequired: bigint;
  imageUrlRequired: string;
};

function Upload({
  imageUrl,
  setImageUrl,
}: {
  imageUrl: string | undefined;
  setImageUrl: Dispatch<SetStateAction<string | undefined>>;
}) {
  return (
    <>
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          console.log("Files: ", res);
          setImageUrl(res[0].url);
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
      {imageUrl && (
        <div>
          <Image src={imageUrl} width={512} height={512} alt="" />
        </div>
      )}
    </>
  );
}

interface AddContract {
  contract: string;
  amount: bigint;
  channel:string;
}
function LastedCreation({ fid }: { fid: number }) {
  const [tokenContract, setTokenContract] = useState<AddContract | null>(null);
  useEffect(() => {
    async function getCreated() {
      const res = await fetch(`http://127.0.0.1:8787/user/${fid}`);
      if (!res.ok) {
        setTokenContract(null);
      } else {
        const contract = await res.json<AddContract>();
        console.log({contract});
        setTokenContract(contract);
      }
    }
    getCreated();
  }, [fid]);
  if (tokenContract) {
    return (
      <>
        <h1>1/1 contract:{tokenContract.contract} channel:{tokenContract.channel}</h1>{" "}
        <FetchNFTBalance
          token={tokenContract.contract as `0x${string}`}
          holderContract={holderContract}
          limit={tokenContract.amount}
        />
      </>
    );
  }
  return <h1>0/1</h1>;
}
// interface Metadata {
//   name: string;
//   description: string;
//   image: string;
// }

export default function Home() {
  const { authenticated, user } = usePrivy();
  const [imageUrl, setImageUrl] = useState<string>();
  const [metadata, setMetadata] = useState<string>();
  const [channel, setChannel] = useState<string>();
  const [hash, setHash] = useState<`0x${string}`>();
  const [amount, setAmount] = useState<bigint>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const resMetadata = await fetch(
      `http://127.0.0.1:8787/metadata/${data.nameRequired}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          name: data.nameRequired,
          description: data.descriptionRequired,
          image: data.imageUrlRequired,
        }),
      }
    );
    const urlMetadata = await resMetadata.text();
    console.log({form:data});
    setMetadata(urlMetadata.replace(/"/g, ""));
    setLoading(true);
    const hash = await createZoraContract(
      data.nameRequired,
      urlMetadata,
      data.royaltyRecipient
    );
    setHash(hash);
    setAmount(data.amountRequired);
    console.log({channel_:data.channelRequired})
    setChannel(data.channelRequired);
  };

  if (authenticated && user?.farcaster) {
    return (
      <div>
        <h2>farcaster</h2>
        {user.farcaster.fid && <LastedCreation fid={user.farcaster.fid} />}
        <ul>
          <li>displayName:{user?.farcaster?.displayName}</li>
          <li>fid:{user?.farcaster?.fid}</li>
          <li>ownerAddress:{user?.farcaster?.ownerAddress}</li>
          <li>pfp:{user?.farcaster?.pfp}</li>
          {user?.farcaster?.pfp && (
            <Image
              src={user?.farcaster?.pfp}
              width={512}
              height={512}
              alt="Picture of the author"
            />
          )}
          <LogoutButton />
          <h2>FORM</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor="royaltyRecipient">royalty recipient</label>
            <input
              id="royaltyRecipient"
              {...register("royaltyRecipient", { required: true })}
            />
            {errors.royaltyRecipient && <span>This field is required</span>}

            <label htmlFor="name">Name</label>
            <input
              id="name"
              {...register("nameRequired", { required: true })}
            />
            {errors.nameRequired && <span>This field is required</span>}

            <label htmlFor="description">description</label>
            <input
              id="description"
              {...register("descriptionRequired", { required: true })}
            />
            {errors.descriptionRequired && <span>This field is required</span>}

            <label htmlFor="channel">channel</label>
            <input
              id="channel"
              {...register("channelRequired", { required: true })}
            />
            {errors.descriptionRequired && <span>This field is required</span>}

            <label htmlFor="amount">amount</label>
            <input
              id="amount"
              {...register("amountRequired", { required: true })}
            />
            {errors.amountRequired && <span>This field is required</span>}

            <label htmlFor="image">image</label>
            <Upload imageUrl={imageUrl} setImageUrl={setImageUrl} />
            {imageUrl && <h3>imageUrl:{imageUrl}</h3>}
            <input
              value={imageUrl}
              id="image"
              {...register("imageUrlRequired", { required: true })}
            />
            {errors.imageUrlRequired && <span>This field is required</span>}

            <input type="submit" />
          </form>
          <h1>metadata:{metadata}</h1>
          <h1>Contract</h1>
          {isLoading && <h1>Loading</h1>}
          {hash && (
            <>
              <p>{`🔍 View on Etherscan: https://sepolia.basescan.org/tx/${hash}`}</p>
              {isConfirming && <div>Waiting for confirmation...</div>}
              {isConfirmed && (
                <>
                <p>channel:{channel}-metadata:{metadata}-amount:{amount}</p>
                  {amount && metadata && channel && (
                    <FetchContractAddress
                      amount={amount}
                      hash={hash}
                      metadata={metadata}
                      channel={channel}
                    />
                  )}
                </>
              )}
            </>
          )}
        </ul>
      </div>
    );
  }
  return (
    <div>
      <h2>Loging into farcast</h2>
      <LoginButton />
    </div>
  );
}

function FetchContractAddress({
  hash,
  amount,
  metadata,
  channel,
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
          <MintAdmin
            amount={amount}
            token={token}
            channel={channel}
            metadata={metadata}
          />
        </>
      )}
    </>
  );
}

function MintAdmin({
  token,
  amount,
  metadata,
  channel,
}: {
  token: `0x${string}`;
  amount: bigint;
  metadata: string;
  channel: string;
}) {
  const { user } = usePrivy();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [hash, setHash] = useState<`0x${string}`>();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  return (
    <>
      <button
        onClick={async () => {
          const resMetadata = await fetch(
            `http://127.0.0.1:8787/user/${user?.farcaster?.fid}`,
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
          const contract = await (await resMetadata.text()).replace(/"/g, "");
          setLoading(true);
          if (contract.includes(token)) {
            const result = await createZoraNFT(token, amount, metadata);
            setHash(result);
          }
        }}
      >
        Save
      </button>
      <>
        {isLoading == true && <h1>loading</h1>}
        {hash && (
          <p>{`🔍 View on Etherscan: https://sepolia.basescan.org/tx/${hash}`}</p>
        )}
        {isConfirming && <div>Waiting for confirmation...</div>}
        {isConfirmed && (
          <>
            <FetchNFTBalance
              token={token}
              holderContract={holderContract}
              limit={amount}
            />
          </>
        )}
      </>
    </>
  );
}

function FetchNFTBalance({
  token,
  holderContract,
  limit,
}: {
  token: `0x${string}`;
  holderContract: `0x${string}`;
  limit: bigint;
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
          <p>
            Balance:{data.toString()}/{limit.toString()}
          </p>
          <p>success</p>
        </>
      )}
    </>
  );
}

//createContractDeterministic
async function createZoraNFT(
  token: `0x${string}`,
  amount: bigint,
  metadata: string
) {
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
      args: [token, 1n, amount, "0x0"],
    }),
    value: 0n,
  });

  await smartAccountClient.sendTransaction({
    account: smartAccountClient.account,
    to: holderContract,
    data: encodeFunctionData({
      abi,
      functionName: "updateTokenURI",
      args: [token, 1n, metadata],
    }),
    value: 0n,
  });

  return txHash;
}
