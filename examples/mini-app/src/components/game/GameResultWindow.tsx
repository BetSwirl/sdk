import { FORMAT_TYPE, formatRawAmount } from "@betswirl/sdk-core"
import { useEffect } from "react"
import lossBgWebp from "../../assets/game/game-result/loss-bg.webp"
import lossIcon from "../../assets/game/game-result/loss-icon.svg"
import winBgWebp from "../../assets/game/game-result/win-bg.webp"
import winIcon from "../../assets/game/game-result/win-icon.svg"

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
  isWin?: boolean
  isVisible: boolean
  amount: bigint
  payout?: bigint
  currency: string
  rolled: string
  className?: string
}

export function GameResultWindow({
  isWin = false,
  isVisible,
  amount,
  payout = 0n,
  currency,
  rolled,
  className,
}: GameResultWindowProps) {
  const resultType = isWin ? "win" : "loss"
  const currentImages = images[resultType]
  const sign = isWin ? "+" : "-"

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

  if (!isVisible) {
    return null
  }

  const formattedAmount = formatRawAmount(amount)
  const formattedPayout = formatRawAmount(payout, 18, FORMAT_TYPE.PRECISE) //TODO use tokenDecimals

  return (
    <div
      className={`w-full h-full flex flex-col items-center py-[12px] px-[42px] absolute left-0 top-0 text-white ${className}`}
    >
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
          {sign}
          {formattedAmount}
          <span className="uppercase"> {currency}</span>
        </p>
        <p className="text-[14px] leading-[157%] font-semibold">
          Payout: {formattedPayout}
          <span className="uppercase"> {currency}</span>
        </p>
        <p className="text-[12px] leading-[167%] font-medium uppercase">Draw: {rolled}</p>
      </div>
    </div>
  )
}
