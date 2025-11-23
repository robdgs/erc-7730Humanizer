import CalldataDecoder from "@/components/CalldataDecoder";
import MatrixBackground from "@/components/MatrixBackground";
import Link from "next/link";

export default function Home() {
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
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div
            className="terminal-dim ascii-spinner"
            style={{
              fontSize: "0.75rem",
              marginBottom: "1rem",
              letterSpacing: "0.2em",
            }}
          >
            INITIALIZING SYSTEM...
          </div>
          <h1
            className="terminal-text terminal-glow"
            style={{
              fontSize: "3.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              letterSpacing: "0.15em",
            }}
          >
            &gt;&gt;HOOMANIFI 
          </h1>
          <h2
            className="terminal-cyan"
            style={{
              fontSize: "2rem",
              marginBottom: "0.5rem",
              letterSpacing: "0.1em",
            }}
          >
            ERC-7730
          </h2>
          <p
            className="terminal-amber"
            style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
          >
            SECURE SOVEREIGN TRANSACTION SIGNING
          </p>
          <p
            className="terminal-dim"
            style={{ fontSize: "0.8rem", marginBottom: "3rem" }}
          >
            LEDGER + MULTIBAAS + HARDHAT 3
          </p>

          {/* Three Path Choice */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.5rem",
              maxWidth: "1400px",
              margin: "0 auto",
            }}
          >
            {/* Path 1: Decoder */}
            <div
              className="terminal-box"
              style={{
                padding: "2rem",
                border: "2px solid #00ff41",
                textAlign: "left",
              }}
            >
              <div
                className="terminal-text terminal-glow"
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                &gt; QUICK_DECODE
              </div>
              <p
                className="terminal-dim"
                style={{
                  fontSize: "0.9rem",
                  marginBottom: "1.5rem",
                  lineHeight: "1.6",
                }}
              >
                Paste raw transaction calldata and instantly see human-readable
                preview with ERC-7730 formatting
              </p>
              <div
                className="terminal-amber"
                style={{
                  fontSize: "0.75rem",
                  marginBottom: "1rem",
                  letterSpacing: "0.05em",
                }}
              >
                ▸ PASTE CALLDATA
                <br />
                ▸ VIEW DECODED FIELDS
                <br />▸ EXPORT FORMATTED OUTPUT
              </div>
            </div>

            {/* Path 2: Dashboard */}
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <div
                className="terminal-box"
                style={{
                  padding: "2rem",
                  border: "2px solid #ff00ff",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                <div
                  className="terminal-cyan terminal-glow"
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                  }}
                >
                  &gt; ASSET_DASHBOARD
                </div>
                <p
                  className="terminal-dim"
                  style={{
                    fontSize: "0.9rem",
                    marginBottom: "1.5rem",
                    lineHeight: "1.6",
                  }}
                >
                  Connect wallet to view portfolio, governance votes, and
                  vesting schedules with integrated signing
                </p>
                <div
                  className="terminal-amber"
                  style={{
                    fontSize: "0.75rem",
                    marginBottom: "1rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  ▸ CONNECT METAMASK
                  <br />
                  ▸ VIEW TOKEN BALANCES
                  <br />
                  ▸ VOTE ON PROPOSALS
                  <br />▸ CLAIM VESTED TOKENS
                </div>
              </div>
            </Link>

            {/* Path 3: Create Descriptor */}
            <Link href="/create" style={{ textDecoration: "none" }}>
              <div
                className="terminal-box"
                style={{
                  padding: "2rem",
                  border: "2px solid #00ff41",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                <div
                  className="terminal-amber terminal-glow"
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                  }}
                >
                  &gt; CREATE_DESCRIPTOR
                </div>
                <p
                  className="terminal-dim"
                  style={{
                    fontSize: "0.9rem",
                    marginBottom: "1.5rem",
                    lineHeight: "1.6",
                  }}
                >
                  Generate ERC-7730 JSON descriptors for your smart contracts
                  with custom formatting rules
                </p>
                <div
                  className="terminal-amber"
                  style={{
                    fontSize: "0.75rem",
                    marginBottom: "1rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  ▸ PASTE CONTRACT ABI
                  <br />
                  ▸ CONFIGURE FIELDS
                  <br />
                  ▸ DOWNLOAD DESCRIPTOR
                  <br />▸ USE WITH LEDGER
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Decoder Section */}

        <CalldataDecoder />

        {/* Tech Stack Footer */}
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
              fontWeight: 600,
              marginBottom: "1.5rem",
              letterSpacing: "0.1em",
            }}
          >
            &gt; ARCHITECTURE
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <div>
              <h4
                className="terminal-cyan"
                style={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  marginBottom: "0.5rem",
                  letterSpacing: "0.05em",
                }}
              >
                [1] ERC-7730 STANDARD
              </h4>
              <p
                className="terminal-dim"
                style={{ fontSize: "0.8rem", lineHeight: "1.6" }}
              >
                Transform raw calldata into human-readable previews with
                standardized descriptors
              </p>
            </div>
            <div>
              <h4
                className="terminal-cyan"
                style={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  marginBottom: "0.5rem",
                  letterSpacing: "0.05em",
                }}
              >
                [2] LEDGER INTEGRATION
              </h4>
              <p
                className="terminal-dim"
                style={{ fontSize: "0.8rem", lineHeight: "1.6" }}
              >
                Hardware wallet signing via WebUSB with visual simulator for
                testing
              </p>
            </div>
            <div>
              <h4
                className="terminal-cyan"
                style={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  marginBottom: "0.5rem",
                  letterSpacing: "0.05em",
                }}
              >
                [3] MULTIBAAS DASHBOARD
              </h4>
              <p
                className="terminal-dim"
                style={{ fontSize: "0.8rem", lineHeight: "1.6" }}
              >
                Portfolio tracking, governance, and vesting with integrated
                signing flow
              </p>
            </div>
          </div>
        </div>

        <div
          className="terminal-box"
          style={{
            marginTop: "2rem",
            padding: "1rem",
            border: "1px solid #004d1a",
            textAlign: "center",
          }}
        >
          <div
            className="terminal-dim ascii-spinner"
            style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}
          >
            SYSTEM STATUS: OPERATIONAL
          </div>
        </div>
      </div>
    </main>
  );
}
