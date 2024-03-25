import React from 'react'

import Text from 'components/common/Text'
import { produceCountdown } from 'utils/formatters'

export const UNLOCK_TIME_META = { accessorKey: 'unlocksAt', header: 'Unlock time left' }

interface Props {
  unlocksAt?: number
}

export default function UnlockTime(props: Props) {
  return (
    <Text
      className='group/label relative h-5 w-[84px] rounded-sm bg-green text-center leading-5 text-white ml-auto'
      size='xs'
    >
      {props.unlocksAt ? produceCountdown(props.unlocksAt - Date.now()) : 'Unlocked'}
    </Text>
  )
}
