import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "News Pulse",
  description: "Real-time news aggregation with intelligent topic clustering and interactive timeline visualization.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body style={{ fontFamily: 'var(--font-sans)' }} suppressHydrationWarning>{children}</body>
    </html>
  );
}
