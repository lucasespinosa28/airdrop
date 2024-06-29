"use client";
import { http } from "viem";
import {
  ENTRYPOINT_ADDRESS_V06,
  createSmartAccountClient
} from "permissionless";
import { baseSepolia } from "viem/chains";
import { privateKeyToSimpleSmartAccount } from "permissionless/accounts";
import { publicClient, cloudPaymaster } from "./publicClient";
import { createContractDeterministic } from "./createContractDeterministic";
import { holderContract, privateKey, rpc_url } from "@/utils/constants";

export async function createZoraContract(
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
