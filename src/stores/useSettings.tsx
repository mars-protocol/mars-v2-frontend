import create from 'zustand'

interface SettingsStore {
  animationsEnabled: boolean
}

export const useSettings = create<SettingsStore>()(() => ({
  animationsEnabled: true,
}))
