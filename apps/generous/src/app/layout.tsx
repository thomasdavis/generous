import type { Metadata } from "next";
import type { ReactNode } from "react";

// Import design system styles
import "@generous/ui/tokens";
import "@generous/ui/styles";

export const metadata: Metadata = {
  title: "Generous",
  description: "Generous - Open Source Framework",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
