import { createFrames, Button } from "frames.js/cloudflare-workers";
import type { JsonValue } from "frames.js/types";
import http from "./http";
type Env = {
  /**
   * Taken from wrangler.toml#vars
   */
  MY_APP_LABEL: string;
};


const frames = createFrames<JsonValue | undefined, Env>({
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
export default {
  fetch,
} satisfies ExportedHandler<Env>;