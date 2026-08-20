import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us – Dnews Africa",
  description:
    "Get in touch with Dnews Africa. Reach out via email or follow us on social media.",
};

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
