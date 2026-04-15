import { Toaster } from "sonner"

function Sonner() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "text-sm",
        },
      }}
    />
  )
}

export { Sonner }