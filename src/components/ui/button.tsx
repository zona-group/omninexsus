import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "data-[slot=button]:inline-flex data-[slot=button]:items-center data-[slot=button]:justify-center data-[slot=button]:gap-2 data-[slot=button]:whitespace-nowrap data-[slot=button]:rounded-md data-[slot=button]:text-sm data-[slot=button]:font-medium data-[slot=button]:ring-offset-background data-[slot=button]:transition-colors data-[slot=button]:focus-visible:outline-none data-[slot=button]:focus-visible:ring-2 data-[slot=button]:focus-visible:ring-ring data-[slot=button]:focus-visible:ring-offset-2 data-[slot=button]:disabled:pointer-events-none data-[slot=button]:disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[slot=button]:bg-primary data-[slot=button]:text-primary-foreground data-[slot=button]:hover:bg-primary/90",
        destructive:
          "data-[slot=button]:bg-destructive data-[slot=button]:text-destructive-foreground data-[slot=button]:hover:bg-destructive/90",
        outline:
          "data-[slot=button]:border data-[slot=button]:border-input data-[slot=button]:bg-background data-[slot=button]:hover:bg-accent data-[slot=button]:hover:text-accent-foreground",
        secondary:
          "data-[slot=button]:bg-secondary data-[slot=button]:text-secondary-foreground data-[slot=button]:hover:bg-secondary/80",
        ghost:
          "data-[slot=button]:hover:bg-accent data-[slot=button]:hover:text-accent-foreground",
        link: "data-[slot=button]:text-primary data-[slot=button]:underline-offset-4 data-[slot=button]:hover:underline",
      },
      size: {
        default: "data-[slot=button]:h-10 data-[slot=button]:px-4 data-[slot=button]:py-2",
        sm: "data-[slot=button]:h-9 data-[slot=button]:rounded-md data-[slot=button]:px-3",
        lg: "data-[slot=button]:h-11 data-[slot=button]:rounded-md data-[slot=button]:px-8",
        icon: "data-[slot=button]:h-10 data-[slot=button]:w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
