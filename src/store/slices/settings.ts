import { GetState, SetState } from 'zustand'

import { DEFAULT_SETTINGS } from 'constants/defaultSettings'

export default function createSettingsSlice(
  set: SetState<SettingsSlice>,
  get: GetState<SettingsSlice>,
) {
  return DEFAULT_SETTINGS
}
