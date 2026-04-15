import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonGroupVariants = cva(
  "inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
  {
    variants: {},
    defaultVariants: {},
  }
)

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {}

function ButtonGroup({ className, ...props }: ButtonGroupProps) {
  return (
    <div className={cn(buttonGroupVariants(), className)} {...props} />
  )
}

export { ButtonGroup, buttonGroupVariants }