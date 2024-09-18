import getHlsStakingAssets from 'api/hls/getHlsStakingAssets'
import getAccounts from 'api/wallets/getAccounts'
import { calculateAccountLeverage, getAccountPositionValues, isAccountEmpty } from 'utils/accounts'

export default async function getHlsStakingAccounts(
  chainConfig: ChainConfig,
  assets: Asset[],
  markets: Market[],
  address?: string,
): Promise<HlsAccountWithStrategy[]> {
  const accounts = await getAccounts('high_levered_strategy', chainConfig, assets, address)
  const activeAccounts = accounts.filter((account) => !isAccountEmpty(account))
  const hlsStrategies = await getHlsStakingAssets(chainConfig, assets, markets)
  const hlsAccountsWithStrategy: HlsAccountWithStrategy[] = []

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
