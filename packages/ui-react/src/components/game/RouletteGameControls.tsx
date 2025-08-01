import { ROULETTE_INPUT_BUNDLE, RouletteNumber } from "@betswirl/sdk-core"
import React from "react"
import chipSvg from "../../assets/game/roulette-chip.svg"
import { TokenWithImage } from "../../types/types"
import { Button } from "../ui/button"
import { TokenIcon } from "../ui/TokenIcon"
import { GameMultiplierDisplay } from "./shared/GameMultiplierDisplay"
import { GameControlsProps } from "./shared/types"

interface ChipWithTokenProps {
  number: RouletteNumber
  chipSize: number
  tokenSize: number
  tokenStyles?: string
  textStyles?: string
  token: TokenWithImage
}

interface NumberButtonProps {
  number: RouletteNumber
  isSelected: boolean
  isDisabled: boolean
  onClick: (number: RouletteNumber) => void
  token: TokenWithImage
}

interface BundleButtonProps {
  bundle: BundleType
  label?: string
  className?: string
  isDisabled: boolean
  onClick: (bundle: BundleType) => void
}

interface RouletteGameControlsProps extends GameControlsProps {
  selectedNumbers: RouletteNumber[]
  onNumbersChange: (numbers: RouletteNumber[]) => void
  token: TokenWithImage
}

type BundleType = ROULETTE_INPUT_BUNDLE

const RED_NUMBERS: RouletteNumber[] = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]

const BLACK_NUMBERS: RouletteNumber[] = [
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
]

const ROW_NUMBERS: Record<
  | ROULETTE_INPUT_BUNDLE.FIRST_ROW
  | ROULETTE_INPUT_BUNDLE.SECOND_ROW
  | ROULETTE_INPUT_BUNDLE.THIRD_ROW,
  RouletteNumber[]
> = {
  [ROULETTE_INPUT_BUNDLE.FIRST_ROW]: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
  [ROULETTE_INPUT_BUNDLE.SECOND_ROW]: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [ROULETTE_INPUT_BUNDLE.THIRD_ROW]: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
}

const NUMBER_GRID: RouletteNumber[][] = [
  ROW_NUMBERS[ROULETTE_INPUT_BUNDLE.FIRST_ROW],
  ROW_NUMBERS[ROULETTE_INPUT_BUNDLE.SECOND_ROW],
  ROW_NUMBERS[ROULETTE_INPUT_BUNDLE.THIRD_ROW],
]

type RouletteColor = "red" | "black" | "green"

interface ButtonColorConfig {
  background: string
  hover: string
}

const ROULETTE_COLORS: Record<RouletteColor, ButtonColorConfig> = {
  red: {
    background: "bg-roulette-red",
    hover: "hover:bg-roulette-red-hover",
  },
  black: {
    background: "bg-roulette-black",
    hover: "hover:bg-roulette-black-hover",
  },
  green: {
    background: "bg-roulette-green",
    hover: "hover:bg-roulette-green-hover",
  },
}

const BUNDLE_COLORS: ButtonColorConfig = {
  background: "bg-roulette-bundle",
  hover: "hover:bg-roulette-bundle-hover",
}

const BUTTON_STYLES = {
  disabled: "disabled:opacity-[0.72]",
  common: "text-white hover:text-white disabled:hover:bg-opacity-100",
  number:
    "relative w-[20px] h-[20px] p-0 text-[9px] leading-5 font-semibold rounded-[4px] shadow-none",
  bundle: "px-1 text-[10px] leading-5 font-semibold rounded-[4px] shadow-none",
  rowButton: "w-[20px] h-[20px]",
  regularButton: "h-[20px]",
} as const

const getNumberColor = (number: RouletteNumber): RouletteColor => {
  if (number === 0) return "green"
  return RED_NUMBERS.includes(number) ? "red" : "black"
}

const getColorStyles = (color: RouletteColor): string => {
  const colorConfig = ROULETTE_COLORS[color]
  return `${colorConfig.background} ${colorConfig.hover}`
}

const getBundleStyles = (): string => {
  return `${BUNDLE_COLORS.background} ${BUNDLE_COLORS.hover}`
}

const ChipWithToken = React.memo<ChipWithTokenProps>(
  ({ number, chipSize, tokenSize, tokenStyles, textStyles, token }) => {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={chipSvg}
          alt="Selected"
          className="absolute"
          style={{ width: `${chipSize}px`, height: `${chipSize}px` }}
        />
        <span className={`relative z-10 text-white ${textStyles || ""}`}>{number}</span>
        <div className={`absolute z-20 ${tokenStyles || ""}`}>
          <TokenIcon token={token} size={tokenSize} />
        </div>
      </div>
    )
  },
)

