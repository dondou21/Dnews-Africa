import type { ContentBlock } from "@dnews/types";

interface BlockRendererProps {
  block: ContentBlock;
  isPreview?: boolean;
}

export default function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case "paragraph": {
      const text = String(block.data.text ?? "");
      const rendered = text.split("\n").map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {line || "\u00A0"}
        </span>
      ));
      return (
        <p className="mb-6 text-[clamp(1rem,1.2vw,1.125rem)] leading-[1.8] text-dnews-dark last:mb-0">
          {rendered}
        </p>
      );
    }

    case "heading": {
      const Tag = (block.data.level as "h2" | "h3" | "h4") ?? "h2";
      const sizes: Record<string, string> = {
        h2: "text-[clamp(1.35rem,2vw,1.75rem)] font-bold mb-5 mt-12",
        h3: "text-[clamp(1.15rem,1.5vw,1.35rem)] font-bold mb-4 mt-10",
        h4: "text-[clamp(1rem,1.2vw,1.15rem)] font-semibold mb-3 mt-8",
      };
      return (
        <Tag className={`${sizes[Tag]} leading-tight text-dnews-dark`}>
          {String(block.data.text ?? "")}
        </Tag>
      );
    }

    case "quote":
      return (
        <blockquote className="mb-8 mt-8 border-l-4 border-dnews-accent bg-dnews-bg py-5 pl-6 pr-5 italic text-dnews-dark">
          <p className="text-[clamp(1rem,1.2vw,1.1rem)] leading-relaxed">
            {String(block.data.text ?? "")}
          </p>
          {!!block.data.attribution && (
            <cite className="mt-3 block text-sm text-dnews-muted not-italic">
              &mdash; {String(block.data.attribution)}
            </cite>
          )}
        </blockquote>
      );

    case "pullQuote":
      return (
        <aside className="my-10 border-y border-dnews-border py-8 text-center">
          <p className="font-heading text-[clamp(1.35rem,2.5vw,2rem)] font-bold italic leading-snug text-dnews-dark">
            &ldquo;{String(block.data.text ?? "")}&rdquo;
          </p>
          {!!block.data.attribution && (
            <cite className="mt-3 block text-sm text-dnews-muted not-italic">
              &mdash; {String(block.data.attribution)}
            </cite>
          )}
        </aside>
      );

    case "image": {
      const al = (block.data.alignment as string) ?? "full";
      const sz = (block.data.size as string) ?? "large";
      const alignClass =
        al === "left" ? "float-left mr-6 mb-4" : al === "right" ? "float-right ml-6 mb-4" : "mx-auto";
      const sizeClass =
        sz === "small"
          ? "w-1/3"
          : sz === "medium"
            ? "w-1/2"
            : sz === "fullWidth"
              ? "w-full"
              : "w-full max-w-3xl";
      return (
        <figure className={`my-10 ${alignClass} ${sizeClass}`}>
          <img
            src={String(block.data.url ?? "")}
            alt={String(block.data.alt ?? "")}
            className="w-full rounded-sm"
            loading="lazy"
          />
          {!!(block.data.caption || block.data.credit) && (
            <figcaption className="mt-2.5 text-center text-sm text-dnews-muted">
              {String(block.data.caption ?? "")}
              {!!block.data.credit && (
                <span className="ml-1">
                  ({String(block.data.credit)})
                </span>
              )}
            </figcaption>
          )}
        </figure>
      );
    }

    case "imageGallery": {
      const items = (
        block.data.items as Array<{
          url: string;
          caption?: string;
          credit?: string;
          alt?: string;
        }>
      ) ?? [];
      return (
        <div className="my-10">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {items.map((item, i) => (
              <figure key={i} className="overflow-hidden rounded-sm">
                <img
                  src={item.url}
                  alt={item.alt ?? ""}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                />
                {item.caption && (
                  <figcaption className="mt-1.5 text-center text-xs text-dnews-muted">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
          {!!block.data.caption && (
            <p className="mt-4 text-center text-sm text-dnews-muted">
              {String(block.data.caption)}
            </p>
          )}
        </div>
      );
    }

    case "video":
      return (
        <div className="my-10">
          <div className="aspect-video overflow-hidden rounded-sm bg-dnews-bg">
            {String(block.data.url ?? "").includes("youtube") ||
            String(block.data.url ?? "").includes("youtu.be") ? (
              <iframe
                src={String(block.data.url ?? "").replace("watch?v=", "embed/")}
                className="h-full w-full"
                allowFullScreen
                title={String(block.data.caption ?? "Video")}
              />
            ) : (
              <video
                controls
                className="h-full w-full"
                poster={String(block.data.posterUrl ?? "")}
              >
                <source src={String(block.data.url ?? "")} />
              </video>
            )}
          </div>
          {!!block.data.caption && (
            <p className="mt-2.5 text-center text-sm text-dnews-muted">
              {String(block.data.caption)}
            </p>
          )}
        </div>
      );

    case "divider":
      return <hr className="my-10 border-dnews-border/60" />;

    case "bulletList": {
      const items = (block.data.items as string[]) ?? [];
      return (
        <ul className="mb-6 mt-4 space-y-2.5 text-[clamp(1rem,1.2vw,1.125rem)] leading-relaxed text-dnews-dark">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 pl-1">
              <span className="mt-2.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-dnews-accent/60" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    }

    case "numberedList": {
      const items = (block.data.items as string[]) ?? [];
      return (
        <ol className="mb-6 mt-4 list-inside list-decimal space-y-2.5 text-[clamp(1rem,1.2vw,1.125rem)] leading-relaxed text-dnews-dark marker:text-dnews-accent">
          {items.map((item, i) => (
            <li key={i} className="pl-1">
              {item}
            </li>
          ))}
        </ol>
      );
    }

    case "table": {
      const rows = (block.data.rows as string[][]) ?? [];
      const header = (block.data.header as string[]) ?? [];
      return (
        <div className="my-10 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            {header.length > 0 && (
              <thead>
                <tr className="bg-dnews-bg">
                  {header.map((h, i) => (
                    <th
                      key={i}
                      className="border border-dnews-border px-4 py-3 text-left font-semibold text-dnews-dark"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((row, ri) => (
                <tr
                  key={ri}
                  className={
                    ri % 2 === 0 ? "bg-dnews-card" : "bg-dnews-bg"
                  }
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="border border-dnews-border px-4 py-3 text-dnews-dark"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {!!block.data.caption && (
            <p className="mt-3 text-center text-sm text-dnews-muted">
              {String(block.data.caption)}
            </p>
          )}
        </div>
      );
    }

    case "embed":
      return (
        <div className="my-10">
          <div className="overflow-hidden rounded-sm bg-dnews-bg">
            <iframe
              src={String(block.data.url ?? "")}
              className="h-[450px] w-full"
              allowFullScreen
              title={String(block.data.caption ?? "Embedded content")}
            />
          </div>
          {!!block.data.caption && (
            <p className="mt-2.5 text-center text-sm text-dnews-muted">
              {String(block.data.caption)}
            </p>
          )}
        </div>
      );

    case "relatedArticle":
      return (
        <div className="my-10 rounded-sm border border-dnews-border bg-dnews-bg p-6">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-dnews-muted">
            Related Article
          </p>
          <a
            href={String(block.data.url ?? "#")}
            className="font-heading text-lg font-bold text-dnews-accent transition-colors hover:text-dnews-accent-light hover:underline"
          >
            {String(block.data.title ?? "Read more")}
          </a>
        </div>
      );

    case "callout": {
      const variant = (block.data.variant as string) ?? "info";
      const variantStyles: Record<string, string> = {
        info: "border-dnews-accent/30 bg-dnews-accent/5",
        warning: "border-amber-400/30 bg-amber-50",
        tip: "border-emerald-400/30 bg-emerald-50",
        quote: "border-dnews-border bg-dnews-card",
      };
      return (
        <div
          className={`my-10 rounded-sm border-l-4 p-6 ${variantStyles[variant] ?? variantStyles.info}`}
        >
          {!!block.data.title && (
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-dnews-muted">
              {String(block.data.title)}
            </p>
          )}
          <p className="text-[clamp(0.95rem,1.1vw,1.05rem)] leading-relaxed text-dnews-dark">
            {String(block.data.text ?? "")}
          </p>
        </div>
      );
    }

    default:
      return null;
  }
}