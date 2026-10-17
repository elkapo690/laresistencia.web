import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegistrarSW from "@/components/RegistrarSW";

export const metadata: Metadata = {
  title: "La Resistencia",
  description: "La agenda de planes de la resistencia.",
  applicationName: "La Resistencia",
  appleWebApp: { capable: true, title: "La Resistencia", statusBarStyle: "default" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <RegistrarSW />
      </body>
    </html>
  );
}
