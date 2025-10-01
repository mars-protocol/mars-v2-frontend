import classNames from 'classnames'
import { ReactElement, ReactNode, useCallback, useRef, useState } from 'react'

import Text from 'components/common/Text'

interface Props {
  children: ReactNode
  className?: string
  contentClassName?: string
  onClick?: () => void
  title?: string | ReactElement
  id?: string
  showOverflow?: boolean
  isTab?: boolean
  defaultWidth?: number
  defaultHeight?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  resizable?: boolean
}

export default function ResizableCard(props: Props) {
  const {
    resizable = false,
    defaultWidth = 300,
    defaultHeight = 200,
    minWidth = 200,
    minHeight = 150,
    maxWidth = 800,
    maxHeight = 600,
  } = props

  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight })
  const [isResizing, setIsResizing] = useState(false)
  const cardRef = useRef<HTMLElement>(null)
  const startPos = useRef({ x: 0, y: 0 })
  const startSize = useRef({ width: 0, height: 0 })

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!resizable) return

      e.preventDefault()
      setIsResizing(true)
      startPos.current = { x: e.clientX, y: e.clientY }
      startSize.current = { width: size.width, height: size.height }

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startPos.current.x
        const deltaY = e.clientY - startPos.current.y

        const newWidth = Math.min(maxWidth, Math.max(minWidth, startSize.current.width + deltaX))
        const newHeight = Math.min(
          maxHeight,
          Math.max(minHeight, startSize.current.height + deltaY),
        )

        setSize({ width: newWidth, height: newHeight })
      }

      const handleMouseUp = () => {
        setIsResizing(false)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [resizable, size, minWidth, minHeight, maxWidth, maxHeight],
  )

  const isTab = props.isTab ?? false

  return (
    <section
      ref={cardRef}
      id={props.id}
      onClick={props.onClick}
      style={resizable ? { width: size.width, height: size.height } : undefined}
      className={classNames(
        props.className,
        'flex flex-col',
        'relative isolate max-w-full',
        resizable ? 'resize-none' : 'max-h-full',
        !props.showOverflow && 'overflow-hidden',
        isTab ? '' : 'bg-surface rounded-lg',
        resizable && 'transition-none',
      )}
    >
      {typeof props.title === 'string' ? (
        <div className='flex items-center justify-between w-full px-3 py-2 font-semibold bg-surface rounded-t-lg'>
          <Text size='sm'>{props.title}</Text>
          {resizable && (
            <div className='flex items-center gap-1'>
              <button
                className='text-xs text-grey-light hover:text-white transition-colors'
                onClick={(e) => {
                  e.stopPropagation()
                  setSize({ width: defaultWidth, height: defaultHeight })
                }}
              >
                Reset
              </button>
            </div>
          )}
        </div>
      ) : typeof props.title === 'object' ? (
        props.title
      ) : null}

      <div
        className={classNames(
          'w-full flex-1',
          resizable ? 'overflow-auto' : '',
          props.contentClassName,
        )}
      >
        {props.children}
      </div>

      {resizable && (
        <div
          className={classNames(
            'absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize',
            ' hover:bg-white/10 transition-colors',
            'flex items-center justify-center',
            isResizing && 'bg-grey-light',
          )}
          onMouseDown={handleMouseDown}
        >
          <div className='w-2 h-2 border-r-2 border-b-2 border-current opacity-60' />
        </div>
      )}
    </section>
  )
}
