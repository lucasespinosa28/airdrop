type Result = {
  followingSince: string;
  txHash: string;
};

export default async function http(fid: number, contract: string) {
  console.log({ fid, contract });
  const response = await fetch("https://782e-143-137-68-31.ngrok-free.app/giveway", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fid: fid,
      contract: contract,
    }),
  });
  const json = await response.json();
  console.log(json)
  return json as Result;
}

//    const response =  await fetch(`http://127.0.0.1:8787/user/${fid}`,{method:"POST", headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({
//     fid: fid,
//     contract: contract,
//   });
//    const json = await response.json();
//    return json;
