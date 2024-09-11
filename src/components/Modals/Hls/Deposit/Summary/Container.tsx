import React from 'react'

import Text from 'components/common/Text'

interface Props {
  children: React.ReactNode
  title: string
}
export default function Container(props: Props) {
  return (
    <div>
      <Text size='xs' className='text-white/60 mb-2 uppercase'>
        {props.title}
      </Text>
      <div className='p-3 rounded-sm bg-black/20'>{props.children}</div>
    </div>
  )
}
