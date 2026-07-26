import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-dnews-dark">
          Already subscribed
        </h1>
        <p className="mt-3 text-sm text-dnews-muted">
          Email verification is no longer required. New subscriptions are activated immediately upon signup.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
        >
          Explore Dnews Africa
        </Link>
      </div>
    </div>
  );
}
