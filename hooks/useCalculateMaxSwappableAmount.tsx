import React, { useMemo } from 'react'
import BigNumber from 'bignumber.js'

import { getTokenDecimals } from 'utils/tokens'
import useCreditManagerStore from 'stores/useCreditManagerStore'

import useCreditAccountPositions from './useCreditAccountPositions'
import useMarkets from './useMarkets'
import useRedbankBalances from './useRedbankBalances'
import useTokenPrices from './useTokenPrices'
import useAllBalances from './useAllBalances'

enum FundingMode {
  Wallet = 'Wallet',
  CreditAccount = 'CreditAccount',
  Both = 'Both',
}

const useCalculateMaxSwappableAmount = (
  tokenIn: string,
  tokenOut: string,
  fundingFrom: FundingMode,
) => {
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)

  const { data: walletBalancesData } = useAllBalances()
  const { data: positionsData } = useCreditAccountPositions(selectedAccount ?? '')
  const { data: marketsData } = useMarkets()
  const { data: tokenPrices } = useTokenPrices()
  const { data: redbankBalances } = useRedbankBalances()

  const { accountAmount, walletAmount } = useMemo(() => {
    const accountAmount = BigNumber(
      positionsData?.coins?.find((coin) => coin.denom === tokenIn)?.amount ?? 0,
    )
      .div(10 ** getTokenDecimals(tokenIn))
      .toNumber()

    const walletAmount = BigNumber(
      walletBalancesData?.find((balance) => balance.denom === tokenIn)?.amount ?? 0,
    )
      .div(10 ** getTokenDecimals(tokenIn))
      .toNumber()

    return { accountAmount, walletAmount }
  }, [walletBalancesData, positionsData, tokenIn])

  const maxAmount = useMemo(() => {
    if (fundingFrom === FundingMode.CreditAccount) {
      return accountAmount
    }

    if (fundingFrom === FundingMode.Wallet) {
      return walletAmount
    }

    return accountAmount + walletAmount
  }, [accountAmount, fundingFrom, walletAmount])

  return maxAmount
}

export default useCalculateMaxSwappableAmount
