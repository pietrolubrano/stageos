import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StageOS MVP",
  description: "Prototipo operativo per produzioni live, cast, crew e inviti condivisibili."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
