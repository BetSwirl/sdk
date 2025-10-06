import {
  type BetSwirlExtendedEventData,
  type BetSwirlFunctionData,
  BetSwirlWallet,
  wrappedGasTokenById,
} from "@betswirl/sdk-core";
import {
  call,
  getPublicClient,
  getTransactionReceipt,
  readContract,
  readContracts,
  signTypedData,
  simulateContract,
  type Config as WagmiConfig,
  waitForTransactionReceipt,
  watchContractEvent,
  writeContract,
} from "@wagmi/core";
import type {
  Abi,
  CallReturnType,
  Hash,
  PublicClient,
  TransactionReceipt,
  TypedDataDomain,
  TypedDataParameter,
} from "viem";

export class WagmiBetSwirlWallet extends BetSwirlWallet {
  private wagmiConfig: WagmiConfig;

  constructor(wagmiConfig: WagmiConfig) {
    super();
    this.wagmiConfig = wagmiConfig;
  }

  getChainId() {
    return this.wagmiConfig.state.chainId;
  }

  // Wagmi currently does not support hosting Private Key & Mnemonic Accounts to the top-level Wagmi Config – meaning we have to explicitly pass through the account to every Action
  // If at least one connector exists, then do not return an account
  getAccount(chainId?: number) {
    if (this.wagmiConfig.connectors.length > 0) return undefined;
    return this.wagmiConfig.getClient({ chainId }).account;
  }

  getPublicClient(chainId?: number) {
    return getPublicClient(this.wagmiConfig, { chainId }) as PublicClient;
  }

  async readContract<TFunctionData extends BetSwirlFunctionData<Abi, string, readonly any[]>>(
    functionData: TFunctionData,
    gasPrice: bigint,
  ): Promise<CallReturnType>;

  async readContract<
    TFunctionData extends BetSwirlFunctionData<Abi, string, readonly any[]>,
    TReturnType = any,
  >(functionData: TFunctionData, gasPrice?: undefined): Promise<TReturnType>;

  override async readContract<
    TFunctionData extends BetSwirlFunctionData<Abi, string, readonly any[]>,
    TReturnType = any,
  >(functionData: TFunctionData, gasPrice?: bigint): Promise<CallReturnType | TReturnType> {
    if (gasPrice && typeof gasPrice === "bigint") {
      return call(this.wagmiConfig, {
        to: functionData.data.to,
        data: functionData.encodedData,
        gasPrice,
        gas: 3000000n, // workaround to avoid not enough gas issue
        account: wrappedGasTokenById[this.getChainId()], // workaround to avoid not enough gas issue
      }) as Promise<CallReturnType>;
    }
    return readContract(this.wagmiConfig, {
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
    const contracts = functionDatas.map((functionData) => ({
      address: functionData.data.to,
      abi: functionData.data.abi,
      functionName: functionData.data.functionName,
      args: functionData.data.args,
    }));

    const states = await readContracts(this.wagmiConfig, {
      contracts,
    });

    if (states.some((state) => state.status === "failure" || state === undefined)) {
      throw new Error("[wagmiWallet] An error occured while reading contracts");
    }

    return states.map((state) => state.result) as TReturnTypes;
  }

  async getTransactionReceipt(txHash: Hash): Promise<TransactionReceipt> {
    return getTransactionReceipt(this.wagmiConfig, { hash: txHash });
  }

  watchContractEvent<TEventData extends BetSwirlExtendedEventData<Abi, string, any>>(
    eventData: TEventData,
  ): () => void {
    return watchContractEvent(this.wagmiConfig, {
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
    const { request } = await simulateContract(this.wagmiConfig, {
      address: functionData.data.to,
      abi: functionData.data.abi,
      functionName: functionData.data.functionName,
      args: functionData.data.args,
      gasPrice,
      account: this.getAccount(),
      value,
    });
    return await writeContract(this.wagmiConfig, request);
  }

  async waitTransaction(txHash: Hash, pollingInterval?: number): Promise<TransactionReceipt> {
    return await waitForTransactionReceipt(this.wagmiConfig, { hash: txHash, pollingInterval });
  }

  // TODO to improve to avoid unknown/string
  async signTypedData<
    TTypedData extends {
      domain: TypedDataDomain;
      types: Record<string, readonly TypedDataParameter[]>;
      primaryType: string;
      message: Record<string, unknown>;
    },
  >(typedData: TTypedData): Promise<Hash> {
    return signTypedData(this.wagmiConfig, typedData);
  }
}
