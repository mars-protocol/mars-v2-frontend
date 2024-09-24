import useAssets from 'hooks/assets/useAssets'
import { useMemo } from 'react'
import { getTokenPrice } from 'utils/tokens'

export default function usePrice(denom: string) {
  const { data: assets } = useAssets()

  return useMemo(() => getTokenPrice(denom, assets), [denom, assets])
}
