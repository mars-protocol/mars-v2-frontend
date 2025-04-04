import { useCallback, useEffect, useState } from 'react'
import useStore from 'store'

export function useSelectedDenoms(
  filteredAssets: Asset[],
  onChangeDenoms: (denoms: string[]) => void,
  isConnected: boolean,
) {
  const currentSelectedDenom = useStore((s) => s.walletAssetsModal?.selectedDenoms ?? [])

  const [selectedDenoms, setSelectedDenoms] = useState<string[]>(() => {
    return currentSelectedDenom.filter((denomWithChain) => {
      const [denom, chainName] = denomWithChain.split(':')
      return filteredAssets.some(
        (asset) =>
          asset.denom === denom && (!chainName ? !asset.chainName : asset.chainName === chainName),
      )
    })
  })

  const onChangeSelect = useCallback(
    (denoms: string[]) => {
      const formattedDenoms = denoms.map((denom) => {
        const [baseDenom, chain] = denom.split(':')
        return chain ? `${baseDenom}:${chain}` : baseDenom
      })
      setSelectedDenoms(formattedDenoms)
      onChangeDenoms(formattedDenoms)
    },
    [onChangeDenoms],
  )

  return { selectedDenoms, onChangeSelect }
}
