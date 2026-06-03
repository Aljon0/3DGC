import { useCallback, useEffect, useState } from 'react'

/**
 * useMediaQuery
 * Tracks a CSS media query and returns whether it currently matches.
 * SSR-safe (defaults to false on server).
 *
 * @param {string} query - e.g. '(max-width: 768px)'
 * @returns {boolean}
 *
 * @example
 *   const isMobile  = useMediaQuery('(max-width: 767px)')
 *   const isTablet  = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
 *   const isDesktop = useMediaQuery('(min-width: 1024px)')
 */
export function useMediaQuery(query) {
  const getMatches = useCallback(() => {
    // SSR guard
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  }, [query])

  const [matches, setMatches] = useState(getMatches)

  useEffect(() => {
    const mql      = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)

    // Modern API
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange)
    } else {
      // Fallback for older Safari
      mql.addListener(onChange)
    }

    // No setMatches call here — useState(getMatches) already initializes
    // with the correct value, so calling setMatches again synchronously
    // inside the effect triggers a cascading render warning for no benefit.

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', onChange)
      } else {
        mql.removeListener(onChange)
      }
    }
  }, [query])

  return matches
}

// ── Preset breakpoint hooks ────────────────────────────────────────────────
// Match Tailwind v4 breakpoints defined in index.css

/** < 480px */
export const useIsXs      = () => useMediaQuery('(max-width: 479px)')

/** < 640px  — "mobile" */
export const useIsMobile  = () => useMediaQuery('(max-width: 639px)')

/** 640px – 767px */
export const useIsSm      = () => useMediaQuery('(min-width: 640px) and (max-width: 767px)')

/** 768px – 1023px — "tablet" */
export const useIsTablet  = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)')

/** ≥ 1024px — "desktop" */
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')

/** ≥ 1280px */
export const useIsXl      = () => useMediaQuery('(min-width: 1280px)')

/**
 * useBreakpoint
 * Returns a single object with all breakpoint states at once.
 * Useful when you need multiple breakpoints in one component.
 *
 * @example
 *   const { isMobile, isDesktop } = useBreakpoint()
 */
export function useBreakpoint() {
  const isXs      = useIsXs()
  const isMobile  = useIsMobile()
  const isSm      = useIsSm()
  const isTablet  = useIsTablet()
  const isDesktop = useIsDesktop()
  const isXl      = useIsXl()

  return { isXs, isMobile, isSm, isTablet, isDesktop, isXl }
}