import classNames from 'classnames'
import { useMemo } from 'react'

import { CircularProgress } from 'components/common/CircularProgress'
import { ExclamationMarkTriangle, InfoCircle } from 'components/common/Icons'
import Text from 'components/common/Text'

interface Props {
  children: string | React.ReactNode
  className?: string
  iconClassName?: string
  type: CalloutType
}

export function Callout(props: Props) {
  const Icon = useMemo(() => {
    switch (props.type) {
      case CalloutType.INFO:
        return <InfoCircle />
      case CalloutType.WARNING:
        return <ExclamationMarkTriangle />
      case CalloutType.LOADING:
        return <CircularProgress className='w-4 h-4 mt-1 mr-1' />
    }
  }, [props.type])

  return (
    <div
      className={classNames(
        'grid grid-cols-[20px,auto] py-2 pl-2 pr-4 rounded-sm gap-1 items-center',
        props.type === CalloutType.INFO && 'bg-white/10 text-white border border-white/20',
        props.type === CalloutType.LOADING && 'bg-surface-light text-white border border-white/20',
        props.type === CalloutType.WARNING && 'bg-info/20 text-info border border-info',
        props.className,
      )}
    >
      <div className={classNames('w-4', props.iconClassName)}>{Icon}</div>
      <Text size='xs'>{props.children}</Text>
    </div>
  )
}

export enum CalloutType {
  INFO,
  LOADING,
  WARNING,
}
