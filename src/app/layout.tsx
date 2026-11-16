import type { Metadata } from "next";
import { Alumni_Sans, Inter } from "next/font/google";
import "./globals.css";


// Alumni Sans — used for headings (h1, h2)
const alumniSans = Alumni_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-alumni-sans",
});

// Inter — used for body / paragraph text
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Poto's Burgers | Las Mejores Hamburguesas Artesanales en El Tigre",
  description:
    "Las mejores hamburguesas artesanales en El Tigre, Anzoátegui. Smash burgers, perros calientes, pizzas, papas locas, parrillas y postres. ¡Pide online o visítanos en CC Z&T!",
  keywords: [
    "Hamburguesas El Tigre",
    "Poto's Burgers",
    "Hamburguesas artesanales El Tigre",
    "Smash burgers El Tigre",
    "Comida rápida El Tigre",
    "Parrillas El Tigre",
    "Perros calientes El Tigre",
    "Delivery El Tigre Anzoátegui",
  ],
  openGraph: {
    title: "Poto's Burgers | Las Mejores Hamburguesas Artesanales en El Tigre",
    description:
      "¡El sabor que manda en El Tigre! Hamburguesas artesanales, perros calientes, pizzas, papas locas y parrillas. Pide online con entrega rápida.",
    siteName: "Poto's Burgers",
    locale: "es_VE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Poto's Burgers | Las Mejores Hamburguesas Artesanales en El Tigre",
    description:
      "¡El sabor que manda en El Tigre! Hamburguesas artesanales, perros calientes, pizzas, papas locas y parrillas.",
  },
  icons: {
    icon: [
      { url: "/potos-logo.png", type: "image/png" },
    ],
    shortcut: "/potos-logo.png",
    apple: "/potos-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${alumniSans.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" type="image/png" href="/potos-logo.png" />
        <link rel="shortcut icon" href="/potos-logo.png" />
        <link rel="apple-touch-icon" href="/potos-logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Alumni+Sans:ital,wght@0,100..900;1,100..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-[#FAFAF8] text-[#111111] min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
