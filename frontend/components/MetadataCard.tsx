"use client";
import React, { useEffect, useState } from "react";
import { FrameUrl } from "./FrameUrl";
import Image from "next/image";

type Metadata = {
  name: string;
  description: string;
  image: string;
};

export function MetadataCard({
  url,
  contract,
}: {
  url: string;
  contract: string;
}) {
  const [metadata, setMetadata] = useState<Metadata>();
  const [isLoading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    async function getMetadata() {
      setLoading(true);
      const response = await fetch(url);
      const result = await response.json<Metadata>();
      setMetadata(result);
      setLoading(false);
    }
    getMetadata();
  }, [url]);

  return (
    <>
      {!isLoading && metadata && (
        <>
          <ul>
            <li>Name: {metadata.name}</li>
            <li>Description: {metadata.description}</li>
            <div className="w-full flex justify-center">
              <Image
                src={metadata.image}
                width={512}
                height={512}
                alt="Farcast avatar image"
                className="border-4 border-purple-900"
              />
            </div>
          </ul>
          <FrameUrl
            thumbnail={metadata.image
              .replace("https://utfs.io/f/", "")
              .replace(".png", "")}
            contract={contract}
          />
        </>
      )}
    </>
  );
}
