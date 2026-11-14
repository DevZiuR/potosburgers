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
  title: "Poto's Burgers | El Tigre, Anzoátegui",
  description:
    "Las mejores hamburguesas artesanales de El Tigre. Perros calientes, pizzas, papas locas, parrillas, almuerzos y más. CC Z&T, 4ta Carrera Sur.",
  icons: {
    icon: "/media/logo.jpg",
    apple: "/media/logo.jpg",
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
