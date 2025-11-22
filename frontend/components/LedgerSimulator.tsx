"use client";

import React, { useState } from "react";

interface LedgerSimulatorProps {
  intent: string;
  functionName: string;
  fields: Array<{
    label: string;
    value: string;
  }>;
  onApprove: () => void;
  onReject: () => void;
}

export default function LedgerSimulator({
  intent,
  functionName,
  fields,
  onApprove,
  onReject,
}: LedgerSimulatorProps) {
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  const handleNext = () => {
    if (currentFieldIndex < fields.length - 1) {
      setCurrentFieldIndex(currentFieldIndex + 1);
    } else {
      setCurrentFieldIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex(currentFieldIndex - 1);
    } else {
      setCurrentFieldIndex(fields.length - 1);
    }
  };

  const handleApprove = () => {
    setIsApproved(true);
    setTimeout(() => {
      onApprove();
    }, 500);
  };

  const handleReject = () => {
    setIsRejected(true);
    setTimeout(() => {
      onReject();
    }, 500);
  };

  if (isApproved) {
    return (
      <div className="ledger-device approved">
        <div className="ledger-screen">
          <div className="text-center">
            <div
              className="terminal-glow"
              style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
            >
              [✓]
            </div>
            <div className="terminal-text">TRANSACTION</div>
            <div className="terminal-text">APPROVED</div>
          </div>
        </div>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="ledger-device rejected">
        <div className="ledger-screen">
          <div className="text-center">
            <div
              className="terminal-red"
              style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
            >
              [✗]
            </div>
            <div className="terminal-red">TRANSACTION</div>
            <div className="terminal-red">REJECTED</div>
          </div>
        </div>
      </div>
    );
  }

  const currentField = fields[currentFieldIndex];

  return (
    <div className="flex flex-col items-center">
      <div className="ledger-device">
        <div className="ledger-header">
          <div className="ledger-logo terminal-text terminal-glow">LEDGER</div>
          <div className="ledger-model">NANO X</div>
        </div>

        <div className="ledger-screen">
          {currentFieldIndex === 0 ? (
            <div className="text-center">
              <div
                className="terminal-dim"
                style={{ fontSize: "0.7rem", marginBottom: "0.5rem" }}
              >
                &gt; REVIEW TRANSACTION
              </div>
              <div
                className="terminal-text terminal-glow"
                style={{ fontSize: "0.9rem", fontWeight: "bold" }}
              >
                {intent}
              </div>
              <div
                className="terminal-dim"
                style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}
              >
                [{functionName}()]
              </div>
            </div>
          ) : (
            <div>
              <div
                className="terminal-dim"
                style={{ fontSize: "0.7rem", marginBottom: "0.25rem" }}
              >
                &gt; {currentField.label}
              </div>
              <div
                className="terminal-text"
                style={{ fontSize: "0.85rem", wordBreak: "break-all" }}
              >
                {currentField.value}
              </div>
            </div>
          )}

          <div
            className="terminal-dim text-center"
            style={{ fontSize: "0.7rem", marginTop: "1rem" }}
          >
            [{currentFieldIndex + 1}/{fields.length + 1}]
          </div>
        </div>

        <div className="ledger-buttons">
          <button
            onClick={handlePrev}
            className="ledger-button ledger-button-left"
            title="Previous"
          >
            ◀
          </button>
          <button
            onClick={handleNext}
            className="ledger-button ledger-button-right"
            title="Next"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={handleReject}
          className="terminal-button"
          style={{ borderColor: "#ff0040", color: "#ff0040" }}
        >
          [ REJECT ]
        </button>
        <button
          onClick={handleApprove}
          className="terminal-button"
          style={{ borderColor: "#00ff41", color: "#00ff41" }}
        >
          [ APPROVE ]
        </button>
      </div>

      <style jsx>{`
        .ledger-device {
          width: 340px;
          background: #0a0a0a;
          border-radius: 4px;
          padding: 20px;
          box-shadow: 0 0 20px rgba(0, 255, 65, 0.3),
            inset 0 0 30px rgba(0, 255, 65, 0.05);
          border: 2px solid #004d1a;
        }

        .ledger-device.approved {
          border-color: #00ff41;
          box-shadow: 0 0 30px rgba(0, 255, 65, 0.5),
            inset 0 0 30px rgba(0, 255, 65, 0.1);
        }

        .ledger-device.rejected {
          border-color: #ff0040;
          box-shadow: 0 0 30px rgba(255, 0, 64, 0.5),
            inset 0 0 30px rgba(255, 0, 64, 0.1);
        }

        .ledger-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #004d1a;
        }

        .ledger-logo {
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 3px;
        }

        .ledger-model {
          font-size: 10px;
          color: #004d1a;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .ledger-screen {
          background: #000000;
          border-radius: 2px;
          padding: 20px;
          min-height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 2px solid #00ff41;
          box-shadow: 0 0 10px rgba(0, 255, 65, 0.3),
            inset 0 0 20px rgba(0, 255, 65, 0.05);
          position: relative;
        }

        .ledger-screen::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 255, 65, 0.03) 0px,
            transparent 1px,
            transparent 2px,
            rgba(0, 255, 65, 0.03) 3px
          );
          pointer-events: none;
        }

        .ledger-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 16px;
          gap: 8px;
        }

        .ledger-button {
          width: 50px;
          height: 50px;
          border-radius: 2px;
          background: #000000;
          border: 2px solid #00ff41;
          color: #00ff41;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          text-shadow: 0 0 5px #00ff41;
        }

        .ledger-button:hover {
          background: #00ff41;
          color: #000000;
          box-shadow: 0 0 15px rgba(0, 255, 65, 0.6);
          transform: translateY(-2px);
        }

        .ledger-button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
