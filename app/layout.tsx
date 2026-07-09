import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StayProof",
  description: "Document your rental condition and win your bond back.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <div className="flex flex-1 flex-col">{children}</div>
        <footer className="flex justify-center gap-4 border-t border-border p-4 text-xs text-muted">
          <a href="/legal/terms" className="hover:text-foreground">
            Terms
          </a>
          <a href="/legal/privacy" className="hover:text-foreground">
            Privacy
          </a>
        </footer>
      </body>
    </html>
  );
}
