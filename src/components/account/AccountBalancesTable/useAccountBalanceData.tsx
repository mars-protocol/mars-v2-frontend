import { useMemo } from 'react'

import { getAssetAccountBalanceRow } from 'components/account/AccountBalancesTable/functions'
import useAssets from 'hooks/assets/useAssets'
import useHlsStakingAssets from 'hooks/hls/useHlsStakingAssets'
import { byDenom } from 'utils/array'

interface Props {
  account: Account
  updatedAccount?: Account
  lendingData: LendingMarketTableData[]
  borrowingData: BorrowMarketTableData[]
}

export default function useAccountBalanceData(props: Props) {
  const { account, updatedAccount, lendingData, borrowingData } = props
  const { data: hlsStrategies } = useHlsStakingAssets()
  const { data: assets } = useAssets()
  const isHls = account.kind === 'high_levered_strategy'

  return useMemo<AccountBalanceRow[]>(() => {
    const usedAccount = updatedAccount ?? account
    const accountDeposits = usedAccount?.deposits ?? []
    const accountLends = usedAccount?.lends ?? []
    const accountDebts = usedAccount?.debts ?? []

    const deposits: AccountBalanceRow[] = []
    accountDeposits.forEach((deposit) => {
      const asset = assets.find(byDenom(deposit.denom))
      if (!asset) return
      const apy = isHls
        ? (hlsStrategies.find((strategy) => strategy.denoms.deposit === asset.denom)?.apy ?? 0)
        : 0
      const prevDeposit = updatedAccount ? account?.deposits.find(byDenom(deposit.denom)) : deposit

      deposits.push(getAssetAccountBalanceRow('deposit', asset, assets, deposit, apy, prevDeposit))
    })

    const lends = accountLends.map((lending) => {
      const asset = assets.find(byDenom(lending.denom)) ?? assets[0]
      const apy =
        lendingData.find((market) => market.asset.denom === lending.denom)?.apy.deposit ?? 0

      const prevLending = updatedAccount
        ? account?.lends.find((position) => position.denom === lending.denom)
        : lending
      return getAssetAccountBalanceRow('lend', asset, assets, lending, apy, prevLending)
    })

    const debts = accountDebts.map((debt) => {
      const asset = assets.find(byDenom(debt.denom)) ?? assets[0]
      const apy = borrowingData.find((market) => market.asset.denom === debt.denom)?.apy.borrow ?? 0
      const prevDebt = updatedAccount
        ? account?.debts.find((position) => position.denom === debt.denom)
        : debt
      return getAssetAccountBalanceRow('borrow', asset, assets, debt, apy, prevDebt)
    })
    return [...deposits, ...lends, ...debts]
  }, [updatedAccount, account, isHls, hlsStrategies, assets, lendingData, borrowingData])
}
