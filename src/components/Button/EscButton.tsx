import { useCallback, useEffect } from 'react'

import Button from 'components/Button'
import { Cross } from 'components/Icons'
import Text from 'components/Text'

interface Props {
  enableKeyPress?: boolean
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
      className='h-3 w-13'
      size='xs'
    >
      <Text size='2xs'>ESC</Text>
    </Button>
  )
}
