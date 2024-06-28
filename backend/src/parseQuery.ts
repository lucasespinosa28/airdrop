//   query MyQuery {
//       FarcasterChannelParticipants(
//         input: {
//           filter: {
//             participant: { _eq: "fc_fid:646523" }
//             channelId: { _eq: "base" }
//             channelActions: { _eq: follow }
//           }
//           blockchain: ALL
//         }
//       ) {
//         FarcasterChannelParticipant {
//           lastActionTimestamp
//         }
//       }
//       Socials(
//         input: {
//           filter: { identity: { _in: ["fc_fid:646523"] } }
//           blockchain: ethereum
//         }
//       ) {
//         Social {
//           userAssociatedAddresses
//         }
//       }
//     }
interface RootObject {
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




    // {
    //   "data": {
    //     "FarcasterChannelParticipants": {
    //       "FarcasterChannelParticipant": null
    //     },
    //     "Socials": {
    //       "Social": null
    //     }
    //   }
    // }

    // {
    //   "data": {
    //     "FarcasterChannelParticipants": {
    //       "FarcasterChannelParticipant": [
    //         {
    //           "lastActionTimestamp": "2024-06-08T02:43:45Z"
    //         }
    //       ]
    //     },
    //     "Socials": {
    //       "Social": [
    //         {
    //           "userAssociatedAddresses": [
    //             "0xd7e8790b5e1525c666633bfacfe3b53bfab1d365",
    //             "0xf77a535ecdeb2f065f92e076cb5572e2e96644da",
    //             "Ers3EE2nHxrbE1MNE6eZJQsdz7Uoeds5QvdtSeJdCDCf"
    //           ]
    //         }
    //       ]
    //     }
    //   }
    // }
