import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SekreKas Cibulakan",
  description: "Sistem absensi KKN Desa Cibulakan",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="m-0 font-sans antialiased bg-cream text-text">
        {children}
      </body>
    </html>
  );
}
