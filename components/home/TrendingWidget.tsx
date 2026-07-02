const trending = [
  { rank: 1, title: "Ethiopia launches first stock exchange in East Africa" },
  { rank: 2, title: "South Africa's renewable energy grid passes 10GW milestone" },
  { rank: 3, title: "Morocco to host 2030 World Cup final, FIFA confirms" },
  { rank: 4, title: "African tech entrepreneurs call for unified startup act" },
];

export default function TrendingWidget() {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-dnews-muted">
        Trending · Most Read
      </h3>
      <div className="space-y-3">
        {trending.map((item) => (
          <div key={item.rank} className="flex gap-3 border-b border-dnews-border pb-3">
            <span className="w-6 text-lg font-bold leading-none text-dnews-accent">
              {String(item.rank).padStart(2, "0")}
            </span>
            <a
              href="#"
              className="text-sm font-medium leading-snug text-dnews-dark transition-colors hover:text-dnews-accent"
            >
              {item.title}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
