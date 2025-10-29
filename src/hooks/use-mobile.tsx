import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      }
    }
    void (mql.addEventListener?.("change", onChange) ?? mql.addListener(onChange))
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () =>
      void (
        mql.removeEventListener?.("change", onChange) ??
          mql.removeListener(onChange)
      )
  }, [])

  return !!isMobile
}
