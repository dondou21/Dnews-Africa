const navItems = [
  "Home",
  "News",
  "Business",
  "Sports",
  "Featured",
  "Culture",
  "Pictorial",
  "DnewsAfrica TV",
  "About",
];

export default function Navbar() {
  return (
    <nav className="border-b border-dnews-border bg-white">
      <div className="mx-auto max-w-[1180px] overflow-x-auto px-4">
        <ul className="flex min-w-max items-center divide-x divide-dnews-border text-sm">
          {navItems.map((item) => (
            <li key={item}>
              <a
                href="#"
                className="inline-block px-3 py-2.5 font-medium uppercase tracking-wide text-dnews-gray transition-colors hover:text-dnews-accent md:px-4"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
