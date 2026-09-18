import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import { TimeZoneSync } from "@/components/layout/time-zone-sync";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LisanFlow — Arabic that listens with you",
    template: "%s · LisanFlow",
  },
  description:
    "A focused daily Arabic mission: lecture phrases, spaced-repetition vocabulary, and targeted listening practice for formal Islamic Arabic.",
  applicationName: "LisanFlow",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "LisanFlow",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#10B981",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${notoArabic.variable}`}>
      <body className="antialiased">
        {children}
        <TimeZoneSync />
      </body>
    </html>
  );
}
