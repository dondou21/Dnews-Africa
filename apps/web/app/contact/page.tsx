"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { FaYoutube, FaInstagram, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import { post } from "@dnews/api-client";
import { SITE_CONFIG, socialLinks } from "@/lib/siteConfig";

const iconMap: Record<string, typeof FaYoutube> = {
  YouTube: FaYoutube,
  Instagram: FaInstagram,
  Facebook: FaFacebookF,
  "X (Twitter)": FaXTwitter,
};

const contactEmail = SITE_CONFIG.contactEmail || "contact@dnewsafrica.com";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await post("/contact", {
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        subject: String(formData.get("subject") ?? "").trim(),
        message: String(formData.get("message") ?? "").trim(),
      });
      form.reset();
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Message could not be sent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold text-dnews-accent md:text-4xl">
          Contact Us
        </h1>
        <p className="mt-2 text-sm text-dnews-gray">
          We&apos;d love to hear from you
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-heading text-xl font-semibold text-dnews-accent">
            Get in Touch
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-dnews-gray">
            Have a story tip, feedback, or inquiry? Reach out to us via email:
          </p>
          <a
            href={`mailto:${contactEmail}`}
            className="mt-3 inline-block text-dnews-accent underline underline-offset-2 hover:text-dnews-accent-light"
          >
            {contactEmail}
          </a>

          {socialLinks().length > 0 && (
            <div className="mt-6">
              <h3 className="font-heading text-lg font-semibold text-dnews-accent">
                Follow Us
              </h3>
              <div className="mt-3 flex flex-wrap gap-3">
                {socialLinks().map((link) => {
                  const Icon = iconMap[link.name] ?? FaYoutube;
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
          )}
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-dnews-accent">
            Send Us a Message
          </h2>
          {success ? (
            <div
              role="status"
              className="mt-4 rounded-sm border border-green-500/30 bg-green-50 p-5 dark:bg-green-900/15"
            >
              <div className="flex items-start gap-3">
                <CheckCircle
                  size={22}
                  className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                    Message sent successfully
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-green-700 dark:text-green-400">
                    Thank you for reaching out. The Dnews Africa team will get back to you soon.
                  </p>
                </div>
              </div>
            </div>
          ) : (
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
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
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded bg-dnews-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-dnews-accent-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
          )}
          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-dnews-red" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-dnews-red">{error}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
