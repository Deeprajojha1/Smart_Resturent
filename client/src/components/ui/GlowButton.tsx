import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/helpers";

type GlowButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

const GlowButton = ({ className, variant = "primary", ...props }: GlowButtonProps) => {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-3 text-sm font-semibold transition duration-300",
        variant === "primary"
          ? "bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg shadow-primary/50 hover:shadow-primary hover:from-primary-dark hover:to-emerald-700 animate-gradient"
          : "border border-white/25 bg-white/5 text-white hover:bg-white/10 hover:border-white/40",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{props.children}</span>
    </button>
  );
};

export default GlowButton;
