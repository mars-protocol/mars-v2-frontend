import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import Image from 'next/image'

import DisplayCurrency from 'components/DisplayCurrency'
import NumberInput from 'components/NumberInput'
import Select from 'components/Select/Select'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import useStore from 'store'
import { BN } from 'utils/helpers'
import { FormattedNumber } from 'components/FormattedNumber'
import Button from 'components/Button'

interface Props {
  amount: BigNumber
  asset: Asset
  max: BigNumber
  onChange: (amount: BigNumber) => void
  accountId?: string
  balances?: Coin[]
  className?: string
  disabled?: boolean
  hasSelect?: boolean
  maxText?: string
  onChangeAsset?: (asset: Asset) => void
}

export default function TokenInput(props: Props) {
  const baseCurrency = useStore((s) => s.baseCurrency)

  function onMaxBtnClick() {
    if (!props.max) return
    props.onChange(BN(props.max))
  }

  function onChangeAsset(denom: string) {
    if (!props.onChangeAsset) return
    const newAsset = ASSETS.find((asset) => asset.denom === denom) ?? baseCurrency
    props.onChangeAsset(newAsset)
  }

  return (
    <div
      className={classNames(
        'flex w-full flex-col gap-2 transition-opacity',
        props.className,
        props.disabled && 'pointer-events-none opacity-50',
      )}
    >
      <div className='relative isolate z-40 box-content flex h-11 w-full rounded-sm border border-white/20 bg-white/5'>
        {props.hasSelect && props.balances ? (
          <Select
            options={props.balances}
            defaultValue={props.asset.denom}
            onChange={onChangeAsset}
            title={props.accountId ? `Account ${props.accountId}` : 'Your Wallet'}
            className='border-r border-white/20 bg-white/5'
          />
        ) : (
          <div className='flex min-w-fit items-center gap-2 border-r border-white/20 bg-white/5 p-3'>
            <Image src={props.asset.logo} alt='token' width={20} height={20} />
            <Text>{props.asset.symbol}</Text>
          </div>
        )}
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

      <div className='flex'>
        <div className='flex flex-1 items-center'>
          {props.max && props.maxText && (
            <>
              <Text size='xs' className='mr-1 text-white' monospace>
                {`${props.maxText}:`}
              </Text>
              <FormattedNumber
                className='mr-1 text-xs text-white/50'
                amount={props.max?.toNumber() || 0}
                options={{ decimals: props.asset.decimals }}
              />
              <Button
                color='tertiary'
                className='h-4 bg-white/20 px-1.5 py-0.5 text-2xs'
                variant='transparent'
                onClick={onMaxBtnClick}
              >
                MAX
              </Button>
            </>
          )}
        </div>
        <div className='flex'>
          <DisplayCurrency
            isApproximation
            className='inline pl-0.5 text-xs text-white/50'
            coin={{ denom: props.asset.denom, amount: props.amount.toString() }}
          />
        </div>
      </div>
    </div>
  )
}
