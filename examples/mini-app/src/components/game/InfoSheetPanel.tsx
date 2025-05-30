import { chainById, Token } from "@betswirl/sdk-core"
import { useChain } from "../../context/chainContext"
import { cn } from "../../lib/utils"
import { SheetBottomPanelContent, SheetOverlay, SheetPortal } from "../ui/sheet"

interface InfoSheetPanelProps {
  portalContainer: HTMLElement
  winChance: number
  rngFee: number | string // formatted
  targetPayout: number | string // formatted
  gasPrice: number | string // gwei formatted
  token: Token
}

export function InfoSheetPanel({
  portalContainer,
  winChance,
  rngFee,
  targetPayout,
  gasPrice,
  token,
}: InfoSheetPanelProps) {
  const { appChainId } = useChain()
  return (
    <SheetPortal container={portalContainer}>
      <SheetOverlay className="!absolute !inset-0 !bg-black/60" />
      <SheetBottomPanelContent
        className={cn("!h-auto !max-h-[70%]", "p-5 sm:p-6")}
      >
        <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3 sm:gap-y-4 text-sm font-medium text-text-on-surface-variant">
          <div>
            <p>Win chance:</p>
            <p className="text-text-on-surface">{winChance}%</p>
          </div>
          <div>
            <p>RNG fee:</p>
            <p className="text-text-on-surface">
              {rngFee} {chainById[appChainId].nativeCurrency.symbol}
            </p>
          </div>
          <div>
            <p>Target payout:</p>
            <p className="text-text-on-surface">
              {targetPayout} {token.symbol}
            </p>
          </div>
          <div>
            <p>Gas price:</p>
            <p className="text-text-on-surface">{gasPrice} gwei</p>
          </div>
        </div>
      </SheetBottomPanelContent>
    </SheetPortal>
  )
}
