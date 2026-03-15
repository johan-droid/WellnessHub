import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], weight: ['400', '500', '600', '700'], variable: '--font-inter' });
const poppins = Poppins({ subsets: ["latin"], weight: ['600', '700', '800'], variable: '--font-poppins' });

export const metadata: Metadata = {
  title: "Wellness & Travel Adventure Hub | Live Fully. Travel Boldly.",
  description: "Live Fully. Travel Boldly. Your all-in-one companion for wellness, adventure, and cherished moments together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="bg-white font-sans text-deepNavy overflow-x-hidden">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
