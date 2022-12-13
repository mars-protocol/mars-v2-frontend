import create from 'zustand'

interface SettingsStore {
  enableAnimations: boolean
}

export const useSettings = create<SettingsStore>()(() => ({
  enableAnimations: true,
}))
