import { useEffect } from "react"
import lossBgWebp from "../../assets/game/game-result/loss-bg.webp"
import lossIcon from "../../assets/game/game-result/loss-icon.svg"
import winBgWebp from "../../assets/game/game-result/win-bg.webp"
import winIcon from "../../assets/game/game-result/win-icon.svg"
import { cn } from "../../lib/utils"
import { GameResult } from "../../types/types"

const images = {
  win: {
    bg: winBgWebp,
    icon: winIcon,
  },
  loss: {
    bg: lossBgWebp,
    icon: lossIcon,
  },
} as const

interface GameResultWindowProps {
  result: GameResult | null
  currency: string
  className?: string
}

export function GameResultWindow({ result, currency, className }: GameResultWindowProps) {
  useEffect(() => {
    const preloadImg = (imgSrc: string) => {
      const img = new Image()
      img.src = imgSrc
    }

    for (const { bg, icon } of Object.values(images)) {
      preloadImg(bg)
      preloadImg(icon)
    }
  }, [])

  const isVisible = !!result
  const resultType = result?.isWin ? "win" : "loss"
  const currentImages = images[resultType]

  return (
    <div
      role="alert"
      data-testid="game-result-window"
      data-result-type={result ? resultType : undefined}
      className={cn(
        "w-full h-full flex flex-col items-center justify-center px-[42px] absolute left-0 top-0 text-text-color z-20 transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
        className,
      )}
    >
      {result && (
        <>
          <img
            src={currentImages.bg}
            className="absolute left-0 top-0 w-full h-full"
            alt={`${resultType} background`}
          />

          <div className="flex flex-col items-center gap-[8px] text-center relative">
            <div className="w-[48px] h-[44px] flex items-center justify-center bg-game-result-icon-bg relative rounded-[6px]">
              <img className="absolute" src={currentImages.icon} alt={`${resultType} icon`} />
            </div>
            <p className="text-[16px] leading-[150%] font-bold">
              {result.isWin && "+"}
              {result.formattedBenefit}
              <span className="uppercase"> {currency}</span>
            </p>
            <p className="text-[14px] leading-[157%] font-semibold">
              Payout: {result.formattedPayout}
              <span className="uppercase"> {currency}</span>
            </p>
            <p data-testid="rolled" className="text-[12px] leading-[167%] font-medium uppercase">
              Draw: {result.formattedRolled}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
