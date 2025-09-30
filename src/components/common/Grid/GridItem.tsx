import classNames from 'classnames'
import React from 'react'

interface GridItemProps {
  children: React.ReactNode
  className?: string
  gridArea?: string
  backgroundColor?: string
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
  className,
  gridArea,
  backgroundColor = 'bg-surface',
}) => {
  return (
    <div
      className={classNames('relative overflow-hidden w-full h-full', backgroundColor, className)}
      style={{
        gridArea,
      }}
    >
      {children}
    </div>
  )
}
