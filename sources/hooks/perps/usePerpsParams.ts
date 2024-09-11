import { useMemo } from 'react'
import useSWRImmutable from 'swr/immutable'

import useChainConfig from '../chain/useChainConfig'
import useClients from '../chain/useClients'

export function usePerpsParams(denom: string) {
  /* PERPS
  const perpsParams = useAllPerpsParams()

  return useMemo(() => {
    
    if (!perpsParams) return null
    return perpsParams.find(byDenom(denom)) as PerpsParams
  
  }, [denom, perpsParams ])
    */
  return null
}

export function useAllPerpsParams() {
  const { data: perpsParams } = useAllPerpsParamsSC()

  return useMemo(() => perpsParams?.map(resolvePerpsParams), [perpsParams])
}

export function useAllPerpsParamsSC() {
  const chainConfig = useChainConfig()
  const clients = useClients()

  return useSWRImmutable(
    clients && chainConfig.perps && `chains/${chainConfig.id}/perps/params`,
    async () => getPerpsParams(chainConfig, clients!),
    { suspense: true },
  )
}

async function getPerpsParams(chainConfig: ChainConfig, clients: ContractClients) {
  /* PERPS
  if (!chainConfig.perps) return []
  return iterateContractQuery(clients.params.allPerpParams, undefined, [])
  */
  return []
}

/* PERPS
function resolvePerpsParams(param: PerpParams) {
  return {
    denom: param.denom,
    openingFeeRate: BN(param.opening_fee_rate),
    closingFeeRate: BN(param.closing_fee_rate),
    minPositionValue: BN(param.min_position_value),
    maxPositionValue: param.max_position_value ? BN(param.max_position_value) : null,
    maxOpenInterestShort: BN(param.max_short_oi_value),
    maxOpenInterestLong: BN(param.max_long_oi_value),
  } as PerpsParams
}
*/
function resolvePerpsParams() {
  return [{ denom: '' }]
}
