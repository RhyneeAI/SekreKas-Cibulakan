import "./globals.css";

export const metadata = {
  title: "Absensi KKN",
  description: "Sistem absensi KKN tanpa login",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="m-0 font-sans antialiased">{children}</body>
    </html>
  );
}
