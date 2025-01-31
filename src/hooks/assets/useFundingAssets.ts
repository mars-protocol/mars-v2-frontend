import { useCallback, useEffect, useRef, useState } from 'react'
import { WrappedBNCoin } from 'types/classes/WrappedBNCoin'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export function useFundingAssets(selectedDenoms: string[]) {
  const [fundingAssets, setFundingAssets] = useState<WrappedBNCoin[]>([])
  const prevSelectedDenomsRef = useRef<string[]>([])

  useEffect(() => {
    if (JSON.stringify(prevSelectedDenomsRef.current) === JSON.stringify(selectedDenoms)) {
      return
    }

    const currentSelectedDenom = fundingAssets.map((asset) =>
      asset.chain ? `${asset.coin.denom}:${asset.chain}` : asset.coin.denom,
    )

    if (
      selectedDenoms.every((denom) => currentSelectedDenom.includes(denom)) &&
      selectedDenoms.length === currentSelectedDenom.length
    ) {
      return
    }

    const newFundingAssets = selectedDenoms.map((denomWithChain) => {
      const [denom, chainName] = denomWithChain.split(':')
      const effectiveChainName = chainName && chainName !== 'undefined' ? chainName : undefined

      const coin = BNCoin.fromDenomAndBigNumber(denom, BN('0'))
      return WrappedBNCoin.fromBNCoin(coin, effectiveChainName)
    })

    setFundingAssets(newFundingAssets)

    prevSelectedDenomsRef.current = selectedDenoms
  }, [selectedDenoms, fundingAssets])

  const updateFundingAssets = useCallback(
    (amount: BigNumber, denom: string, chainName?: string) => {
      setFundingAssets((fundingAssets) => {
        const updateIdx = fundingAssets.findIndex(
          (asset) =>
            asset.coin.denom === denom &&
            ((!chainName && !asset.chain) || chainName === asset.chain),
        )

        if (updateIdx === -1) return fundingAssets

        const updatedCoin = BNCoin.fromDenomAndBigNumber(denom, amount)
        const updatedAsset = WrappedBNCoin.fromBNCoin(updatedCoin, chainName)

        return [
          ...fundingAssets.slice(0, updateIdx),
          updatedAsset,
          ...fundingAssets.slice(updateIdx + 1),
        ]
      })
    },
    [],
  )

  return { fundingAssets, updateFundingAssets, setFundingAssets }
}
