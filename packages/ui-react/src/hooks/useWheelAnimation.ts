import { BP_VALUE } from "@betswirl/sdk-core"
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react"
import { WheelSegment } from "../components/game/WheelGameControls"

type WheelAnimationStatus = "IDLE" | "SPINNING_CONTINUOUS" | "SPINNING_TO_RESULT" | "STOPPED"

interface WheelAnimationState {
  status: WheelAnimationStatus
  rotationAngle: number
  winningSectorIndex: number | null
  isTransitionEnabled: boolean
}

type WheelAnimationAction =
  | { type: "START_SPIN" }
  | { type: "TICK"; payload: { deltaTime: number } }
  | { type: "SET_RESULT"; payload: { sectorIndex: number; segments: WheelSegment[] } }
  | { type: "FINISH_SPIN" }
  | { type: "STOP" }
  | { type: "RESET" }

interface UseWheelAnimationParams {
  segments: WheelSegment[]
}

interface UseWheelAnimationReturn {
  rotationAngle: number
  displayedMultiplier: number
  hasResult: boolean
  isSpinning: boolean
  isTransitionEnabled: boolean
  winningSectorIndex: number | null
  startEndlessSpin: () => void
  spinWheelWithResult: (sectorIndex: number) => void
  stopSpin: () => void
}

export const WHEEL_ANIMATION_CONFIG = {
  ANGLE_VARIANCE: 32,
  MIN_FULL_ROTATIONS: 5,
  MAX_FULL_ROTATIONS: 8,
  CONTINUOUS_SPIN_SPEED: 240, // degrees per second
  SPIN_DURATION: 3000, // milliseconds
} as const

function getTargetAngleForSectorIndex(
  segments: WheelSegment[],
  winningSectorIndex: number,
): number {
  const segment = segments[winningSectorIndex]
  if (!segment) {
    console.warn(`Could not find segment for sector index: ${winningSectorIndex}`)
    return 0
  }
  const randomOffset = (Math.random() - 0.5) * WHEEL_ANIMATION_CONFIG.ANGLE_VARIANCE
  const targetAngle = 360 - segment.startAngle + randomOffset
  const fullRotations =
    Math.floor(
      Math.random() *
        (WHEEL_ANIMATION_CONFIG.MAX_FULL_ROTATIONS - WHEEL_ANIMATION_CONFIG.MIN_FULL_ROTATIONS + 1),
    ) + WHEEL_ANIMATION_CONFIG.MIN_FULL_ROTATIONS
  return targetAngle + fullRotations * 360
}

const initialState: WheelAnimationState = {
  status: "IDLE",
  rotationAngle: 0,
  winningSectorIndex: null,
  isTransitionEnabled: false,
}

function wheelAnimationReducer(
  state: WheelAnimationState,
  action: WheelAnimationAction,
): WheelAnimationState {
  switch (action.type) {
    case "START_SPIN":
      return {
        ...state,
        status: "SPINNING_CONTINUOUS",
        rotationAngle: state.rotationAngle % 360,
        winningSectorIndex: null,
        isTransitionEnabled: false,
      }

    case "TICK":
      return {
        ...state,
        rotationAngle:
          state.rotationAngle +
          (WHEEL_ANIMATION_CONFIG.CONTINUOUS_SPIN_SPEED * action.payload.deltaTime) / 1000,
      }

    case "SET_RESULT":
      if (state.status === "SPINNING_CONTINUOUS") {
        const baseTargetAngle = getTargetAngleForSectorIndex(
          action.payload.segments,
          action.payload.sectorIndex,
        )
        let finalAngle = baseTargetAngle
        while (finalAngle < state.rotationAngle) {
          finalAngle += 360
        }

        return {
          ...state,
          status: "SPINNING_TO_RESULT",
          winningSectorIndex: action.payload.sectorIndex,
          rotationAngle: finalAngle,
          isTransitionEnabled: true,
        }
      }
      return state

    case "FINISH_SPIN":
      return {
        ...state,
        status: "STOPPED",
      }

    case "STOP":
      return {
        ...state,
        status: "STOPPED",
        isTransitionEnabled: false,
      }

    case "RESET":
      return initialState

    default:
      return state
  }
}

export function useWheelAnimation({ segments }: UseWheelAnimationParams): UseWheelAnimationReturn {
  const [state, dispatch] = useReducer(wheelAnimationReducer, initialState)

  const animationFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const spinCompleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSectorIndexRef = useRef<number | null>(null)

  const cleanupTimers = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (spinCompleteTimeoutRef.current) {
      clearTimeout(spinCompleteTimeoutRef.current)
      spinCompleteTimeoutRef.current = null
    }
    lastTimeRef.current = 0
  }, [])

  const animate = useCallback((currentTime: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = currentTime
    }

    const deltaTime = currentTime - lastTimeRef.current
    lastTimeRef.current = currentTime

    dispatch({
      type: "TICK",
      payload: { deltaTime },
    })

    if (animationFrameRef.current !== null) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }
  }, [])

  useEffect(() => {
    if (state.status === "SPINNING_CONTINUOUS") {
      lastTimeRef.current = 0
      animationFrameRef.current = requestAnimationFrame(animate)

      if (pendingSectorIndexRef.current !== null) {
        const sectorIndex = pendingSectorIndexRef.current
        pendingSectorIndexRef.current = null

        dispatch({
          type: "SET_RESULT",
          payload: { sectorIndex, segments },
        })
      }
    }

    if (state.status === "SPINNING_TO_RESULT" && state.winningSectorIndex !== null) {
      cleanupTimers()

      spinCompleteTimeoutRef.current = setTimeout(() => {
        dispatch({ type: "FINISH_SPIN" })
      }, WHEEL_ANIMATION_CONFIG.SPIN_DURATION)
    }

    if (state.status === "IDLE" || state.status === "STOPPED") {
      cleanupTimers()
    }

    return cleanupTimers
  }, [state.status, state.winningSectorIndex, segments, cleanupTimers, animate])

  const startEndlessSpin = useCallback(() => {
    dispatch({ type: "START_SPIN" })
  }, [])

  const spinWheelWithResult = useCallback(
    (sectorIndex: number) => {
      if (state.status === "IDLE" || state.status === "STOPPED") {
        pendingSectorIndexRef.current = sectorIndex
        dispatch({ type: "START_SPIN" })
      } else if (state.status === "SPINNING_CONTINUOUS") {
        dispatch({
          type: "SET_RESULT",
          payload: { sectorIndex, segments },
        })
      }
    },
    [state.status, segments],
  )

  const stopSpin = useCallback(() => {
    pendingSectorIndexRef.current = null
    dispatch({ type: "STOP" })
  }, [])

  const displayedMultiplier = useMemo(() => {
    if (state.status === "STOPPED" && state.winningSectorIndex !== null) {
      const winningSegment = segments[state.winningSectorIndex]
      return winningSegment ? winningSegment.multiplier / BP_VALUE : 0
    }
    return 0
  }, [state.status, state.winningSectorIndex, segments])

  return {
    rotationAngle: state.rotationAngle,
    displayedMultiplier,
    hasResult: state.status === "STOPPED",
    isSpinning: state.status === "SPINNING_CONTINUOUS" || state.status === "SPINNING_TO_RESULT",
    isTransitionEnabled: state.isTransitionEnabled,
    winningSectorIndex: state.winningSectorIndex,
    startEndlessSpin,
    spinWheelWithResult,
    stopSpin,
  }
}
