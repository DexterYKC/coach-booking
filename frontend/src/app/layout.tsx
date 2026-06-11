import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"]
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "Coaching Basketball Tunisie",
  description:
    "Réservez vos séances de coaching basketball, fitness et préparation physique en Tunisie."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${outfit.variable}`}>
      <body data-testid="app-root" className="min-h-screen bg-surface-alt text-ink antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { borderRadius: "12px", background: "#0F172A", color: "white" }
          }}
        />
        {children}
      </body>
    </html>
  );
}
