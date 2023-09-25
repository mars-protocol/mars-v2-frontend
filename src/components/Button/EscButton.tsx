import { useCallback, useEffect } from 'react'

import Button from 'components/Button'
import { Cross } from 'components/Icons'
import Text from 'components/Text'

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
      leftIcon={<Cross />}
      iconClassName='w-3'
      color='tertiary'
      className={props.className ? props.className : 'h-3 w-13'}
      size='xs'
    >
      {!props.hideText && <Text size='2xs'>ESC</Text>}
    </Button>
  )
}
