import { useState, useEffect } from "react"

export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    mq.addEventListener("change", onChange)
    setIsMobile(mq.matches)
    return () => mq.removeEventListener("change", onChange)
  }, [breakpoint])

  return !!isMobile
}