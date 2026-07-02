const categories = [
  "Top Stories",
  "Sports",
  "Business",
  "Innovation",
  "Youth",
  "Culture",
  "Lifestyle",
  "Interviews",
];

const browseItems = ["Today", "This Week", "Archive"];

export default function LeftSidebar() {
  return (
    <div>
      <Section label="Categories">
        <ul>
          {categories.map((cat) => (
            <li key={cat}>
              <a
                href="#"
                className="block border-b border-dnews-border py-2 text-sm font-medium text-dnews-gray transition-colors hover:text-dnews-accent"
              >
                {cat}
              </a>
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
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-dnews-muted">
        {label}
      </h3>
      {children}
    </div>
  );
}
