import { useMemo } from 'react'
import useTierSystem from 'hooks/staking/useTierSystem'

/**
 * Hook to calculate the adjusted swap fee based on the user's staking tier
 * The swap fee is reduced according to the tier's swapFeeReduction percentage
 *
 * @param baseSwapFee - The base swap fee from chainConfig
 * @returns The adjusted swap fee after applying the tier reduction
 *
 * @example
 * // If baseSwapFee is 0.0005 (0.05%) and user is Tier 5 (45% reduction):
 * // adjustedFee = 0.0005 * (1 - 0.45) = 0.000275 (0.0275%)
 */
export default function useAdjustedSwapFee(baseSwapFee: number): number {
  const { data: tierData } = useTierSystem()

  const adjustedSwapFee = useMemo(() => {
    // Apply the tier's swap fee reduction
    // Formula: adjustedFee = baseSwapFee * (1 - swapFeeReduction)
    const reduction = tierData.currentTier.swapFeeReduction
    return baseSwapFee * (1 - reduction)
  }, [baseSwapFee, tierData.currentTier.swapFeeReduction])

  return adjustedSwapFee
}
