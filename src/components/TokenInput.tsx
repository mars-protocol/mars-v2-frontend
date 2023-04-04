import Image from 'next/image'

import BigNumber from 'bignumber.js'
import NumberInput from 'components/NumberInput'
import { Text } from 'components/Text'
import { useState } from 'react'

interface Props {
  amount: number
  max: number
  asset: Asset
  onChange: (amount: number) => void
}

export default function TokenInput(props: Props) {
  return (
    <div className='flex w-full flex-col gap-2'>
      <div className='box-content flex h-11 w-full rounded-sm border border-white/20 bg-white/5'>
        <div className='flex min-w-fit items-center gap-2 border-r border-white/20 bg-white/5 p-3'>
          <Image src={props.asset.logo} alt='token' width={20} height={20} />
          <Text size='base'>{props.asset.symbol}</Text>
        </div>
        <NumberInput
          asset={props.asset}
          maxDecimals={props.asset.decimals}
          onChange={props.onChange}
          amount={props.amount}
          max={props.max}
          className='border-none p-3'
        />
      </div>
      <div className='flex justify-between'>
        <Text size='xs' className='text-white/50' monospace>
          1 OSMO = $0.9977
        </Text>
        <Text size='xs' monospace className='text-white/50'>
          ~ $0.00
        </Text>
      </div>
    </div>
  )
}
