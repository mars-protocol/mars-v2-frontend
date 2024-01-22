import getHLSStakingAssets from 'api/hls/getHLSStakingAssets'
import getPrices from 'api/prices/getPrices'
import getAccounts from 'api/wallets/getAccounts'
import { calculateAccountLeverage, getAccountPositionValues, isAccountEmpty } from 'utils/accounts'

export default async function getHLSStakingAccounts(
  chainConfig: ChainConfig,
  address?: string,
): Promise<HLSAccountWithStrategy[]> {
  const accounts = await getAccounts('high_levered_strategy', chainConfig, address)
  const activeAccounts = accounts.filter((account) => !isAccountEmpty(account))
  const hlsStrategies = await getHLSStakingAssets(chainConfig)
  const prices = await getPrices(chainConfig)
  const hlsAccountsWithStrategy: HLSAccountWithStrategy[] = []

  activeAccounts.forEach((account) => {
    if (account.deposits.length === 0) return

    const strategy = hlsStrategies.find(
      (strategy) => strategy.denoms.deposit === account.deposits[0].denom,
    )

    if (!strategy) return

    const [deposits, lends, debts, vaults] = getAccountPositionValues(
      account,
      prices,
      chainConfig.assets,
    )

    hlsAccountsWithStrategy.push({
      ...account,
      strategy,
      values: {
        net: deposits.minus(debts),
        debt: debts,
        total: deposits,
      },
      leverage: calculateAccountLeverage(account, prices, chainConfig.assets).toNumber(),
    })
  })

  return hlsAccountsWithStrategy
}
