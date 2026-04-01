import type { ReactNode } from "react";
import { cn } from "../../utils/helpers";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

type SlideUpProps = {
  children: ReactNode;
  className?: string;
};

const SlideUp = ({ children, className }: SlideUpProps) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={cn(
        "transition duration-700",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
};

export default SlideUp;
