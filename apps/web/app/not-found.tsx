import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Home, Newspaper, Radio } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative isolate overflow-hidden bg-dnews-bg">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-dnews-red/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-dnews-accent/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[560px] max-w-[1180px] items-center px-4 py-16 sm:py-20 lg:min-h-[650px] lg:py-24">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <section>
            <div className="mb-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-dnews-red">
              <span className="h-px w-10 bg-dnews-red" />
              <Radio size={14} strokeWidth={2.5} aria-hidden="true" />
              <span>Newsroom bulletin</span>
            </div>

            <p className="font-heading text-[clamp(6rem,18vw,12rem)] font-bold leading-[0.78] tracking-[-0.08em] text-dnews-accent dark:text-white">
              404
            </p>
            <h1 className="mt-8 max-w-xl font-heading text-[clamp(2.2rem,5vw,4.5rem)] font-bold leading-[0.98] tracking-tight text-dnews-dark">
              Story not found.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-dnews-gray sm:text-lg">
              Our reporters searched every desk, but this story has slipped past
              the deadline. Let&apos;s get you back to the headlines that matter.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="group inline-flex items-center justify-center gap-2 rounded-sm bg-dnews-accent px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-dnews-accent-light hover:shadow-lg hover:shadow-dnews-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dnews-accent"
              >
                <Home size={15} aria-hidden="true" />
                Back to Home
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/news"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-dnews-border bg-dnews-card px-5 py-3 text-xs font-bold uppercase tracking-wider text-dnews-dark transition-all duration-200 hover:-translate-y-0.5 hover:border-dnews-accent hover:text-dnews-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dnews-accent"
              >
                <Newspaper size={15} aria-hidden="true" />
                Explore News
              </Link>
            </div>
          </section>

          <aside
            className="relative mx-auto w-full max-w-md motion-safe:animate-[float_6s_ease-in-out_infinite]"
            aria-label="A missing newspaper story"
          >
            <div className="absolute -inset-3 rounded-sm border border-dnews-red/20" />
            <div className="relative rotate-[-2deg] overflow-hidden rounded-sm border border-dnews-border bg-dnews-card p-6 shadow-2xl shadow-dnews-accent/10 sm:p-9">
              <div className="flex items-center justify-between border-b-2 border-dnews-accent pb-4 dark:border-white">
                <span className="font-heading text-lg font-bold text-dnews-accent dark:text-white">
                  Dnews Africa
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-dnews-muted">
                  Special edition
                </span>
              </div>
              <div className="py-8 text-center sm:py-12">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-dnews-red/10 text-dnews-red">
                  <Newspaper size={38} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <p className="mt-6 font-heading text-2xl font-bold text-dnews-dark sm:text-3xl">
                  The missing edition
                </p>
                <div className="mx-auto mt-5 max-w-[220px] space-y-2" aria-hidden="true">
                  <span className="block h-2 rounded-full bg-dnews-light-gray" />
                  <span className="mx-auto block h-2 w-4/5 rounded-full bg-dnews-light-gray" />
                  <span className="mx-auto block h-2 w-3/5 rounded-full bg-dnews-light-gray" />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-dnews-border pt-4 text-[9px] font-semibold uppercase tracking-widest text-dnews-muted">
                <span>Filed: nowhere</span>
                <span className="flex items-center gap-1 text-dnews-red">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-dnews-red" />
                  Live desk
                </span>
              </div>
            </div>
            <div className="absolute -bottom-7 -left-5 hidden -rotate-6 items-center gap-2 rounded-sm bg-dnews-red px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg sm:flex">
              <ArrowLeft size={13} aria-hidden="true" />
              Keep reading
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </main>
  );
}