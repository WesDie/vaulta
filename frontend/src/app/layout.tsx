import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/components/QueryProvider";
import { ThemeProvider } from "next-themes";
import { ThemeDataProvider } from "../components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vaulta - Media Gallery",
  description: "Self-hosted media management application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem={false}
        >
          <ThemeDataProvider>
            <QueryProvider>{children}</QueryProvider>
          </ThemeDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
