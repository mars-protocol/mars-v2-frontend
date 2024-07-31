import { cacheFn, positionsCache } from 'api/cache'
import { getCreditManagerQueryClient } from 'api/cosmwasm-client'
import getDepositedVaults from 'api/vaults/getDepositedVaults'
import { Positions } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { convertCoinArrayIntoBNCoinArrayAndRemoveEmptyCoins } from 'utils/accounts'

export default async function getAccount(
  chainConfig: ChainConfig,
  assets: Asset[],
  accountId?: string,
): Promise<Account> {
  if (!accountId) return new Promise((_, reject) => reject('No account ID found'))

  const creditManagerQueryClient = await getCreditManagerQueryClient(chainConfig)

  const accountPosition: Positions = await cacheFn(
    () => creditManagerQueryClient.positions({ accountId: accountId }),
    positionsCache,
    `${chainConfig.id}/account/${accountId}`,
  )

  const accountKind = await creditManagerQueryClient.accountKind({ accountId: accountId })

  const depositedVaults = await getDepositedVaults(accountId, chainConfig, assets, accountPosition)
  const stakedAstroLps = accountPosition.staked_astro_lps ?? []

  if (accountPosition) {
    return {
      id: accountPosition.account_id,
      debts: convertCoinArrayIntoBNCoinArrayAndRemoveEmptyCoins(accountPosition.debts as Coin[]),
      lends: convertCoinArrayIntoBNCoinArrayAndRemoveEmptyCoins(accountPosition.lends),
      deposits: convertCoinArrayIntoBNCoinArrayAndRemoveEmptyCoins(accountPosition.deposits),
      vaults: depositedVaults,
      /*PERPS 
      perpsVault: resolvePerpsVaultPositions(accountPosition.perp_vault),
      perps: resolvePerpsPositions(accountPosition.perps, assets),
      */
      stakedAstroLps: convertCoinArrayIntoBNCoinArrayAndRemoveEmptyCoins(stakedAstroLps),
      kind: accountKind,
    }
  }

  return new Promise((_, reject) => reject('No account found'))
}
