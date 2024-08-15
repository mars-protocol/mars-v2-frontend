import { useCallback, useEffect, useState } from 'react'
import useStore from 'store'

export function useSelectedDenoms(
  filteredAssets: Asset[],
  onChangeDenoms: (denoms: string[]) => void,
  isConnected: boolean,
) {
  const currentSelectedDenom = useStore((s) => s.walletAssetsModal?.selectedDenoms ?? [])
  const [selectedDenoms, setSelectedDenoms] = useState<string[]>(
    currentSelectedDenom.filter((denom) =>
      isConnected
        ? filteredAssets.findIndex((asset) => `${asset.denom}:${asset.chainName}` === denom) !== -1
        : filteredAssets.findIndex((asset) => `${asset.denom}` === denom) !== -1,
    ),
  )

  const onChangeSelect = useCallback(
    (denoms: string[]) => {
      setSelectedDenoms(denoms)
      onChangeDenoms(denoms)
    },
    [onChangeDenoms],
  )

  return { selectedDenoms, onChangeSelect }
}
