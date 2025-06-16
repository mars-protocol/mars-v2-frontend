import { useMemo, useState } from 'react'
import { BN_ZERO } from 'constants/math'
import { LEVEL_CONFIGS, LevelConfig, MARS_DECIMALS, MARS_DENOM } from 'constants/levels'
import useAssets from 'hooks/assets/useAssets'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import { useStakedMars } from 'hooks/levels/useNeutronStakingData'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import useStore from 'store'

export interface LevelSystemData {
  currentLevel: LevelConfig
  nextLevel: LevelConfig | null
  stakedAmount: BigNumber
  walletBalance: BigNumber
  progressToNextLevel: number
  marsNeededForNextLevel: BigNumber
  totalMarsBalance: BigNumber
  marsAsset: Asset | null
}

export interface LevelSystemActions {
  stake: (amount: BigNumber) => Promise<void>
  unstake: (amount: BigNumber) => Promise<void>
  withdraw: () => Promise<void>
  setStakedAmount: (amount: BigNumber) => void
}

export default function useLevelSystem(): [LevelSystemData, LevelSystemActions] {
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

  const levelData = useMemo((): LevelSystemData => {
    const stakedMars = localStakedAmount || stakedMarsData?.stakedAmount || BN_ZERO
    const walletMars = walletBalanceBN
    const totalMars = stakedMars.plus(walletMars)

    let currentLevel = LEVEL_CONFIGS[0]
    for (let i = LEVEL_CONFIGS.length - 1; i >= 0; i--) {
      if (stakedMars.gte(LEVEL_CONFIGS[i].minAmount)) {
        currentLevel = LEVEL_CONFIGS[i]
        break
      }
    }

    const nextLevel = LEVEL_CONFIGS.find((level) => level.minAmount > stakedMars.toNumber()) || null

    let progressToNextLevel = 100
    let marsNeededForNextLevel = BN_ZERO

    if (nextLevel) {
      const currentLevelMin = currentLevel.minAmount
      const nextLevelMin = nextLevel.minAmount
      const progress = stakedMars
        .minus(currentLevelMin)
        .div(nextLevelMin - currentLevelMin)
        .times(100)
      progressToNextLevel = Math.min(100, Math.max(0, progress.toNumber()))
      marsNeededForNextLevel = BN(nextLevel.minAmount).minus(stakedMars)
    }

    return {
      currentLevel,
      nextLevel,
      stakedAmount: stakedMars,
      walletBalance: walletMars,
      progressToNextLevel,
      marsNeededForNextLevel,
      totalMarsBalance: totalMars,
      marsAsset: marsAsset || null,
    }
  }, [localStakedAmount, stakedMarsData?.stakedAmount, walletBalanceBN, marsAsset])

  const actions: LevelSystemActions = {
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

  return [levelData, actions]
}
