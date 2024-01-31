import { useMemo } from 'react'

import {
  getAssetAccountBalanceRow,
  getVaultAccountBalanceRow,
} from 'components/account/AccountBalancesTable/functions'
import useAllAssets from 'hooks/assets/useAllAssets'
import useHLSStakingAssets from 'hooks/useHLSStakingAssets'
import usePrices from 'hooks/usePrices'
import { byDenom } from 'utils/array'

interface Props {
  account: Account
  isHls?: boolean
  updatedAccount?: Account
  lendingData: LendingMarketTableData[]
  borrowingData: BorrowMarketTableData[]
}

export default function useAccountBalanceData(props: Props) {
  const { account, updatedAccount, lendingData, borrowingData } = props
  const { data: hlsStrategies } = useHLSStakingAssets()
  const { data: prices } = usePrices()
  const assets = useAllAssets()
  return useMemo<AccountBalanceRow[]>(() => {
    const usedAccount = updatedAccount ?? account
    const accountDeposits = usedAccount?.deposits ?? []
    const accountLends = usedAccount?.lends ?? []
    const accountDebts = usedAccount?.debts ?? []
    const accountVaults = usedAccount?.vaults ?? []

    const deposits: AccountBalanceRow[] = []
    accountDeposits.forEach((deposit) => {
      const asset = assets.find(byDenom(deposit.denom))
      if (!asset) return
      const apy = props.isHls
        ? hlsStrategies.find((strategy) => strategy.denoms.deposit === asset.denom)?.apy ?? 0
        : 0
      const prevDeposit = updatedAccount ? account?.deposits.find(byDenom(deposit.denom)) : deposit

      deposits.push(
        getAssetAccountBalanceRow('deposit', asset, prices, assets, deposit, apy, prevDeposit),
      )
    })

    const lends = accountLends.map((lending) => {
      const asset = assets.find(byDenom(lending.denom)) ?? assets[0]
      const apy =
        lendingData.find((market) => market.asset.denom === lending.denom)?.apy.deposit ?? 0

      const prevLending = updatedAccount
        ? account?.lends.find((position) => position.denom === lending.denom)
        : lending
      return getAssetAccountBalanceRow('lend', asset, prices, assets, lending, apy, prevLending)
    })

    const vaults = accountVaults.map((vault) => {
      const apy = vault.apy ?? 0
      const prevVault = updatedAccount
        ? account?.vaults.find((position) => position.name === vault.name)
        : vault
      return getVaultAccountBalanceRow(vault, apy, prevVault)
    })

    const debts = accountDebts.map((debt) => {
      const asset = assets.find(byDenom(debt.denom)) ?? assets[0]
      const apy = borrowingData.find((market) => market.asset.denom === debt.denom)?.apy.borrow ?? 0
      const prevDebt = updatedAccount
        ? account?.debts.find((position) => position.denom === debt.denom)
        : debt
      return getAssetAccountBalanceRow('borrow', asset, prices, assets, debt, apy, prevDebt)
    })
    return [...deposits, ...lends, ...vaults, ...debts]
  }, [
    updatedAccount,
    account,
    props.isHls,
    hlsStrategies,
    prices,
    assets,
    lendingData,
    borrowingData,
  ])
}
