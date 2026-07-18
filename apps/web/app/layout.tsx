import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import ThemeProvider from "@/components/theme/ThemeProvider";
import PublicLayout from "@/components/layout/PublicLayout";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dnews Africa",
  description:
    "Independent news media across the continent and the world",
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>
          <PublicLayout>{children}</PublicLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
