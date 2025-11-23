"use client";

import React from "react";

interface ConnectButtonProps {
  onConnect: () => void | Promise<void>;
  isConnecting?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ConnectButton({
  onConnect,
  isConnecting = false,
  disabled = false,
  className = "",
}: ConnectButtonProps) {
  const handleClick = async () => {
    try {
      await onConnect();
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isConnecting}
      className={`terminal-button ${className}`}
      style={{
        padding: "0.75rem 2rem",
        fontSize: "0.9rem",
        borderColor: "#ff00ff",
        color: "#ff00ff",
        opacity: disabled || isConnecting ? 0.5 : 1,
        cursor: disabled || isConnecting ? "not-allowed" : "pointer",
      }}
    >
      {isConnecting ? "[CONNECTING...]" : "[CONNECT_WALLET]"}
    </button>
  );
}
