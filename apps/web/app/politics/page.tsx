import type { Metadata } from "next";
import PoliticsPageClient from "./PoliticsPageClient";

export const metadata: Metadata = {
  title: "Politics – Dnews Africa",
  description:
    "Political news, policy analysis, and governance stories from across Africa and the diaspora.",
};

export default function PoliticsPage() {
  return (
    <PoliticsPageClient />
  );
}
