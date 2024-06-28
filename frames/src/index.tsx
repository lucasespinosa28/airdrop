import { createFrames, Button } from "frames.js/cloudflare-workers";
import type { JsonValue } from "frames.js/types";
import http from "./http";
type Env = {
  /**
   * Taken from wrangler.toml#vars
   */
  MY_APP_LABEL: string;
};

export type State = {
  count: number;
};

const frames = createFrames<JsonValue | undefined, Env>({
  initialState: {
    count: 0,
  },
});
const fetch = frames(async (ctx) => {
  const message = ctx.message;
  const contract = ctx.searchParams.contract;
  let json = null;
  if (message) {
    json = await http(message.requesterFid, contract);
  }
  const thumbnail = ctx.searchParams.thumbnail;

  return {
    image: (
      <span
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img style={{marginTop:"15",width:"50%",height:"80%"}} src={`https://utfs.io/f/${thumbnail}.png`}/>
        {/* {message && <h1>{message.requesterFid}</h1>}
        {message && <span>{JSON.stringify(json)}</span>} */}
        <h2 style={{ paddingBottom: "50", textAlign: "center" }}>
          Giveway free nft to follower
        </h2>
      </span>
    ),
    buttons: json
      ? [
          <Button
            action="link"
            target={`https://sepolia.basescan.org/tx/${json.txHash}`}
          >
            ✨NFT minted
          </Button>,
        ]
      : [
          <Button action="post" target={{ query: { contract: contract,thumbnail:thumbnail } }}>
            Mint if is fallower
          </Button>,
        ],
  };
});
//<img src={`https://utfs.io/f/${da2314fc-4d85-46cd-a32e-7e61f238b1b0-sy7y5e}.png`} />
export default {
  fetch,
} satisfies ExportedHandler<Env>;
//646523
// const fetch = frames(async (ctx) => {
//   const message = ctx.message;

//   return {
//     image: message ? (
//       <div style={{ display: "flex", flexDirection: "column" }}>
//         GM, {message.requesterUserData?.displayName || "anonymous"}! Your FID is{" "}
//         {message.requesterFid},{" "}
//         {message.requesterFid < 20000
//           ? "you're OG!"
//           : "welcome to the Farcaster!"}
//       </div>
//     ) : (
//       <div>Say GM</div>
//     ),
//     buttons: message ? [] : [<Button action="post">Say GM</Button>],
//   };
// });
