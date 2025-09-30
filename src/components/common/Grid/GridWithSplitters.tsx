import classNames from 'classnames'
import { ReactNode, useCallback, useRef, useState } from 'react'

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

  const handleVerticalSplit = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging('vertical')

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = (x / rect.width) * 100

      // Constrain between 60% and 85%
      const newWidth = Math.min(85, Math.max(60, percentage))
      setChartWidthPercent(newWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [])

  const handleHorizontalSplit = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging('horizontal')

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const y = e.clientY - rect.top
      const percentage = (y / rect.height) * 100

      // Constrain between 60% and 85%
      const newHeight = Math.min(85, Math.max(60, percentage))
      setChartHeightPercent(newHeight)
    }

    const handleMouseUp = () => {
      setIsDragging(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [])

  const rightWidthPercent = 100 - chartWidthPercent
  const bottomHeightPercent = 100 - chartHeightPercent

  return (
    <div ref={containerRef} className={classNames('relative w-full h-full', className)}>
      {/* Chart Area */}
      <div
        className='absolute bg-surface'
        style={{
          left: '0%',
          top: '0%',
          width: `calc(${chartWidthPercent}% - 0.5px)`,
          height: `calc(${chartHeightPercent}% - 0.5px)`,
        }}
      >
        {chartArea}
      </div>

      {/* Right Panel */}
      <div
        className='absolute bg-surface'
        style={{
          left: `calc(${chartWidthPercent}% + 0.5px)`,
          top: '0%',
          width: `calc(${rightWidthPercent}% - 0.5px)`,
          height: '100%',
        }}
      >
        {rightArea}
      </div>

      {/* Bottom Panel */}
      <div
        className='absolute bg-surface'
        style={{
          left: '0%',
          top: `calc(${chartHeightPercent}% + 0.5px)`,
          width: `calc(${chartWidthPercent}% - 0.5px)`,
          height: `calc(${bottomHeightPercent}% - 0.5px)`,
        }}
      >
        {bottomArea}
      </div>

      {/* Vertical Splitter - between chart and right panel */}
      <div
        className={classNames(
          'absolute top-0 bottom-0 w-1 cursor-col-resize bg-black hover:bg-white/20 transition-colors z-20',
          isDragging === 'vertical' && 'bg-white/40',
        )}
        style={{
          left: `${chartWidthPercent}%`,
          transform: 'translateX(-50%)',
        }}
        onMouseDown={handleVerticalSplit}
      />

      {/* Horizontal Splitter - between chart and bottom panel */}
      <div
        className={classNames(
          'absolute left-0 h-1 cursor-row-resize bg-black hover:bg-white/20 transition-colors z-20',
          isDragging === 'horizontal' && 'bg-white/40',
        )}
        style={{
          top: `${chartHeightPercent}%`,
          width: `${chartWidthPercent}%`,
          transform: 'translateY(-50%)',
        }}
        onMouseDown={handleHorizontalSplit}
      />
    </div>
  )
}
