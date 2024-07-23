import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { RewardsCenterType } from 'types/enums'

export default function useRewardsCenterType() {
  return useLocalStorage<RewardsCenterType>(
    LocalStorageKeys.REWARDS_CENTER_TYPE,
    DEFAULT_SETTINGS.rewardsCenterType,
  )
}
