import BigNumber from 'bignumber.js'
import React, { useEffect, useMemo } from 'react'

import Button from 'components/common/Button'
import DepositCapMessage from 'components/common/DepositCapMessage'
import Divider from 'components/common/Divider'
import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useMarkets from 'hooks/markets/useMarkets'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { findCoinByDenom } from 'utils/assets'
import { formatPercent, getCoinAmount, getCoinValue } from 'utils/formatters'

export default function FarmLeverage(props: HlsFarmLeverageProps) {
  const assets = useDepositEnabledAssets()
  const { borrowings, onChangeBorrowings, farm } = props
  const markets = useMarkets()
  const modal = useStore((s) => s.farmModal)
  const maxLeverage = modal?.maxLeverage ?? 0

  const depositValue = useMemo(() => {
    let depositValue = BN_ZERO
    props.deposits.forEach((deposit) => {
      const value = getCoinValue(deposit, assets)
      depositValue = depositValue.plus(value)
    })

    return depositValue
  }, [props.deposits, assets])

  const currentLeverage = useMemo(() => {
    const borrowValue = props.totalValue.minus(depositValue)
    return borrowValue.dividedBy(depositValue).plus(1).toNumber() || 1
  }, [props.totalValue, depositValue])

  const maxBorrowAmounts: BNCoin[] = useMemo(() => {
    return props.borrowings.map((borrowing) => {
      const maxBorrowValue = depositValue.times(maxLeverage - 1.1)
      const maxAmount = getCoinAmount(borrowing.denom, maxBorrowValue, assets)
      return new BNCoin({
        denom: borrowing.denom,
        amount: maxAmount.toString(),
      })
    })
  }, [props.borrowings, depositValue, maxLeverage, assets])

  useEffect(() => {
    const selectedBorrowDenoms = modal?.selectedBorrowDenoms || []
    if (
      borrowings.length === selectedBorrowDenoms.length &&
      borrowings.every((coin) => selectedBorrowDenoms.includes(coin.denom))
    ) {
      return
    }
    const updatedBorrowings = selectedBorrowDenoms.map((denom) => {
      const amount = findCoinByDenom(denom, borrowings)?.amount || BN_ZERO

      return new BNCoin({
        denom,
        amount: amount.toString(),
      })
    })
    onChangeBorrowings(updatedBorrowings)
  }, [modal, maxBorrowAmounts, borrowings, onChangeBorrowings])

  function updateAssets(denom: string, amount: BigNumber) {
    const index = props.borrowings.findIndex((coin) => coin.denom === denom)
    props.borrowings[index].amount = amount
    props.onChangeBorrowings([...props.borrowings])
  }

  return (
    <div className='flex flex-col flex-1 gap-4 p-4'>
      {props.borrowings.map((coin) => {
        const asset = assets.find(byDenom(coin.denom))
        const maxAmount = maxBorrowAmounts.find(byDenom(coin.denom))?.amount ?? BN_ZERO
        if (!asset || !maxAmount)
          return <React.Fragment key={`input-${coin.denom}`}></React.Fragment>

        return (
          <TokenInputWithSlider
            amount={coin.amount}
            asset={asset}
            max={maxAmount}
            onChange={(amount) => updateAssets(coin.denom, amount)}
            maxText='Max Borrow'
            leverage={{
              current: currentLeverage,
              max: maxLeverage,
            }}
            warningMessages={[]}
            key={`input-${coin.denom}`}
          />
        )
      })}

      <DepositCapMessage
        action='deposit'
        coins={props.depositCapReachedCoins}
        className='px-4 y-2'
        showIcon
      />

      <Divider />
      <div className='flex flex-col gap-2'>
        {props.borrowings.map((coin) => {
          const asset = assets.find(byDenom(coin.denom))
          const borrowRate = markets?.find((market) => market.asset.denom === coin.denom)?.apy
            .borrow

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
      <Button
        onClick={() => props.toggleOpen(2)}
        color='primary'
        text='Deposit'
        rightIcon={<ArrowRight />}
        disabled={props.depositCapReachedCoins.length > 0}
      />
    </div>
  )
}
