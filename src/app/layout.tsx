import type { Metadata, Viewport } from "next";
import { Inter, Kaushan_Script, Oswald, Rubik } from "next/font/google";
import Script from "next/script";
import "lenis/dist/lenis.css";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["500", "600", "700"] });
const rubik = Rubik({ variable: "--font-rubik", subsets: ["latin"], weight: ["500", "600"] });
const kaushan = Kaushan_Script({ variable: "--font-kaushan", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Franchise – Oh My Greece",
  description:
    "Werde Teil der Oh My Greece Familie. Eröffne deinen eigenen Store mit fertigem Konzept, 100 % Halal-Qualität und griechischen Original-Rezepten.",
};

export const viewport: Viewport = {
  themeColor: "#00d4d5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      // the reveal-ready class is added by the early script below, before hydration
      suppressHydrationWarning
      className={`${inter.variable} ${oswald.variable} ${rubik.variable} ${kaushan.variable} antialiased`}
    >
      {/* extensions (Grammarly, password managers) inject attributes into <body> before hydration */}
      <body suppressHydrationWarning>
        {/* Hide reveal targets before first paint (only when JS runs and motion is allowed) */}
        <Script id="reveal-ready" strategy="beforeInteractive">
          {"if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('reveal-ready')"}
        </Script>
        {children}
      </body>
    </html>
  );
}
