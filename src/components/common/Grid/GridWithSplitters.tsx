import classNames from 'classnames'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'

interface Props {
  className?: string
  chartArea: ReactNode
  rightArea: ReactNode
  bottomArea: ReactNode
}

// Desktop layout component with full grid and drag functionality
function DesktopGridLayout({ className, chartArea, rightArea, bottomArea }: Props) {
  const [chartWidthPercent, setChartWidthPercent] = useState(75) // Chart takes 75% width
  const [chartHeightPercent, setChartHeightPercent] = useState(75) // Chart takes 75% height
  const [isDragging, setIsDragging] = useState<'vertical' | 'horizontal' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleVerticalKnobDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging('vertical')

    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    let animationFrameId: number

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

      animationFrameId = requestAnimationFrame(() => {
        if (!containerRef.current) return

        const x = e.clientX - containerRect.left
        const percentage = (x / containerRect.width) * 100

        // Constrain between 60% and 83%
        const newWidth = Math.min(83, Math.max(60, percentage))
        setChartWidthPercent(newWidth)
      })
    }

    const handleMouseUp = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      setIsDragging(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [])

  const handleHorizontalKnobDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging('horizontal')

    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    let animationFrameId: number

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

      animationFrameId = requestAnimationFrame(() => {
        if (!containerRef.current) return

        const y = e.clientY - containerRect.top
        const percentage = (y / containerRect.height) * 100

        // Constrain between 60% and 85%
        const newHeight = Math.min(85, Math.max(60, percentage))
        setChartHeightPercent(newHeight)
      })
    }

    const handleMouseUp = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      setIsDragging(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [])

  // Cleanup effect to ensure dragging state is always cleared
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(null)
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden && isDragging) {
        setIsDragging(null)
      }
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isDragging])

  // Memoize calculated values to prevent unnecessary re-renders
  const gridStyles = useMemo(() => {
    const rightWidthFr = 100 - chartWidthPercent
    const bottomHeightFr = 100 - chartHeightPercent

    return {
      gridTemplateColumns: `${chartWidthPercent}fr 4px ${rightWidthFr}fr`,
      gridTemplateRows: `${chartHeightPercent}fr 4px ${bottomHeightFr}fr`,
    }
  }, [chartWidthPercent, chartHeightPercent])

  return (
    <div ref={containerRef} className={classNames('w-full md:h-full', className)}>
      {/* Drag Overlay - Prevents TradingView chart from capturing mouse events */}
      {isDragging && (
        <div
          className={classNames(
            'fixed inset-0 z-9999',
            isDragging === 'vertical' ? 'cursor-col-resize' : 'cursor-row-resize',
          )}
          style={{ userSelect: 'none' }}
        />
      )}

      {/* Desktop Layout - CSS Grid with Splitters */}
      <div className='grid w-full h-full min-h-0' style={gridStyles}>
        {/* Row 1, Col 1: Chart Area */}
        <div className='min-w-0 min-h-0 overflow-hidden row-start-1 row-end-2 col-start-1 col-end-2'>
          {chartArea}
        </div>

        {/* Row 1-3, Col 2: Vertical Splitter (spans all rows) */}
        <div className='bg-body transition-colors relative group row-start-1 row-end-4 col-start-2 col-end-3'>
          {/* Vertical Drag Knob */}
          <div
            className={classNames(
              'absolute top-1/2 left-1/2 w-6 h-6 rounded-full cursor-col-resize transition-all duration-200 z-60',
              'transform -translate-x-1/2 -translate-y-1/2',
              'opacity-0 group-hover:opacity-50 hover:opacity-75!',
              'bg-white shadow-lg border border-white/20',
              'flex items-center justify-center',
              isDragging === 'vertical' && 'opacity-100! scale-110',
            )}
            onMouseDown={handleVerticalKnobDrag}
          >
            {/* Vertical grip lines */}
            <div className='flex space-x-0.5'>
              <div className='w-px h-3 bg-gray-400'></div>
              <div className='w-px h-3 bg-gray-400'></div>
              <div className='w-px h-3 bg-gray-400'></div>
            </div>
          </div>
        </div>

        {/* Row 1-3, Col 3: Right Panel (spans all rows) */}
        <div className='min-w-0 min-h-0 overflow-auto scrollbar-hide row-start-1 row-end-4 col-start-3 col-end-4'>
          {rightArea}
        </div>

        {/* Row 2, Col 1: Horizontal Splitter */}
        <div className='bg-body transition-colors relative group row-start-2 row-end-3 col-start-1 col-end-2'>
          {/* Horizontal Drag Knob */}
          <div
            className={classNames(
              'absolute top-1/2 left-1/2 w-6 h-6 rounded-full cursor-row-resize transition-all duration-200 z-60',
              'transform -translate-x-1/2 -translate-y-1/2',
              'opacity-0 group-hover:opacity-50 hover:opacity-75!',
              'bg-white shadow-lg border border-white/20',
              'flex items-center justify-center',
              isDragging === 'horizontal' && 'opacity-100! scale-110',
            )}
            onMouseDown={handleHorizontalKnobDrag}
          >
            {/* Horizontal grip lines */}
            <div className='flex flex-col space-y-0.5'>
              <div className='w-3 h-px bg-gray-400'></div>
              <div className='w-3 h-px bg-gray-400'></div>
              <div className='w-3 h-px bg-gray-400'></div>
            </div>
          </div>
        </div>

        {/* Row 3, Col 1: Bottom Panel */}
        <div className='bg-surface min-w-0 min-h-0 overflow-auto scrollbar-hide row-start-3 row-end-4 col-start-1 col-end-2'>
          {bottomArea}
        </div>
      </div>
    </div>
  )
}

// Mobile layout - stacked
function MobileGridLayout({ className, chartArea, rightArea, bottomArea }: Props) {
  return (
    <div className={classNames('w-full', className)}>
      <div className='flex flex-col w-full gap-1'>
        <div className='bg-surface w-full'>{chartArea}</div>
        <div className='bg-surface w-full'>{rightArea}</div>
        <div className='bg-surface w-full'>{bottomArea}</div>
      </div>
    </div>
  )
}

export default function GridWithSplitters(props: Props) {
  return isMobile ? <MobileGridLayout {...props} /> : <DesktopGridLayout {...props} />
}
