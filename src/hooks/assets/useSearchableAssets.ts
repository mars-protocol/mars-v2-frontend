import { useMemo } from 'react'

import useAssets from 'hooks/assets/useAssets'

export default function useSearchableAssets() {
  const { data: assets } = useAssets()

  return useMemo(() => {
    if (!assets) return []

    return assets.filter(
      (asset) =>
        !asset.isDeprecated &&
        // Only include assets with Market data (lending/borrowing) or perps data
        // Exclude trade-only assets since we don't have comprehensive market data for them
        (asset.isPerpsEnabled || asset.isBorrowEnabled || asset.isDepositEnabled) &&
        asset.isWhitelisted,
    )
  }, [assets])
}
