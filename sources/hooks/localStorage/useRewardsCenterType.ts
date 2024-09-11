import { getDefaultChainSettings } from '../../constants/defaultSettings'
import { LocalStorageKeys } from '../../constants/localStorageKeys'
import { RewardsCenterType } from '../../types/enums'
import useChainConfig from '../chain/useChainConfig'
import useLocalStorage from './useLocalStorage'

export default function useRewardsCenterType() {
  const chainConfig = useChainConfig()
  return useLocalStorage<RewardsCenterType>(
    LocalStorageKeys.REWARDS_CENTER_TYPE,
    getDefaultChainSettings(chainConfig).rewardsCenterType,
  )
}
