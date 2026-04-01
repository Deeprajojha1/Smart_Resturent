import { cn } from "../../utils/helpers";

type GlowEffectProps = {
  className?: string;
};

const GlowEffect = ({ className }: GlowEffectProps) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] bg-shine opacity-40 blur-2xl",
        className
      )}
    />
  );
};

export default GlowEffect;
