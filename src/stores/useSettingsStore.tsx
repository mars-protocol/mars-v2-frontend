import create from 'zustand'

interface SettingsStore {
  enableAnimations: boolean
}

export const useSettingsStore = create<SettingsStore>()(() => ({
  enableAnimations: true,
}))
