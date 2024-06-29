import {
  cors,
  error,
  IRequest,
  json,
  Router,
  withContent,
  withParams,
} from "itty-router";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

type Environment = {
  basezoraairdrop: KVNamespace;
  PRIVATE_KEY: `0x${string}`;
  GRAPHQL_URL: string;
  AUTHORIZATION: string;
  RPC_URL: string;
  CONTRACT: `0x${string}`;
};

type CFArgs = [Environment, ExecutionContext];

const { preflight, corsify } = cors({
  origin: "*",
  allowMethods: "GET, POST",
});

interface Metadata {
  name: string;
  description: string;
  image: string;
}

interface Thumbnail {
  image: string;
}

interface User {
  contract: string[];
}

interface AddContract {
  contract: string;
  amount: bigint;
  channel: string;
}
const router = Router<IRequest, CFArgs>({
  before: [withParams, preflight],
  catch: error,
  finally: [json, corsify],
});

type Warpcast = {
  fid: number;
  contract: string;
};

interface Root {
  data: Data;
}
interface Data {
  FarcasterChannelParticipants: FarcasterChannelParticipants;
  Socials: Socials;
}
interface Socials {
  Social: Social[] | null;
}
interface Social {
  userAssociatedAddresses: string[] | null;
}
interface FarcasterChannelParticipants {
  FarcasterChannelParticipant: FarcasterChannelParticipant[] | null;
}
interface FarcasterChannelParticipant {
  lastActionTimestamp: string;
}

router
  .post("/metadata/:key", async (request, env) => {
    const key = request.params.key;
    const body = await request.json<Metadata>();
    try {
      await env.basezoraairdrop.put(key, JSON.stringify(body));
      let value = await env.basezoraairdrop.get(key);
      if (value === null) {
        return error(404);
      }
      return request.url;
    } catch (error: any) {
      console.error(`KV returned error: ${error}`);
      return error(500);
    }
  })
  .get("/metadata/:key", async (request, env) => {
    const key = request.params.key;
    try {
      let value = await env.basezoraairdrop.get(key);
      if (value === null) {
        return error(404);
      }
      return JSON.parse(value);
    } catch (error: any) {
      console.error(`KV returned error: ${error}`);
      return error(500);
    }
  })
  .post("/user/:key", async (request, env) => {
    const key = request.params.key;
    const body = await request.json<AddContract>();
    try {
      console.log({ key: body.contract, value: body.channel });
      await env.basezoraairdrop.put(body.contract, body.channel);
      let value = await env.basezoraairdrop.get(body.contract);
      console.log({ value });
      if (value === null) {
        return error(404);
      }
    } catch (error: any) {
      console.error(`KV returned error: ${error}`);
      return error(500);
    }
    try {
      await env.basezoraairdrop.put(key, JSON.stringify(body));
      let value = await env.basezoraairdrop.get(key);
      if (value === null) {
        return error(404);
      }
      return value;
    } catch (error: any) {
      console.error(`KV returned error: ${error}`);
      return error(500);
    }
  })
  .get("/user/:key", async (request, env) => {
    const key = request.params.key;
    try {
      let value = await env.basezoraairdrop.get(key);
      if (value) {
        const json = JSON.parse(value) as AddContract;
        console.log({ value: json });
        let contract = await env.basezoraairdrop.get(json.contract);
        console.log({ contract });
        if (value === null) {
          return error(404);
        }
        return json;
      }
      return error(500);
    } catch (error: any) {
      console.error(`KV returned error: ${error}`);
      return error(500);
    }
  })
  .post("/giveway", async (request, env) => {
    const body = await request.json<Warpcast>();
    console.log({body});
    console.log({ contract: body.contract });
    console.log(body.contract)
    let channel = await env.basezoraairdrop.get(body.contract);
    console.log(channel)
    console.log({ body, channel });
    console.log({ fid: body.fid, channel });
    if (!channel) {
      channel = "";
    }

    const res = await fetch(
      env.GRAPHQL_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: env.AUTHORIZATION,
        },
        body: JSON.stringify({
          query: `
{
FarcasterChannelParticipants(
input: {
filter: {
participant: { _eq: "fc_fid:${body.fid}" }
channelId: { _eq: "base" }
channelActions: { _eq: follow }
}
blockchain: ALL
}
) {
FarcasterChannelParticipant {
lastActionTimestamp
}
}
Socials(
input: {
filter: { identity: { _in: ["fc_fid:${body.fid}"] } }
blockchain: ethereum
}
) {
Social {
userAssociatedAddresses
}
}
    }
            `,
        }),
      },
    );
    const json = await res.json() as Root;
    console.log(json);
    if (
      json.data.FarcasterChannelParticipants.FarcasterChannelParticipant == null
    ) {
      return error(500);
    }
    if (
      json.data.Socials.Social == null
    ) {
      return error(500);
    }
    if (json.data.Socials.Social[0].userAssociatedAddresses == null) {
      return error(500);
    }
    let address = json.data.Socials.Social[0].userAssociatedAddresses[0];
    if (json.data.Socials.Social[0].userAssociatedAddresses.length > 1) {
      address = json.data.Socials.Social[0].userAssociatedAddresses[1];
    }
    const isTrue =
      json.data.FarcasterChannelParticipants.FarcasterChannelParticipant[0]
        .lastActionTimestamp;

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });
    const walletClient = createWalletClient({
      chain: baseSepolia,
      transport: http(),
    });

    const account = privateKeyToAccount(env.PRIVATE_KEY);

    const abi = [
      {
        type: "function",
        name: "giveway",
        inputs: [
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
    ];
    console.log({token:body.contract,contract:env.CONTRACT,address:address});
    const { request: call } = await publicClient.simulateContract({
      account,
      address: env.CONTRACT,
      abi: abi,
      functionName: "giveway",
      args: [body.contract, address],
    });
    const txHash = await walletClient.writeContract(call);
    console.log("✅ Transaction successfully sponsored!");
    console.log(
      `🔍 View on Etherscan: https://sepolia.basescan.org/tx/${txHash}`,
    );

    return { followingSince: isTrue, txHash: txHash };
  })
  //Frames
  .post("/thumbnail/:key", async (request, env) => {
    const body = await request.json<Thumbnail>();
    const key = request.params.key;
    await env.basezoraairdrop.put(key, body.image);
    return { success: true };
  })
  .all("*", () => error(404));

export default {
  ...router,
} satisfies ExportedHandler<Env>;
//0x8c99f79f4732d264b72f6409851cb78c3c2773a9
