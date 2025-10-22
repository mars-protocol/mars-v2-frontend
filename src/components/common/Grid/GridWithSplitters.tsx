import classNames from 'classnames'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface Props {
  className?: string
  chartArea: ReactNode
  rightArea: ReactNode
  bottomArea: ReactNode
}

export default function GridWithSplitters({ className, chartArea, rightArea, bottomArea }: Props) {
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
  const layoutStyles = useMemo(() => {
    const rightWidthPercent = 100 - chartWidthPercent
    const bottomHeightPercent = 100 - chartHeightPercent

    return {
      chart: {
        left: '0%',
        top: '0%',
        width: `calc(${chartWidthPercent}% - 2px)`,
        height: `calc(${chartHeightPercent}% - 2px)`,
      },
      right: {
        left: `calc(${chartWidthPercent}% + 2px)`,
        top: '0%',
        width: `calc(${rightWidthPercent}% - 2px)`,
        height: '100%',
      },
      bottom: {
        left: '0%',
        top: `calc(${chartHeightPercent}% + 2px)`,
        width: `calc(${chartWidthPercent}% - 2px)`,
        height: `calc(${bottomHeightPercent}% - 2px)`,
      },
      verticalSplitter: {
        left: `${chartWidthPercent}%`,
        transform: 'translateX(-50%)',
      },
      horizontalSplitter: {
        top: `${chartHeightPercent}%`,
        width: `${chartWidthPercent}%`,
        transform: 'translateY(-50%)',
      },
    }
  }, [chartWidthPercent, chartHeightPercent])

  return (
    <div ref={containerRef} className={classNames('relative w-full', className)}>
      {/* Drag Overlay - Prevents TradingView chart from capturing mouse events */}
      {isDragging && (
        <div
          className={classNames(
            'fixed inset-0 z-[9999]',
            isDragging === 'vertical' ? 'cursor-col-resize' : 'cursor-row-resize',
          )}
          style={{ userSelect: 'none' }}
        />
      )}

      {/* Mobile Layout - Stacked */}
      <div className='flex flex-col w-full h-full gap-1 md:hidden'>
        <div className='bg-surface w-full h-[500px] flex-shrink-0'>{chartArea}</div>
        <div className='bg-surface w-full flex-1'>{rightArea}</div>
        <div className='bg-surface w-full flex-1'>{bottomArea}</div>
      </div>

      {/* Desktop Layout - Grid with Splitters */}
      <div className='hidden md:block relative w-full h-full'>
        {/* Chart Area */}
        <div className='absolute' style={layoutStyles.chart}>
          {chartArea}
        </div>

        {/* Right Panel */}
        <div className='absolute' style={layoutStyles.right}>
          {rightArea}
        </div>

        {/* Bottom Panel */}
        <div className='absolute bg-surface' style={layoutStyles.bottom}>
          {bottomArea}
        </div>

        {/* Vertical Splitter - between chart and right panel */}
        <div
          className='absolute top-0 bottom-0 w-1 bg-body transition-colors z-30 group'
          style={layoutStyles.verticalSplitter}
        >
          {/* Vertical Drag Knob */}
          <div
            className={classNames(
              'absolute top-1/2 left-1/2 w-6 h-6 rounded-full cursor-col-resize transition-all duration-200 z-[60]',
              'transform -translate-x-1/2 -translate-y-1/2',
              'opacity-0 group-hover:opacity-50 hover:!opacity-75',
              'bg-white shadow-lg border border-white/20',
              'flex items-center justify-center',
              isDragging === 'vertical' && '!opacity-100 scale-110',
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

        {/* Horizontal Splitter - between chart and bottom panel */}
        <div
          className='absolute left-0 h-1 bg-body transition-colors z-50 group'
          style={layoutStyles.horizontalSplitter}
        >
          {/* Horizontal Drag Knob */}
          <div
            className={classNames(
              'absolute top-1/2 left-1/2 w-6 h-6 rounded-full cursor-row-resize transition-all duration-200 z-[60]',
              'transform -translate-x-1/2 -translate-y-1/2',
              'opacity-0 group-hover:opacity-50 hover:!opacity-75',
              'bg-white shadow-lg border border-white/20',
              'flex items-center justify-center',
              isDragging === 'horizontal' && '!opacity-100 scale-110',
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
      </div>
    </div>
  )
}
