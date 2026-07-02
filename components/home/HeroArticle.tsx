export default function HeroArticle() {
  return (
    <article className="mb-8 border-b border-dnews-border pb-6">
      <div className="mb-4 aspect-[16/9] w-full bg-dnews-light-gray flex items-center justify-center text-dnews-muted text-sm">
        Hero Image Placeholder
      </div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-dnews-red">
        Featured · News
      </div>
      <h2 className="font-heading text-2xl font-bold leading-tight text-dnews-dark md:text-3xl">
        AU Summit reaches landmark agreement on cross-border digital infrastructure
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-dnews-gray">
        African Union heads of state have endorsed a historic framework to harmonize digital
        policies across member nations, aiming to connect the continent&apos;s unconnected and
        boost intra-African trade through seamless data flows.
      </p>
      <div className="mt-3 flex items-center gap-3 text-xs text-dnews-muted">
        <span className="font-medium text-dnews-dark">By Kwame Asante</span>
        <span>June 29, 2026</span>
        <span>·</span>
        <span>6 min read</span>
      </div>
    </article>
  );
}
