import { generatePrivateKey } from "viem/accounts";


export const privateKey = generatePrivateKey();
export const holderContract = "0xb6e270859be3258fdf609faa66cc9aa0eebb3a27";
export const rpc_url =
  "https://api.developer.coinbase.com/rpc/v1/base-sepolia/O69gR1ZwN5XzwFe9gyz0vjrNvJIQ7rgs";
export const backend_url = (path: string, param: string | number) =>
  `https://backend.email1948.workers.dev/${path}/${param}`;