const NumberButton = React.memo<NumberButtonProps>(
  ({ number, isSelected, isDisabled, onClick, token }) => {
    const color = getNumberColor(number)
    const colorStyles = getColorStyles(color)
    const buttonClasses = `${BUTTON_STYLES.number} ${colorStyles} ${BUTTON_STYLES.common} ${BUTTON_STYLES.disabled}`

    return (
      <Button
        key={number}
        variant="ghost"
        size="sm"
        onClick={() => onClick(number)}
        disabled={isDisabled}
        className={buttonClasses}
      >
        {isSelected ? (
          <ChipWithToken
            number={number}
            chipSize={17}
            tokenSize={6}
            tokenStyles="bottom-[0.5px] right-[0.5px]"
            token={token}
          />
        ) : (
          <span>{number}</span>
        )}
      </Button>
    )
  },
)

const BundleButton = React.memo<BundleButtonProps>(
  ({ bundle, label, className, isDisabled, onClick }) => {
    const isRowButton = [
      ROULETTE_INPUT_BUNDLE.FIRST_ROW,
      ROULETTE_INPUT_BUNDLE.SECOND_ROW,
      ROULETTE_INPUT_BUNDLE.THIRD_ROW,
    ].includes(bundle as ROULETTE_INPUT_BUNDLE)
    const sizeClass = isRowButton ? BUTTON_STYLES.rowButton : BUTTON_STYLES.regularButton

    const isColorButton = [ROULETTE_INPUT_BUNDLE.RED, ROULETTE_INPUT_BUNDLE.BLACK].includes(
      bundle as ROULETTE_INPUT_BUNDLE,
    )
    const buttonStyles = isColorButton
      ? getColorStyles(bundle === ROULETTE_INPUT_BUNDLE.RED ? "red" : "black")
      : `${getBundleStyles()} roulette-button-border`

    const buttonClasses = `${sizeClass} ${BUTTON_STYLES.bundle} ${buttonStyles} ${BUTTON_STYLES.common} ${BUTTON_STYLES.disabled} ${className || ""}`

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onClick(bundle)}
        disabled={isDisabled}
        className={buttonClasses}
      >
        {label}
      </Button>
    )
  },
)

