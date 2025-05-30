export interface Logger {
  debug: (message: string, data?: unknown) => void
  info: (message: string, data?: unknown) => void
  warn: (message: string, data?: unknown) => void
  error: (message: string, error?: Error | unknown, data?: unknown) => void
}

export function createLogger(moduleContext: string): Logger {
  const formatMessage = (level: string, message: string): string => {
    return `[${moduleContext}] ${level.toUpperCase()}: ${message}`
  }

  return {
    debug: (message: string, data?: unknown) => {
      const logMessage = formatMessage("debug", message)
      if (data !== undefined) {
        console.log(logMessage, data)
      } else {
        console.log(logMessage)
      }
    },
    info: (message: string, data?: unknown) => {
      const logMessage = formatMessage("info", message)
      if (data !== undefined) {
        console.info(logMessage, data)
      } else {
        console.info(logMessage)
      }
    },
    warn: (message: string, data?: unknown) => {
      const logMessage = formatMessage("warn", message)
      if (data !== undefined) {
        console.warn(logMessage, data)
      } else {
        console.warn(logMessage)
      }
    },
    error: (message: string, error?: Error | unknown, data?: unknown) => {
      const logMessage = formatMessage("error", message)
      const paramsToLog: unknown[] = []
      if (error !== undefined) paramsToLog.push(error)
      if (data !== undefined) paramsToLog.push(data)

      if (paramsToLog.length > 0) {
        console.error(logMessage, ...paramsToLog)
      } else {
        console.error(logMessage)
      }
    },
  }
}
