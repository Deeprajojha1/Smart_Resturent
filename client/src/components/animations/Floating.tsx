import type { ReactNode } from "react";
import { cn } from "../../utils/helpers";

type FloatingProps = {
  children: ReactNode;
  className?: string;
};

const Floating = ({ children, className }: FloatingProps) => {
  return (
    <div className={cn("animate-float", className)}>{children}</div>
  );
};

export default Floating;
