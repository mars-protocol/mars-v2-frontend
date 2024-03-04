import useSWR from 'swr'

import useChainConfig from 'hooks/useChainConfig'
import useV1Debts from 'hooks/v1/useV1Debts'
import useV1Deposits from 'hooks/v1/useV1Deposits'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'

export default function useV1Account() {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)
  const { data: lends } = useV1Deposits()
  const { data: debts } = useV1Debts()

  return useSWR(
    !!address && `chains/${chainConfig.id}/v1/user/${address}`,
    () => {
      return {
        id: address ?? '',
        debts: debts.map((debt) => new BNCoin(debt)),
        lends: lends.map((lend) => new BNCoin(lend)),
        deposits: [],
        vaults: [],
        perps: [],
        kind: 'default',
      }
    },
    { suspense: false, revalidateOnFocus: false },
  )
}
