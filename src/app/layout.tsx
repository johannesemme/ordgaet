import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ordgæt",
  description: "Gæt det skjulte ord på fem bogstaver. Du har otte forsøg.",
  // Lets an iPhone add the game to the home screen as a full-screen app.
  appleWebApp: { capable: true, title: "Ordgæt", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  // Colours the browser chrome on Android and iOS to match the page.
  themeColor: "#121513",
  // The game is a fixed layout; pinch-zooming it only breaks the fit.
  // maximumScale is deliberately not set to 1, which would block zoom
  // entirely and fail accessibility guidelines.
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
