import { useMemo } from 'react'
import useSWR from 'swr'

import useChainConfig from 'hooks/useChainConfig'
import useClients from 'hooks/useClients'
import { PerpParams } from 'types/generated/mars-params/MarsParams.types'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import iterateContractQuery from 'utils/iterateContractQuery'

export function usePerpsParams(denom: string) {
  const perpsParams = useAllPerpsParams()

  return useMemo(() => perpsParams?.find(byDenom(denom)) as PerpsParams, [denom, perpsParams])
}

export function useAllPerpsParams() {
  const { data: perpsParams } = useAllPerpsParamsSC()

  return useMemo(() => perpsParams?.map(resolvePerpsParams), [perpsParams])
}

export function useAllPerpsParamsSC() {
  const chainConfig = useChainConfig()
  const clients = useClients()
  return useSWR(clients && `chains/${chainConfig.id}/perps/params`, async () =>
    getPerpsParams(clients!),
  )
}

async function getPerpsParams(clients: ContractClients) {
  return iterateContractQuery(clients.params.allPerpParams, undefined, [])
}

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

export interface PerpsParams {
  denom: string
  closingFeeRate: BigNumber
  maxOpenInterestLong: BigNumber
  maxOpenInterestShort: BigNumber
  maxPositionValue: BigNumber | null
  minPositionValue: BigNumber
  openingFeeRate: BigNumber
}
