import type { ReactNode } from "react";
import { cn } from "../../utils/helpers";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

type FadeInProps = {
  children: ReactNode;
  className?: string;
};

const FadeIn = ({ children, className }: FadeInProps) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div ref={ref} className={cn("reveal", isVisible && "is-visible", className)}>
      {children}
    </div>
  );
};

export default FadeIn;
