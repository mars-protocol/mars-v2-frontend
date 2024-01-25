import { useCallback, useEffect } from 'react'

import Button from 'components/common/Button/index'
import { Cross } from 'components/common/Icons'

interface Props {
  enableKeyPress?: boolean
  hideText?: boolean
  className?: string
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
      leftIcon={<Cross size={16} />}
      iconClassName='w-3'
      color='tertiary'
      className={props.className ? props.className : 'h-8 w-8'}
      size='xs'
    />
  )
}
