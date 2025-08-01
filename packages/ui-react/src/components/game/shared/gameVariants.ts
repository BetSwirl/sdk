import { GameVariant, VariantConfigMap } from "./types"

export const VARIANT_CONFIG: VariantConfigMap = {
  default: {
    card: {
      height: "",
    },
    gameArea: {
      height: "h-[160px]",
      rounded: "rounded-[16px]",
      contentClass: "flex flex-col gap-4",
    },
  },
  roulette: {
    card: {
      height: "h-[527px]",
    },
    gameArea: {
      height: "h-[173px]",
      rounded: "rounded-[16px]",
      contentClass: "",
    },
  },
  keno: {
    card: {
      height: "h-[550px]",
    },
    gameArea: {
      height: "h-[198px]",
      rounded: "rounded-[16px]",
      contentClass: "",
    },
  },
  wheel: {
    card: {
      height: "h-[550px]",
    },
    gameArea: {
      height: "h-[198px]",
      rounded: "rounded-[16px]",
      contentClass: "",
    },
  },
} as const

export function getVariantConfig(variant: GameVariant) {
  return VARIANT_CONFIG[variant]
}
