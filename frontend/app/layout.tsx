import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "VoteOnChain — On-chain governance",
  description: "Create proposals, vote with GOV tokens, and execute on-chain actions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans min-h-screen antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
