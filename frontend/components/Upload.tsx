"use client";
import Image from "next/image";
import React, { Dispatch, SetStateAction } from "react";
import { UploadButton } from "@/utils/uploadthing";

export function Upload({
  imageUrl, setImageUrl,
}: {
  imageUrl: string | undefined;
  setImageUrl: Dispatch<SetStateAction<string | undefined>>;
}) {
  return (
    <>
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          console.log("Files: ", res);
          setImageUrl(res[0].url);
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
        }} />
      {imageUrl && (
        <div>
          <Image src={imageUrl} width={512} height={512} alt="" />
        </div>
      )}
    </>
  );
}
