export const SITE_CONFIG = {
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  social: {
    youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || "",
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "",
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "",
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || "",
  },
} as const;

export function socialLinks() {
  return [
    { name: "YouTube", href: SITE_CONFIG.social.youtube },
    { name: "Instagram", href: SITE_CONFIG.social.instagram },
    { name: "X (Twitter)", href: SITE_CONFIG.social.twitter },
    { name: "Facebook", href: SITE_CONFIG.social.facebook },
  ].filter((link) => link.href.length > 0);
}
