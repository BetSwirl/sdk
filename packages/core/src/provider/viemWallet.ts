import type {
  Abi,
  CallReturnType,
  Hash,
  PublicClient,
  TransactionReceipt,
  TypedDataDomain,
  TypedDataParameter,
  WalletClient,
} from "viem";
import type { BetSwirlExtendedEventData, BetSwirlFunctionData } from "../interfaces";
import { BetSwirlWallet } from "./wallet";

export class ViemBetSwirlWallet extends BetSwirlWallet {
  public publicClient: PublicClient;
  private walletClient?: WalletClient;

  constructor(viemPublicClient: PublicClient, viemWalletClient?: WalletClient) {
    super();
    this.walletClient = viemWalletClient;
    this.publicClient = viemPublicClient;
  }

  getChainId() {
    return this.walletClient?.chain?.id ?? this.publicClient.chain!.id;
  }

  getAccount(_chainId?: number) {
    return this.walletClient?.account;
  }

  getPublicClient(_chainId?: number) {
    return this.publicClient;
  }

  override async readContract<
    TFunctionData extends BetSwirlFunctionData<Abi, string, readonly any[]>,
    TReturnType = any,
  >(functionData: TFunctionData, gasPrice?: bigint): Promise<CallReturnType | TReturnType> {
    if (gasPrice) {
      return this.publicClient.call({
        to: functionData.data.to,
        data: functionData.encodedData,
        gasPrice,
      });
    }

    return this.publicClient.readContract({
      address: functionData.data.to,
      abi: functionData.data.abi,
      functionName: functionData.data.functionName,
      args: functionData.data.args,
    }) as Promise<TReturnType>;
  }
  async readContracts<
    TFunctionDatas extends BetSwirlFunctionData<Abi, string, readonly any[]>[],
    TReturnTypes extends any[],
  >(functionDatas: [...TFunctionDatas]): Promise<TReturnTypes> {
    const results = await Promise.all(
      functionDatas.map((functionData) =>
        this.publicClient.readContract({
          address: functionData.data.to,
          abi: functionData.data.abi,
          functionName: functionData.data.functionName,
          args: functionData.data.args,
        }),
      ),
    );

    return results as TReturnTypes;
  }

  async getTransactionReceipt(txHash: Hash): Promise<TransactionReceipt> {
    return this.publicClient.getTransactionReceipt({ hash: txHash });
  }

  watchContractEvent<TEventData extends BetSwirlExtendedEventData<Abi, string, any>>(
    eventData: TEventData,
  ): () => void {
    return this.publicClient.watchContractEvent({
      address: eventData.data.to,
      abi: eventData.data.abi,
      eventName: eventData.data.eventName,
      args: eventData.data.args,
      pollingInterval: eventData.data.pollingInterval,
      onLogs: (logs) => eventData.callbacks.onLogs?.(logs),
      onError: (error) => eventData.callbacks.onError?.(error),
    });
  }

  async writeContract<TFunctionData extends BetSwirlFunctionData<Abi, string, readonly any[]>>(
    functionData: TFunctionData,
    value?: bigint,
    gasPrice?: bigint,
  ): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error("[ViemBetSwirlWallet]Wallet client is not initialized");
    }

    const { request } = await this.publicClient.simulateContract({
      address: functionData.data.to,
      abi: functionData.data.abi,
      functionName: functionData.data.functionName,
      args: functionData.data.args,
      account: this.getAccount(),
      value,
      gasPrice,
    });

    return this.walletClient.writeContract(request);
  }

  async waitTransaction(txHash: Hash, pollingInterval?: number): Promise<TransactionReceipt> {
    return this.publicClient.waitForTransactionReceipt({
      hash: txHash,
      pollingInterval,
    });
  }
  // TODO to improve to avoid unknown/any
  async signTypedData<
    TTypedData extends {
      domain: TypedDataDomain;
      types: Record<string, readonly TypedDataParameter[]>;
      primaryType: string;
      message: Record<string, unknown>;
    },
  >(typedData: TTypedData): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error("[ViemBetSwirlWallet] Wallet client is not initialized");
    }

    const account = this.getAccount();
    if (!account) {
      throw new Error("[ViemBetSwirlWallet] Account is not initialized");
    }

    return this.walletClient.signTypedData({
      account: account,
      domain: typedData.domain,
      types: typedData.types,
      primaryType: typedData.primaryType,
      message: typedData.message,
    });
  }
}
