import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/Footer"; // ✅ Import extracted footer
import { Providers } from "@/components/providers";
import PageTransition from "@/components/PageTransition";

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
  description: "La galerie photo interne du Comité d’Entreprise d’Infomil Mauritius pour consulter et partager les souvenirs des événements passés.",
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
      <body className="min-h-screen flex flex-col bg-white text-[#172033] dark:bg-[#091522] dark:text-white">
        {/* Changed min-h-full to min-h-screen for reliable viewport height */}
        <Providers>
          <Navbar />
          
          {/* ✅ flex-1 forces main to expand and push footer to bottom */}
          <main className="flex-1 pt-20">
            <PageTransition>{children}</PageTransition>
          </main>
          
          {/* ✅ Footer sits outside main, naturally pushed to bottom */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}