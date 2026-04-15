import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

const fieldVariants = cva("flex", {
  variants: {
    variant: {
      default: "flex-col gap-2",
      inline: "gap-2 items-start",
      floating: "relative",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface FieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof fieldVariants> {}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="field"
      className={cn(fieldVariants({ variant, className }))}
      {...props}
    />
  )
)

Field.displayName = "Field"

export { Field, fieldVariants }