import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/Footer"; // ✅ Import extracted footer
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CE Frames",
  description: "Photographie d'événements et galeries numériques pour les évènements du Comité d’Entreprise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`h-full antialiased ${inter.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col">
        {/* Changed min-h-full to min-h-screen for reliable viewport height */}
        <Providers>
          <Navbar />
          
          {/* ✅ flex-1 forces main to expand and push footer to bottom */}
          <main className="flex-1 pt-20">
            {children}
          </main>
          
          {/* ✅ Footer sits outside main, naturally pushed to bottom */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}