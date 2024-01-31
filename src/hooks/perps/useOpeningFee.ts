import BigNumber from 'bignumber.js'
import useSWR from 'swr'

import useChainConfig from 'hooks/useChainConfig'
import useClients from 'hooks/useClients'
import useDebounce from 'hooks/useDebounce'
import { BNCoin } from 'types/classes/BNCoin'

export default function useOpeningFee(denom: string, amount: BigNumber) {
  const chainConfig = useChainConfig()
  const debouncedAmount = useDebounce<string>(amount.toString(), 500)
  const clients = useClients()
  const enabled = !amount.isZero() && clients

  return useSWR(enabled && `${chainConfig.id}/perps/${denom}/openingFee/${debouncedAmount}`, () =>
    clients!.perps
      .openingFee({ denom, size: amount as any })
      .then((resp) => BNCoin.fromCoin(resp.fee)),
  )
}
