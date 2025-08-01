import { BP_VALUE, WeightedGameConfiguration } from "@betswirl/sdk-core"
import { forwardRef, RefObject, useEffect, useImperativeHandle, useMemo } from "react"
import wheelArrow from "../../assets/game/wheel-arrow.svg"
import wheelDark from "../../assets/game/wheel-dark.svg"
import wheelLight from "../../assets/game/wheel-light.svg"
import { useWheelAnimation, WHEEL_ANIMATION_CONFIG } from "../../hooks/useWheelAnimation"
import { Theme, TokenWithImage } from "../../types/types"
import { TokenIcon } from "../ui/TokenIcon"
import { Tooltip, TooltipPrimitive, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { GameMultiplierDisplay } from "./shared/GameMultiplierDisplay"

export interface WheelController {
  startEndlessSpin: () => void
  spinWheelWithResult: (sectorIndex: number) => void
  stopSpin: () => void
  isSpinning: boolean
}

export interface WheelSegment {
  index: number
  multiplier: number
  formattedMultiplier: string
  color: string
  startAngle: number
  endAngle: number
  weight: bigint
}

type TooltipItemContent = {
  chance?: string | React.ReactNode
  profit?: number
  token: TokenWithImage
}

interface WheelGameControlsProps {
  config: WeightedGameConfiguration
  theme?: Theme
  parent?: RefObject<HTMLDivElement | null>
  tooltipContent?: Record<number, TooltipItemContent>
  onSpinningChange?: (isSpinning: boolean) => void
  uniqueMultipliers: Array<{ multiplier: number; formattedMultiplier: string; color: string }>
}

interface MultiplierItemProps {
  item: { multiplier: number; formattedMultiplier: string; color: string }
  isWinning: boolean
  tooltipContent?: TooltipItemContent
  containerRef?: RefObject<HTMLDivElement | null>
}

interface WheelProps {
  rotationAngle: number
  isSpinning: boolean
  multiplier: number
  hasCompletedSpin?: boolean
  theme?: Theme
  isTransitionEnabled: boolean
}

/**
 * Formats a multiplier value for display
 * @param multiplier - The multiplier value as bigint
 * @returns Formatted string representation (e.g., "1.50x", "0.00x")
 */
function formatMultiplier(multiplier: bigint): string {
  return multiplier === 0n ? "0.00x" : `${(Number(multiplier) / BP_VALUE).toFixed(2)}x`
}

/**
 * Creates wheel segments from game configuration
 * @param config - The weighted game configuration
 * @returns Array of wheel segments with calculated angles and formatting
 */
function createWheelSegments(config: WeightedGameConfiguration): WheelSegment[] {
  const totalSegments = config.multipliers.length
  const anglePerSegment = 360 / totalSegments

  return config.multipliers.map((multiplier, index) => {
    const startAngle = index * anglePerSegment
    const endAngle = (index + 1) * anglePerSegment
    const formattedMultiplier = formatMultiplier(multiplier)

    const color = config.colors?.[index]
    if (!color) {
      throw new Error(`Color not defined for segment at index ${index}`)
    }

    const weight = config.weights?.[index]
    if (weight === undefined) {
      throw new Error(`Weight not defined for segment at index ${index}`)
    }

    return {
      index,
      multiplier: Number(multiplier),
      formattedMultiplier,
      color,
      startAngle,
      endAngle,
      weight,
    }
  })
}

/**
 * MultiplierItem component for displaying individual multiplier values
 */
function MultiplierItem({ item, isWinning, tooltipContent, containerRef }: MultiplierItemProps) {
  const hasTooltip = tooltipContent && (tooltipContent.chance || tooltipContent.profit)

  const multiplierContent = (
    <div
      className={`flex h-[24px] w-[49px] items-center justify-center rounded-[2px] backdrop-blur-sm bg-wheel-multiplier-bg text-wheel-multiplier-text wheel-multiplier-item ${
        isWinning ? "wheel-multiplier-winning" : ""
      }`}
      style={
        {
          "--wheel-color": item.color,
        } as React.CSSProperties
      }
    >
      <span className="text-xs font-medium">{item.formattedMultiplier}</span>
    </div>
  )

  if (!hasTooltip) {
    return multiplierContent
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{multiplierContent}</TooltipTrigger>
      <TooltipPrimitive.Content
        side="top"
        sideOffset={5}
        collisionBoundary={containerRef?.current}
        collisionPadding={19}
        className="px-2 py-1 text-xs font-medium rounded-[2px] bg-wheel-multiplier-bg text-wheel-multiplier-text border-none shadow-none flex flex-col items-start gap-1 z-50"
      >
        <div className="flex items-center gap-1">
          <span>Chance to draw: </span>
          <span className="text-game-win font-bold">{tooltipContent.chance}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Target profit: </span>
          <span className="font-bold">{tooltipContent.profit}</span>
          <TokenIcon token={tooltipContent.token} size={15} />
        </div>
        <TooltipPrimitive.Arrow className="fill-wheel-multiplier-bg z-50" width={10} height={5} />
      </TooltipPrimitive.Content>
    </Tooltip>
  )
}

function Wheel({
  rotationAngle,
  isSpinning,
  multiplier,
  hasCompletedSpin = false,
  theme = "light",
  isTransitionEnabled,
}: WheelProps) {
  const shouldShowMultiplier = hasCompletedSpin && !isSpinning
  const wheelSrc = theme === "dark" ? wheelDark : wheelLight

  return (
    <>
      <div className={"relative w-[192px] h-[148px] mx-auto"}>
        <div
          className={"absolute inset-0 flex items-center justify-center top-[12px]"}
          style={{
            transform: `rotate(${rotationAngle}deg)`,
            transition: isTransitionEnabled
              ? `transform ${WHEEL_ANIMATION_CONFIG.SPIN_DURATION}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
              : "none",
            transformOrigin: "center center",
          }}
        >
          <img src={wheelSrc} alt="Wheel colors" className="w-full h-full object-contain" />
        </div>
        {shouldShowMultiplier && (
          <GameMultiplierDisplay
            multiplier={multiplier}
            className={"absolute text-wheel-multiplier-text top-[80px] text-[18px]"}
          />
        )}
      </div>
      <img src={wheelArrow} alt="Wheel arrow" className="absolute" />
    </>
  )
}

export const WheelGameControls = forwardRef<WheelController, WheelGameControlsProps>(
  (
    {
      config,
      theme = "light",
      parent: containerRef,
      tooltipContent,
      onSpinningChange,
      uniqueMultipliers,
    },
    ref,
  ) => {
    const segments = useMemo(() => createWheelSegments(config), [config])

    const {
      rotationAngle,
      displayedMultiplier,
      hasResult,
      isSpinning: internalIsSpinning,
      isTransitionEnabled,
      winningSectorIndex: internalWinningSectorIndex,
      startEndlessSpin,
      spinWheelWithResult,
      stopSpin,
    } = useWheelAnimation({
      segments,
    })

    useEffect(() => {
      if (onSpinningChange) {
        onSpinningChange(internalIsSpinning)
      }
    }, [internalIsSpinning, onSpinningChange])

    // Expose the controller methods via ref
    useImperativeHandle(
      ref,
      () => ({
        startEndlessSpin,
        spinWheelWithResult,
        stopSpin,
        isSpinning: internalIsSpinning,
      }),
      [startEndlessSpin, spinWheelWithResult, stopSpin, internalIsSpinning],
    )

    const isMultiplierWinning = (itemMultiplier: number): boolean => {
      if (!hasResult || internalWinningSectorIndex === null) return false
      const winningSegment = segments[internalWinningSectorIndex]
      return winningSegment && winningSegment.multiplier === itemMultiplier
    }

    return (
      <TooltipProvider>
        <div className="flex flex-col items-center gap-[8px] absolute top-[8px] left-1/2 transform -translate-x-1/2 w-full max-w-lg px-4">
          <Wheel
            rotationAngle={rotationAngle}
            isSpinning={internalIsSpinning}
            multiplier={displayedMultiplier}
            hasCompletedSpin={hasResult}
            theme={theme}
            isTransitionEnabled={isTransitionEnabled}
          />

          <div className={"flex flex-wrap justify-center gap-[6px] w-full"}>
            {uniqueMultipliers.map((item) => (
              <MultiplierItem
                key={item.multiplier}
                item={item}
                isWinning={isMultiplierWinning(item.multiplier)}
                tooltipContent={tooltipContent?.[item.multiplier]}
                containerRef={containerRef}
              />
            ))}
          </div>
        </div>
      </TooltipProvider>
    )
  },
)

WheelGameControls.displayName = "WheelGameControls"
