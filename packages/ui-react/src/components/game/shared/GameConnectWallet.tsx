import { Avatar, Name } from "@coinbase/onchainkit/identity"
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet"
import { cn } from "../../../lib/utils"

export function GameConnectWallet() {
  return (
    <Wallet>
      <ConnectWallet
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          "bg-neutral-background hover:bg-neutral-background-hover",
          "rounded-[12px]",
          "border border-border-stroke",
          "px-3 py-1.5 h-[44px]",
          "text-connect-btn-font",
        )}
        disconnectedLabel="Connect"
      >
        <div className="flex items-center">
          <Avatar className="h-7 w-7 mr-2" address="0x838aD0EAE54F99F1926dA7C3b6bFbF617389B4D9" />
          <Name className="text-title-color" />
        </div>
      </ConnectWallet>
    </Wallet>
  )
}
