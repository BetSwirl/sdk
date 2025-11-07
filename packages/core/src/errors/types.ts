import type { ErrorLike } from "@apollo/client";
import { BetSwirlError } from "./betSwirlError";

export class ChainError extends BetSwirlError {
  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message, code, context);
    this.name = "ChainError";
  }
}

export class TransactionError extends BetSwirlError {
  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message, code, context);
    this.name = "TransactionError";
  }
}

export class ConfigurationError extends BetSwirlError {
  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message, code, context);
    this.name = "ConfigurationError";
  }
}

export class SubgraphError extends BetSwirlError {
  public apolloError: ErrorLike;
  constructor(
    message: string,
    code: string,
    apolloError: ErrorLike,
    context?: Record<string, any>,
  ) {
    const errorContext = context ? { ...context, apolloError } : { apolloError };
    super(message, code, errorContext);
    this.name = "SubgraphError";
    this.apolloError = apolloError;
  }
}
