import { useCallback, useEffect } from 'react'

import Button from 'components/common/Button/index'
import { Cross } from 'components/common/Icons'

interface Props {
  enableKeyPress?: boolean
  hideText?: boolean
  className?: string
  icon?: React.ReactNode
  onClick: () => void
}

export default function EscButton(props: Props) {
  const handleEscKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        props.onClick()
      }
    },
    [props],
  )

  useEffect(() => {
    if (props.enableKeyPress) {
      document.addEventListener('keydown', handleEscKey)
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [props.onClick, props.enableKeyPress, handleEscKey])

  return (
    <Button
      onClick={props.onClick}
      leftIcon={props.icon ?? <Cross />}
      iconClassName='w-full'
      color='tertiary'
      className={props.className ? props.className : 'h-8 w-8 !p-2.5'}
      size='xs'
    />
  )
}
