import BigNumber from 'bignumber.js'
import useSWR from 'swr'

import useChainConfig from 'hooks/useChainConfig'
import useClients from 'hooks/useClients'
import useDebounce from 'hooks/useDebounce'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export default function useTradingFee(denom: string, amount: BigNumber) {
  const chainConfig = useChainConfig()
  const debouncedAmount = useDebounce<string>(amount.toString(), 500)
  const clients = useClients()
  const enabled = !amount.isZero() && clients

  return useSWR(enabled && `${chainConfig.id}/perps/${denom}/tradingFee/${debouncedAmount}`, () =>
    clients!.perps
      .openingFee({ denom, size: amount as any })
      .then((resp) => ({ rate: BN(resp.rate), fee: BNCoin.fromCoin(resp.fee) })),
  )
}
