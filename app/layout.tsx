import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "JLPT CardLab",
  description: "JLPT vocabulary learning with spaced repetition, quizzes, imports, and progress analytics.",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#14b8a6"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
        <script src="/sw-register.js" defer />
      </body>
    </html>
  );
}
