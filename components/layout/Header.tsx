export default function Header() {
  return (
    <header className="border-b border-dnews-border bg-white">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-4">
        <div className="flex-1" />
        <div className="text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-dnews-dark md:text-5xl">
            Dnews Africa
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-dnews-muted">
            Independent news media across the continent and the world
          </p>
        </div>
        <div className="flex flex-1 justify-end">
          <button
            className="rounded border border-dnews-border px-3 py-1.5 text-sm text-dnews-gray hover:bg-dnews-light-gray"
            aria-label="Menu"
          >
            Menu
          </button>
        </div>
      </div>
    </header>
  );
}
