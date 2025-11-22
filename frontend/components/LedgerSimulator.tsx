'use client';

import React, { useState } from 'react';

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
            <div className="text-4xl mb-2">✓</div>
            <div className="text-sm font-mono">Transaction</div>
            <div className="text-sm font-mono">Approved</div>
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
            <div className="text-4xl mb-2">✗</div>
            <div className="text-sm font-mono">Transaction</div>
            <div className="text-sm font-mono">Rejected</div>
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
          <div className="ledger-logo">LEDGER</div>
          <div className="ledger-model">Nano X</div>
        </div>
        
        <div className="ledger-screen">
          {currentFieldIndex === 0 ? (
            <div className="text-center">
              <div className="text-xs font-mono text-gray-500 mb-2">Review transaction</div>
              <div className="text-sm font-mono font-bold">{intent}</div>
              <div className="text-xs font-mono mt-1 text-gray-600">{functionName}</div>
            </div>
          ) : (
            <div>
              <div className="text-xs font-mono text-gray-500 mb-1">{currentField.label}</div>
              <div className="text-sm font-mono break-all">{currentField.value}</div>
            </div>
          )}
          
          <div className="text-xs text-center mt-3 text-gray-400">
            {currentFieldIndex + 1} / {fields.length + 1}
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
          className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
        >
          ✗ Reject
        </button>
        <button
          onClick={handleApprove}
          className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
        >
          ✓ Approve
        </button>
      </div>

      <style jsx>{`
        .ledger-device {
          width: 320px;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          border: 2px solid #404040;
        }

        .ledger-device.approved {
          border-color: #10b981;
          box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);
        }

        .ledger-device.rejected {
          border-color: #ef4444;
          box-shadow: 0 10px 40px rgba(239, 68, 68, 0.3);
        }

        .ledger-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .ledger-logo {
          font-size: 14px;
          font-weight: bold;
          color: #ffffff;
          letter-spacing: 2px;
        }

        .ledger-model {
          font-size: 10px;
          color: #888;
          text-transform: uppercase;
        }

        .ledger-screen {
          background: #000;
          border-radius: 8px;
          padding: 20px;
          min-height: 120px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: #fff;
          font-family: 'Courier New', monospace;
          border: 1px solid #333;
        }

        .ledger-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 16px;
        }

        .ledger-button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #404040;
          border: 2px solid #555;
          color: #fff;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ledger-button:hover {
          background: #505050;
          border-color: #666;
          transform: scale(1.05);
        }

        .ledger-button:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
}
