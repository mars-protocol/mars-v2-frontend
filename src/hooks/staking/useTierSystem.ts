import { BN_ZERO } from 'constants/math'
import { MARS_DECIMALS, MARS_DENOM, TIER_CONFIGS, TierConfig } from 'constants/tiers'
import useAssets from 'hooks/assets/useAssets'
import { useStakedMars } from 'hooks/staking/useNeutronStakingData'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import { useMemo, useState } from 'react'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export interface TierSystemData {
  currentTier: TierConfig
  nextTier: TierConfig | null
  stakedAmount: BigNumber
  walletBalance: BigNumber
  progressToNextTier: number // 0-100 percentage
  marsNeededForNextTier: BigNumber
  totalMarsBalance: BigNumber
  marsAsset: Asset | null
}

export interface TierSystemActions {
  stake: (amount: BigNumber) => Promise<void>
  unstake: (amount: BigNumber) => Promise<void>
  withdraw: () => Promise<void>
  setStakedAmount: (amount: BigNumber) => void
}

export default function useTierSystem(): [TierSystemData, TierSystemActions] {
  const { data: stakedMarsData } = useStakedMars()
  const [localStakedAmount, setLocalStakedAmount] = useState<BigNumber | null>(null)

  const { data: assets } = useAssets()
  const marsAsset = useMemo(() => {
    return assets?.find((asset) => asset.denom === MARS_DENOM) || null
  }, [assets])
  const stakeMars = useStore((s) => s.stakeMars)
  const unstakeMars = useStore((s) => s.unstakeMars)
  const withdrawMars = useStore((s) => s.withdrawMars)

  const walletBalance = useCurrentWalletBalance(MARS_DENOM)
  const walletBalanceBN = useMemo(() => {
    return walletBalance ? BN(walletBalance.amount).shiftedBy(-MARS_DECIMALS) : BN_ZERO
  }, [walletBalance])

  const tierData = useMemo((): TierSystemData => {
    const stakedMars = localStakedAmount || stakedMarsData?.stakedAmount || BN_ZERO
    const walletMars = walletBalanceBN
    const totalMars = stakedMars.plus(walletMars)

    let currentTier = TIER_CONFIGS[0]
    for (let i = TIER_CONFIGS.length - 1; i >= 0; i--) {
      if (stakedMars.gte(TIER_CONFIGS[i].minAmount)) {
        currentTier = TIER_CONFIGS[i]
        break
      }
    }

    const nextTier = TIER_CONFIGS.find((tier) => tier.minAmount > stakedMars.toNumber()) || null

    let progressToNextTier = 100
    let marsNeededForNextTier = BN_ZERO

    if (nextTier) {
      const currentTierMin = currentTier.minAmount
      const nextTierMin = nextTier.minAmount
      const progress = stakedMars
        .minus(currentTierMin)
        .div(nextTierMin - currentTierMin)
        .times(100)
      progressToNextTier = Math.min(100, Math.max(0, progress.toNumber()))
      marsNeededForNextTier = BN(nextTier.minAmount).minus(stakedMars)
    }

    return {
      currentTier,
      nextTier,
      stakedAmount: stakedMars,
      walletBalance: walletMars,
      progressToNextTier,
      marsNeededForNextTier,
      totalMarsBalance: totalMars,
      marsAsset: marsAsset || null,
    }
  }, [localStakedAmount, stakedMarsData?.stakedAmount, walletBalanceBN, marsAsset])

  const actions: TierSystemActions = {
    stake: async (amount: BigNumber) => {
      try {
        const stakingAmount = BNCoin.fromDenomAndBigNumber(MARS_DENOM, amount)

        const success = await stakeMars(stakingAmount)

        if (success) {
          const currentStaked = localStakedAmount || stakedMarsData?.stakedAmount || BN_ZERO
          const amountInMarsTokens = amount.shiftedBy(-MARS_DECIMALS) // Convert microMARS back to MARS tokens
          setLocalStakedAmount(currentStaked.plus(amountInMarsTokens))
        }
      } catch (error) {
        console.error('Failed to stake MARS:', error)
        throw error
      }
    },

    unstake: async (amount: BigNumber) => {
      try {
        const unstakingAmount = BNCoin.fromDenomAndBigNumber(MARS_DENOM, amount)

        const success = await unstakeMars(unstakingAmount)

        if (success) {
          const currentStaked = localStakedAmount || stakedMarsData?.stakedAmount || BN_ZERO
          const amountInMarsTokens = amount.shiftedBy(-MARS_DECIMALS) // Convert microMARS back to MARS tokens
          setLocalStakedAmount(currentStaked.minus(amountInMarsTokens))
        }
      } catch (error) {
        console.error('Failed to unstake MARS:', error)
        throw error
      }
    },

    withdraw: async () => {
      try {
        await withdrawMars()
      } catch (error) {
        console.error('Failed to withdraw MARS:', error)
        throw error
      }
    },

    setStakedAmount: (amount: BigNumber) => {
      setLocalStakedAmount(amount)
    },
  }

  return [tierData, actions]
}
