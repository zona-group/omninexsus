import { cn } from "@/lib/utils"

function Spinner({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="spinner"
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-solid border-current border-e-transparent",
        className
      )}
      {...props}
    />
  )
}

export { Spinner }