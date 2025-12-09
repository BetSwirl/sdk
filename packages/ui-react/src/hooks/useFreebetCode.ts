import {
  type CasinoChainId,
  claimFreebetCode as claimFreebetCodeApi,
  getClaimFreebetCodeTypedData,
} from "@betswirl/sdk-core"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useAccount, useChainId, useSignTypedData } from "wagmi"
import { useBettingConfig } from "../context/configContext"
import { createLogger } from "../lib/logger"

const logger = createLogger("useFreebetCode")

interface UseFreebetCodeReturn {
  isLoadingClaimCodeApi: boolean
  errorClaimCodeApi: string
  isPendingClaimCode: boolean
  errorClaimCode: Error | null
  resetClaimCode: () => void
  isClaimProcessloading: boolean
  errorClaimProcess: string | null
  claimFreebetCode: (onSuccess?: () => void) => void
}

/**
 * Hook for claiming freebet codes using typed data signing
 *
 * @param code - The freebet code to claim (string)
 * @returns Object containing loading states, errors, and claim function
 *
 * @example
 * ```tsx
 * const [code, setCode] = useState("")
 * const { claimFreebetCode, isClaimProcessloading, errorClaimProcess } = useFreebetCode(code)
 *
 * const handleClaim = () => {
 *   claimFreebetCode(() => {
 *     console.log("Freebet claimed successfully!")
 *   })
 * }
 * ```
 */
export function useFreebetCode(code: string): UseFreebetCodeReturn {
  const [isLoadingClaimCodeApi, setIsLoadingClaimCodeApi] = useState(false)
  const [errorClaimCodeApi, setErrorClaimCodeApi] = useState("")
  const prevCodeRef = useRef(code)
  const { address } = useAccount()
  const chainId = useChainId()
  const { testMode } = useBettingConfig()

  const {
    signTypedData,
    isPending: isPendingClaimCode,
    error: errorClaimCode,
    reset: resetClaimCode,
  } = useSignTypedData()

  const isClaimProcessloading = useMemo(
    () => isLoadingClaimCodeApi || isPendingClaimCode,
    [isLoadingClaimCodeApi, isPendingClaimCode],
  )

  const errorClaimProcess = useMemo(
    () =>
      (errorClaimCode?.name
        ? `${errorClaimCode.name}: ${errorClaimCode.message}`
        : errorClaimCodeApi) || null,
    [errorClaimCode, errorClaimCodeApi],
  )

  const claimFreebetCode = useCallback(
    (onSuccess?: () => void) => {
      if (!address) {
        setErrorClaimCodeApi("No wallet connected")
        return
      }

      setErrorClaimCodeApi("")

      const typedData = getClaimFreebetCodeTypedData(code.toLowerCase(), address)

      signTypedData(
        {
          ...typedData,
        },
        {
          onSuccess: async (signatureData) => {
            // POST data to API
            setIsLoadingClaimCodeApi(true)
            try {
              const res = await claimFreebetCodeApi(
                signatureData,
                typedData,
                chainId as CasinoChainId,
                testMode,
              )
              if (res.success) {
                onSuccess?.()
                setErrorClaimCodeApi("")
              } else {
                setErrorClaimCodeApi(res.error ?? "An unexpected error occurred")
              }
            } catch (error) {
              logger.error("Failed to claim freebet code", error)
              setErrorClaimCodeApi("An unexpected error occurred. Please contact an admin")
            } finally {
              resetClaimCode()
              setIsLoadingClaimCodeApi(false)
            }
          },
        },
      )
    },
    [code, address, chainId, testMode, signTypedData, resetClaimCode],
  )

  // Reset API error when code changes
  useEffect(() => {
    if (prevCodeRef.current !== code) {
      setErrorClaimCodeApi("")
      prevCodeRef.current = code
    }
  }, [code])

  return {
    isLoadingClaimCodeApi,
    errorClaimCodeApi,
    isPendingClaimCode,
    errorClaimCode: errorClaimCode || null,
    resetClaimCode,
    isClaimProcessloading,
    errorClaimProcess,
    claimFreebetCode,
  }
}
