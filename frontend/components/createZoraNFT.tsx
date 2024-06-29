"use client";
import {
  encodeFunctionData,
  http
} from "viem";
import {
  ENTRYPOINT_ADDRESS_V06,
  createSmartAccountClient
} from "permissionless";
import { baseSepolia } from "viem/chains";
import { privateKeyToSimpleSmartAccount } from "permissionless/accounts";
import { publicClient, cloudPaymaster } from "@/app/publicClient";
import { privateKey, rpc_url, holderContract } from "@/utils/constants";

//createContractDeterministic
export async function createZoraNFT(
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
      abi: [
        {
          inputs: [
            { internalType: "address", name: "recipient", type: "address" },
            { internalType: "uint256", name: "tokenId", type: "uint256" },
            { internalType: "uint256", name: "quantity", type: "uint256" },
            { internalType: "bytes", name: "data", type: "bytes" },
          ],
          name: "adminMint",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      functionName: "adminMint",
      args: [token, 1n, amount, "0x0"],
    }),
    value: 0n,
  });

  await smartAccountClient.sendTransaction({
    account: smartAccountClient.account,
    to: holderContract,
    data: encodeFunctionData({
      abi: [
        {
          inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "tokenId", type: "uint256" },
            { internalType: "string", name: "_newURI", type: "string" },
          ],
          name: "updateTokenURI",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      functionName: "updateTokenURI",
      args: [token, 1n, metadata],
    }),
    value: 0n,
  });

  return txHash;
}
