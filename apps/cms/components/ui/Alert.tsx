import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { type ReactNode } from "react";

type AlertVariant = "error" | "success" | "info" | "warning";

interface AlertProps {
  variant?: AlertVariant;
  message: string;
  onDismiss?: () => void;
  action?: ReactNode;
}

const variantConfig = {
  error: {
    bg: "bg-dnews-red/5",
    border: "border-dnews-red/20",
    text: "text-dnews-red",
    icon: AlertCircle,
  },
  success: {
    bg: "bg-dnews-green/5",
    border: "border-dnews-green/20",
    text: "text-dnews-green",
    icon: CheckCircle2,
  },
  info: {
    bg: "bg-dnews-blue/5",
    border: "border-dnews-blue/20",
    text: "text-dnews-blue",
    icon: Info,
  },
  warning: {
    bg: "bg-dnews-amber/5",
    border: "border-dnews-amber/20",
    text: "text-dnews-amber",
    icon: AlertTriangle,
  },
};

export default function Alert({
  variant = "info",
  message,
  onDismiss,
  action,
}: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-5 py-4 ${config.bg} ${config.border}`}
      role="alert"
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${config.text}`} />
      <div className="flex-1 text-sm font-medium ${config.text}">
        {message}
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`shrink-0 rounded-lg p-1 transition-colors hover:bg-white/20 ${config.text}`}
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
