import type { Metadata } from "next";
import { FaYoutube, FaInstagram, FaFacebookF, FaXTwitter } from "react-icons/fa6";

export const metadata: Metadata = {
  title: "Contact Us – Dnews Africa",
  description:
    "Get in touch with Dnews Africa. Reach out via email or follow us on social media.",
};

const socialLinks = [
  { name: "YouTube", href: "#", icon: FaYoutube },
  { name: "Instagram", href: "#", icon: FaInstagram },
  { name: "Facebook", href: "#", icon: FaFacebookF },
  { name: "X (Twitter)", href: "#", icon: FaXTwitter },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold text-brand-red md:text-4xl">
          Contact Us
        </h1>
        <p className="mt-2 text-sm text-dnews-gray">
          We&apos;d love to hear from you
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-heading text-xl font-semibold text-brand-red">
            Get in Touch
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-dnews-gray">
            Have a story tip, feedback, or inquiry? Reach out to us via email:
          </p>
          <a
            href="mailto:dnewsafrica23@gmail.com"
            className="mt-3 inline-block text-dnews-accent underline underline-offset-2 hover:text-dnews-accent-light"
          >
            dnewsafrica23@gmail.com
          </a>

          <div className="mt-6">
            <h3 className="font-heading text-lg font-semibold text-brand-red">
              Follow Us
            </h3>
            <div className="mt-3 flex flex-wrap gap-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    className="inline-flex h-9 w-9 items-center justify-center rounded border border-dnews-border bg-dnews-card text-dnews-gray transition-colors hover:border-dnews-red hover:text-dnews-red"
                    aria-label={link.name}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-brand-red">
            Send Us a Message
          </h2>
          <form className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-dnews-dark"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 w-full rounded border border-dnews-border bg-dnews-card px-3 py-2 text-sm text-dnews-dark outline-none placeholder-dnews-muted focus:border-dnews-accent"
                placeholder="Your name"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-dnews-dark"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 w-full rounded border border-dnews-border bg-dnews-card px-3 py-2 text-sm text-dnews-dark outline-none placeholder-dnews-muted focus:border-dnews-accent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-dnews-dark"
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                className="mt-1 w-full rounded border border-dnews-border bg-dnews-card px-3 py-2 text-sm text-dnews-dark outline-none placeholder-dnews-muted focus:border-dnews-accent"
                placeholder="Subject"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-dnews-dark"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="mt-1 w-full resize-y rounded border border-dnews-border bg-dnews-card px-3 py-2 text-sm text-dnews-dark outline-none placeholder-dnews-muted focus:border-dnews-accent"
                placeholder="Your message"
              />
            </div>
            <button
              type="submit"
              className="rounded bg-dnews-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-dnews-accent-light"
            >
              Send Message
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
