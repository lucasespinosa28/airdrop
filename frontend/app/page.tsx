import Link from "next/link";
import { fetchMetadata } from "frames.js/next";
 
export async function generateMetadata() {
  return {
    title: "My page",
    other: {
      // ...
      ...(await fetchMetadata(
        // provide full URL to your /frames endpoint
        new URL(
          "/frames",
          process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000"
        )
      )),
    },
  };
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
       <Link href="/dashboard">Dashboard</Link>
      <h1>Home page</h1>
    </main>
  );
}
