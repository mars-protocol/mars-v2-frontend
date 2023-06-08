import { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import React from 'react'

import { BN } from 'utils/helpers'
import { getAssetByDenom } from 'utils/assets'
import Button from 'components/Button'
import TokenInput from 'components/TokenInput'
import Divider from 'components/Divider'
import Text from 'components/Text'
import { ArrowRight } from 'components/Icons'
import { formatPercent } from 'utils/formatters'
import Slider from 'components/Slider'
import usePrices from 'hooks/usePrices'
import useMarketAssets from 'hooks/useMarketAssets'
import { calculateMaxBorrowAmounts } from 'utils/vaults'
import useStore from 'store'

interface Props {
  account: Account
  defaultBorrowDenom: string
  onChangeBorrowings: (borrowings: Map<string, BigNumber>) => void
}

export default function VaultBorrowings(props: Props) {
  const { data: prices } = usePrices()
  const { data: marketAssets } = useMarketAssets()

  const [borrowings, setBorrowings] = useState<Map<string, BigNumber>>(
    new Map().set(props.defaultBorrowDenom, BN(0)),
  )

  const maxAmounts: Map<string, BigNumber> = useMemo(
    () =>
      calculateMaxBorrowAmounts(props.account, marketAssets, prices, Array.from(borrowings.keys())),
    [borrowings, marketAssets, prices, props.account],
  )

  const [percentage, setPercentage] = useState<number>(0)

  function onChangeSlider(value: number) {
    if (borrowings.size !== 1) return

    const denom = Array.from(borrowings.keys())[0]

    const newBorrowings = new Map().set(
      denom,
      maxAmounts.get(denom)?.times(value).div(100).toPrecision(0) || BN(0),
    )
    setBorrowings(newBorrowings)
    props.onChangeBorrowings(newBorrowings)
    setPercentage(value)
  }

  function updateAssets(denom: string, amount: BigNumber) {
    const newborrowings = new Map(borrowings)
    newborrowings.set(denom, amount)
    setBorrowings(newborrowings)
    props.onChangeBorrowings(newborrowings)
  }

  function onDelete(denom: string) {
    const newborrowings = new Map(borrowings)
    newborrowings.delete(denom)
    setBorrowings(newborrowings)
    props.onChangeBorrowings(newborrowings)
  }

  function addAsset() {
    useStore.setState({ addVaultBorrowingsModal: true })
    const newborrowings = new Map(borrowings)
    // Replace with denom parameter from the modal (MP-2546)
    newborrowings.set('', BN(0))
    setBorrowings(newborrowings)
    props.onChangeBorrowings(newborrowings)
  }

  return (
    <div className='flex flex-grow flex-col gap-4 p-4'>
      {Array.from(borrowings.entries()).map(([denom, amount]) => {
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
      {borrowings.size === 1 && <Slider onChange={onChangeSlider} value={percentage} />}
      <Button text='Select borrow assets +' color='tertiary' onClick={addAsset} />
      <Divider />
      {Array.from(borrowings.entries()).map(([denom, amount]) => {
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
      <Button color='primary' text='Deposit' rightIcon={<ArrowRight />} />
    </div>
  )
}
