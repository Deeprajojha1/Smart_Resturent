import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/helpers";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

const Button = ({ className, variant = "primary", ...props }: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition duration-300";
  const variants = {
    primary: "bg-white text-night hover:bg-white/90",
    secondary: "bg-white/10 text-white hover:bg-white/20",
    ghost: "border border-white/20 text-white hover:border-white/40",
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
};

export default Button;
