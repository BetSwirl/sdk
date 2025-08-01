import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Hex } from "viem"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toLowerCase(address: string): Hex {
  return `0x${address.toLowerCase()}`
}

export function getTokenImage(symbol: string): string {
  return `https://www.betswirl.com/img/tokens/${symbol.toUpperCase()}.svg`
}
