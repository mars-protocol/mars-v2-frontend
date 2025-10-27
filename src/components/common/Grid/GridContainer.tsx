import classNames from 'classnames'
import React from 'react'

interface GridContainerProps {
  children: React.ReactNode
  className?: string
  columns?: number
  rows?: number
  gap?: number
}

export const GridContainer: React.FC<GridContainerProps> = ({
  children,
  className,
  columns = 12,
  rows = 8,
  gap = 8,
}) => {
  return (
    <div
      className={classNames('grid h-full w-full', className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  )
}
