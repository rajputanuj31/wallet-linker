import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "./store/provider";
import { cookieToInitialState } from "@account-kit/core";
import { Providers } from "./providers";
import { config } from "./lib/config";
import { headers } from "next/headers";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wallet-Linker",
  description: "Connect and manage your crypto wallets across multiple blockchains",
};

const getInitialState = async () => {
  return cookieToInitialState(
    config,
    (await headers()).get("cookie") ?? undefined
  );
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = await getInitialState();
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         <Providers initialState={initialState}>
          <ReduxProvider>
            <Navbar />
            {children}
          </ReduxProvider>
        </Providers>
      </body>
    </html>
  );
}
