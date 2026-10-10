import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nexo-pearl-pi.vercel.app"),
  title: {
    default: "NEXO — Seu caminho até o ENEM",
    template: "%s · NEXO",
  },
  description:
    "Plataforma gratuita e gamificada de preparação para o ENEM com estudo personalizado.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "NEXO",
    title: "NEXO — Seu caminho até o ENEM",
    description:
      "Estude para o ENEM de forma gratuita, personalizada e gamificada.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NEXO — Seu caminho até o ENEM",
    description:
      "Estude para o ENEM de forma gratuita, personalizada e gamificada.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${inter.variable} ${manrope.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
