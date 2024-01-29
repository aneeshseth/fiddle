"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from "recoil";
import { Toaster } from "@/components/ui/toaster";

import useBeforeUnload from "./hook";
import { WebSocketProvider } from "./websocket/provider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RecoilRoot>
          <WebSocketProvider>{children}</WebSocketProvider>
          <Toaster />
        </RecoilRoot>
      </body>
    </html>
  );
}
