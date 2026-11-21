import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const clarityCity = localFont({
  src: [
    { path: "../public/font/ClarityCity-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/font/ClarityCity-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/font/ClarityCity-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-clarity-city",
});

export const metadata: Metadata = {
  title: "Teleradiologi AI",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={clarityCity.variable}>
      <body className="bg-neutral-100 font-sans text-b3 text-neutral-1000 antialiased">
        {children}
      </body>
    </html>
  );
}
