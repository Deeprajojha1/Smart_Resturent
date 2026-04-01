import type { ReactNode } from "react";
import { cn } from "../../utils/helpers";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

const Badge = ({ children, className }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border bg-gradient-to-r from-primary/20 to-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-light border-primary/30 hover:border-primary/50 transition-all duration-300",
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
