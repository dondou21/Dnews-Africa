import type { ContentBlock } from "@/types/contentBlocks";

interface BlockRendererProps {
  block: ContentBlock;
  isPreview?: boolean;
}

export default function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case "paragraph":
      return <p className="mb-4 text-base leading-relaxed text-dnews-dark">{String(block.data.text ?? "")}</p>;

    case "heading": {
      const Tag = (block.data.level as "h2" | "h3" | "h4") ?? "h2";
      const sizes: Record<string, string> = {
        h2: "text-2xl font-bold mb-4",
        h3: "text-xl font-bold mb-3",
        h4: "text-lg font-semibold mb-2",
      };
      return <Tag className={`${sizes[Tag]} text-dnews-dark`}>{String(block.data.text ?? "")}</Tag>;
    }

    case "quote":
      return (
        <blockquote className="mb-4 border-l-4 border-dnews-accent bg-dnews-bg py-3 pl-4 pr-4 italic text-dnews-dark">
          <p className="text-base">{String(block.data.text ?? "")}</p>
          {block.data.attribution && (
            <cite className="mt-1 block text-xs text-dnews-muted">&mdash; {String(block.data.attribution)}</cite>
          )}
        </blockquote>
      );

    case "pullQuote":
      return (
        <aside className="my-6 border-y border-dnews-border py-4 text-center">
          <p className="font-heading text-xl font-bold italic leading-snug text-dnews-dark">
            &ldquo;{String(block.data.text ?? "")}&rdquo;
          </p>
          {block.data.attribution && (
            <cite className="mt-2 block text-xs text-dnews-muted">&mdash; {String(block.data.attribution)}</cite>
          )}
        </aside>
      );

    case "image": {
      const al = (block.data.alignment as string) ?? "full";
      const sz = (block.data.size as string) ?? "large";
      const alignClass = al === "left" ? "float-left mr-4" : al === "right" ? "float-right ml-4" : "mx-auto";
      const sizeClass = sz === "small" ? "w-1/3" : sz === "medium" ? "w-1/2" : sz === "fullWidth" ? "w-full" : "w-full max-w-3xl";
      return (
        <figure className={`my-6 ${alignClass} ${sizeClass}`}>
          <img src={String(block.data.url ?? "")} alt={String(block.data.alt ?? "")} className="w-full rounded-sm" />
          {(block.data.caption || block.data.credit) && (
            <figcaption className="mt-1 text-center text-xs text-dnews-muted">
              {String(block.data.caption ?? "")}
              {block.data.credit && <span className="ml-1">({String(block.data.credit)})</span>}
            </figcaption>
          )}
        </figure>
      );
    }

    case "imageGallery": {
      const items = (block.data.items as Array<{ url: string; caption?: string; credit?: string; alt?: string }>) ?? [];
      return (
        <div className="my-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.map((item, i) => (
              <figure key={i} className="overflow-hidden rounded-sm">
                <img src={item.url} alt={item.alt ?? ""} className="h-40 w-full object-cover" />
                {item.caption && (
                  <figcaption className="mt-1 text-center text-xs text-dnews-muted">{item.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
          {block.data.caption && (
            <p className="mt-2 text-center text-xs text-dnews-muted">{String(block.data.caption)}</p>
          )}
        </div>
      );
    }

    case "video":
      return (
        <div className="my-6">
          <div className="aspect-video overflow-hidden rounded-sm bg-dnews-bg">
            {String(block.data.url ?? "").includes("youtube") || String(block.data.url ?? "").includes("youtu.be") ? (
              <iframe
                src={String(block.data.url ?? "").replace("watch?v=", "embed/")}
                className="h-full w-full"
                allowFullScreen
              />
            ) : (
              <video controls className="h-full w-full" poster={String(block.data.posterUrl ?? "")}>
                <source src={String(block.data.url ?? "")} />
              </video>
            )}
          </div>
          {block.data.caption && (
            <p className="mt-1 text-center text-xs text-dnews-muted">{String(block.data.caption)}</p>
          )}
        </div>
      );

    case "divider":
      return <hr className="my-6 border-dnews-border" />;

    case "bulletList": {
      const items = (block.data.items as string[]) ?? [];
      return (
        <ul className="mb-4 list-inside list-disc space-y-1 text-base text-dnews-dark">
          {items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
    }

    case "numberedList": {
      const items = (block.data.items as string[]) ?? [];
      return (
        <ol className="mb-4 list-inside list-decimal space-y-1 text-base text-dnews-dark">
          {items.map((item, i) => <li key={i}>{item}</li>)}
        </ol>
      );
    }

    case "table": {
      const rows = (block.data.rows as string[][]) ?? [];
      const header = (block.data.header as string[]) ?? [];
      return (
        <div className="my-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            {header.length > 0 && (
              <thead>
                <tr className="bg-dnews-bg">
                  {header.map((h, i) => (
                    <th key={i} className="border border-dnews-border px-3 py-2 text-left font-semibold text-dnews-dark">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-dnews-card" : "bg-dnews-bg"}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-dnews-border px-3 py-2 text-dnews-dark">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.data.caption && (
            <p className="mt-1 text-center text-xs text-dnews-muted">{String(block.data.caption)}</p>
          )}
        </div>
      );
    }

    case "embed":
      return (
        <div className="my-6">
          <div className="overflow-hidden rounded-sm bg-dnews-bg">
            <iframe
              src={String(block.data.url ?? "")}
              className="h-[400px] w-full"
              allowFullScreen
            />
          </div>
          {block.data.caption && (
            <p className="mt-1 text-center text-xs text-dnews-muted">{String(block.data.caption)}</p>
          )}
        </div>
      );

    case "relatedArticle": {
      return (
        <div className="my-6 rounded-sm border border-dnews-border bg-dnews-bg p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-dnews-muted">Related Article</p>
          <a
            href={String(block.data.url ?? "#")}
            className="font-heading text-lg font-bold text-dnews-accent hover:underline"
          >
            {String(block.data.title ?? "Read more")}
          </a>
        </div>
      );
    }

    case "callout": {
      const variant = (block.data.variant as string) ?? "info";
      const variantStyles: Record<string, string> = {
        info: "border-dnews-accent/30 bg-dnews-accent/5",
        warning: "border-amber-400/30 bg-amber-50",
        tip: "border-emerald-400/30 bg-emerald-50",
        quote: "border-dnews-border bg-dnews-card",
      };
      return (
        <div className={`my-6 rounded-sm border-l-4 p-4 ${variantStyles[variant] ?? variantStyles.info}`}>
          {block.data.title && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-dnews-muted">{String(block.data.title)}</p>
          )}
          <p className="text-sm text-dnews-dark">{String(block.data.text ?? "")}</p>
        </div>
      );
    }

    default:
      return null;
  }
}
