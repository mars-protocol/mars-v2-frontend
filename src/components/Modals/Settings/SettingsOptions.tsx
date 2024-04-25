import classNames from 'classnames'
import { ReactNode } from 'react'

import Text from 'components/common/Text'

interface Props {
  label: string
  description: string
  className?: string
  children: ReactNode | ReactNode[]
  fullwidth?: boolean
}

export default function SettingsOptions(props: Props) {
  return (
    <div
      className={classNames(
        'mb-4 flex w-full flex-wrap gap-4 items-start justify-between border-b border-white/5',
        'md:mb-6 md:flex-nowrap md:gap-0',
        props.className,
      )}
    >
      <div className={classNames('flex flex-wrap', props.fullwidth ? 'w-full' : 'w-120')}>
        <Text size='lg' className='w-full mb-2'>
          {props.label}
        </Text>
        <Text size='xs' className='text-white/50'>
          {props.description}
        </Text>
      </div>
      <div
        className={classNames('flex flex-wrap', props.fullwidth ? 'w-full' : 'w-60 justify-end')}
      >
        {props.children}
      </div>
    </div>
  )
}
