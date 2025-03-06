import { switchChain, type Config as WagmiConfig } from "@wagmi/core";
import type { Hex, TransactionReceipt } from "viem";
import { WagmiBetSwirlWallet } from "./wallet";
import type { BetRequirements, PlaceBetCallbacks, CoinTossParams, BetSwirlClientOptions, CASINO_GAME_TYPE, CasinoChainId, CasinoGameToken, CasinoToken, CasinoWaitRollOptions, ChainId, CoinTossPlacedBet, CoinTossRolledBet, DiceParams, DicePlacedBet, DiceRolledBet, GAS_PRICE_TYPE, KenoConfiguration, RouletteParams, RoulettePlacedBet, RouletteRolledBet, Token } from "@betswirl/sdk-core";
import { BetSwirlClient, casinoChainById, getBetRequirements, getCasinoGames, getCasinoGameToken, getCasinoTokens, getChainlinkVrfCost, getKenoConfiguration, placeCoinTossBet, placeDiceBet, placeRouletteBet, waitCoinTossRolledBet, waitDiceRolledBet, waitRouletteRolledBet } from "@betswirl/sdk-core";


export class WagmiBetSwirlClient extends BetSwirlClient {
    public wagmiConfig: WagmiConfig;

    constructor(
        wagmiConfig: WagmiConfig,
        betSwirlDefaultOptions: BetSwirlClientOptions = {}
    ) {
        super(new WagmiBetSwirlWallet(wagmiConfig), betSwirlDefaultOptions);
        this.wagmiConfig = wagmiConfig;
    }

    /* Casino Games */
    async playCoinToss(
        params: CoinTossParams,
        callbacks?: PlaceBetCallbacks,
        chainId?: CasinoChainId
    ): Promise<{ placedBet: CoinTossPlacedBet; receipt: TransactionReceipt }> {
        this._switchChain(chainId);
        return placeCoinTossBet(
            this.betSwirlWallet,
            { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
            {
                ...this.betSwirlDefaultOptions,
            },
            callbacks
        );

    }

    async waitCoinToss(
        placedBet: CoinTossPlacedBet,
        options: CasinoWaitRollOptions
    ): Promise<{ rolledBet: CoinTossRolledBet; receipt: TransactionReceipt }> {
        this._switchChain(placedBet.chainId);
        return waitCoinTossRolledBet(this.betSwirlWallet, placedBet, options);
    }

    async playDice(
        params: DiceParams,
        callbacks?: PlaceBetCallbacks,
        chainId?: CasinoChainId,
    ): Promise<{ placedBet: DicePlacedBet; receipt: TransactionReceipt }> {
        this._switchChain(chainId);
        return placeDiceBet(
            this.betSwirlWallet,
            { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
            {
                ...this.betSwirlDefaultOptions,
            },
            callbacks
        );
    }

    async waitDice(
        placedBet: DicePlacedBet,
        options: CasinoWaitRollOptions
    ): Promise<{ rolledBet: DiceRolledBet; receipt: TransactionReceipt }> {
        this._switchChain(placedBet.chainId);
        return waitDiceRolledBet(this.betSwirlWallet, placedBet, options);
    }

    async playRoulette(
        params: RouletteParams,
        callbacks?: PlaceBetCallbacks,
        chainId?: CasinoChainId,
    ): Promise<{ placedBet: RoulettePlacedBet; receipt: TransactionReceipt }> {
        this._switchChain(chainId);
        return placeRouletteBet(
            this.betSwirlWallet,
            { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
            {
                ...this.betSwirlDefaultOptions,
            },
            callbacks
        );
    }

    async waitRoulette(
        placedBet: RoulettePlacedBet,
        options: CasinoWaitRollOptions
    ): Promise<{ rolledBet: RouletteRolledBet; receipt: TransactionReceipt }> {
        this._switchChain(placedBet.chainId);
        return waitRouletteRolledBet(this.betSwirlWallet, placedBet, options);
    }

    /* Casino Utilities */

    async getCasinoGames(onlyActive = false, chainId?: CasinoChainId,) {
        this._switchChain(chainId);
        return getCasinoGames(this.betSwirlWallet, onlyActive);
    }

    async getCasinoTokens(
        onlyActive = false,
        chainId?: CasinoChainId
    ): Promise<CasinoToken[]> {
        this._switchChain(chainId);
        return getCasinoTokens(this.betSwirlWallet, onlyActive);
    }

    async getCasinoGameToken(
        casinoToken: CasinoToken,
        game: CASINO_GAME_TYPE,
        affiliate?: Hex
    ): Promise<CasinoGameToken> {
        const casinoChain = casinoChainById[casinoToken.chainId];
        this._switchChain(casinoToken.chainId);
        return getCasinoGameToken(
            this.betSwirlWallet,
            casinoToken,
            game,
            affiliate || casinoChain.defaultAffiliate
        );
    }

    async getBetRequirements(
        token: Token,
        multiplier: number,
        game: CASINO_GAME_TYPE,
        chainId?: CasinoChainId
    ): Promise<BetRequirements> {
        this._switchChain(chainId);
        return getBetRequirements(
            this.betSwirlWallet,
            token,
            multiplier,
            game,
        );
    }

    async getChainlinkVrfCost(
        game: CASINO_GAME_TYPE,
        tokenAddress: Hex,
        betCount: number,
        gasPrice?: bigint,
        gasPriceType?: GAS_PRICE_TYPE,
        chainId?: CasinoChainId
    ) {
        this._switchChain(chainId);
        return getChainlinkVrfCost(
            this.betSwirlWallet,
            game,
            tokenAddress,
            betCount,
            gasPrice || this.betSwirlDefaultOptions.gasPrice,
            gasPriceType || this.betSwirlDefaultOptions.gasPriceType
        );
    }

    async getKenoConfiguration(
        token: Token,
        chainId?: CasinoChainId
    ): Promise<KenoConfiguration> {
        this._switchChain(chainId);
        return getKenoConfiguration(this.betSwirlWallet, token);
    }

    /* Private */
    async _switchChain(
        chainId?: ChainId
    ) {
        const effectiveChainId = chainId || this.betSwirlDefaultOptions.chainId;
        if (effectiveChainId) {
            const currentChainId = await this.betSwirlWallet.getChainId();
            if (currentChainId !== effectiveChainId) {
                await switchChain(this.wagmiConfig, { chainId: effectiveChainId });
            }
        }
    }

    static init(
        wagmiConfig: WagmiConfig,
        options?: BetSwirlClientOptions
    ): WagmiBetSwirlClient {
        return new WagmiBetSwirlClient(wagmiConfig, options);
    }
}

export function initWagmiBetSwirlClient(
    wagmiConfig: WagmiConfig,
    options?: BetSwirlClientOptions
): WagmiBetSwirlClient {
    return WagmiBetSwirlClient.init(wagmiConfig, options);
}
