import useSWRImmutable from 'swr/immutable'

import getAssetParams from 'api/params/getAssetParams'
import useChainConfig from 'hooks/chain/useChainConfig'
import { AssetParamsBaseForAddr } from 'types/generated/mars-params/MarsParams.types'

export default function useAssetParams() {
  const chainConfig = useChainConfig()
  return useSWRImmutable(
    `chains/${chainConfig.id}/assets/params`,
    async () => addParamWithdrawEnabled(await getAssetParams(chainConfig)),
    {
      suspense: true,
    },
  )
}

function addParamWithdrawEnabled(params: AssetParamsBaseForAddr[]) {
  return params.map((param) => ({
    ...param,
    credit_manager: {
      ...param['credit_manager'],
      withdraw_enabled: true,
    },
    red_bank: {
      ...param['red_bank'],
      withdraw_enabled: true,
    },
  }))
}
