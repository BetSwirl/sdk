import { KenoBall, KenoConfiguration } from "@betswirl/sdk-core"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import React from "react"
import { Button } from "../ui/button"
import { Tooltip, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

interface KenoMultiplierData {
  multiplier: number
  winChance: number
}

interface KenoGameControlsProps {
  selectedNumbers: KenoBall[]
  onNumbersChange: (numbers: KenoBall[]) => void
  kenoConfig: KenoConfiguration
  multipliers: KenoMultiplierData[]
  isDisabled: boolean
  lastGameWinningNumbers?: number[]
}

interface NumberButtonProps {
  number: KenoBall
  isSelected: boolean
  isDisabled: boolean
  isWinningNumber: boolean
  onClick: (number: KenoBall) => void
}

interface MultiplierItemProps {
  data: KenoMultiplierData
  isVisible: boolean
}

const BUTTON_STYLES = {
  unselected: {
    background: "bg-keno-unselected-bg",
    border: "border border-keno-unselected-border",
    text: "text-keno-unselected-text",
    hover: "hover:bg-keno-unselected-hover-bg hover:border-primary hover:text-keno-unselected-text",
    focus:
      "focus:bg-keno-unselected-hover-bg focus:border-primary focus:text-keno-unselected-text focus:outline-none focus-visible:ring-0",
  },
  unselectedWinning: {
    background: "bg-keno-unselected-bg",
    border: "border-2 border-keno-winning-border",
    text: "text-keno-unselected-text",
    hover:
      "hover:bg-keno-unselected-hover-bg hover:border-keno-winning-border hover:text-keno-unselected-text",
    focus:
      "focus:bg-keno-unselected-hover-bg focus:border-keno-winning-border focus:text-keno-unselected-text focus:outline-none focus-visible:ring-0",
  },
  selected: {
    background: "bg-primary",
    border: "",
    text: "text-primary-foreground",
    hover: "hover:brightness-105 hover:bg-primary hover:text-primary-foreground",
    focus: "focus:brightness-105 focus:outline-none focus-visible:ring-0",
  },
  selectedWinning: {
    background: "bg-primary",
    border: "border-2 border-keno-winning-border",
    text: "text-primary-foreground",
    hover:
      "hover:brightness-105 hover:bg-primary hover:text-primary-foreground hover:border-keno-winning-border",
    focus:
      "focus:brightness-105 focus:border-keno-winning-border focus:outline-none focus-visible:ring-0",
  },
  disabled: "disabled:opacity-[0.72]",
  common: "w-[40px] h-[40px] p-0 text-[12px] font-medium rounded-[6px] shadow-none",
} as const

const KENO_GRID_COLS = 4

const NumberButton = React.memo<NumberButtonProps>(
  ({ number, isSelected, isDisabled, isWinningNumber, onClick }) => {
    let styles:
      | typeof BUTTON_STYLES.unselected
      | typeof BUTTON_STYLES.unselectedWinning
      | typeof BUTTON_STYLES.selected
      | typeof BUTTON_STYLES.selectedWinning

    if (isSelected && isWinningNumber) {
      styles = BUTTON_STYLES.selectedWinning
    } else if (isSelected) {
      styles = BUTTON_STYLES.selected
    } else if (isWinningNumber) {
      styles = BUTTON_STYLES.unselectedWinning
    } else {
      styles = BUTTON_STYLES.unselected
    }

    const buttonClasses = `${BUTTON_STYLES.common} ${styles.background} ${styles.border} ${styles.text} ${styles.hover} ${styles.focus} ${BUTTON_STYLES.disabled}`

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onClick(number)}
        disabled={isDisabled}
        className={buttonClasses}
        aria-label={`Keno number ${number}`}
        data-testid={`keno-number-${number}`}
      >
        {number}
      </Button>
    )
  },
)

const MultiplierItem = React.memo<MultiplierItemProps>(({ data, isVisible }) => {
  if (!isVisible) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="w-[48px] h-[15px] flex items-center justify-center text-[10px] font-medium rounded-[4px] bg-keno-multiplier-bg text-white cursor-default">
          {data.multiplier}x
        </div>
      </TooltipTrigger>
      <TooltipPrimitive.Content
        side="left"
        sideOffset={2.5}
        className="h-[15px] px-2 py-0 text-[10px] font-medium rounded-[3px] bg-keno-multiplier-tooltip-bg text-keno-multiplier-tooltip-text border-none shadow-none flex items-center z-50"
      >
        {data.winChance.toFixed(2)}% win chance
        <TooltipPrimitive.Arrow
          className="fill-keno-multiplier-tooltip-bg z-50 rounded-[1px]"
          width={10}
          height={5}
        />
      </TooltipPrimitive.Content>
    </Tooltip>
  )
})

export function KenoGameControls({
  selectedNumbers,
  onNumbersChange,
  isDisabled,
  kenoConfig,
  multipliers,
  lastGameWinningNumbers = [],
}: KenoGameControlsProps) {
  const isNumberSelected = (number: KenoBall) => selectedNumbers.includes(number)
  const isWinningNumber = (number: KenoBall) => lastGameWinningNumbers.includes(number)

  const handleNumberClick = (number: KenoBall) => {
    if (isDisabled) return

    if (isNumberSelected(number)) {
      onNumbersChange(selectedNumbers.filter((n) => n !== number))
    } else if (selectedNumbers.length < kenoConfig.maxSelectableBalls) {
      onNumbersChange([...selectedNumbers, number])
    }
  }

  const isNumberDisabled = (number: KenoBall) => {
    return (
      isDisabled ||
      (!isNumberSelected(number) && selectedNumbers.length >= kenoConfig.maxSelectableBalls)
    )
  }

  const visibleMultipliersCount = selectedNumbers.length > 0 ? selectedNumbers.length + 1 : 0
  const numbers: KenoBall[] = Array.from(
    { length: kenoConfig.biggestSelectableBall },
    (_, i) => (i + 1) as KenoBall,
  )

  const renderNumberGrid = () => {
    const rows = []
    const gridRows = Math.ceil(kenoConfig.biggestSelectableBall / KENO_GRID_COLS)

    for (let row = 0; row < gridRows; row++) {
      const rowNumbers = []
      for (let col = 0; col < KENO_GRID_COLS; col++) {
        const numberIndex = row * KENO_GRID_COLS + col
        if (numberIndex >= kenoConfig.biggestSelectableBall) break

        const number = numbers[numberIndex]
        rowNumbers.push(
          <NumberButton
            key={number}
            number={number}
            isSelected={isNumberSelected(number)}
            isDisabled={isNumberDisabled(number)}
            isWinningNumber={isWinningNumber(number)}
            onClick={handleNumberClick}
          />,
        )
      }
      rows.push(
        <div key={row} className="flex gap-[2px]">
          {rowNumbers}
        </div>,
      )
    }
    return rows
  }

  return (
    <TooltipProvider>
      <div className="absolute top-[16px] bottom-[16px] left-[69px] right-0 flex gap-[13px]">
        <div className="flex flex-col gap-[2px]">{renderNumberGrid()}</div>

        <div className="flex flex-col gap-[2px] pt-[32px]">
          {multipliers.map((data, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Multiplier items are positionally keyed; array length is fixed
            <MultiplierItem key={index} data={data} isVisible={index < visibleMultipliersCount} />
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
