import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – Dnews Africa",
  description:
    "Dnews Africa privacy policy. Learn how we collect, use, and protect your personal information.",
};

const sections = [
  {
    title: "Information We Collect",
    content:
      "When you visit Dnews Africa, we may collect information you voluntarily provide, such as your name and email address when subscribing to our newsletter or contacting us. We also automatically collect certain technical information including your IP address, browser type, operating system, and browsing behavior on our site.",
  },
  {
    title: "Newsletter and Email Collection",
    content:
      "If you subscribe to our newsletter, we collect your email address to send you updates, news, and promotional content. You may unsubscribe at any time by clicking the unsubscribe link in any email we send. We do not share your email address with third parties for their own marketing purposes.",
  },
  {
    title: "Analytics",
    content:
      "We use analytics tools to understand how visitors interact with our website. This helps us improve our content and user experience. These tools may collect anonymized data about page views, session duration, and referral sources. We do not sell this data to third parties.",
  },
  {
    title: "Cookies",
    content:
      "Our website uses cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and remember your preferences. You can control cookie settings through your browser preferences. Disabling cookies may affect certain features of our site.",
  },
  {
    title: "Third-Party Embeds",
    content:
      "Dnews Africa may embed content from third-party services such as YouTube, X (Twitter), Instagram, and Facebook. These third parties may set their own cookies and collect data about your interaction with their content. We encourage you to review the privacy policies of these services.",
  },
  {
    title: "Contact Information",
    content:
      "If you have any questions about this privacy policy or how we handle your data, please contact us at:",
    email: "dnewsafrica23@gmail.com",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold text-dnews-accent md:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-dnews-gray">
          Last updated: July 2026
        </p>
      </div>

      <div className="max-w-3xl">
        <p className="mb-8 leading-relaxed text-dnews-gray">
          At Dnews Africa, we take your privacy seriously. This policy
          outlines how we collect, use, and protect your personal information
          when you visit our website.
        </p>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-heading text-xl font-semibold text-dnews-accent">
                {section.title}
              </h2>
              <p className="mt-2 leading-relaxed text-dnews-gray">
                {section.content}
              </p>
              {section.email && (
                <a
                  href={`mailto:${section.email}`}
                  className="mt-1 inline-block text-dnews-accent underline underline-offset-2 hover:text-dnews-accent-light"
                >
                  {section.email}
                </a>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
