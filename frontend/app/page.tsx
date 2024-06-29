"use client";
import React, { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { FieldError, SubmitHandler, useForm } from "react-hook-form";
import { useWaitForTransactionReceipt } from "wagmi";
import { LogoutButton } from "@/components/LogoutButton";
import { LoginButton } from "@/components/LoginButton";
import { LastedCreation } from "@/components/LastedCreation";
import { FetchContractAddress } from "../components/FetchContractAddress";
import { Upload } from "../components/Upload";
import { createZoraContract } from "./createZoraContract";
import { backend_url } from "@/utils/constants";
import { RotatingSquare } from "react-loader-spinner";
import { Loading } from "@/components/Loading";
import { SuccessAlert } from "@/components/SuccessAlert";
import { Farcast } from "../components/Farcast";

type Inputs = {
  royaltyRecipient: `0x${string}`;
  nameRequired: string;
  descriptionRequired: string;
  channelRequired: string;
  amountRequired: bigint;
  imageUrlRequired: string;
};

function ErrorAlert({ text }: { text: string }) {
  const [hidden, setHidden] = useState<boolean>(false);
  if (hidden) {
    return <></>;
  }
  return (
    <div className="my-2 w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      <strong className="font-bold">{text}!</strong>
      <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
        <svg
          className="fill-current h-6 w-6 text-red-500"
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          onClick={() => setHidden(true)}
        >
          <title>Close</title>
          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
        </svg>
      </span>
    </div>
  );
}

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
    formState: { errors },
  } = useForm<Inputs>();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const resMetadata = await fetch(
      backend_url("metadata", data.nameRequired),
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
    setMetadata(urlMetadata.replace(/"/g, ""));
    setLoading(true);
    const hash = await createZoraContract(
      data.nameRequired,
      urlMetadata,
      data.royaltyRecipient
    );
    setHash(hash);
    setAmount(data.amountRequired);
    setChannel(data.channelRequired);
    setLoading(false);
  };

  if (authenticated && user?.farcaster) {
    return (
      <div className="flex flex-col justify-center items-center">
        <LogoutButton />
        <Farcast user={user.farcaster} />
        {user.farcaster.fid && <LastedCreation fid={user.farcaster.fid} />}
        <div className="bg-base-100 w-3/5  shadow">
          <h2 className="bg-purple-900  text-center text-white text-white w-full">
            Create a zora NFT for giveaway to a channel follower using gasless
            transaction with Coinbase paymaster
          </h2>
          <span className="bg-yellow-400 m-4 rounded-lg text-purple-900 text-center px-4 w-12">
            Upload an image if you do not already have a URL for it ready
          </span>
          <Upload imageUrl={imageUrl} setImageUrl={setImageUrl} />
          <form
            className="flex flex-col justify-center items-center"
            onSubmit={handleSubmit(onSubmit)}
          >
            <label
              className="mt-4 font-bold rounded-t bg-purple-900  w-full text-center text-white"
              htmlFor="royaltyRecipient"
            >
              Royalty recipient
            </label>
            {errors.royaltyRecipient && (
              <ErrorAlert text="This field is required" />
            )}
            <input
              className="border-2 border-purple-900 p-1 rounded-b w-full focus:border-blue-400 focus:outline-none"
              id="royaltyRecipient"
              {...register("royaltyRecipient", { required: true })}
              placeholder="Address of who will receive royalties from the sale"
            />

            <label
              className="mt-4 font-bold rounded-t bg-purple-900  w-full text-center text-white"
              htmlFor="name"
            >
              Name
            </label>
            <input
              className="border-2 border-purple-900 p-1 rounded-b w-full focus:border-blue-400 focus:outline-none"
              id="name"
              {...register("nameRequired", { required: true })}
              placeholder="Name of your nft"
            />
            {errors.nameRequired && (
              <ErrorAlert text="This field is required" />
            )}
            <label
              className="mt-4 font-bold rounded-t bg-purple-900  w-full text-center text-white"
              htmlFor="description"
            >
              description
            </label>
            <input
              className="border-2 border-purple-900 p-1 rounded-b w-full focus:border-blue-400 focus:outline-none"
              id="description"
              {...register("descriptionRequired", { required: true })}
              placeholder="Description of your nft"
            />
            {errors.descriptionRequired && (
              <ErrorAlert text="This field is required" />
            )}
            <label
              className="mt-4 font-bold rounded-t bg-purple-900  w-full text-center text-white"
              htmlFor="channel"
            >
              channel
            </label>
            <input
              className="border-2 border-purple-900 p-1 rounded-b w-full focus:border-blue-400 focus:outline-none"
              id="channel"
              {...register("channelRequired", { required: true })}
              placeholder="Channel that needs to be followed"
            />
            {errors.descriptionRequired && (
              <ErrorAlert text="This field is required" />
            )}
            <label
              className="mt-4 font-bold rounded-t bg-purple-900  w-full text-center text-white"
              htmlFor="amount"
            >
              amount
            </label>
            <input
              className="border-2 border-purple-900 p-1 rounded-b w-full focus:border-blue-400 focus:outline-none"
              id="amount"
              {...register("amountRequired", { required: true })}
              placeholder="Amount that will be distributed"
            />
            {errors.amountRequired && (
              <ErrorAlert text="This field is required" />
            )}
            <label
              className="mt-4 font-bold rounded-t bg-purple-900  w-full text-center text-white"
              htmlFor="image"
            >
              image
            </label>

            {imageUrl && <h3>imageUrl:{imageUrl}</h3>}
            <input
              className="border-2 border-purple-900 p-1 rounded-b w-full focus:border-blue-400 focus:outline-none"
              value={imageUrl}
              id="image"
              {...register("imageUrlRequired", { required: true })}
              placeholder="Amount that will be distributed"
            />
            {errors.imageUrlRequired && (
              <ErrorAlert text="This field is required" />
            )}
            <input
              className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded my-4"
              type="submit"
              value="Create Metatada and NFT"
            />
          </form>

          {isLoading && <Loading />}
          {hash && (
            <>
              {isConfirming && <Loading />}
              {isConfirmed && (
                <>
                  <SuccessAlert
                    text="NFT Metadata was create the "
                    hash={hash}
                  />
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
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col  justify-center items-center">
      <div className="w-1/2 shadow">
        <h1 className="text-center p-2 font-bold text-xl bg-purple-900 text-white">
          Welcome to airdrop nft for warpcast alpha
        </h1>
        <h2 className="p-4 text-lg ">
          This dapp uses coinbase paymaster to create NFT and send it to the
          follower of a warpcast channel without the user paying for the gas to
          send the NFT or to create the contracts
        </h2>
        <div className="flex flex-col  justify-center items-center">
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
