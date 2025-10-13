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
        <div key={item.title} className='grid grid-cols-[min-content,auto] items-center'>
          <span
            className={classNames(
              'rounded-sm relative h-10 w-10 p-3 mr-6 grid place-items-center bg-white/10 border border-white/20',
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
