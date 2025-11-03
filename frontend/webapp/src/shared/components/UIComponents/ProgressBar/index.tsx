import { useEffect, useMemo, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useIsFetching } from '@tanstack/react-query'
import anime from 'animejs'

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
  const progressRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (!progressRef.current) return
    
    if (isActive) {
      anime({
        targets: progressRef.current,
        width: ['10%', '60%', '85%', '95%', '85%', '100%'],
        opacity: 0.9,
        duration: 1200,
        easing: 'easeInOutQuad',
        loop: true,
      })
    } else {
      anime({
        targets: progressRef.current,
        width: '100%',
        opacity: 0,
        duration: 200,
        easing: 'easeInOutQuad',
      })
    }
  }, [isActive])

  if (!visible) return null

  return (
    <div
      className={`absolute left-0 right-0 ${position === 'top' ? 'top-0' : 'bottom-0'} z-50 pointer-events-none`}
      style={{ height }}
      aria-hidden
    >
      <div
        ref={progressRef}
        className={`h-full ${colorClass}`}
        style={{ width: '10%', opacity: 0.9 }}
      />
    </div>
  )
}
