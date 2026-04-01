import type { HTMLAttributes } from "react";
import { cn } from "../../utils/helpers";

type GlassCardProps = HTMLAttributes<HTMLDivElement>;

const GlassCard = ({ className, ...props }: GlassCardProps) => {
  return (
    <div
      className={cn(
        "glass rounded-3xl border border-white/10 bg-white/10 backdrop-blur-lg",
        className
      )}
      {...props}
    />
  );
};

export default GlassCard;
