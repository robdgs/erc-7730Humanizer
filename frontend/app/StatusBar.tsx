"use client";

import { useEffect, useState } from "react";

export default function StatusBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(new Date().toISOString().slice(0, 19));
    const interval = setInterval(() => {
      setTime(new Date().toISOString().slice(0, 19));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="terminal-status-bar">
        <div className="status-left">
          <span className="status-indicator status-online">
            NETWORK: ONLINE
          </span>
          <span className="status-separator">|</span>
          <span className="status-indicator status-warning">CHAIN: 31337</span>
          <span className="status-separator">|</span>
          <span className="status-indicator status-online">
            SECURITY: ENABLED
          </span>
        </div>
        <div className="status-right">
          <span className="terminal-time">{time}</span>
        </div>
      </div>
      <style jsx global>{`
        .terminal-status-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 40px;
          background: #000000;
          border-bottom: 2px solid #00ff41;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 1rem;
          z-index: 1000;
          font-size: 0.7rem;
          box-shadow: 0 2px 10px rgba(0, 255, 65, 0.3);
        }

        .status-left {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .status-separator {
          color: #004d1a;
        }

        .terminal-time {
          color: #00ff41;
          font-family: "JetBrains Mono", monospace;
        }

        main {
          padding-top: 60px;
        }
      `}</style>
    </>
  );
}
