import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/theme-provider";
import KBar from "./mail/components/kbar";
// import { Toaster } from "~/components/ui/toaster";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Normal Human",
  description: "An AI based email management service",
  icons: [{ rel: "icon", url: "/logo.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html
        suppressHydrationWarning
        lang="en"
        className={`${GeistSans.variable}`}
      >
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TRPCReactProvider>
              <KBar>{children}</KBar>
            </TRPCReactProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
