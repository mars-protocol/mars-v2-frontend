import { BNCoin } from 'types/classes/BNCoin'
import useStore from 'store'
import { MARS_DENOM } from 'utils/constants'

export interface MarsStakingActions {
  stake: (amount: BigNumber) => Promise<void>
  unstake: (amount: BigNumber) => Promise<void>
  withdraw: () => Promise<void>
}

export function useMarsStakingActions(): MarsStakingActions {
  const stakeMars = useStore((s) => s.stakeMars)
  const unstakeMars = useStore((s) => s.unstakeMars)
  const withdrawMars = useStore((s) => s.withdrawMars)

  const actions: MarsStakingActions = {
    stake: async (amount: BigNumber) => {
      try {
        const stakingAmount = BNCoin.fromDenomAndBigNumber(MARS_DENOM, amount)
        const success = await stakeMars(stakingAmount)
        if (!success) {
          throw new Error('Staking transaction failed')
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
        if (!success) {
          throw new Error('Unstaking transaction failed')
        }
      } catch (error) {
        console.error('Failed to unstake MARS:', error)
        throw error
      }
    },

    withdraw: async () => {
      try {
        const success = await withdrawMars()
        if (!success) {
          throw new Error('Withdraw transaction failed')
        }
      } catch (error) {
        console.error('Failed to withdraw MARS:', error)
        throw error
      }
    },
  }

  return actions
}
