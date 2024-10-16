import getV1Debts from 'api/v1/getV1Debts'
import getV1Deposits from 'api/v1/getV1Deposits'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import useSWR from 'swr'
import { BNCoin } from 'types/classes/BNCoin'

export default function useV1Account() {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)
  const isV1 = useStore((s) => s.isV1)
  const enabled = isV1 && !!address

  return useSWR<Account>(
    enabled && `chains/${chainConfig.id}/v1/user/${address}`,
    async () => {
      const [debts, lends] = await Promise.all([
        getV1Debts(chainConfig, address ?? ''),
        getV1Deposits(chainConfig, address ?? ''),
      ])
      return {
        id: address ?? '',
        debts: debts.map((debt) => new BNCoin(debt)),
        lends: lends.map((lend) => new BNCoin(lend)),
        deposits: [],
        vaults: [],
        perps: [],
        perpsVault: null,
        stakedAstroLps: [],
        kind: 'default' as AccountKind,
      } satisfies Account
    },
    { suspense: false, revalidateOnFocus: false, enabled },
  )
}
