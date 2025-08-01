import { cn } from "../../lib/utils"
import { HistoryEntry } from "../../types/types"
import { ScrollArea } from "../ui/scroll-area"
import { SheetBottomPanelContent, SheetOverlay, SheetPortal } from "../ui/sheet"
import { TokenIcon } from "../ui/TokenIcon"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

interface HistorySheetPanelProps {
  portalContainer: HTMLElement
  historyData: HistoryEntry[]
  className?: string
}

export function HistorySheetPanel({
  portalContainer,
  historyData,
  className,
}: HistorySheetPanelProps) {
  const isEmpty = historyData.length === 0

  return (
    <SheetPortal container={portalContainer}>
      <SheetOverlay className="!absolute !inset-0 !bg-black/60" />
      <SheetBottomPanelContent
        className={cn(isEmpty ? "!h-auto !max-h-[70%]" : "!h-[70%] !max-h-full", "p-0", className)}
      >
        <ScrollArea className="h-full w-full rounded-t-[16px] overflow-hidden">
          <div className="p-1 pt-0">
            <Table className="text-sm font-medium">
              <TableHeader>
                <TableRow className="border-b border-table-separator">
                  <TableHead className="px-3 py-2.5 text-text-on-surface-variant top-0 bg-menu-bg">
                    Draw
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-right text-text-on-surface-variant top-0 bg-menu-bg">
                    X
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-right text-text-on-surface-variant top-0 bg-menu-bg">
                    Payout
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-right text-text-on-surface-variant top-0 bg-menu-bg">
                    Time
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isEmpty ? (
                  <TableRow className="border-b-0">
                    <TableCell colSpan={4} className="px-3 py-6 text-left align-top">
                      <div>
                        <p className="text-base text-card-foreground font-semibold">
                          No bets currently
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">
                          Play the game to make your first bet
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  historyData.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className="border-b border-table-separator last:border-b-0"
                    >
                      <TableCell
                        className={cn(
                          "px-3 py-2.5",
                          entry.status === "Won bet" ? "text-game-win" : "text-game-loss",
                        )}
                      >
                        {entry.status}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right text-table-text">
                        {entry.multiplier}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-table-text">
                        <div className="flex items-center justify-end gap-1">
                          <span>{entry.payoutAmount}</span>
                          <TokenIcon token={entry.payoutCurrencyToken} size={18} />
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right text-text-on-surface-variant">
                        {entry.timestamp}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </SheetBottomPanelContent>
    </SheetPortal>
  )
}
