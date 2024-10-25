import { getCreditManagerQueryClient, getPerpsQueryClient } from 'api/cosmwasm-client'
import getDepositedVaults from 'api/vaults/getDepositedVaults'
import { Positions } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { convertCoinArrayIntoBNCoinArrayAndRemoveEmptyCoins } from 'utils/accounts'
import { resolvePerpsPositions, resolvePerpsVaultPositions } from 'utils/resolvers'

export default async function getAccount(
  chainConfig: ChainConfig,
  assets: Asset[],
  accountId?: string,
  address?: string,
): Promise<Account> {
  if (!accountId) return new Promise((_, reject) => reject('No account ID found'))

  const isPerpsEnabled = chainConfig.perps
  const creditManagerQueryClient = await getCreditManagerQueryClient(chainConfig)

  const accountPosition: Positions = await creditManagerQueryClient.positions({ accountId })

  let perpsVaultPosition = null
  if (isPerpsEnabled && address) {
    const perpsQueryClient = await getPerpsQueryClient(chainConfig)
    perpsVaultPosition = await perpsQueryClient.vaultPosition({ accountId, userAddress: address })
  }

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
      perpsVault: perpsVaultPosition ? resolvePerpsVaultPositions(perpsVaultPosition) : null,
      perps: resolvePerpsPositions(accountPosition.perps, assets),
      stakedAstroLps: convertCoinArrayIntoBNCoinArrayAndRemoveEmptyCoins(stakedAstroLps),
      kind: accountKind,
    }
  }

  return new Promise((_, reject) => reject('No account found'))
}
