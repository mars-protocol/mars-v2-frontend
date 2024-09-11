import { useMemo } from 'react'
import { getTokenPrice } from '../../utils/tokens'
import useAssets from '../assets/useAssets'

export default function usePrice(denom: string) {
  const { data: assets } = useAssets()

  return useMemo(() => getTokenPrice(denom, assets), [denom, assets])
}
