import getHLSStakingAssets from 'api/hls/getHLSStakingAssets'
import getAccounts from 'api/wallets/getAccounts'
import { calculateAccountLeverage, getAccountPositionValues, isAccountEmpty } from 'utils/accounts'

export default async function getHLSStakingAccounts(
  chainConfig: ChainConfig,
  assets: Asset[],
  address?: string,
): Promise<HLSAccountWithStrategy[]> {
  const accounts = await getAccounts('high_levered_strategy', chainConfig, assets, address)
  const activeAccounts = accounts.filter((account) => !isAccountEmpty(account))
  const hlsStrategies = await getHLSStakingAssets(chainConfig, assets)
  const hlsAccountsWithStrategy: HLSAccountWithStrategy[] = []

  activeAccounts.forEach((account) => {
    if (account.deposits.length === 0) return

    const strategy = hlsStrategies.find(
      (strategy) => strategy.denoms.deposit === account.deposits[0].denom,
    )

    if (!strategy) return

    const [deposits, _, debts] = getAccountPositionValues(account, assets)

    hlsAccountsWithStrategy.push({
      ...account,
      strategy,
      values: {
        net: deposits.minus(debts),
        debt: debts,
        total: deposits,
      },
      leverage: calculateAccountLeverage(account, assets).toNumber(),
    })
  })

  return hlsAccountsWithStrategy
}
