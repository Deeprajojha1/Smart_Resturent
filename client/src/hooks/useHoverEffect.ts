import { useState } from "react";

export const useHoverEffect = () => {
  const [isHovered, setIsHovered] = useState(false);

  return {
    isHovered,
    bind: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    },
  } as const;
};
