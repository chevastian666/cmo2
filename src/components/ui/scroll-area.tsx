import * as React from "react"
import { cn} from "@/utils/utils"
interface ScrollAreaProps {
  className?: string
  children?: React.ReactNode
  style?: React.CSSProperties
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(({ className, children, style, ...props }, ref) => (
    <div
      ref={_ref}
      className={cn("relative overflow-auto", className)}
      style={s_tyle}
      {...props}
    >
      <div className="h-full w-full">
        {_children}
      </div>
    </div>
  )
)
ScrollArea.displayName = "ScrollArea"
export { ScrollArea }