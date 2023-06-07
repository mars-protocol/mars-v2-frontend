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
import { ExclamationMarkTriangle, TrashBin } from 'components/Icons'
import { Tooltip } from 'components/Tooltip'

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
  warning?: string
  onChangeAsset?: (asset: Asset) => void
  onDelete?: () => void
}

export default function TokenInput(props: Props) {
  const baseCurrency = useStore((s) => s.baseCurrency)

  function onMaxBtnClick() {
    props.onChange(BN(props.max))
  }

  function onChangeAsset(denom: string) {
    if (!props.onChangeAsset) return
    const newAsset = ASSETS.find((asset) => asset.denom === denom) ?? baseCurrency
    props.onChangeAsset(newAsset)
  }

  return (
    <div
      data-testid='token-input-component'
      className={classNames('flex w-full flex-col gap-2 transition-opacity', props.className, {
        'pointer-events-none opacity-50': props.disabled,
      })}
    >
      <div
        data-testid='token-input-wrapper'
        className={classNames(
          'relative isolate z-40 box-content flex h-11 w-full rounded-sm border bg-white/5',
          props.warning ? 'border-warning' : 'border-white/20',
        )}
      >
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
        {props.onDelete && (
          <div role='button' className='grid items-center pr-2' onClick={props.onDelete}>
            <TrashBin width={16} />
          </div>
        )}
        {props.warning && (
          <div className='grid items-center px-2'>
            <Tooltip
              content={`You don't have any ${props.asset.symbol}. Please first deposit ${props.asset.symbol} into your credit account before.`}
              type='info'
              interactive
            >
              <ExclamationMarkTriangle className='text-warning' />
            </Tooltip>
          </div>
        )}
      </div>

      <div className='flex'>
        <div className='flex flex-1 items-center'>
          {props.maxText && (
            <>
              <Text size='xs' className='mr-1 text-white' monospace>
                {`${props.maxText}:`}
              </Text>
              <FormattedNumber
                className='mr-1 text-xs text-white/50'
                amount={props.max.toNumber()}
                options={{ decimals: props.asset.decimals }}
              />
              <Button
                dataTestId='token-input-max-button'
                color='tertiary'
                className='!h-4 !min-h-0 bg-white/20 !px-2 !py-0.5 text-2xs'
                variant='transparent'
                onClick={onMaxBtnClick}
                disabled={props.disabled}
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
