import React, { useEffect, useMemo } from 'react'

import Button from 'components/common/Button'
import DepositCapMessage from 'components/common/DepositCapMessage'
import Divider from 'components/common/Divider'
import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import useAssets from 'hooks/assets/useAssets'
import useMarkets from 'hooks/markets/useMarkets'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { getAccountDebtValue, getAccountNetValue, getAccountTotalValue } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { findCoinByDenom } from 'utils/assets'
import { formatPercent, getCoinAmount, getCoinValue } from 'utils/formatters'

export default function FarmLeverage(props: HlsFarmLeverageProps) {
  const { data: assets } = useAssets()
  const {
    borrowings,
    onChangeBorrowings,
    account,
    totalValue,
    deposits,
    depositCapReachedCoins,
    toggleOpen,
  } = props
  const markets = useMarkets()
  const modal = useStore((s) => s.farmModal)
  const maxLeverage = modal?.maxLeverage ?? 0

  const depositValue = useMemo(() => {
    let depositValue = BN_ZERO
    deposits.forEach((deposit) => {
      const value = getCoinValue(deposit, assets)
      depositValue = depositValue.plus(value)
    })

    return depositValue
  }, [deposits, assets])

  const [accountTotalValue, accountNetValue, accountTotalDebt, accountDebtAmount] = useMemo(
    () => [
      getAccountTotalValue(account, assets),
      getAccountNetValue(account, assets),
      getAccountDebtValue(account, assets),
      account.debts.length ? account.debts[0].amount : BN_ZERO,
    ],
    [account, assets],
  )

  const currentLeverage = useMemo(() => {
    let borrowValue = BN_ZERO
    if (account) {
      const newTotalValue = accountTotalValue.plus(totalValue)
      const currentBorrowValue = totalValue.minus(depositValue)
      borrowValue = accountTotalDebt.plus(currentBorrowValue)
      const netValue = newTotalValue.minus(borrowValue)
      return borrowValue.dividedBy(netValue).plus(1).toNumber() || 1
    }

    borrowValue = totalValue.minus(depositValue)
    return borrowValue.dividedBy(depositValue).plus(1).toNumber() || 1
  }, [account, totalValue, depositValue, accountTotalValue, accountTotalDebt])

  const minLeverage = useMemo(() => {
    if (!account) return 1
    const newAccountNetValue = accountNetValue.plus(depositValue)
    return accountTotalDebt.dividedBy(newAccountNetValue).plus(1).toNumber() || 1
  }, [account, accountNetValue, accountTotalDebt, depositValue])

  const maxBorrowAmounts: BNCoin[] = useMemo(() => {
    return borrowings.map((borrowing) => {
      let newValue = BN_ZERO
      if (account) {
        newValue = accountNetValue.plus(depositValue)
      } else {
        newValue = depositValue
      }
      const maxBorrowValue = newValue.times(maxLeverage - 1.1)
      const maxAmount = getCoinAmount(borrowing.denom, maxBorrowValue, assets)

      return BNCoin.fromDenomAndBigNumber(
        borrowing.denom,
        account ? maxAmount.minus(accountDebtAmount) : maxAmount,
      )
    })
  }, [borrowings, account, maxLeverage, assets, accountDebtAmount, accountNetValue, depositValue])

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
    const index = borrowings.findIndex((coin) => coin.denom === denom)
    borrowings[index].amount = amount
    onChangeBorrowings([...borrowings])
  }

  return (
    <div className='flex flex-col flex-1 gap-4 p-4'>
      {borrowings.map((coin) => {
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
              min: account ? minLeverage : 1,
            }}
            warningMessages={[]}
            key={`input-${coin.denom}`}
          />
        )
      })}

      <DepositCapMessage
        action='deposit'
        coins={depositCapReachedCoins}
        className='px-4 y-2'
        showIcon
      />

      <Divider />
      <div className='flex flex-col gap-2'>
        {borrowings.map((coin) => {
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
        onClick={() => toggleOpen(2)}
        color='primary'
        text='Deposit'
        rightIcon={<ArrowRight />}
        disabled={depositCapReachedCoins.length > 0}
      />
    </div>
  )
}
