import Link from "next/link";

const categories = [
  { label: "Top Stories", href: "/" },
  { label: "Sports", href: "/sports" },
  { label: "Business", href: "/business" },
  { label: "Innovation", href: "/innovation" },
  { label: "Youth", href: "/youth" },
  { label: "Culture", href: "/culture" },
  { label: "Travel", href: "/travel" },
  { label: "Lifestyle", href: "/lifestyle" },
  { label: "Interviews", href: "/interviews" },
  { label: "Opinion & Analysis", href: "/opinion" },
];

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


    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-red">
        {label}
      </h3>
      {children}
    </div>
  );
}
