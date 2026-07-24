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
        <p className="mb-5 text-[17px] leading-[1.75] text-dnews-dark last:mb-0">
          {rendered}
        </p>
      );
    }

    case "heading": {
      const Tag = (block.data.level as "h2" | "h3" | "h4") ?? "h2";
      const sizes: Record<string, string> = {
        h2: "text-2xl font-bold mb-4 mt-10",
        h3: "text-xl font-bold mb-3 mt-8",
        h4: "text-lg font-semibold mb-2 mt-6",
      };
      return (
        <Tag className={`${sizes[Tag]} leading-tight text-dnews-dark`}>
          {String(block.data.text ?? "")}
        </Tag>
      );
    }

    case "quote":
      return (
        <blockquote className="mb-6 mt-6 border-l-4 border-dnews-accent bg-dnews-bg py-4 pl-5 pr-4 italic text-dnews-dark">
          <p className="text-[17px] leading-relaxed">
            {String(block.data.text ?? "")}
          </p>
          {!!block.data.attribution && (
            <cite className="mt-2 block text-sm text-dnews-muted not-italic">
              &mdash; {String(block.data.attribution)}
            </cite>
          )}
        </blockquote>
      );

    case "pullQuote":
      return (
        <aside className="my-8 border-y border-dnews-border py-6 text-center">
          <p className="font-heading text-2xl font-bold italic leading-snug text-dnews-dark md:text-3xl">
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
        al === "left" ? "float-left mr-5 mb-3" : al === "right" ? "float-right ml-5 mb-3" : "mx-auto";
      const sizeClass =
        sz === "small"
          ? "w-1/3"
          : sz === "medium"
            ? "w-1/2"
            : sz === "fullWidth"
              ? "w-full"
              : "w-full max-w-3xl";
      return (
        <figure className={`my-8 ${alignClass} ${sizeClass}`}>
          <img
            src={String(block.data.url ?? "")}
            alt={String(block.data.alt ?? "")}
            className="w-full rounded-sm"
            loading="lazy"
          />
          {!!(block.data.caption || block.data.credit) && (
            <figcaption className="mt-2 text-center text-sm text-dnews-muted">
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
        <div className="my-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item, i) => (
              <figure key={i} className="overflow-hidden rounded-sm">
                <img
                  src={item.url}
                  alt={item.alt ?? ""}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                />
                {item.caption && (
                  <figcaption className="mt-1 text-center text-xs text-dnews-muted">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
          {!!block.data.caption && (
            <p className="mt-3 text-center text-sm text-dnews-muted">
              {String(block.data.caption)}
            </p>
          )}
        </div>
      );
    }

    case "video":
      return (
        <div className="my-8">
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
            <p className="mt-2 text-center text-sm text-dnews-muted">
              {String(block.data.caption)}
            </p>
          )}
        </div>
      );

    case "divider":
      return <hr className="my-8 border-dnews-border" />;

    case "bulletList": {
      const items = (block.data.items as string[]) ?? [];
      return (
        <ul className="mb-5 mt-3 list-inside list-disc space-y-2 text-[17px] leading-relaxed text-dnews-dark">
          {items.map((item, i) => (
            <li key={i} className="pl-2">
              {item}
            </li>
          ))}
        </ul>
      );
    }

    case "numberedList": {
      const items = (block.data.items as string[]) ?? [];
      return (
        <ol className="mb-5 mt-3 list-inside list-decimal space-y-2 text-[17px] leading-relaxed text-dnews-dark">
          {items.map((item, i) => (
            <li key={i} className="pl-2">
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
        <div className="my-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            {header.length > 0 && (
              <thead>
                <tr className="bg-dnews-bg">
                  {header.map((h, i) => (
                    <th
                      key={i}
                      className="border border-dnews-border px-4 py-2.5 text-left font-semibold text-dnews-dark"
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
                      className="border border-dnews-border px-4 py-2.5 text-dnews-dark"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {!!block.data.caption && (
            <p className="mt-2 text-center text-sm text-dnews-muted">
              {String(block.data.caption)}
            </p>
          )}
        </div>
      );
    }

    case "embed":
      return (
        <div className="my-8">
          <div className="overflow-hidden rounded-sm bg-dnews-bg">
            <iframe
              src={String(block.data.url ?? "")}
              className="h-[450px] w-full"
              allowFullScreen
              title={String(block.data.caption ?? "Embedded content")}
            />
          </div>
          {!!block.data.caption && (
            <p className="mt-2 text-center text-sm text-dnews-muted">
              {String(block.data.caption)}
            </p>
          )}
        </div>
      );

    case "relatedArticle":
      return (
        <div className="my-8 rounded-sm border border-dnews-border bg-dnews-bg p-5">
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
          className={`my-8 rounded-sm border-l-4 p-5 ${variantStyles[variant] ?? variantStyles.info}`}
        >
          {!!block.data.title && (
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-dnews-muted">
              {String(block.data.title)}
            </p>
          )}
          <p className="text-[15px] leading-relaxed text-dnews-dark">
            {String(block.data.text ?? "")}
          </p>
        </div>
      );
    }

    default:
      return null;
  }
}