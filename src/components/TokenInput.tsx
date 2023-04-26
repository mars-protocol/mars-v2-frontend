import classNames from 'classnames'
import Image from 'next/image'
import BigNumber from 'bignumber.js'

import NumberInput from 'components/NumberInput'
import Text from 'components/Text'

import { Button } from './Button'
import DisplayCurrency from './DisplayCurrency'

interface Props {
  amount: BigNumber
  max: BigNumber
  asset: Asset
  onChange: (amount: BigNumber) => void
  className?: string
  disabled?: boolean
}

export default function TokenInput(props: Props) {
  function onClickMax() {
    props.onChange(props.max)
  }

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
        <Button onClick={onClickMax} variant='transparent'>
          <Text size='xs' className='mr-1 font-bold text-martian-red' tag='span'>
            Max:
          </Text>
          <Text size='xs' className='text-white/50' tag='span' monospace>
            {props.max.toString()}
          </Text>
        </Button>
        <DisplayCurrency
          className='text-xs text-white/50'
          coin={{ amount: props.amount.toString(), denom: props.asset.denom }}
          isApproximation
        />
      </div>
    </div>
  )
}
