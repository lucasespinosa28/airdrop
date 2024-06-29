"use client";
import { holderContract } from "@/utils/constants";
import { encodeFunctionData } from "viem";


export const createContractDeterministic = (
  nameRequired: string,
  metadata: string,
  royaltyRecipient: `0x${string}`
) => encodeFunctionData({
  abi: [
    {
      inputs: [
        { internalType: "address", name: "factory", type: "address" },
        { internalType: "string", name: "contractURI", type: "string" },
        { internalType: "string", name: "name", type: "string" },
        {
          components: [
            {
              internalType: "uint32",
              name: "royaltyMintSchedule",
              type: "uint32",
            },
            { internalType: "uint32", name: "royaltyBPS", type: "uint32" },
            {
              internalType: "address",
              name: "royaltyRecipient",
              type: "address",
            },
          ],
          internalType: "struct ICreatorRoyaltiesControl.RoyaltyConfiguration",
          name: "defaultRoyaltyConfiguration",
          type: "tuple",
        },
        {
          internalType: "address payable",
          name: "defaultAdmin",
          type: "address",
        },
        { internalType: "bytes[]", name: "setupActions", type: "bytes[]" },
      ],
      name: "createContractDeterministic",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  functionName: "createContractDeterministic",
  args: [
    "0x777777C338d93e2C7adf08D102d45CA7CC4Ed021",
    metadata,
    nameRequired,
    {
      royaltyMintSchedule: 0,
      royaltyBPS: 1000,
      royaltyRecipient: royaltyRecipient,
    },
    holderContract,
    [
      "0xe72878b40000000000000000000000000000000000000000000000000000000000000000",
      "0x674cbae60000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000ffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000017697066733a2f2f44554d4d592f746f6b656e2e6a736f6e000000000000000000",
      "0x8ec998a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000d34872be0cdb6b09d45fca067b07f04a1a9ae1ae0000000000000000000000000000000000000000000000000000000000000004",
      "0xd904b94a0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000d34872be0cdb6b09d45fca067b07f04a1a9ae1ae000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c434db7eee00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000583d98c6fa793b9eff80674f9dca1bbc7cc6f9f200000000000000000000000000000000000000000000000000000000",
      "0xafed7e9e0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003e8000000000000000000000000583d98c6fa793b9eff80674f9dca1bbc7cc6f9f2",
    ],
  ],
});
