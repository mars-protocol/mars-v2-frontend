import { useCallback, useEffect } from 'react'

import classNames from 'classnames'
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
      leftIcon={<Cross />}
      iconClassName='w-3'
      color='tertiary'
      className={classNames('w-8 h-8', props.className)}
      size='xs'
    />
  )
}
