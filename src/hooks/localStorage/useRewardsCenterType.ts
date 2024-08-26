import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { RewardsCenterType } from 'types/enums'

export default function useRewardsCenterType() {
  const chainConfig = useChainConfig()
  return useLocalStorage<RewardsCenterType>(
    LocalStorageKeys.REWARDS_CENTER_TYPE,
    getDefaultChainSettings(chainConfig).rewardsCenterType,
  )
}
