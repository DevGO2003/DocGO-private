import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useIsFetching } from '@tanstack/react-query'
import { motion } from 'framer-motion'

interface ProgressBarProps {
  active?: boolean
  height?: number
  colorClass?: string
  position?: 'top' | 'bottom'
}

export const ProgressBar = ({
  active,
  height = 2,
  colorClass = 'bg-blue-600',
  position = 'top',
}: ProgressBarProps) => {
  const location = useLocation()
  const isFetching = useIsFetching()
  const [navigating, setNavigating] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setNavigating(true)
    const t = setTimeout(() => setNavigating(false), 400)
    return () => clearTimeout(t)
  }, [location.pathname, location.search, location.hash])

  const isActive = useMemo(() => {
    if (typeof active === 'boolean') return active
    return navigating || isFetching > 0
  }, [active, navigating, isFetching])

  useEffect(() => {
    if (isActive) {
      setVisible(true)
    } else {
      const t = setTimeout(() => setVisible(false), 200)
      return () => clearTimeout(t)
    }
  }, [isActive])

  if (!visible) return null

  return (
    <div
      className={`absolute left-0 right-0 ${position === 'top' ? 'top-0' : 'bottom-0'} z-50 pointer-events-none`}
      style={{ height }}
      aria-hidden
    >
      <motion.div
        className={`h-full ${colorClass}`}
        initial={{ width: '10%', opacity: 0.9 }}
        animate={{
          width: isActive ? ['10%', '60%', '85%', '95%', '85%', '100%'] : '100%',
          opacity: isActive ? 0.9 : 0,
        }}
        transition={{ duration: 1.2, ease: 'easeInOut', repeat: isActive ? Infinity : 0, repeatDelay: 0.2 }}
      />
    </div>
  )
}
