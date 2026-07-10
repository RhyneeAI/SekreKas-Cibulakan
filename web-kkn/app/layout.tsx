import "./globals.css";

export const metadata = {
  title: "SekreKas Cibulakan",
  description: "Sistem absensi KKN Desa Cibulakan",
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
