import classNames from 'classnames'
import Image from 'next/image'
import BigNumber from 'bignumber.js'
import { useState } from 'react'

import BigNumber from 'bignumber.js'
import NumberInput from 'components/NumberInput'
import { Text } from 'components/Text'
import { useState } from 'react'

interface Props {
  amount: number
  max: number
  asset: Asset
  onChange: (amount: number) => void
  className?: string
  disabled?: boolean

}

export default function TokenInput(props: Props) {
  return (
    <div
      className={classNames(
        'flex w-full flex-col gap-2 transition-opacity',
        props.className,
        props.disabled && 'pointer-events-none opacity-50',
      )}
    >
      <div className='box-content flex h-11 w-full rounded-sm border border-white/20 bg-white/5'>
        <div className='flex min-w-fit items-center gap-2 border-r border-white/20 bg-white/5 p-3'>
          <Image src={props.asset.logo} alt='token' width={20} height={20} />
          <Text>{props.asset.symbol}</Text>
        </div>
        <NumberInput
          disabled={props.disabled}
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
