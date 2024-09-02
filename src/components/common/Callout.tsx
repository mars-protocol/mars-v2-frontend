import classNames from 'classnames'
import { useCallback } from 'react'

import { ExclamationMarkTriangle, InfoCircle } from 'components/common/Icons'
import Text from 'components/common/Text'

interface Props {
  children: string | React.ReactNode
  className?: string
  type: CalloutType
}

export function Callout(props: Props) {
  const Icon = useCallback(() => {
    switch (props.type) {
      case CalloutType.INFO:
        return <InfoCircle />
      case CalloutType.WARNING:
        return <ExclamationMarkTriangle />
    }
  }, [props.type])

  return (
    <div
      className={classNames(
        'grid grid-cols-[20px,auto] py-2 pl-2 pr-4 gap-1 rounded-md items-center',
        props.type === CalloutType.INFO && 'bg-purple/20 text-purple border-purple',
        props.type === CalloutType.WARNING && 'bg-info/20 text-info border-info border',
        props.className,
      )}
    >
      <div className='w-4'>
        <Icon />
      </div>
      <Text size='xs'>{props.children}</Text>
    </div>
  )
}

export enum CalloutType {
  INFO,
  WARNING,
}
