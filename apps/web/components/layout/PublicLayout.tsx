"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import ReadingProgressBar from "@/components/layout/ReadingProgressBar";
import BackToTop from "@/components/layout/BackToTop";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isArticlePage = pathname.startsWith("/articles/");
  const isHomepage = pathname === "/";

  return (
    <>
      {isArticlePage && <ReadingProgressBar />}
      <Header />
      <Navbar />
      {!isHomepage && !isArticlePage && <Breadcrumbs />}
      {children}
      <Footer />
      <BackToTop />
    </>
  );
}
