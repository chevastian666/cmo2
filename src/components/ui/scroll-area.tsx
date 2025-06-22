import * as React from "react";
import { cn} from "@/utils/utils";

interface ScrollAreaProps {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(({ className, children, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative overflow-auto", className)}
      style={style}
      {...props}
    >
      <div className="h-full w-full">
        {children}
      </div>
    </div>
  )
);
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
