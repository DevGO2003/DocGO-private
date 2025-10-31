import { useEffect, useMemo, useState } from 'react'

export function useHashTab<T extends string>(options: { defaultTab: T; validTabs?: readonly T[] }) {
  const { defaultTab, validTabs } = options
  const [tab, setTab] = useState<T>(defaultTab)

  const isValid = useMemo(() => {
    if (!validTabs || validTabs.length === 0) return (v: string): v is T => true as any
    const set = new Set(validTabs as readonly string[])
    return (v: string): v is T => set.has(v)
  }, [validTabs])

  // Initialize from URL hash
  useEffect(() => {
    const raw = (typeof window !== 'undefined' ? window.location.hash : '').replace(/^#/, '')
    if (raw && isValid(raw)) {
      setTab(raw as T)
    }
  }, [isValid])

  // Respond to external hash changes
  useEffect(() => {
    const onHashChange = () => {
      const raw = window.location.hash.replace(/^#/, '')
      if (raw && isValid(raw)) {
        setTab(raw as T)
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [isValid])

  // Update URL hash when tab changes
  useEffect(() => {
    try {
      const { pathname, search } = window.location
      const next = `#${tab}`
      if (window.location.hash !== next) {
        window.history.replaceState(null, '', `${pathname}${search}${next}`)
      }
    } catch {}
  }, [tab])

  const update = (next: T) => setTab(next)
  return [tab, update] as const
}
