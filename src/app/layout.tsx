import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ordgæt",
  description: "Gæt det skjulte ord på fem bogstaver. Du har otte forsøg.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // lang="da" tells browsers and screen readers this page is Danish,
  // which fixes hyphenation, spellcheck and pronunciation.
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  );
}
