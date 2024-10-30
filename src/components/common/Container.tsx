import React from 'react'

import Text from 'components/common/Text'

interface Props {
  children: React.ReactNode
  title: string
  className?: string
}
export default function Container(props: Props) {
  return (
    <div className={props.className}>
      <Text size='xs' className='mb-2 text-white/60' uppercase={true}>
        {props.title}
      </Text>
      <div className='p-3 rounded-sm bg-black/20'>{props.children}</div>
    </div>
  )
}
