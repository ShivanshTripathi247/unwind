import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatingNavBar from "./components/FloatingNavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unwind-Mental Health Tracker",
  description:
    "A premium, private, and beautiful journal and emotion analysis app for your mental well-being. Track your thoughts, analyze your emotions, and visualize your mental health journey.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Unwind-Mental Health Tracker",
    description:
      "A premium, private, and beautiful journal and emotion analysis app for your mental well-being. Track your thoughts, analyze your emotions, and visualize your mental health journey.",
    url: "https://yourdomain.com/",
    siteName: "Mental Health Tracker",
    images: [
      {
        url: "/favicon.svg",
        width: 1200,
        height: 630,
        alt: "Mental Health Tracker Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unwind-Mental Health Tracker",
    description:
      "A premium, private, and beautiful journal and emotion analysis app for your mental well-being.",
    images: ["/favicon.svg"],
    creator: "@yourhandle",
  },
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
        {children}
        <FloatingNavBar />
      </body>
    </html>
  );
}
