"use client";
import { createPublicClient, http } from "viem";
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";
import { ENTRYPOINT_ADDRESS_V06 } from "permissionless";
import { baseSepolia } from "viem/chains";
import { rpc_url } from "@/utils/constants";



export const publicClient = createPublicClient({
  transport: http(rpc_url),
});

export const cloudPaymaster = createPimlicoPaymasterClient({
  chain: baseSepolia,
  transport: http(rpc_url),
  entryPoint: ENTRYPOINT_ADDRESS_V06,
});
