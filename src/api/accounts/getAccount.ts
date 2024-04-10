import { cacheFn, positionsCache } from 'api/cache'
import { getCreditManagerQueryClient } from 'api/cosmwasm-client'
import getPrices from 'api/prices/getPrices'
import getDepositedVaults from 'api/vaults/getDepositedVaults'
import { BNCoin } from 'types/classes/BNCoin'
import { Positions } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { resolvePerpsPositions, resolvePerpsVaultPositions } from 'utils/resolvers'

export default async function getAccount(
  chainConfig: ChainConfig,
  accountId?: string,
): Promise<Account> {
  if (!accountId) return new Promise((_, reject) => reject('No account ID found'))

  const creditManagerQueryClient = await getCreditManagerQueryClient(chainConfig)

  const accountPosition: Positions = await cacheFn(
    () => creditManagerQueryClient.positions({ accountId: accountId }),
    positionsCache,
    `${chainConfig.id}/account/${accountId}`,
  )

  const prices = await getPrices(chainConfig)

  const accountKind = await creditManagerQueryClient.accountKind({ accountId: accountId })

  const depositedVaults = await getDepositedVaults(accountId, chainConfig, accountPosition)

  // const arbVault: DepositedVault = {
  //
  //   address: 'neutron1lsfp7svm3r09zqqxz39d6dcy57m48dzs0xhvcrtvm7ek6esc2x4sx2vaqf',
  //     denoms: {
  //   primary: 'ibc/4C19E7EC06C1AB2EC2D70C6855FEB6D48E9CE174913991DA0A517D21978E7E42',
  //     secondary: '',
  //     lp: '',
  //     vault: '',
  // },
  //   name: 'NTRN Funding Rate Arb.',
  //     provider: 'Mars Wif Bots',
  //   lockup: {
  //   duration: 5,
  //     timeframe: 'days',
  // },
  //   symbols: {
  //     primary: 'USDC',
  //       secondary: '',
  //   },
  //   ltv: {
  //     max: 0.67,
  //     liq: 0.6
  //   },
  //
  // }
  //

  if (accountPosition) {
    return {
      id: accountPosition.account_id,
      debts: accountPosition.debts.map((debt) => new BNCoin(debt)),
      lends: accountPosition.lends.map((lend) => new BNCoin(lend)),
      deposits: accountPosition.deposits.map((deposit) => new BNCoin(deposit)),
      vaults: depositedVaults,
      perpsVault: resolvePerpsVaultPositions(accountPosition.perp_vault),
      perps: resolvePerpsPositions(accountPosition.perps, prices),
      kind: accountKind,
    }
  }

  return new Promise((_, reject) => reject('No account found'))
}
