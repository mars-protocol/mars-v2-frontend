import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo } from 'react'

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
import {
  getDepositCapMessage,
  getHealthFactorMessage,
  getLiquidityMessage,
  getNoBalanceMessage,
} from 'utils/messages'

interface Props {
  account: HLSAccountWithStrategy
  action: HlsStakingManageAction
  borrowAsset: BorrowAsset
  collateralAsset: Asset
}

export default function Deposit(props: Props) {
  const { addedDeposits, addedDebts, updatedAccount, addedTrades, simulateHlsStakingDeposit } =
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

  const addedDepositFromSwap = useMemo(
    () => addedTrades.find(byDenom(props.collateralAsset.denom))?.amount || BN_ZERO,
    [addedTrades, props.collateralAsset.denom],
  )

  const borrowCoin = useMemo(
    () =>
      BNCoin.fromDenomAndBigNumber(
        props.borrowAsset.denom,
        addedDebts.find(byDenom(props.borrowAsset.denom))?.amount || BN_ZERO,
      ),
    [addedDebts, props.borrowAsset.denom],
  )

  const warningMessages = useMemo(() => {
    let messages: string[] = []
    const capLeft = props.account.strategy.depositCap.max.minus(
      props.account.strategy.depositCap.used,
    )

    if (capLeft.isLessThan(depositCoin.amount.plus(addedDepositFromSwap))) {
      messages.push(getDepositCapMessage(props.collateralAsset.denom, capLeft, 'deposit'))
    }

    if (collateralAssetAmountInWallet.isZero()) {
      messages.push(getNoBalanceMessage(props.collateralAsset.symbol))
    }

    return messages
  }, [
    addedDepositFromSwap,
    collateralAssetAmountInWallet,
    depositCoin.amount,
    props.account.strategy.depositCap.max,
    props.account.strategy.depositCap.used,
    props.collateralAsset.denom,
    props.collateralAsset.symbol,
  ])

  const maxBorrowAmount = useMemo(
    () => computeMaxBorrowAmount(props.borrowAsset.denom, 'deposit'),
    [computeMaxBorrowAmount, props.borrowAsset.denom],
  )

  const borrowWarningMessages = useMemo(() => {
    let messages: string[] = []
    if (borrowCoin.amount.isGreaterThan(maxBorrowAmount)) {
      messages.push(getHealthFactorMessage(props.borrowAsset.denom, maxBorrowAmount, 'borrow'))
    }

    const borrowLiquidity = props.borrowAsset.liquidity?.amount || BN_ZERO

    if (borrowCoin.amount.isGreaterThan(borrowLiquidity)) {
      messages.push(getLiquidityMessage(props.borrowAsset.denom, borrowLiquidity))
    }

    return messages
  }, [
    borrowCoin.amount,
    maxBorrowAmount,
    props.borrowAsset.denom,
    props.borrowAsset.liquidity?.amount,
  ])

  const actions = useDepositActions({ depositCoin, borrowCoin })

  const currentDebt: BigNumber = useMemo(
    () => props.account.debts.find(byDenom(props.borrowAsset.denom))?.amount || BN_ZERO,
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
              warningMessages: borrowWarningMessages,
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
      borrowWarningMessages,
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
          warningMessages={warningMessages}
        />
        <Divider className='my-6' />
        <div className='flex flex-wrap items-center justify-between flex-1'>
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
        <Button
          onClick={handleDeposit}
          text='Deposit'
          disabled={
            depositCoin.amount.isZero() ||
            !!warningMessages.length ||
            !!borrowWarningMessages.length
          }
        />
      </div>
    </>
  )
}
