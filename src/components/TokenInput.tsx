import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import NumberInput from 'components/NumberInput'
import Select from 'components/Select/Select'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import useStore from 'store'
import { BN } from 'utils/helpers'
import { FormattedNumber } from 'components/FormattedNumber'
import { Button } from 'components/Button'

interface Props {
  amount: BigNumber
  maxText: string
  onChange: (amount: BigNumber) => void
  className?: string
  disabled?: boolean
  balances?: Coin[] | null
  accountId?: string
}

interface SingleProps extends Props {
  asset: Asset
  max: BigNumber
  hasSelect?: boolean
  onChangeAsset?: (asset: Asset, max: BigNumber) => void
}

interface SelectProps extends Props {
  asset?: Asset
  max?: BigNumber
  hasSelect: boolean
  onChangeAsset: (asset: Asset, max: BigNumber) => void
}

export default function TokenInput(props: SingleProps | SelectProps) {
  const baseCurrency = useStore((s) => s.baseCurrency)
  const [asset, setAsset] = useState<Asset>(props.asset ? props.asset : baseCurrency)
  const [coin, setCoin] = useState<Coin>({
    denom: props.asset ? props.asset.denom : baseCurrency.denom,
    amount: '0',
  })

  const selectedAssetDenom = props.asset ? props.asset.denom : baseCurrency.denom

  // TODO: Refactor the useEffect
  useEffect(
    () => {
      setDefaultAsset()
      updateAsset(asset.denom)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // TODO: Refactor the useEffect
  useEffect(() => {
    props.onChangeAsset && props.onChangeAsset(asset, coin ? BN(coin.amount) : BN(0))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin, asset])

  const updateAsset = useCallback(
    (coinDenom: string) => {
      const newAsset = ASSETS.find((asset) => asset.denom === coinDenom) ?? baseCurrency
      const newCoin = props.balances?.find((coin) => coin.denom === coinDenom)
      setAsset(newAsset)
      setCoin(newCoin ?? { denom: coinDenom, amount: '0' })
    },
    [props.balances, baseCurrency],
  )

  function setDefaultAsset() {
    if (!props.balances || props.balances?.length === 0) return setAsset(baseCurrency)
    if (props.balances.length === 1) {
      const balances = props.balances ?? []
      return setAsset(ASSETS.find((asset) => asset.denom === balances[0].denom) ?? baseCurrency)
    }
    return setAsset(ASSETS.find((asset) => asset.denom === selectedAssetDenom) ?? baseCurrency)
  }

  function onMaxBtnClick() {
    if (!props.max) return
    props.onChange(BN(props.max))
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
            defaultValue={coin.denom}
            onChange={(value) => updateAsset(value)}
            title={props.accountId ? `Account ${props.accountId}` : 'Your Wallet'}
            className='border-r border-white/20 bg-white/5'
          />
        ) : (
          <div className='flex min-w-fit items-center gap-2 border-r border-white/20 bg-white/5 p-3'>
            <Image src={asset.logo} alt='token' width={20} height={20} />
            <Text>{asset.symbol}</Text>
          </div>
        )}
        <NumberInput
          disabled={props.disabled}
          asset={asset}
          maxDecimals={asset.decimals}
          onChange={props.onChange}
          amount={props.amount}
          max={props.max}
          className='border-none p-3'
        />
      </div>

      <div className='flex'>
        <div className='flex flex-1 items-center'>
          <Text size='xs' className='mr-1 text-white' monospace>
            {`${props.maxText}:`}
          </Text>
          <FormattedNumber
            className='mr-1 text-xs text-white/50'
            amount={props.max?.toNumber() || 0}
            options={{ decimals: asset.decimals }}
          />
          <Button
            color='tertiary'
            className='h-4 bg-white/20 px-1.5 py-0.5 text-2xs'
            variant='transparent'
            onClick={onMaxBtnClick}
          >
            MAX
          </Button>
        </div>
        <div className='flex'>
          <DisplayCurrency
            isApproximation
            className='inline pl-0.5 text-xs text-white/50'
            coin={{ denom: asset.denom, amount: props.amount.toString() }}
          />
        </div>
      </div>
    </div>
  )
}
