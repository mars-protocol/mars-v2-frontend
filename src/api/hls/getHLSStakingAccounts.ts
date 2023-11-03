import getHLSStakingAssets from 'api/hls/getHLSStakingAssets'
import getPrices from 'api/prices/getPrices'
import getAccounts from 'api/wallets/getAccounts'
import { calculateAccountLeverage, getAccountPositionValues, isAccountEmpty } from 'utils/accounts'

export default async function getHLSStakingAccounts(
  address?: string,
): Promise<HLSAccountWithStrategy[]> {
  const accounts = await getAccounts('high_levered_strategy', address)
  const activeAccounts = accounts.filter((account) => !isAccountEmpty(account))
  const hlsStrategies = await getHLSStakingAssets()
  const prices = await getPrices()
  const hlsAccountsWithStrategy: HLSAccountWithStrategy[] = []

  activeAccounts.forEach((account) => {
    if (account.deposits.length === 0 || account.debts.length === 0) return

    const strategy = hlsStrategies.find(
      (strategy) =>
        strategy.denoms.deposit === account.deposits.at(0).denom &&
        strategy.denoms.borrow === account.debts.at(0).denom,
    )

    if (!strategy) return

    const [deposits, lends, debts, vaults] = getAccountPositionValues(account, prices)

    hlsAccountsWithStrategy.push({
      ...account,
      strategy,
      values: {
        net: deposits.minus(debts),
        debt: debts,
        total: deposits,
      },
      leverage: calculateAccountLeverage(account, prices).toNumber(),
    })
  })

  return hlsAccountsWithStrategy
}
