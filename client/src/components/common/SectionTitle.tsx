import type { ReactNode } from "react";
import { cn } from "../../utils/helpers";

type SectionTitleProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
};

const SectionTitle = ({ eyebrow, title, subtitle, className }: SectionTitleProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {eyebrow ? (
        <p className="text-sm uppercase tracking-[0.3em] text-cyan/80">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-3xl font-semibold leading-tight md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-base text-white/70 md:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
};

export default SectionTitle;
