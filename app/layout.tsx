import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppChrome from "@/components/chrome/AppChrome";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "SehatLens — Your blood report, decoded",
  description:
    "Drop your blood report. SehatLens parses, explains, and turns it into action — trajectories, plain-language deep-dives, specialist finder, and a printable doctor brief.",
};

const themeScript = `
try {
  var t = localStorage.getItem("vg-theme") || "day";
  document.documentElement.classList.remove("day", "night");
  document.documentElement.classList.add(t);
} catch (e) {
  document.documentElement.classList.add("day");
}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="day" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
