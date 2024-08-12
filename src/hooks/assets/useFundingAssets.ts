import { useCallback, useEffect, useRef, useState } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export function useFundingAssets(selectedDenoms: string[]) {
  const [fundingAssets, setFundingAssets] = useState<BNCoin[]>([])
  const prevSelectedDenomsRef = useRef<string[]>([])

  useEffect(() => {
    if (JSON.stringify(prevSelectedDenomsRef.current) === JSON.stringify(selectedDenoms)) {
      return
    }

    const currentSelectedDenom = fundingAssets.map((asset) =>
      asset.chainName ? `${asset.denom}:${asset.chainName}` : asset.denom,
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

      return BNCoin.fromDenomAndBigNumber(denom, BN('0'), effectiveChainName)
    })

    setFundingAssets(newFundingAssets)

    prevSelectedDenomsRef.current = selectedDenoms
  }, [selectedDenoms, fundingAssets])

  const updateFundingAssets = useCallback(
    (amount: BigNumber, denom: string, chainName?: string) => {
      setFundingAssets((fundingAssets) => {
        const updateIdx = fundingAssets.findIndex((asset) => asset.denom === denom)
        if (updateIdx === -1) return fundingAssets
        const updatedAsset = BNCoin.fromDenomAndBigNumber(denom, amount, chainName)
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
