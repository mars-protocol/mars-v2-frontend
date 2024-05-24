import { BN_ZERO } from 'constants/math'
import useAllAssets from 'hooks/assets/useAllAssets'

export default function usePrice(denom: string) {
  const { data: assets } = useAllAssets()

  return assets.find((asset) => asset.denom === denom)?.price?.amount ?? BN_ZERO
}
