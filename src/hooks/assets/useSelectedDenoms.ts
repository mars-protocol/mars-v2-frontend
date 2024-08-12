import { useCallback, useState } from 'react'
import useStore from 'store'

export function useSelectedDenoms(
  filteredAssets: Asset[],
  onChangeDenoms: (denoms: string[]) => void,
) {
  const currentSelectedDenom = useStore((s) => s.walletAssetsModal?.selectedDenoms ?? [])
  const [selectedDenoms, setSelectedDenoms] = useState<string[]>(
    currentSelectedDenom.filter(
      (denom) =>
        filteredAssets.findIndex((asset) => `${asset.denom}:${asset.chainName}` === denom) !== -1,
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
