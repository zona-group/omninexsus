import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import { Rnd } from "react-rnd"
import { cn } from "@/lib/utils"

function Resizable({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="resizable"
      className={cn("relative w-full", className)}
      {...props}
    />
  )
}

function ResizableHandle({
  className,
  withHandle = true,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> & {
  withHandle?: boolean
  orientation?: "horizontal" | "vertical"
}) {
  return (
    <div
      data-slot="resizable-handle"
      data-orientation={orientation}
      className={cn(
        "bg-border select-none touch-none transition-colors",
        orientation === "horizontal"
          ? "h-1 w-full hover:bg-border/80 cursor-row-resize"
          : "h-full w-1 hover:bg-border/80 cursor-col-resize",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div
          className={cn(
            "bg-muted-foreground/50 absolute rounded-sm flex items-center justify-center",
            orientation === "horizontal"
              ? "top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2"
              : "top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2"
          )}
        >
          <GripVerticalIcon className="size-4" />
        </div>
      )}
    </div>
  )
}

export { Resizable, ResizableHandle }