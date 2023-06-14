import { useEffect, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import React from 'react'

import { BN } from 'utils/helpers'
import { findCoinByDenom, getAssetByDenom } from 'utils/assets'
import Button from 'components/Button'
import TokenInput from 'components/TokenInput'
import Divider from 'components/Divider'
import Text from 'components/Text'
import { ArrowRight, ExclamationMarkCircled } from 'components/Icons'
import { formatPercent } from 'utils/formatters'
import Slider from 'components/Slider'
import usePrices from 'hooks/usePrices'
import useMarketAssets from 'hooks/useMarketAssets'
import { calculateMaxBorrowAmounts } from 'utils/vaults'
import useStore from 'store'
import DisplayCurrency from 'components/DisplayCurrency'
import usePrice from 'hooks/usePrice'
import { BNCoin } from 'types/classes/BNCoin'

export interface VaultBorrowingsProps {
  account: Account
  borrowings: BNCoin[]
  primaryAmount: BigNumber
  secondaryAmount: BigNumber
  primaryAsset: Asset
  secondaryAsset: Asset
  onChangeBorrowings: (borrowings: BNCoin[]) => void
}

export default function VaultBorrowings(props: VaultBorrowingsProps) {
  const { data: marketAssets } = useMarketAssets()
  const { data: prices } = usePrices()
  const primaryPrice = usePrice(props.primaryAsset.denom)
  const secondaryPrice = usePrice(props.secondaryAsset.denom)
  const baseCurrency = useStore((s) => s.baseCurrency)
  const selectedBorrowDenoms = useStore((s) => s.selectedBorrowDenoms)

  const primaryValue = useMemo(
    () => props.primaryAmount.times(primaryPrice),
    [props.primaryAmount, primaryPrice],
  )
  const secondaryValue = useMemo(
    () => props.secondaryAmount.times(secondaryPrice),
    [props.secondaryAmount, secondaryPrice],
  )

  const borrowingValue = useMemo(() => {
    return props.borrowings.reduce((prev, curr) => {
      const price = prices.find((price) => price.denom === curr.denom)?.amount
      if (!price) return prev

      return prev.plus(curr.amount.times(price))
    }, BN(0) as BigNumber)
  }, [props.borrowings, prices])

  const totalValue = useMemo(
    () => primaryValue.plus(secondaryValue).plus(borrowingValue),
    [primaryValue, secondaryValue, borrowingValue],
  )

  useEffect(() => {
    const updatedBorrowings = selectedBorrowDenoms.map((denom) => {
      const amount = findCoinByDenom(denom, props.borrowings)?.amount || BN(0)
      return new BNCoin({
        denom,
        amount: amount.toString()
      })
    })
    props.onChangeBorrowings(updatedBorrowings)
    // Ignore of props is required to prevent infinite loop.
    // THis is needed because of selectedDenoms is extrapolated into the store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBorrowDenoms])

  const maxAmounts: BNCoin[] = useMemo(
    () =>
      calculateMaxBorrowAmounts(
        props.account,
        marketAssets,
        prices,
        props.borrowings.map((coin) => coin.denom)
      ),
    [props.borrowings, marketAssets, prices, props.account],
  )

  const [percentage, setPercentage] = useState<number>(0)

  function onChangeSlider(value: number) {
    if (props.borrowings.length !== 1) return

    const denom = props.borrowings[0].denom
    const currentAmount = props.borrowings[0].amount
    const maxAmount = maxAmounts.find((coin) => coin.denom === denom)?.amount ?? BN(0)
    const newBorrowings: BNCoin[] = [new BNCoin({
      denom,
      amount: (maxAmount.plus(currentAmount).times(value).div(100).decimalPlaces(0) || BN(0)).toString(),
    })]

    props.onChangeBorrowings(newBorrowings)
    setPercentage(value)
  }

  function updateAssets(denom: string, amount: BigNumber) {
    const index = props.borrowings.findIndex((coin) => coin.denom === denom)
    props.borrowings[index].amount = amount
    props.onChangeBorrowings([...props.borrowings])
  }

  function onDelete(denom: string) {
    const index = props.borrowings.findIndex((coin) => coin.denom === denom)
    props.borrowings.splice(index, 1)
    props.onChangeBorrowings([...props.borrowings])
    useStore.setState({ selectedBorrowDenoms: props.borrowings.map((coin) => coin.denom) })
  }

  function addAsset() {
    useStore.setState({ addVaultBorrowingsModal: true })
  }

  return (
    <div className='flex flex-grow flex-col gap-4 p-4'>
      {props.borrowings.map((coin) => {
        const asset = getAssetByDenom(coin.denom)
        const maxAmount = maxAmounts.find((maxAmount) => maxAmount.denom === coin.denom)?.amount
        if (!asset || !maxAmount) return <React.Fragment key={`input-${coin.denom}`}></React.Fragment>
        return (
          <TokenInput
            key={`input-${coin.denom}`}
            amount={coin.amount}
            asset={asset}
            max={maxAmount.plus(coin.amount)}
            maxText='Max Borrow'
            onChange={(amount) => updateAssets(coin.denom, amount)}
            onDelete={() => onDelete(coin.denom)}
          />
        )
      })}
      {props.borrowings.length === 1 && <Slider onChange={onChangeSlider} value={percentage} />}
      {props.borrowings.length === 0 && (
        <div className='flex items-center gap-4 py-2'>
          <div className='w-4'>
            <ExclamationMarkCircled width={20} height={20} />
          </div>
          <Text size='xs'>
            You have no borrowing assets selected. Click on select borrow assets if you would like
            to add assets to borrow.
          </Text>
        </div>
      )}
      <Button text='Select borrow assets +' color='tertiary' onClick={addAsset} />
      <Divider />
      <div className='flex flex-col gap-2'>
        <div className='flex justify-between'>
          <Text className='text-white/50'>{`${props.primaryAsset.symbol}-${props.secondaryAsset.symbol} Position Value`}</Text>
          <DisplayCurrency coin={{ denom: baseCurrency.denom, amount: totalValue.toString() }} />
        </div>
        {props.borrowings.map((coin) => {
          const asset = getAssetByDenom(coin.denom)
          const borrowRate = marketAssets?.find((market) => market.denom === coin.denom)?.borrowRate

          if (!asset || !borrowRate)
            return <React.Fragment key={`borrow-rate-${coin.denom}`}></React.Fragment>
          return (
            <div key={`borrow-rate-${coin.denom}`} className='flex justify-between'>
              <Text className='text-white/50'>Borrow APR {asset.symbol}</Text>
              <Text>{formatPercent(borrowRate)}</Text>
            </div>
          )
        })}
      </div>
      <Button color='primary' text='Deposit' rightIcon={<ArrowRight />} />
    </div>
  )
}
