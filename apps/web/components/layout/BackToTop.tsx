"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-xl bg-dnews-accent text-white shadow-lg transition-all duration-300 hover:bg-dnews-accent-light hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dnews-accent ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
      }`}
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}
