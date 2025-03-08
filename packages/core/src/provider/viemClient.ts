import type { Hex, PublicClient, TransactionReceipt, WalletClient } from "viem";
import { ViemBetSwirlWallet } from "./viemWallet";
import { placeCoinTossBet, type CoinTossPlacedBet } from "../actions/casino/coinToss";
import type { CoinTossParams } from "../actions/casino/coinToss";
import type { CASINO_GAME_TYPE } from "../data";
import { BetSwirlClient } from "./client";
import { placeDiceBet, placeRouletteBet, waitCoinTossRolledBet, waitDiceRolledBet, getCasinoTokens, waitRouletteRolledBet, getCasinoGames, type BetRequirements, type BetSwirlClientOptions, type CasinoGameToken, type CasinoToken, type CasinoWaitRollOptions, type CoinTossRolledBet, type DiceParams, type DicePlacedBet, type DiceRolledBet, type GAS_PRICE_TYPE, type KenoConfiguration, type PlaceBetCallbacks, type RouletteParams, type RoulettePlacedBet, type RouletteRolledBet, type Token, casinoChainById, getCasinoGameToken, getBetRequirements, getChainlinkVrfCost, getKenoConfiguration } from "..";


export class ViemBetSwirlClient extends BetSwirlClient {
    public publicClient: PublicClient;

    constructor(
        walletClient: WalletClient,
        publicClient: PublicClient,
        betSwirlDefaultOptions: BetSwirlClientOptions = {}
    ) {
        super(new ViemBetSwirlWallet(walletClient, publicClient), betSwirlDefaultOptions);
        this.publicClient = publicClient
    }

    /* Casino Games */
    async playCoinToss(
        params: CoinTossParams,
        callbacks?: PlaceBetCallbacks,
    ): Promise<{ placedBet: CoinTossPlacedBet; receipt: TransactionReceipt }> {
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
        return waitCoinTossRolledBet(this.betSwirlWallet, placedBet, options);
    }

    async playDice(
        params: DiceParams,
        callbacks?: PlaceBetCallbacks,
    ): Promise<{ placedBet: DicePlacedBet; receipt: TransactionReceipt }> {
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
        return waitDiceRolledBet(this.betSwirlWallet, placedBet, options);
    }

    async playRoulette(
        params: RouletteParams,
        callbacks?: PlaceBetCallbacks,
    ): Promise<{ placedBet: RoulettePlacedBet; receipt: TransactionReceipt }> {
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
        return waitRouletteRolledBet(this.betSwirlWallet, placedBet, options);
    }

    /* Casino Utilities */

    async getCasinoGames(onlyActive = false) {
        return getCasinoGames(this.betSwirlWallet, onlyActive);
    }

    async getCasinoTokens(
        onlyActive = false,
    ): Promise<CasinoToken[]> {
        return getCasinoTokens(this.betSwirlWallet, onlyActive);
    }

    async getCasinoGameToken(
        casinoToken: CasinoToken,
        game: CASINO_GAME_TYPE,
        affiliate?: Hex
    ): Promise<CasinoGameToken> {
        const casinoChain = casinoChainById[casinoToken.chainId];
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
    ): Promise<BetRequirements> {
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
    ) {
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
    ): Promise<KenoConfiguration> {
        return getKenoConfiguration(this.betSwirlWallet, token);
    }

    /* Private */

    static init(
        viemWalletClient: WalletClient,
        viemPublicClient: PublicClient,
        options?: BetSwirlClientOptions
    ): ViemBetSwirlClient {
        return new ViemBetSwirlClient(viemWalletClient, viemPublicClient, options);
    }
}

export function initViemBetSwirlClient(
    viemWalletClient: WalletClient,
    viemPublicClient: PublicClient,
    options?: BetSwirlClientOptions
): ViemBetSwirlClient {
    return ViemBetSwirlClient.init(viemWalletClient, viemPublicClient, options);
}
