# 🌀BetSwirl SDKs

**BetSwirl** is a decentralized protocol allowing to play casino games on multiple chains. 

The goal of this repo is to give developers some tools to interact easily with the protocol. 

Feel free to reach us via [Discord](https://discord.gg/uAJXn4GJdX) or [Telegram](https://t.me/betswirl_affiliates) if you need **support**!

[Documentation website](https://docs.betswirl.com)

## General

### Glossary
We highly suggest you to read the [glossary](https://docs.betswirl.com/developer-hub/glossary) to familiarize yourself with the terms used in the protocol before to start using it.

### Networks
- **Arbitrum**
- **Avalanche**
- **Base**
- **Binance Smart Chain**
- **Polygon**
- Arbitrum Sepolia
- Avalanche Fuji
- Base Sepolia
- Binance Smart Chain Testnet
- Polygon Amoy

### Deployed contracts

All our mainnets contracts have the same address on each network:

- **Bank** `0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA`
- **CoinToss** `0xC3Dff2489F8241729B824e23eD01F986fcDf8ec3`
- **Dice** `0xAa4D2931a9fE14c3dec8AC3f12923Cbb535C0e5f`
- **Roulette** `0x6678e3B4AB2a8C8Cdd068F132C21293CcBda33cb`
- **Keno** `0xc3428E4FEb5C770Db51DCb9B1C08223B10994a89`
- **Weighted game(Wheel)** `0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b`

=> You can find more info and the deployed testnet contracts [here](https://github.com/BetSwirl/sdk/blob/main/packages/core/src/data/casino.ts)
  
### Subgraphs
- **[Arbitrum](https://thegraph.com/explorer/subgraphs/AsPBS4ymrjoR61r1x2avNJJtMPvzZ3quMHxvQTgDJbU?view=Query&chain=arbitrum-one)**
- **[Avalanche](https://thegraph.com/explorer/subgraphs/4nQJ4T5TXvTxgECqQ6ox6Nwf57d5BNt6SCn7CzzxjDZN?view=Query&chain=arbitrum-one)**
- **[Base](https://thegraph.com/explorer/subgraphs/6rt22DL9aaAjJHDUZ25sSsPuvuKxp1Tnf8LBXhL8WdZi?view=Query&chain=arbitrum-one)**
- **[Binance Smart Chain](https://thegraph.com/explorer/subgraphs/69xMkatN58qWXZS7FXqiVQmvkHhNrq3thTfdB6t85Wvk?view=Query&chain=arbitrum-one)**
- **[Polygon](https://thegraph.com/explorer/subgraphs/FL3ePDCBbShPvfRJTaSCNnehiqxsPHzpLud6CpbHoeKW?view=Query&chain=arbitrum-one)**

=> You can find more info and the testnet subgraph query urls [here](https://github.com/BetSwirl/sdk/blob/main/packages/core/src/data/casino.ts)
  
### Audits

**[Paladin](https://paladinsec.co/)** is our main auditor and has done 3 audits:
- 07/2024 Bank & Casino games
- 10/2024 PvP games & Wheel game
- 11/2024 Leaderboard & Freebet

=> Consult the audit results [here](https://paladinsec.co/projects/betswirl/)

### Randomness
We use **[Chainlink VRF 2.5](https://docs.chain.link/vrf)** to manage randomness. This is why a small fee in native token is requested for each bet. Here is the list of our subscriptions:

- **[Arbitrum](https://vrf.chain.link/arbitrum#/side-drawer/subscription/arbitrum/26510450093329368004237878416199508562205945994063563127634409219041040756566)**
- **[Avalanche](https://vrf.chain.link/avalanche#/side-drawer/subscription/avalanche/87060360337790157170135218934045586905659360396458026876115663885747477615369)**
- **[Base](https://vrf.chain.link/base#/side-drawer/subscription/base/93271074453882857048982544254580571499844752099945152824703671195862788259559)**
- **[Binance Smart Chain](https://vrf.chain.link/bsc#/side-drawer/subscription/bsc/64778934296371996396369853439912130360272408155611603044356319460986888838555)**
- **[Polygon](https://vrf.chain.link/polygon#/side-drawer/subscription/polygon/79838174144652451313763716789896498714546673967850869672884710820136443316484)**

## Contribution

### Installation

```bash
pnpm install
```

Install Biome extension 
### Local changes

If you updated a package and you want to see the changes in the other packages, then run this command in the updated package:

```bash
pnpm run build
```

=> The dependencies of the other packages will automatically be updated with the new version.

### Publishing

```bash
pnpm change:version
pnpm change:publish
```
