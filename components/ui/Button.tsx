import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const baseStyles =
  "inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white shadow-md shadow-brand/30 hover:-translate-y-0.5 hover:bg-brand-strong",
  secondary: "border border-border bg-surface text-ink-soft shadow-sm hover:-translate-y-0.5 hover:border-border/80 hover:bg-surface-2",
  ghost: "text-ink-soft hover:bg-surface-2",
  danger: "bg-coral text-white shadow-md shadow-coral/30 hover:-translate-y-0.5 hover:bg-coral-strong"
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base"
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => {
    const classes = [baseStyles, variantStyles[variant], sizeStyles[size], className]
      .filter(Boolean)
      .join(" ");

    return <button ref={ref} className={classes} {...props} />;
  }
);

Button.displayName = "Button";

export default Button;
