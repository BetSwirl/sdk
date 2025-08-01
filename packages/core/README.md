# @betswirl/sdk-core

VanillaJS library to use Betswirl protocol

## Installation

```bash
npm i @betswirl/sdk-core viem @apollo/client
```
## Usage

### 1.With an external BetSwirl client

Using the sdk with an external BetSwirl client helps you to reduce your codebase and use your favorite compatible viem wallet.
Here is the list of available external clients:

- [Wagmi (@betswirl/wagmi-provider)](https://www.npmjs.com/package/@betswirl/wagmi-provider)

The example below uses the BetSwirl Wagmi client.

```typescript
import { createConfig } from "@wagmi/core";
import { initWagmiBetSwirlClient} from "@betswirl/wagmi-provider";

  /* Init Wagmi BetSwirl client */
  const wagmiConfig = createConfig(...)

  const wagmiBetSwirlClient = initWagmiBetSwirlClient(wagmiConfig, {
    chainId: 137,
    affiliate: "0x...",
    gasPriceType: GAS_PRICE_TYPE.FAST,
    ...
  });

  /* Use the client */
  const casinoGames = await wagmiBetSwirlClient.getCasinoGames(false, 137);
  ...
  wagmiBetSwirlClient.playDice(77, ...)
  ...

```


### 2. With the native BetSwirl client (Viem)

Using the sdk with the native BetSwirl Viem client helps you to reduce your codebase.
**walletClient** is optional if you only need to read data.

```typescript
import { http, createWalletClient, createPublicClient } from "viem";
import { initViemBetSwirlClient } from "@betswirl/sdk-core";

  /* Create the Viem clients */
  const account = privateKeyToAccount("0x...");
  const transport = http("https://...")

  const publicClient = createPublicClient({
    chain: casinoChain.viemChain,
    transport,
  });

  const walletClient = createWalletClient({
    chain: casinoChain.viemChain,
    transport,
    account,
  })

  /* Create the native BetSwirl client */
  const viemBetSwirlClient = initViemBetSwirlClient(publicClient, walletClient, {
    chainId: 137,
    affiliate: "0x...",
    gasPriceType: GAS_PRICE_TYPE.FAST,
    ...
  })

  /* Use the native BetSwirl client */
  const casinoGames = await viemBetSwirlClient.getCasinoGames(false);
  ...
  viemBetSwirlClient.playDice(77, ...)
  ...

```

### 3. Without a client (only a wallet)
Using the sdk withtout a client doesn't let you to centralize all your options in one place. It's more appropriate for projects using only one or two sdk functions. The example below uses the BetSwirl viem wallet, which is native to the sdk. **walletClient** is optional if you only need to read data.


```typescript
import { http, createWalletClient, createPublicClient } from "viem";
import { initViemBetSwirlClient } from "@betswirl/sdk-core";

  /* Create the Viem clients */
  const account = privateKeyToAccount("0x...");
  const transport = http("https://...")

  const publicClient = createPublicClient({
    chain: casinoChain.viemChain,
    transport,
  });

  const walletClient = createWalletClient({
    chain: casinoChain.viemChain,
    transport,
    account,
  })
  

  /* Create the native BetSwirl wallet */
  const viemBetSwirlWallet = new ViemBetSwirlWallet(publicClient, walletClient)

  /* Use functionalities with the wallet*/
  const casinoGames = await getCasinoGames(viemBetSwirlWallet, false);
  ...
  placeDiceBet(viemBetSwirlWallet, 77, ...)
  ...

```

### 4. Using function data
Getting function data doesn't require you to use a client or a wallet. It's particularly useful for frontend projects (React, Vue, etc) or IA agents plugins (Goat, AgentKit, Moxie, etc). The example below shows the placeBet function used in the Moxie BetSwirl plugin to place a bet.


```typescript
import { MoxieWalletClient } from "@moxie-protocol/moxie-lib/src/wallet";
import {
    CASINO_GAME_TYPE,
    type CasinoChainId,
    GameEncodedInput,
    getPlaceBetFunctionData,
} from "@betswirl/sdk-core";
export async function placeBet(
    moxieWalletClient: MoxieWalletClient,
    game: CASINO_GAME_TYPE,
    gameEncodedInput: GameEncodedInput,
    gameMultiplier: number,
    casinoGameParams: {
        betAmount: bigint;
        betToken: Hex;
        betCount: number;
        receiver: Hex;
        stopGain: bigint;
        stopLoss: bigint;
    }
) {
    const chainId = Number(
        (await moxieWalletClient.wallet.provider.getNetwork()).chainId
    ) as CasinoChainId;
    // getBetRequirements is a custom function built in the BetSwirl plugin
    const betRequirements = await getBetRequirements(
        moxieWalletClient,
        game,
        casinoGameParams.betToken,
        gameMultiplier
    );

    if (!betRequirements.isAllowed) {
        throw new Error(`The token isn't allowed for betting`);
    }

    if (casinoGameParams.betAmount > betRequirements.maxBetAmount) {
        throw new Error(
            `Bet amount should be less than ${betRequirements.maxBetAmount}`
        );
    }
    if (casinoGameParams.betCount > betRequirements.maxBetCount) {
        throw new Error(
            `Bet count should be less than ${betRequirements.maxBetCount}`
        );
    }

    const functionData = getPlaceBetFunctionData(
        {
            betAmount: casinoGameParams.betAmount,
            game,
            gameEncodedInput: gameEncodedInput,
            receiver: casinoGameParams.receiver,
            betCount: casinoGameParams.betCount,
            tokenAddress: casinoGameParams.betToken,
            stopGain: casinoGameParams.stopGain,
            stopLoss: casinoGameParams.stopLoss,
        },
        chainId
    );

    try {
        const gasPrice =
            ((await moxieWalletClient.wallet.provider.getFeeData()).gasPrice *
                120n) /
            100n;

    // getChainlinkVrfCost is a custom function built in the BetSwirl plugin
        const vrfCost =
            (await getChainlinkVrfCost(
                moxieWalletClient,
                game,
                casinoGameParams.betToken,
                casinoGameParams.betCount,
                gasPrice
            ))
        const { hash: betHash } = await moxieWalletClient.sendTransaction(
            chainId.toString(),
            {
                toAddress: functionData.data.to,
                data: functionData.encodedData,
                value: functionData.extraData.getValue(vrfCost)
                gasPrice: Number(gasPrice),
            }
        );

        return betHash as Hex;
    } catch (error) {
        throw new Error(
            `An error occured while placing the bet: $${error.shortMessage || error.message}`
        );
    }
}

```

## Examples

- [NodeJs CLI using Wagmi external client](https://github.com/BetSwirl/node-core-demo)
- [Goat plugin using function data](https://github.com/goat-sdk/goat/pull/392)
- [Moxie plugin using function data](https://github.com/moxie-protocol/moxie-agent-skills/pull/11)
