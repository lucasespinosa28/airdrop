"use client";
import React from "react";

export function SuccessAlert({ text, hash }: { text: string; hash: string; }) {
  return (<div
    className="alert-box bg-green-100 border-l-4 border-green-500 text-green-900 px-4 py-3 rounded relative"
    role="alert"
  >
    <strong className="font-bold">Success:</strong>
    <span className="block sm:inline">
      {text}
      <a className="font-bold underline-offset-0" href={`https://sepolia.basescan.org/tx/${hash}`} target="_blank" rel="noopener noreferrer"> contract</a>
    </span>
  </div>);
}
