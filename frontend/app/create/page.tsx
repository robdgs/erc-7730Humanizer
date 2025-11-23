"use client";

import React, { useState } from "react";
import MatrixBackground from "@/components/MatrixBackground";

export default function CreateDescriptorPage() {
  const [abiInput, setAbiInput] = useState("");
  const [error, setError] = useState("");
  const [generatedJson, setGeneratedJson] = useState("");

  const generateDescriptor = () => {
    setError("");
    setGeneratedJson("");

    if (!abiInput.trim()) {
      setError("Please paste ABI JSON");
      return;
    }

    try {
      const abi = JSON.parse(abiInput);
      if (!Array.isArray(abi)) {
        setError("ABI must be an array");
        return;
      }

      // Auto-generate messages for all functions
      const messages: Record<string, any> = {};
      const functions = abi.filter((item) => item.type === "function");

      functions.forEach((func) => {
        const fields =
          func.inputs?.map((input: any) => {
            const lowerName = input.name?.toLowerCase() || "";
            let format = "raw";

            // Auto-detect format
            if (input.type === "address") {
              format = lowerName.includes("token") ? "token" : "address";
            } else if (
              input.type.startsWith("uint") ||
              input.type.startsWith("int")
            ) {
              if (lowerName.includes("amount") || lowerName.includes("value")) {
                format = "amount";
              } else if (
                lowerName.includes("deadline") ||
                lowerName.includes("time")
              ) {
                format = "date";
              }
            }

            return {
              path: input.name || `param${func.inputs.indexOf(input)}`,
              label: input.name
                ? input.name.charAt(0).toUpperCase() +
                  input.name.slice(1).replace(/([A-Z])/g, " $1")
                : `Parameter ${func.inputs.indexOf(input)}`,
              format,
            };
          }) || [];

        messages[func.name] = {
          intent: `Execute ${func.name}`,
          fields,
        };
      });

      const descriptor = {
        $schema:
          "https://github.com/LedgerHQ/clear-signing-erc7730-registry/blob/master/specs/erc7730-v1.schema.json",
        context: {
          contract: {
            abi,
          },
        },
        metadata: {
          owner: "Generated",
          info: {
            url: "",
            legalName: "Auto-generated descriptor",
            lastUpdate: new Date().toISOString().split("T")[0],
          },
        },
        display: {
          formats: {
            token: { type: "address" },
            address: { type: "address" },
            amount: { type: "amount", denomination: "wei" },
            date: { type: "date", encoding: "timestamp" },
            raw: { type: "raw" },
          },
        },
        messages,
      };

      const json = JSON.stringify(descriptor, null, 2);
      setGeneratedJson(json);
    } catch (err: any) {
      setError(`Failed to generate: ${err.message}`);
    }
  };

  const downloadJson = () => {
    const blob = new Blob([generatedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `descriptor-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedJson);
  };

  const loadExampleAbi = async () => {
    try {
      const response = await fetch("/descriptors/DemoRouter.json");
      const data = await response.json();
      const abi = data.context.contract.abi;
      setAbiInput(JSON.stringify(abi, null, 2));
      setError("");
    } catch (err: any) {
      setError(`Failed to load example: ${err.message}`);
    }
  };

  return (
    <main
      className="min-h-screen"
      style={{ background: "#000000", position: "relative" }}
    >
      <MatrixBackground />
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div
            className="terminal-dim"
            style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}
          >
            <a href="/" style={{ textDecoration: "none", color: "#00ff41" }}>
              &lt; RETURN_TO_MAINFRAME
            </a>
          </div>
          <h1
            className="terminal-text terminal-glow"
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              letterSpacing: "0.1em",
            }}
          >
            &gt; CREATE ERC-7730 DESCRIPTOR
          </h1>
          <p className="terminal-cyan" style={{ fontSize: "1.25rem" }}>
            GENERATE HUMAN-READABLE TRANSACTION DESCRIPTORS
          </p>
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* ABI Input */}
          <div
            className="terminal-box"
            style={{
              padding: "2rem",
              border: "2px solid #00ff41",
              marginBottom: "2rem",
            }}
          >
            <h2
              className="terminal-text"
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              &gt; PASTE_CONTRACT_ABI
            </h2>

            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}
              >
                <button
                  onClick={loadExampleAbi}
                  className="terminal-button"
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.8rem",
                    borderColor: "#ff00ff",
                    color: "#ff00ff",
                  }}
                >
                  [LOAD_EXAMPLE_ABI]
                </button>
                <span
                  className="terminal-dim"
                  style={{ fontSize: "0.75rem", lineHeight: "2" }}
                >
                  ← Or paste your contract ABI below
                </span>
              </div>
              <textarea
                value={abiInput}
                onChange={(e) => setAbiInput(e.target.value)}
                placeholder='[{"type":"function","name":"transfer","inputs":[...]}, ...]'
                className="terminal-input"
                style={{
                  width: "100%",
                  height: "300px",
                  fontSize: "0.8rem",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              onClick={generateDescriptor}
              className="terminal-button"
              style={{
                width: "100%",
                padding: "1rem",
                fontSize: "1.1rem",
                fontWeight: "bold",
                borderColor: "#00ff41",
                color: "#00ff41",
              }}
            >
              [GENERATE_ERC7730_JSON]
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div
              className="terminal-box"
              style={{
                padding: "1.5rem",
                border: "2px solid #ff0040",
                marginBottom: "2rem",
              }}
            >
              <p className="terminal-red" style={{ fontWeight: 600 }}>
                &gt;&gt; ERROR: {error}
              </p>
            </div>
          )}

          {/* Generated JSON */}
          {generatedJson && (
            <div
              className="terminal-box"
              style={{ padding: "2rem", border: "2px solid #00ff41" }}
            >
              <h2
                className="terminal-text terminal-glow"
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                &gt; GENERATED_DESCRIPTOR
              </h2>

              <div
                className="terminal-cyan"
                style={{ fontSize: "0.85rem", marginBottom: "1rem" }}
              >
                ✓ AUTO-DETECTED FORMATS
                <br />
                ✓ ALL FUNCTIONS INCLUDED
                <br />✓ READY FOR LEDGER
              </div>

              <div
                style={{
                  marginBottom: "1rem",
                  maxHeight: "500px",
                  overflowY: "auto",
                }}
              >
                <pre
                  className="terminal-text"
                  style={{
                    fontSize: "0.75rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    padding: "1.5rem",
                    border: "1px solid #004d1a",
                    background: "rgba(0, 255, 65, 0.05)",
                  }}
                >
                  {generatedJson}
                </pre>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={downloadJson}
                  className="terminal-button"
                  style={{
                    flex: 1,
                    padding: "1rem",
                    fontSize: "1rem",
                    borderColor: "#ff00ff",
                    color: "#ff00ff",
                  }}
                >
                  [DOWNLOAD_JSON]
                </button>
                <button
                  onClick={copyToClipboard}
                  className="terminal-button"
                  style={{
                    flex: 1,
                    padding: "1rem",
                    fontSize: "1rem",
                    borderColor: "#ffb000",
                    color: "#ffb000",
                  }}
                >
                  [COPY_TO_CLIPBOARD]
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div
          className="terminal-box"
          style={{
            marginTop: "3rem",
            padding: "2rem",
            border: "1px solid #004d1a",
          }}
        >
          <h3
            className="terminal-text"
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            &gt; HOW_IT_WORKS
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2rem",
            }}
          >
            <div>
              <div
                className="terminal-cyan"
                style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
              >
                1
              </div>
              <h4
                className="terminal-text"
                style={{
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  marginBottom: "0.5rem",
                }}
              >
                PASTE ABI
              </h4>
              <p className="terminal-dim" style={{ fontSize: "0.8rem" }}>
                Copy your contract&apos;s ABI JSON from build artifacts or
                blockchain explorer
              </p>
            </div>
            <div>
              <div
                className="terminal-amber"
                style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
              >
                2
              </div>
              <h4
                className="terminal-text"
                style={{
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  marginBottom: "0.5rem",
                }}
              >
                AUTO-GENERATE
              </h4>
              <p className="terminal-dim" style={{ fontSize: "0.8rem" }}>
                Click generate and we&apos;ll create ERC-7730 descriptor with
                smart format detection
              </p>
            </div>
            <div>
              <div
                className="terminal-text"
                style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
              >
                3
              </div>
              <h4
                className="terminal-text"
                style={{
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  marginBottom: "0.5rem",
                }}
              >
                USE WITH LEDGER
              </h4>
              <p className="terminal-dim" style={{ fontSize: "0.8rem" }}>
                Download JSON and use with hardware wallets for human-readable
                signing
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
