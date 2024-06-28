/* eslint-disable react/jsx-key */
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";

export type State = {
  count: number;
};
//http://127.0.0.1:8787
const frames = createFrames<State>({
  initialState: {
    count: 0,
  },
  basePath: "/frames",
  middleware: [
    farcasterHubContext({
      hubHttpUrl: "https://hub-api.neynar.com/",
    }),
  ],
});
const handleRequest = frames(async (ctx) => {
  const res = await fetch("https://dummyjson.com/posts/1");
  const json = await res.json();
  const message = ctx.message;
  console.log(message);
  let state = ctx.state;
  switch (ctx.searchParams.action) {
    case "increment":
      state = { ...state, count: state.count + 1 };
      break;
    case "decrement":
      state = { ...state, count: state.count - 1 };
      break;
  }

  return {
    image: (
      <div style={{ display: "flex", flexDirection: "column" }}>
        hello world
      </div>
    ),
    buttons: [
      <Button action="post" target={{ query: { action: "check" } }}>
        Check
      </Button>,
      <Button action="post" target={{ query: { action: "decrement" } }}>
        Mint
      </Button>,
    ],
    state,
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
