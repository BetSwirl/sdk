# @betswirl/wagmi-provider

A provider allowing to use **@betswirl/sdk-core** through a Wagmi client.

## Documentation

- [Wagmi provider documentation](https://docs.betswirl.com/developer-hub/sdks/wagmi-provider/getting-started)

## Installation

```bash
pnpm i @betswirl/wagmi-provider
```

## Usage
```typescript
import { createConfig } from "@wagmi/core";
import { initWagmiBetSwirlClient} from "@betswirl/wagmi-provider";

  /* Init the client */
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

## Example

- [NodeJs CLI](https://github.com/BetSwirl/node-core-demo)