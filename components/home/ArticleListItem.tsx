interface ArticleListItemProps {
  category: string;
  title: string;
  date: string;
  readTime: string;
  categoryColor?: "red" | "blue";
}

export default function ArticleListItem({
  category,
  title,
  date,
  readTime,
  categoryColor = "blue",
}: ArticleListItemProps) {
  const colorClass =
    categoryColor === "red" ? "text-dnews-red" : "text-dnews-accent";

  return (
    <article className="flex gap-4 border-b border-dnews-border pb-4">
      <div className="h-20 w-24 shrink-0 bg-dnews-light-gray flex items-center justify-center text-[10px] text-dnews-muted">
        Thumb
      </div>
      <div className="min-w-0 flex-1">
        <div className={`mb-1 text-[11px] font-semibold uppercase tracking-wider ${colorClass}`}>
          {category}
        </div>
        <h3 className="font-heading text-base font-bold leading-snug text-dnews-dark">
          {title}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-dnews-muted">
          <span>{date}</span>
          <span>·</span>
          <span>{readTime}</span>
        </div>
      </div>
    </article>
  );
}
