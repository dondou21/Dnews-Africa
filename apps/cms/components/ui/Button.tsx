import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type Size = "xs" | "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-dnews-accent text-white hover:bg-dnews-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dnews-accent",
  secondary:
    "bg-dnews-light-gray text-dnews-dark hover:bg-dnews-border border border-dnews-border",
  danger:
    "bg-dnews-red text-white hover:bg-dnews-red/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dnews-red",
  ghost:
    "text-dnews-gray hover:bg-dnews-light-gray hover:text-dnews-dark",
  outline:
    "border border-dnews-border text-dnews-gray hover:bg-dnews-light-gray hover:text-dnews-dark",
};

const sizeStyles: Record<Size, string> = {
  xs: "px-2.5 py-1.5 text-xs gap-1.5",
  sm: "px-3.5 py-2 text-xs gap-2",
  md: "px-4 py-2.5 text-sm gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "sm",
      loading = false,
      icon,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : icon ? (
          icon
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
