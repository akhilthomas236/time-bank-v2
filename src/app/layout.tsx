import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TimeBank - Automation Savings Tracker",
  description: "Track automation savings, earn credits, and redeem rewards through gamified productivity tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
