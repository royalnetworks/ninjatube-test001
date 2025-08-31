export type ToggleKey = "weekendDoubleBonus" | "storeOpen" | "adRewardsEnabled"

type Toggles = Record<ToggleKey, boolean>

const toggles: Toggles = {
  weekendDoubleBonus: false,
  storeOpen: true,
  adRewardsEnabled: true,
}

export const TogglesStore = {
  getAll: (): Toggles => ({ ...toggles }),
  set: (key: ToggleKey, value: boolean) => {
    toggles[key] = value
    return { key, value }
  },
}
