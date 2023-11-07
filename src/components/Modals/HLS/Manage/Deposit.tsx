import BigNumber from 'bignumber.js'
import React, { useCallback, useEffect, useMemo } from 'react'

import Button from 'components/Button'
import Divider from 'components/Divider'
import SummaryItems from 'components/SummaryItems'
import Switch from 'components/Switch'
import Text from 'components/Text'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import useDepositActions from 'hooks/HLS/useDepositActions'
import useBorrowAsset from 'hooks/useBorrowAsset'
import useCurrentWalletBalance from 'hooks/useCurrentWalletBalance'
import useHealthComputer from 'hooks/useHealthComputer'
import usePrices from 'hooks/usePrices'
import useToggle from 'hooks/useToggle'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateAccountLeverage } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { getCoinAmount, getCoinValue } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  account: Account
  action: HlsStakingManageAction
  borrowAsset: Asset
  collateralAsset: Asset
}

export default function Deposit(props: Props) {
  const { addedDeposits, addedDebts, updatedAccount, simulateHlsStakingDeposit } =
    useUpdatedAccount(props.account)
  const { computeMaxBorrowAmount } = useHealthComputer(updatedAccount)
  const { data: prices } = usePrices()
  const [keepLeverage, toggleKeepLeverage] = useToggle(true)
  const collateralAssetAmountInWallet = BN(
    useCurrentWalletBalance(props.collateralAsset.denom)?.amount || '0',
  )
  const addToStakingStrategy = useStore((s) => s.addToStakingStrategy)
  const borrowRate = useBorrowAsset(props.borrowAsset.denom)?.borrowRate || 0

  const currentLeverage = useMemo(
    () => calculateAccountLeverage(props.account, prices).toNumber(),
    [prices, props.account],
  )

  const depositCoin = useMemo(
    () =>
      BNCoin.fromDenomAndBigNumber(
        props.collateralAsset.denom,
        addedDeposits.find(byDenom(props.collateralAsset.denom))?.amount || BN_ZERO,
      ),
    [addedDeposits, props.collateralAsset.denom],
  )

  const borrowCoin = useMemo(
    () =>
      BNCoin.fromDenomAndBigNumber(
        props.borrowAsset.denom,
        addedDebts.find(byDenom(props.borrowAsset.denom))?.amount || BN_ZERO,
      ),
    [addedDebts, props.borrowAsset.denom],
  )

  const maxBorrowAmount = useMemo(
    () => computeMaxBorrowAmount(props.collateralAsset.denom, 'deposit'),
    [computeMaxBorrowAmount, props.collateralAsset.denom],
  )

  useEffect(() => {
    if (borrowCoin.amount.isGreaterThan(maxBorrowAmount)) {
      simulateHlsStakingDeposit(
        BNCoin.fromDenomAndBigNumber(props.collateralAsset.denom, depositCoin.amount),
        BNCoin.fromDenomAndBigNumber(props.borrowAsset.denom, maxBorrowAmount),
      )
    }
  }, [
    borrowCoin.amount,
    depositCoin.amount,
    maxBorrowAmount,
    props.borrowAsset.denom,
    props.collateralAsset.denom,
    simulateHlsStakingDeposit,
  ])

  const actions = useDepositActions({ depositCoin, borrowCoin })

  const currentDebt: BigNumber = useMemo(
    () => props.account.debts.find(byDenom(props.borrowAsset.denom)).amount || BN_ZERO,
    [props.account.debts, props.borrowAsset.denom],
  )

  const handleDeposit = useCallback(() => {
    useStore.setState({ hlsManageModal: null })
    addToStakingStrategy({
      accountId: props.account.id,
      actions,
      depositCoin,
      borrowCoin,
    })
  }, [actions, addToStakingStrategy, borrowCoin, depositCoin, props.account.id])

  const handleOnChange = useCallback(
    (amount: BigNumber) => {
      let additionalDebt = BN_ZERO

      if (currentLeverage > 1 && keepLeverage) {
        const depositValue = getCoinValue(
          BNCoin.fromDenomAndBigNumber(props.collateralAsset.denom, amount),
          prices,
        )
        const borrowValue = BN(currentLeverage - 1).times(depositValue)
        additionalDebt = getCoinAmount(props.borrowAsset.denom, borrowValue, prices)
      }

      simulateHlsStakingDeposit(
        BNCoin.fromDenomAndBigNumber(props.collateralAsset.denom, amount),
        BNCoin.fromDenomAndBigNumber(props.borrowAsset.denom, additionalDebt),
      )
    },
    [
      currentLeverage,
      keepLeverage,
      prices,
      props.borrowAsset.denom,
      props.collateralAsset.denom,
      simulateHlsStakingDeposit,
    ],
  )

  const items: SummaryItem[] = useMemo(
    () => [
      ...(keepLeverage
        ? [
            {
              title: 'Borrow rate',
              amount: borrowRate,
              options: {
                suffix: `%`,
                minDecimals: 2,
                maxDecimals: 2,
              },
            },
            {
              title: 'Additional Borrow Amount',
              amount: borrowCoin.amount.toNumber(),
              options: {
                suffix: ` ${props.borrowAsset.symbol}`,
                abbreviated: true,
                decimals: props.borrowAsset.decimals,
              },
            },
            {
              title: 'New Debt Amount',
              amount: currentDebt.plus(borrowCoin.amount).toNumber(),
              options: {
                suffix: ` ${props.borrowAsset.symbol}`,
                abbreviated: true,
                decimals: props.borrowAsset.decimals,
              },
            },
          ]
        : []),
    ],
    [
      borrowCoin.amount,
      borrowRate,
      currentDebt,
      keepLeverage,
      props.borrowAsset.decimals,
      props.borrowAsset.symbol,
    ],
  )

  return (
    <>
      <div>
        <TokenInputWithSlider
          amount={depositCoin.amount}
          asset={props.collateralAsset}
          max={collateralAssetAmountInWallet}
          onChange={handleOnChange}
          maxText='In Wallet'
        />
        <Divider className='my-6' />
        <div className='flex flex-wrap flex-1 items-center justify-between'>
          <div>
            <Text className='w-full mb-1'>Keep leverage</Text>
            <Text size='xs' className='text-white/50'>
              Automatically borrow more funds to keep leverage
            </Text>
          </div>
          <Switch name='keep-leverage' checked={keepLeverage} onChange={toggleKeepLeverage} />
        </div>
      </div>
      <div className='flex flex-col gap-4'>
        <SummaryItems items={items} />
        <Button onClick={handleDeposit} text='Deposit' disabled={depositCoin.amount.isZero()} />
      </div>
    </>
  )
}
