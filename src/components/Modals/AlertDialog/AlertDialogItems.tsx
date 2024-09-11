import classNames from 'classnames'
import { ReactNode } from 'react'

import Text from 'components/common/Text'

interface Props {
  items: AlertDialogItem[]
}

interface AlertDialogItem {
  description: string
  icon: ReactNode
  title: string
}

export function AlertDialogItems(props: Props) {
  return (
    <div className='flex flex-col gap-8 pt-2 pb-8 pr-10'>
      {props.items.map((item) => (
        <div key={item.title} className='grid grid-cols-[min-content,auto]'>
          <span
            className={classNames(
              'rounded-sm relative h-10 w-10 p-3 bg-white/10 mr-6 grid place-items-center',
              'before:content-[" "] before:absolute before:inset-0 before:rounded-sm before:p-[1px] before:border-glas before:-z-1',
            )}
          >
            {item.icon}
          </span>
          <span className='flex flex-col'>
            <Text>{item.title}</Text>
            <Text className='text-sm text-white/60'>{item.description}</Text>
          </span>
        </div>
      ))}
    </div>
  )
}
