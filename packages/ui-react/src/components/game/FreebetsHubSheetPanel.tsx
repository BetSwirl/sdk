import { formatRawAmount, SignedFreebet } from "@betswirl/sdk-core"
import { useState } from "react"
import { useFreebetsContext } from "../../context/FreebetsContext"
import { useFreebetCode } from "../../hooks/useFreebetCode"
import { cn, getTokenImage } from "../../lib/utils"
import { formatExpireAt } from "../../utils/formatExpireAt"
import { Button } from "../ui/button"
import { ChainIcon } from "../ui/ChainIcon"
import { ScrollArea } from "../ui/scroll-area"
import { SheetBottomPanelContent, SheetOverlay, SheetPortal } from "../ui/sheet"
import { TokenIcon } from "../ui/TokenIcon"
import { PromoCodeInput } from "./PromoCodeInput"

const PANEL_HEIGHT_CONNECTED = "!h-[70%]" // Larger height for connected state
const PANEL_HEIGHT_DISCONNECTED = "!h-[238px]" // Smaller height for disconnected state

interface FreebetsHubSheetPanelProps {
  portalContainer: HTMLElement
  isConnected: boolean
  freebets: SignedFreebet[]
  onConnectWallet: () => void
  onSelectFreebet: (freebet: SignedFreebet) => void
}

const MAX_CODE_LENGTH = 10

export function FreebetsHubSheetPanel({
  portalContainer,
  isConnected,
  freebets,
  onConnectWallet,
  onSelectFreebet,
}: FreebetsHubSheetPanelProps) {
  const [codeInput, setCodeInput] = useState("")
  const [isClaimSuccess, setIsClaimSuccess] = useState(false)
  const { errorClaimProcess, isClaimProcessloading, claimFreebetCode } = useFreebetCode(codeInput)
  const { refetchFreebets } = useFreebetsContext()

  const handleClaimCode = () => {
    if (codeInput.trim().length !== MAX_CODE_LENGTH) {
      return
    }
    setIsClaimSuccess(false)
    claimFreebetCode(() => {
      setCodeInput("")
      setIsClaimSuccess(true)
      // Refresh freebet list
      refetchFreebets()
    })
  }

  const handleFreeBetClick = (freeBet: SignedFreebet) => {
    onSelectFreebet(freeBet)
  }

  return (
    <SheetPortal container={portalContainer}>
      <SheetOverlay className="!absolute !inset-0 !bg-black/60" />
      <SheetBottomPanelContent
        className={cn(
          isConnected ? PANEL_HEIGHT_CONNECTED : PANEL_HEIGHT_DISCONNECTED,
          "!max-h-full",
          "p-0",
        )}
      >
        <ScrollArea className="h-full w-full rounded-t-[16px] overflow-hidden">
          <div className="flex flex-col p-[16px]">
            <h2 className="text-xl font-bold mb-[12px] leading-[24px] text-[18px]">Freebets</h2>

            {!isConnected ? (
              // Disconnected state
              <div className="flex flex-col items-center gap-[12px]">
                <Button
                  onClick={onConnectWallet}
                  size="lg"
                  className={cn(
                    "w-full",
                    "bg-primary",
                    "rounded-[16px]",
                    "h-[48px]",
                    "text-play-btn-font font-bold",
                  )}
                >
                  Connect Wallet
                </Button>

                <div
                  className={cn(
                    "w-full h-[110px] p-[12px] rounded-[16px]",
                    "bg-free-bet-card-section-bg",
                    "text-text-on-surface-variant",
                    "flex flex-col gap-3",
                  )}
                >
                  <h3 className="font-semibold text-foreground text-[16px] leading-[16px]">
                    Casino freebets
                  </h3>
                  <p className="leading-relaxed text-[12px] leading-[18px]">
                    Connect your wallet to view and manage your freebets. When you win a casino
                    freebet, you receive the entire won payout.
                  </p>
                </div>
              </div>
            ) : (
              // Connected state
              <div className="flex flex-col gap-[12px]">
                {/* Freebets code claim */}

                <div
                  className={cn(
                    "rounded-[16px]",
                    "bg-free-bet-card-section-bg",
                    "gap-[8px]",
                    "flex flex-col",
                    "py-[16px]",
                    "px-[12px]",
                  )}
                >
                  <p className="text-[12px] text-text-on-surface-variant">
                    If you have a code, you can claim your freebet here.
                  </p>
                  <div className="flex gap-2">
                    <PromoCodeInput
                      value={codeInput}
                      onChange={(e) => {
                        setCodeInput(e.target.value)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleClaimCode()
                        }
                      }}
                      maxLength={MAX_CODE_LENGTH}
                      error={errorClaimProcess}
                      isSuccess={isClaimSuccess}
                      placeholder="Code"
                    />
                    <Button
                      onClick={handleClaimCode}
                      disabled={
                        isClaimProcessloading || codeInput.trim().length !== MAX_CODE_LENGTH
                      }
                      className={cn(
                        "bg-primary",
                        "text-play-btn-font font-bold text-[14px]",
                        "rounded-[16px]",
                        "h-10 px-4",
                        "disabled:opacity-50",
                      )}
                    >
                      Claim
                    </Button>
                  </div>
                </div>

                {/* Casino freebets section */}
                <div className="flex flex-col gap-[8px]">
                  <h3 className="font-bold text-[16px] leading-[24px]">Casino freebets</h3>

                  {freebets.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {freebets.map((freeBet) => (
                        <Button
                          key={freeBet.id}
                          variant="ghost"
                          onClick={() => handleFreeBetClick(freeBet)}
                          className={cn(
                            "p-4 rounded-[12px] h-auto w-full",
                            "bg-free-bet-card-section-bg",
                            "flex flex-col gap-3",
                            "text-[14px] leading-[22px]",
                            "hover:bg-free-bet-card-section-bg/80 transition-colors",
                            "text-left justify-start items-stretch",
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <h4 className="font-semibold text-sm max-w-[150px] overflow-hidden text-ellipsis">
                              {freeBet.campaign.label}
                            </h4>
                            <div className="flex items-center gap-2">
                              <TokenIcon
                                token={{
                                  ...freeBet.token,
                                  image: getTokenImage(freeBet.token.symbol),
                                }}
                                size={20}
                              />
                              <span className="font-bold text-[12px] leading-[20px]">
                                {formatRawAmount(freeBet.amount)} {freeBet.token.symbol}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between w-full">
                            <ChainIcon chainId={freeBet.chainId} size={18} className="" />
                            <p className="text-[12px] leading-[18px] text-text-on-surface-variant text-right break-words">
                              Expire: {formatExpireAt(freeBet.expirationDate)}
                            </p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "w-full p-6 rounded-[12px]",
                        "bg-free-bet-card-section-bg",
                        "flex items-center justify-center",
                      )}
                    >
                      <p className="text-[14px] text-text-on-surface-variant">
                        You currently have no freebets.
                      </p>
                    </div>
                  )}

                  {/* Footer text */}
                  <p className="text-[12px] leading-[18px] text-text-on-surface-variant">
                    You can use your freebets directly while playing casino games. When you win a
                    casino freebet, you receive the entire won payout.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetBottomPanelContent>
    </SheetPortal>
  )
}
