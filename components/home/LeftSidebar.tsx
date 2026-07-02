import Link from "next/link";

const categories = [
  { label: "Top Stories", href: "/" },
  { label: "Sports", href: "/sports" },
  { label: "Business", href: "/business" },
  { label: "Innovation", href: "/news" },
  { label: "Youth", href: "/culture" },
  { label: "Culture", href: "/culture" },
  { label: "Lifestyle", href: "/culture" },
  { label: "Interviews", href: "/featured" },
];

const browseItems = ["Today", "This Week", "Archive"];

export default function LeftSidebar() {
  return (
    <div>
      <Section label="Categories">
        <ul>
          {categories.map((cat) => (
            <li key={cat.label}>
              <Link
                href={cat.href}
                className="block border-b border-dnews-border py-2 text-sm font-medium text-dnews-gray transition-colors hover:text-dnews-accent"
              >
                {cat.label}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section label="Browse">
        <ul>
          {browseItems.map((item) => (
            <li key={item}>
              <a
                href="#"
                className="block border-b border-dnews-border py-2 text-sm font-medium text-dnews-gray transition-colors hover:text-dnews-accent"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-dnews-muted">
        {label}
      </h3>
      {children}
    </div>
  );
}
