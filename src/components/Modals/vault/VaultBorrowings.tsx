import { useEffect, useMemo, useState } from 'react'
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
  borrowings: Map<string, BigNumber>
  onChangeBorrowings: (borrowings: Map<string, BigNumber>) => void
}

export default function VaultBorrowings(props: Props) {
  const { data: prices } = usePrices()
  const { data: marketAssets } = useMarketAssets()
  const selectedBorrowDenoms = useStore((s) => s.selectedBorrowDenoms)

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

    const newBorrowings = new Map().set(
      denom,
      maxAmounts.get(denom)?.times(value).div(100).toPrecision(0) || BN(0),
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
      <Button text='Select borrow assets +' color='tertiary' onClick={addAsset} />
      <Divider />
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
      <Button color='primary' text='Deposit' rightIcon={<ArrowRight />} />
    </div>
  )
}
