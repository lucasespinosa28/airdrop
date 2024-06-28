import { createPublicClient, encodeFunctionData, http } from "viem";
import {
  createSmartAccountClient,
  ENTRYPOINT_ADDRESS_V06,
} from "permissionless";
import { privateKeyToSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";
import { createWalletClient, custom } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

type Env = {
  basezoraairdrop: KVNamespace;
  PRIVATE_KEY: `0x${string}`;
  GRAPHQL_URL: string;
  AUTHORIZATION: string;
  RPC_URL: string;
};
interface Metadata {
  name: string;
  description: string;
  image: string;
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
};

const corsHeaders = {
  "Access-Control-Allow-Headers": "*", // What headers are allowed. * is wildcard. Instead of using '*', you can specify a list of specific headers that are allowed, such as: Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Authorization.
  "Access-Control-Allow-Methods": "POST,GET", // Allowed methods. Others could be GET, PUT, DELETE etc.
  "Access-Control-Allow-Origin": "*", // This is URLs that are allowed to access the server. * is the wildcard character meaning any URL can.
};

export default {
  async fetch(request, env): Promise<Response> {
    const pathName = new URL(request.url).pathname.split("/");
    console.log(request.method);
    switch (pathName[1]) {
      case "metadata":
        switch (request.method) {
          case "POST":
            const reqBody = await request.json<Metadata>();
            try {
              await env.basezoraairdrop.put(
                pathName[2],
                JSON.stringify(reqBody),
              );
              let value = await env.basezoraairdrop.get(pathName[2]);
              if (value === null) {
                return new Response("Value not found", { status: 404 });
              }
              return new Response(
                JSON.stringify({ key: pathName[2], ...reqBody }),
                {
                  headers: {
                    "Content-type": "application/json",
                    ...corsHeaders, //uses the spread operator to include the CORS headers.
                  },
                },
              );
            } catch (error: any) {
              console.error(`KV returned error: ${error}`);
              return new Response(error, { status: 500 });
            }
          case "GET":
            if (pathName[2] == null) {
              return new Response("404", { status: 404 });
            }
            try {
              let value = await env.basezoraairdrop.get(pathName[2]);
              if (value === null) {
                return new Response("Value not found", { status: 404 });
              }
              return new Response(value);
            } catch (error: any) {
              console.error(`KV returned error: ${error}`);
              return new Response(error, { status: 500 });
            }
            return new Response("metadata GET");
          default:
            return new Response("empty");
        }
      default:
        return new Response("empty");
    }
    if (request.method === "GET") {
      const pathName = new URL(request.url).pathname;
      return new Response(
        JSON.stringify({
          path1: pathName.split("/")[1],
          path2: pathName.split("/")[2],
        }),
      );
    }
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
          json.data.FarcasterChannelParticipants.FarcasterChannelParticipant[0]
            .lastActionTimestamp
        ) {
          const publicClient = createPublicClient({
            chain: baseSepolia,
            transport: http(),
          });

          const walletClient = createWalletClient({
            chain: baseSepolia,
            transport: http(),
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
              outputs: [],
            },
          ];

          const account = privateKeyToAccount(env.PRIVATE_KEY);
          const { request } = await publicClient.simulateContract({
            address: "0x8Bd363C1Eaa2F0E82D97d3995bb1a6d057557C51",
            abi,
            functionName: "setSender",
            account,
          });
          const txHash = await walletClient.writeContract(request);
          console.log(
            `🔍 View on Etherscan: https://sepolia.basescan.org/tx/${txHash}`,
          );
          // const rpcUrl =
          // env.RPC_URL;

          // const publicClient = createPublicClient({
          //   transport: http(rpcUrl),
          // });

          // const simpleAccount = await privateKeyToSimpleSmartAccount(
          //   publicClient,
          //   {
          //     // Set this to your private key
          //     privateKey:
          //       env.PRIVATE_KEY,
          //     factoryAddress: "0x9406Cc6185a346906296840746125a0E44976454",
          //     entryPoint: ENTRYPOINT_ADDRESS_V06,
          //   },
          // );

          // const cloudPaymaster = createPimlicoPaymasterClient({
          //   chain: baseSepolia,
          //   transport: http(rpcUrl),
          //   entryPoint: ENTRYPOINT_ADDRESS_V06,
          // });

          // const smartAccountClient = createSmartAccountClient({
          //   account: simpleAccount,
          //   chain: baseSepolia,
          //   bundlerTransport: http(rpcUrl),
          //   // IMPORTANT: Set up Cloud Paymaster to sponsor your transaction
          //   middleware: {
          //     sponsorUserOperation: cloudPaymaster.sponsorUserOperation,
          //   },
          // });

          // const abi = [
          //   {
          //     inputs: [
          //       { internalType: "address", name: "recipient", type: "address" },
          //       { internalType: "uint16", name: "item", type: "uint16" },
          //     ],
          //     name: "mintTo",
          //     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          //     stateMutability: "payable",
          //     type: "function",
          //   },
          //   {
          //     name: "setSender",
          //     stateMutability: "payable",
          //     type: "function",
          //   },
          // ];

          // const callData = encodeFunctionData({
          //   abi: abi,
          //   functionName: "setSender",
          // });

          // const txHash = await smartAccountClient.sendTransaction({
          //   account: smartAccountClient.account,
          //   to: "0x8Bd363C1Eaa2F0E82D97d3995bb1a6d057557C51",
          //   data: callData,
          //   value: 0n,
          // });

          // console.log("✅ Transaction successfully sponsored!");
          // console.log(
          //   `🔍 View on Etherscan: https://sepolia.basescan.org/tx/${txHash}`,
          // );

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

//did:key:z4MXj1wBzi9jUstyP5U8wN9qbFJqL6y2C5aDjLsCRym8sWiQHQmcpjUa1WSrHgQMvC1UasxwaDRMJGqPXvXS9KgStNYc3QHgmSG8YkkVfFjCEFrZ4Dnyj9sxT4MoPFtzc8wW7CsxH8PJEawTabAeLuPqNQM14N83wsuN19CWBqkMxUMq7ZenuyzvaNc9gGRkW71AXb2AP4FZM24GXM9URQ5R9LDrELiKd64D42z8cxCudaZaYJEutRJzyxq1aov3GDztos1kpKdTPJPkzLu7NoN8d7kN59Cf4X3WztSoyxdQYbYMNj9u29yjAW2pfUXctGcGqpi1XaVrnQ2UMgcYbvuZ2ZsoGvGDaZvKHjLxgNhkDwXGGDgfz
//Y6Jlcm9vdHOC2CpYJQABcRIgnm9XDTVaJTawe4wlz-aaKjwlH_UCm3T-g-nwGtTjgWTYKlglAAFxEiCK1uChKeS6HO6UHLc1u4i9yY030G0efg2q_eEXlv66YGd2ZXJzaW9uAboCAXESIAshjpvoPJ-4PHEeAxmuH7k3_hSEHu1gF_eebuSP0iHeqGFzWETtoQNA3Gq86VRW00bBHYeIPk2tD2rQ7x-ZNucesyN8R3wYKKUOwspoRFsCrm45axy08zeMF4hQY8U6b-NzcSDLhRGxCmF2ZTAuOS4xY2F0dIGiY2NhbmEqZHdpdGh4OGRpZDprZXk6ejZNa3NyWGRKbWVVa2ZudWJLc29ORUZ6SFJZSmk1WmZSTVhXMlhXTGp6UXc3OHltY2F1ZFggnRptYWlsdG86bHVjYXNlc3Bpbm9zYS5jb206ZW1haWxjZXhw9mNmY3SBoWVzcGFjZaFkbmFtZW9sdWNreS1kZXZlbG9wZXJjaXNzWCLtAccd6A_5uLKldfETz137qbD-DNB61rrk5p8MKbro08rIY3ByZoCyBAFxEiCeb1cNNVolNrB7jCXP5poqPCUf9QKbdP6D6fAa1OOBZKhhc0SAoAMAYXZlMC45LjFjYXR0gaJjY2FuYSpkd2l0aGZ1Y2FuOipjYXVkWQEQhSQwggEKAoIBAQClwHpK0ReGltWxlPOEajXNz75cHnGNXNNvR9x1SUf80uVsGid_uhGBDqPobxFSvKku_tRylObHMyHf-RDXj0ORcjuuxfJ3ITznTMsIDzAkSzKXyoVirJ0sy2bs6JC3ikNs9al6Zdwq46MR7kQfgLt4OpvfxDGZebbjhNruJGYpZh9yAaF20WdlmT41vZYMdw79dMtfeIx_PBv7TX9VzUjnIi1GUwaKuLP3XPUkHLCqY-MOYnE26_2_iz_qRXHnWaeETlxdbQ5DFFPUFdDqArtI2y5lXqljpycjQI10MpUBomh8SrsR12gSl9bLZspDpcRlsQfg60nBdb3VW7EJpukJAgMBAAFjZXhw9mNmY3SBom5hY2Nlc3MvY29uZmlybdgqWCUAAXESIGpZYZSZ_9F88zTNRlo8ZoRYjPT7hjkl5fvKoRqnpMxNbmFjY2Vzcy9yZXF1ZXN02CpYJQABcRIgTXTRJCLP7lPdh6ViJPKeDOcR-1LVSfeR9NShHGeeaMRjaXNzWCCdGm1haWx0bzpsdWNhc2VzcGlub3NhLmNvbTplbWFpbGNwcmaB2CpYJQABcRIgCyGOm-g8n7g8cR4DGa4fuTf-FIQe7WAX955u5I_SId6GBQFxEiCK1uChKeS6HO6UHLc1u4i9yY030G0efg2q_eEXlv66YKhhc1hE7aEDQO6OOagGvTPZkeqnljVO2p89LRGmOAgiXl80QWvMzukmhbpQRUFae0fbaYyxGed7OV4kdYRx9WMciwutvSO9_QZhdmUwLjkuMWNhdHSBo2JuYqFlcHJvb2bYKlglAAFxEiCeb1cNNVolNrB7jCXP5poqPCUf9QKbdP6D6fAa1OOBZGNjYW5rdWNhbi9hdHRlc3Rkd2l0aHRkaWQ6d2ViOndlYjMuc3RvcmFnZWNhdWRZARCFJDCCAQoCggEBAKXAekrRF4aW1bGU84RqNc3PvlwecY1c029H3HVJR_zS5WwaJ3-6EYEOo-hvEVK8qS7-1HKU5sczId_5ENePQ5FyO67F8nchPOdMywgPMCRLMpfKhWKsnSzLZuzokLeKQ2z1qXpl3CrjoxHuRB-Au3g6m9_EMZl5tuOE2u4kZilmH3IBoXbRZ2WZPjW9lgx3Dv10y194jH88G_tNf1XNSOciLUZTBoq4s_dc9SQcsKpj4w5icTbr_b-LP-pFcedZp4ROXF1tDkMUU9QV0OoCu0jbLmVeqWOnJyNAjXQylQGiaHxKuxHXaBKX1stmykOlxGWxB-DrScF1vdVbsQmm6QkCAwEAAWNleHD2Y2ZjdIGibmFjY2Vzcy9jb25maXJt2CpYJQABcRIgallhlJn_0XzzNM1GWjxmhFiM9PuGOSXl-8qhGqekzE1uYWNjZXNzL3JlcXVlc3TYKlglAAFxEiBNdNEkIs_uU92HpWIk8p4M5xH7UtVJ95H01KEcZ55oxGNpc3NSnRp3ZWI6d2ViMy5zdG9yYWdlY3ByZoA
