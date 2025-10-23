import type {
  Abi,
  Account,
  CallReturnType,
  Hash,
  TransactionReceipt,
  TypedDataDomain,
  TypedDataParameter,
  PublicClient as ViemPublicClient,
} from "viem";
import type { BetSwirlExtendedEventData, BetSwirlFunctionData } from "../interfaces";

export abstract class BetSwirlWallet {
  abstract getChainId(): number;

  abstract getPublicClient(chainId?: number): ViemPublicClient;
  abstract getAccount(chainId?: number): Account | undefined;

  abstract readContract<TFunctionData extends BetSwirlFunctionData<Abi, string, readonly any[]>>(
    functionData: TFunctionData,
    gasPrice: bigint,
  ): Promise<CallReturnType>;

  abstract readContract<
    TFunctionData extends BetSwirlFunctionData<Abi, string, readonly any[]>,
    TReturnType = any,
  >(functionData: TFunctionData, gasPrice?: undefined): Promise<TReturnType>;

  abstract readContracts<
    TFunctionDatas extends BetSwirlFunctionData<Abi, string, readonly any[]>[],
    TReturnTypes extends any[],
  >(functionDatas: [...TFunctionDatas]): Promise<TReturnTypes>;

  abstract getTransactionReceipt(txHash: Hash): Promise<TransactionReceipt>;

  abstract watchContractEvent<
    TEventData extends BetSwirlExtendedEventData<Abi, string, Record<string, any>>,
  >(eventData: TEventData): () => void;

  abstract writeContract<TFunctionData extends BetSwirlFunctionData<Abi, string, readonly any[]>>(
    functionData: TFunctionData,
    value?: bigint,
    gasPrice?: bigint,
  ): Promise<Hash>;

  abstract waitTransaction(txHash: Hash, pollingInterval?: number): Promise<TransactionReceipt>;

  // TODO to improve to avoid unknown/any
  abstract signTypedData<
    TTypedData extends {
      domain: TypedDataDomain;
      types: Record<string, readonly TypedDataParameter[]>;
      primaryType: string;
      message: Record<string, unknown>;
    },
  >(typedData: TTypedData): Promise<Hash>;
}
