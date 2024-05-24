import { BN_ZERO } from 'constants/math'
import useAssets from 'hooks/assets/useAssets'

export default function usePrice(denom: string) {
  const { data: assets } = useAssets()

  return assets.find((asset) => asset.denom === denom)?.price?.amount ?? BN_ZERO
}
