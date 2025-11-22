"use client";

import React from "react";

interface AddressDisplayProps {
  address: string;
  network?: string;
  showFull?: boolean;
  className?: string;
}

export function AddressDisplay({
  address,
  network,
  showFull = false,
  className = "",
}: AddressDisplayProps) {
  const shortAddress = showFull
    ? address
    : `${address.substring(0, 6)}...${address.substring(38)}`;

  return (
    <div
      className={`terminal-cyan ${className}`}
      style={{ fontSize: "0.8rem" }}
    >
      &gt;&gt; CONNECTED: {shortAddress}
      {network && (
        <span className="terminal-dim" style={{ marginLeft: "1rem" }}>
          [{network}]
        </span>
      )}
    </div>
  );
}
