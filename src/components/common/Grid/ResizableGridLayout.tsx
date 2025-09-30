import classNames from 'classnames'
import React, { useCallback, useState } from 'react'
import { GridItem } from './GridItem'

export interface GridLayoutItem {
  id: string
  component: React.ReactNode
  gridArea: string
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  resizable?: boolean
  backgroundColor?: string
}

interface ResizableGridLayoutProps {
  items: GridLayoutItem[]
  className?: string
  gap?: number
  columns?: string
  rows?: string
  onItemResize?: (id: string, width: number, height: number) => void
}

export const ResizableGridLayout: React.FC<ResizableGridLayoutProps> = ({
  items,
  className,
  gap = 8,
  columns = 'repeat(12, 1fr)',
  rows = 'repeat(8, 1fr)',
  onItemResize,
}) => {
  const [itemSizes, setItemSizes] = useState<Record<string, { width: number; height: number }>>({})

  const handleItemResize = useCallback(
    (id: string, width: number, height: number) => {
      setItemSizes((prev) => ({
        ...prev,
        [id]: { width, height },
      }))
      onItemResize?.(id, width, height)
    },
    [onItemResize],
  )

  return (
    <div
      className={classNames('grid h-full w-full', className)}
      style={{
        gridTemplateColumns: columns,
        gridTemplateRows: rows,
        gap: `${gap}px`,
      }}
    >
      {items.map((item) => (
        <GridItem
          key={item.id}
          gridArea={item.gridArea}
          minWidth={item.minWidth}
          minHeight={item.minHeight}
          maxWidth={item.maxWidth}
          maxHeight={item.maxHeight}
          resizable={item.resizable}
          backgroundColor={item.backgroundColor}
          onResize={(width, height) => handleItemResize(item.id, width, height)}
        >
          {item.component}
        </GridItem>
      ))}
    </div>
  )
}
