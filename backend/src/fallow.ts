import { createPublicClient, encodeFunctionData, http } from "viem";
import { baseSepolia } from "viem/chains";
import {
  createSmartAccountClient,
  ENTRYPOINT_ADDRESS_V06,
} from "permissionless";
import { privateKeyToSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";

export interface Env {
  airdropbase: KVNamespace;
  PRIVATE_KEY:`0x${string}`,
  GRAPHQL_URL:string,
  AUTHORIZATION:string,
  RPC_URL:string,
}
interface Root {
  data: Data;
}
interface Data {
  FarcasterChannelParticipants: FarcasterChannelParticipants;
}
interface FarcasterChannelParticipants {
  FarcasterChannelParticipant: FarcasterChannelParticipant[] | null;
}
interface FarcasterChannelParticipant {
  lastActionTimestamp: string;
}

const message = (following: boolean, data: string) => {
  return JSON.stringify({ following, data });
};

type Warpcast = {
  fid: number;
  channel: string;
  contract:string;
};

export default {
  async fetch(request,env): Promise<Response> {
    if (request.method === "POST") {
      const contentType = request.headers.get("content-type");
      if (contentType != null && contentType.includes("application/json")) {
        const reqBody = await request.json<Warpcast>();
        if (reqBody.fid == null) {
          return new Response(message(false, "Error fid is empty"), {
            status: 500,
          });
        }
        const res = await fetch(
          env.GRAPHQL_URL,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: env.AUTHORIZATION, // Add API key to Authorization header
            },
            body: JSON.stringify({
              query: `
              {
  FarcasterChannelParticipants(
    input: {
      filter: {
        participant: { _eq: "fc_fid:${reqBody.fid}" }
        channelId: { _eq: "${reqBody.channel}" }
        channelActions: { _eq: follow }
      }
      blockchain: ALL
    }
  ) {
    FarcasterChannelParticipant {
      lastActionTimestamp
    }
  }
}
              `,
            }),
          },
        );
        const json = await res.json() as Root;
        if (
          json.data.FarcasterChannelParticipants.FarcasterChannelParticipant == 
            null
        ) {
          return new Response(message(false, "not following"));
        }
        if (
          json.data.FarcasterChannelParticipants.FarcasterChannelParticipant[0].lastActionTimestamp
        ) {
          const rpcUrl =
          env.RPC_URL;

          const publicClient = createPublicClient({
            transport: http(rpcUrl),
          });

          const simpleAccount = await privateKeyToSimpleSmartAccount(
            publicClient,
            {
              // Set this to your private key
              privateKey:
                env.PRIVATE_KEY,
              factoryAddress: "0x9406Cc6185a346906296840746125a0E44976454",
              entryPoint: ENTRYPOINT_ADDRESS_V06,
            },
          );

          const cloudPaymaster = createPimlicoPaymasterClient({
            chain: baseSepolia,
            transport: http(rpcUrl),
            entryPoint: ENTRYPOINT_ADDRESS_V06,
          });

          const smartAccountClient = createSmartAccountClient({
            account: simpleAccount,
            chain: baseSepolia,
            bundlerTransport: http(rpcUrl),
            // IMPORTANT: Set up Cloud Paymaster to sponsor your transaction
            middleware: {
              sponsorUserOperation: cloudPaymaster.sponsorUserOperation,
            },
          });

          const abi = [
            {
              inputs: [
                { internalType: "address", name: "recipient", type: "address" },
                { internalType: "uint16", name: "item", type: "uint16" },
              ],
              name: "mintTo",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "payable",
              type: "function",
            },
            {
              name: "setSender",
              stateMutability: "payable",
              type: "function",
            },
          ];

          const callData = encodeFunctionData({
            abi: abi,
            functionName: "setSender",
          });

          const txHash = await smartAccountClient.sendTransaction({
            account: smartAccountClient.account,
            to: "0x8Bd363C1Eaa2F0E82D97d3995bb1a6d057557C51",
            data: callData,
            value: 0n,
          });

          console.log("✅ Transaction successfully sponsored!");
          console.log(
            `🔍 View on Etherscan: https://sepolia.basescan.org/tx/${txHash}`,
          );

          return new Response(
            message(
              true,
              json.data.FarcasterChannelParticipants
                .FarcasterChannelParticipant[0].lastActionTimestamp,
            ),
          );
        }
        return new Response(message(false, "error unknow"));
      }
    }
    return new Response("pong");
  },
} satisfies ExportedHandler<Env>;
