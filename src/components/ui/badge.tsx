import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "data-[slot=badge]:inline-flex data-[slot=badge]:items-center data-[slot=badge]:rounded-full data-[slot=badge]:border data-[slot=badge]:px-2.5 data-[slot=badge]:py-0.5 data-[slot=badge]:text-xs data-[slot=badge]:font-semibold data-[slot=badge]:transition-colors data-[slot=badge]:focus-visible:outline-none data-[slot=badge]:focus-visible:ring-2 data-[slot=badge]:focus-visible:ring-ring data-[slot=badge]:focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "data-[slot=badge]:border-transparent data-[slot=badge]:bg-primary data-[slot=badge]:text-primary-foreground data-[slot=badge]:hover:bg-primary/80",
        secondary:
          "data-[slot=badge]:border-transparent data-[slot=badge]:bg-secondary data-[slot=badge]:text-secondary-foreground data-[slot=badge]:hover:bg-secondary/80",
        destructive:
          "data-[slot=badge]:border-transparent data-[slot=badge]:bg-destructive data-[slot=badge]:text-destructive-foreground data-[slot=badge]:hover:bg-destructive/80",
        outline: "data-[slot=badge]:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge(
  { className, variant, ...props },
  { asChild = false }: { asChild?: boolean } = {}
) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