export function RouletteGameControls({
  selectedNumbers,
  onNumbersChange,
  multiplier,
  isDisabled,
  token,
}: RouletteGameControlsProps) {
  const isNumberSelected = (number: RouletteNumber) => selectedNumbers.includes(number)

  const handleNumberClick = (number: RouletteNumber) => {
    if (isDisabled) return

    if (isNumberSelected(number)) {
      onNumbersChange(selectedNumbers.filter((n) => n !== number))
    } else {
      onNumbersChange([...selectedNumbers, number])
    }
  }

  const getBundleNumbers = (bundle: BundleType): RouletteNumber[] => {
    switch (bundle as ROULETTE_INPUT_BUNDLE) {
      case ROULETTE_INPUT_BUNDLE.FIRST_ROW:
        return ROW_NUMBERS[ROULETTE_INPUT_BUNDLE.FIRST_ROW]
      case ROULETTE_INPUT_BUNDLE.SECOND_ROW:
        return ROW_NUMBERS[ROULETTE_INPUT_BUNDLE.SECOND_ROW]
      case ROULETTE_INPUT_BUNDLE.THIRD_ROW:
        return ROW_NUMBERS[ROULETTE_INPUT_BUNDLE.THIRD_ROW]
      case ROULETTE_INPUT_BUNDLE.RED:
        return RED_NUMBERS
      case ROULETTE_INPUT_BUNDLE.BLACK:
        return BLACK_NUMBERS
      case ROULETTE_INPUT_BUNDLE.ODD:
        return Array.from({ length: 18 }, (_, i) => (i * 2 + 1) as RouletteNumber)
      case ROULETTE_INPUT_BUNDLE.EVEN:
        return Array.from({ length: 18 }, (_, i) => ((i + 1) * 2) as RouletteNumber)
      case ROULETTE_INPUT_BUNDLE.ONE_TO_EIGHTEEN:
        return Array.from({ length: 18 }, (_, i) => (i + 1) as RouletteNumber)
      case ROULETTE_INPUT_BUNDLE.EIGHTEEN_TO_THIRTY_SIX:
        return Array.from({ length: 18 }, (_, i) => (i + 19) as RouletteNumber)
      case ROULETTE_INPUT_BUNDLE.ONE_TO_TWELVE:
        return Array.from({ length: 12 }, (_, i) => (i + 1) as RouletteNumber)
      case ROULETTE_INPUT_BUNDLE.THIRTEEN_TO_TWENTY_FOUR:
        return Array.from({ length: 12 }, (_, i) => (i + 13) as RouletteNumber)
      case ROULETTE_INPUT_BUNDLE.TWENTY_FIVE_TO_THIRTY_SIX:
        return Array.from({ length: 12 }, (_, i) => (i + 25) as RouletteNumber)
      default:
        return []
    }
  }

  const toggleBundleSelection = (bundleNumbers: RouletteNumber[]) => {
    const allSelected = bundleNumbers.every((num) => selectedNumbers.includes(num))

    if (allSelected) {
      onNumbersChange(selectedNumbers.filter((n) => !bundleNumbers.includes(n)))
    } else {
      const newNumbers = [...selectedNumbers]
      for (const num of bundleNumbers) {
        if (!newNumbers.includes(num)) {
          newNumbers.push(num)
        }
      }
      onNumbersChange(newNumbers)
    }
  }

  const handleBundleClick = (bundle: BundleType) => {
    if (isDisabled) return

    const bundleNumbers = getBundleNumbers(bundle)
    toggleBundleSelection(bundleNumbers)
  }

  return (
    <>
      <GameMultiplierDisplay multiplier={multiplier} className="top-[21px]" />
      <div className="absolute bottom-[16px] left-[5px]">
        <div className="space-y-[1px]">
          <div className="flex gap-[1px]">
            <div className="flex flex-col justify-stretch">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNumberClick(0)}
                disabled={isDisabled}
                className={`relative w-[20px] h-full p-0 text-[12px] font-bold rounded-[4px] shadow-none ${getColorStyles(
                  "green",
                )} ${BUTTON_STYLES.common} ${BUTTON_STYLES.disabled}`}
              >
                {isNumberSelected(0) && (
                  <ChipWithToken
                    number={0}
                    chipSize={17}
                    tokenSize={6}
                    tokenStyles="right-[0.4px] bottom-[21px]"
                    token={token}
                  />
                )}
                {!isNumberSelected(0) && <span>0</span>}
              </Button>
            </div>

            <div className="grid grid-rows-3 gap-[1px]">
              {NUMBER_GRID.map((row) => (
                <div key={`row-${row[0]}`} className="grid grid-cols-12 gap-[1px]">
                  {row.map((number) => (
                    <NumberButton
                      key={number}
                      number={number}
                      isSelected={isNumberSelected(number)}
                      isDisabled={isDisabled}
                      onClick={handleNumberClick}
                      token={token}
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-[1px]">
              <BundleButton
                bundle={ROULETTE_INPUT_BUNDLE.FIRST_ROW}
                label="2:1"
                isDisabled={isDisabled}
                onClick={handleBundleClick}
              />
              <BundleButton
                bundle={ROULETTE_INPUT_BUNDLE.SECOND_ROW}
                label="2:1"
                isDisabled={isDisabled}
                onClick={handleBundleClick}
              />
              <BundleButton
                bundle={ROULETTE_INPUT_BUNDLE.THIRD_ROW}
                label="2:1"
                isDisabled={isDisabled}
                onClick={handleBundleClick}
              />
            </div>
          </div>

          <div className="space-y-[1px]">
            <div className="flex gap-[1px]">
              <div className="grid grid-cols-3 gap-[1px] flex-1">
                <BundleButton
                  bundle={ROULETTE_INPUT_BUNDLE.ONE_TO_TWELVE}
                  label="1 to 12"
                  className="flex-1"
                  isDisabled={isDisabled}
                  onClick={handleBundleClick}
                />
                <BundleButton
                  bundle={ROULETTE_INPUT_BUNDLE.THIRTEEN_TO_TWENTY_FOUR}
                  label="13 to 24"
                  className="flex-1"
                  isDisabled={isDisabled}
                  onClick={handleBundleClick}
                />
                <BundleButton
                  bundle={ROULETTE_INPUT_BUNDLE.TWENTY_FIVE_TO_THIRTY_SIX}
                  label="25 to 36"
                  className="flex-1"
                  isDisabled={isDisabled}
                  onClick={handleBundleClick}
                />
              </div>
            </div>

            <div className="flex gap-[1px]">
              <div className="flex gap-[1px] flex-1">
                <BundleButton
                  bundle={ROULETTE_INPUT_BUNDLE.ONE_TO_EIGHTEEN}
                  label="1 to 18"
                  className="flex-1"
                  isDisabled={isDisabled}
                  onClick={handleBundleClick}
                />
                <BundleButton
                  bundle={ROULETTE_INPUT_BUNDLE.EVEN}
                  label="Even"
                  className="flex-1"
                  isDisabled={isDisabled}
                  onClick={handleBundleClick}
                />
                <BundleButton
                  bundle={ROULETTE_INPUT_BUNDLE.RED}
                  className="flex-1"
                  isDisabled={isDisabled}
                  onClick={handleBundleClick}
                />
                <BundleButton
                  bundle={ROULETTE_INPUT_BUNDLE.BLACK}
                  className="flex-1"
                  isDisabled={isDisabled}
                  onClick={handleBundleClick}
                />
                <BundleButton
                  bundle={ROULETTE_INPUT_BUNDLE.ODD}
                  label="Odd"
                  className="flex-1"
                  isDisabled={isDisabled}
                  onClick={handleBundleClick}
                />
                <BundleButton
                  bundle={ROULETTE_INPUT_BUNDLE.EIGHTEEN_TO_THIRTY_SIX}
                  label="18 to 36"
                  className="flex-1"
                  isDisabled={isDisabled}
                  onClick={handleBundleClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
