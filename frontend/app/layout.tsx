import type { Metadata } from "next";
import "./globals.css";
import StatusBar from "@/app/StatusBar";

export const metadata: Metadata = {
  title: "ERC-7730 SYSTEM // TRANSACTION DECODER",
  description: "CLASSIFIED :: Human-readable transaction signing protocol",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <StatusBar />
        {children}
      </body>
    </html>
  );
}
