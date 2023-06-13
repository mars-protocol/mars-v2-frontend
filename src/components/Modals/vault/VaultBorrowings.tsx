import { useEffect, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import React from 'react'

import { BN } from 'utils/helpers'
import { getAssetByDenom } from 'utils/assets'
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

interface Props {
  account: Account
  borrowings: Map<string, BigNumber>
  primaryAmount: BigNumber
  secondaryAmount: BigNumber
  primaryAsset: Asset
  secondaryAsset: Asset
  onChangeBorrowings: (borrowings: Map<string, BigNumber>) => void
}

export default function VaultBorrowings(props: Props) {
  const { data: prices } = usePrices()
  const primaryPrice = usePrice(props.primaryAsset.denom)
  const secondaryPrice = usePrice(props.secondaryAsset.denom)
  const { data: marketAssets } = useMarketAssets()
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
    return Array.from(props.borrowings.entries()).reduce((prev, [denom, amount]) => {
      const price = prices.find((price) => price.denom === denom)?.amount
      if (!price) return prev

      return prev.plus(amount.times(price))
    }, BN(0) as BigNumber)
  }, [props.borrowings])

  const totalValue = useMemo(
    () => primaryValue.plus(secondaryValue).plus(borrowingValue),
    [primaryValue, secondaryValue, borrowingValue],
  )

  useEffect(() => {
    const updatedBorrowings = new Map()

    selectedBorrowDenoms.forEach((denom) => {
      const amount = props.borrowings.get(denom) || BN(0)
      updatedBorrowings.set(denom, amount)
    })
    props.onChangeBorrowings(updatedBorrowings)
    // Ignore of props is required to prevent infinite loop.
    // THis is needed because of selectedDenoms is extrapolated into the store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBorrowDenoms])

  const maxAmounts: Map<string, BigNumber> = useMemo(
    () =>
      calculateMaxBorrowAmounts(
        props.account,
        marketAssets,
        prices,
        Array.from(props.borrowings.keys()),
      ),
    [props.borrowings, marketAssets, prices, props.account],
  )

  const [percentage, setPercentage] = useState<number>(0)

  function onChangeSlider(value: number) {
    if (props.borrowings.size !== 1) return

    const denom = Array.from(props.borrowings.keys())[0]
    const currentAmount = props.borrowings.get(denom) ?? BN(0)
    const maxAmount = maxAmounts.get(denom) ?? BN(0)
    const newBorrowings = new Map().set(
      denom,
      maxAmount.plus(currentAmount).times(value).div(100).decimalPlaces(0) || BN(0),
    )

    props.onChangeBorrowings(newBorrowings)
    setPercentage(value)
  }

  function updateAssets(denom: string, amount: BigNumber) {
    const newborrowings = new Map(props.borrowings)
    newborrowings.set(denom, amount)
    props.onChangeBorrowings(newborrowings)
  }

  function onDelete(denom: string) {
    const newborrowings = new Map(props.borrowings)
    newborrowings.delete(denom)
    props.onChangeBorrowings(newborrowings)
    useStore.setState({ selectedBorrowDenoms: Array.from(newborrowings.keys()) })
  }

  function addAsset() {
    useStore.setState({ addVaultBorrowingsModal: true })
  }

  return (
    <div className='flex flex-grow flex-col gap-4 p-4'>
      {Array.from(props.borrowings.entries()).map(([denom, amount]) => {
        const asset = getAssetByDenom(denom)
        if (!asset) return <React.Fragment key={`input-${denom}`}></React.Fragment>
        return (
          <TokenInput
            key={`input-${denom}`}
            amount={amount}
            asset={asset}
            max={maxAmounts.get(denom)?.plus(amount) || BN(0)}
            maxText='Max Borrow'
            onChange={(amount) => updateAssets(denom, amount)}
            onDelete={() => onDelete(denom)}
          />
        )
      })}
      {props.borrowings.size === 1 && <Slider onChange={onChangeSlider} value={percentage} />}
      {props.borrowings.size === 0 && (
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
        {Array.from(props.borrowings.entries()).map(([denom, amount]) => {
          const asset = getAssetByDenom(denom)
          const borrowRate = marketAssets?.find((market) => market.denom === denom)?.borrowRate

          if (!asset || !borrowRate)
            return <React.Fragment key={`borrow-rate-${denom}`}></React.Fragment>
          return (
            <div key={`borrow-rate-${denom}`} className='flex justify-between'>
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
