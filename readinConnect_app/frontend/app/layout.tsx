import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SoundProvider } from "@/lib/providers/SoundProvider";
import { AuthProvider } from "@/lib/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReadinConnect - Building Strong Readers, One Word at a Time",
  description: "A structured literacy learning platform for children ages 4-8, featuring phonics, sight words, fluency, comprehension, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <SoundProvider>
            {children}
          </SoundProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
