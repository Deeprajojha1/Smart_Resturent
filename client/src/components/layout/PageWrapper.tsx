import type { ReactNode } from "react";
import { cn } from "../../utils/helpers";

type PageWrapperProps = {
  children: ReactNode;
  className?: string;
};

const PageWrapper = ({ children, className }: PageWrapperProps) => {
  return (
    <div className={cn("relative min-h-screen overflow-hidden bg-night", className)}>
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-70" />
      <div className="pointer-events-none absolute -top-32 left-0 h-80 w-80 rounded-full bg-glow/25 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan/20 blur-[120px]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default PageWrapper;
