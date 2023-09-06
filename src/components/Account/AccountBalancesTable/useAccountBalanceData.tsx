import { useMemo } from 'react'

import {
  getAssetAccountBalanceRow,
  getVaultAccountBalanceRow,
} from 'components/Account/AccountBalancesTable/functions'
import { ASSETS } from 'constants/assets'
import usePrices from 'hooks/usePrices'
import { byDenom } from 'utils/array'
import { convertLiquidityRateToAPR } from 'utils/formatters'
import { convertAprToApy } from 'utils/parsers'

interface Props {
  account: Account
  updatedAccount?: Account
  lendingData: LendingMarketTableData[]
  borrowingData: BorrowMarketTableData[]
}

export default function useAccountBalanceData(props: Props) {
  const { account, updatedAccount, lendingData, borrowingData } = props

  const { data: prices } = usePrices()

  return useMemo<AccountBalanceRow[]>(() => {
    const usedAccount = updatedAccount ?? account
    const accountDeposits = usedAccount?.deposits ?? []
    const accountLends = usedAccount?.lends ?? []
    const accountDebts = usedAccount?.debts ?? []
    const accountVaults = usedAccount?.vaults ?? []

    const deposits: AccountBalanceRow[] = []
    accountDeposits.forEach((deposit) => {
      const asset = ASSETS.find(byDenom(deposit.denom))
      if (!asset) return
      const apy = 0
      const prevDeposit = updatedAccount
        ? account?.deposits.find(byDenom(deposit.denom))
        : deposit
      deposits.push(getAssetAccountBalanceRow('deposits', asset, prices, deposit, apy, prevDeposit))
    })

    const lends = accountLends.map((lending) => {
      const asset = ASSETS.find(byDenom(lending.denom)) ?? ASSETS[0]
      const apr = convertLiquidityRateToAPR(
        lendingData.find((market) => market.asset.denom === lending.denom)?.marketLiquidityRate ??
          0,
      )
      const apy = convertAprToApy(apr, 365)
      const prevLending = updatedAccount
        ? account?.lends.find((position) => position.denom === lending.denom)
        : lending
      return getAssetAccountBalanceRow('lending', asset, prices, lending, apy, prevLending)
    })

    const vaults = accountVaults.map((vault) => {
      const apy = (vault.apy ?? 0) * 100
      const prevVault = updatedAccount
        ? account?.vaults.find((position) => position.name === vault.name)
        : vault
      return getVaultAccountBalanceRow(vault, apy, prevVault)
    })

    const debts = accountDebts.map((debt) => {
      const asset = ASSETS.find(byDenom(debt.denom)) ?? ASSETS[0]
      const apy = borrowingData.find((market) => market.asset.denom === debt.denom)?.borrowRate ?? 0
      const prevDebt = updatedAccount
        ? account?.debts.find((position) => position.denom === debt.denom)
        : debt
      return getAssetAccountBalanceRow('borrowing', asset, prices, debt, apy * -100, prevDebt)
    })
    return [...deposits, ...lends, ...vaults, ...debts]
  }, [prices, account, updatedAccount, borrowingData, lendingData])
}
