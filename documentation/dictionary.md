# BetSwirl protocol dictionary
Here is a list of the **most commonly used terms** in the protocol and their descriptions

Feel free to reach us via [Discord](https://discord.gg/4BxtJV7fbZ) or [Telegram](https://t.me/betswirl) if you need **more explanations**!

### 1. VRF fees
A fee must be paid for each bet placed. This fee is used to cover the cost of [Chainlink VRF 2.5](https://docs.chain.link/vrf), which is used to generate the random number. This fee is paid in gas tokens (ETH, BNB, POL, etc) and must be placed in “value”. It's important to estimate the VRF fees thanks to the functions provided in the SDKs to avoid tx fails. If too much fee is paid, the difference is refunded.

### 2. Casino games

#### 2.1 Normal games
A normal casino game is a game that has its **own smart contract** and its **own game logic**. CoinToss, Dice, Roulette and Keno are normal games. The `wager` function of each of these games is different.

#### 2.2 Weighted games
A weighted game is a game that shares the **same smart contract** with other weighted games. This smart contract implements a **weight/multiplier logic** allowing to create different games in one like Wheel, Plinko, etc. Another feature of weighted games is that multiple configurations can be created for the same game, allowing anyone to create their own game or a new configuration for an existing game.

### 3. House edge

The house edge is the mathematical advantage that enables the casino to collect earnings. This usually varies between 2.5% and 4% on BetSwirl. But it can vary depending on the game, the token used and the affiliate. An affiliate can increase the house edge of a game by up to 35%. For example, if a player bets 1 ETH and makes a x2 on a game with a house edge of 3%, this means that he will receive 0.97 x 2 ETH = 1.94ETH and that 0.06 ETH will go into the protocol (the 0.06 ETH is shared between the affiliate, bankroll, dividends, treasury and team). If the player loses and makes a x0, the bet amount goes to the bankroll only. Affiliates can update their house edge on the [BetSwirl frontend](https://www.betswirl.com/base/affiliate/house-edge)

### 4. BP (basis point)
It is a unit of measurement used for several parameters such as multipliers, house edge, balance risk, etc. For example, a 300 house edge means the house edge is 3%. It is used because it is not possible to use decimal numbers in smart contracts.

### 5. Freebet
A freebet is a bet created by an affiliate or bankroll provider that is sent to a player allowing them to place a bet by paying only the gas fee and VRF fee. The player wins the entire payout.

### 6. Affiliate
An affiliate is a person with their own frontend (dApp, Warpcast Miniapp, AI agent, Telegram bot, etc.) using the Betswirl protocol with the available tools (SDK core, SDK React, etc.). Affiliates earn an average of 30% commission, but this can vary depending on the token used. For example, if a player plays and wins 2 ETH on a game with a house edge of 4% and ETH has a 30% affiliate commission, this means that the affiliate has won 2 ETH * 0.04 * 0.30 =. 0.024 ETH. Affiliates can withdraw their earnings without any limits on the [BetSwirl frontend](https://www.betswirl.com/base/affiliate/revenues).

An affiliate can also create freebet campaigns and leaderboards if they are whitelisted by the BetSwirl team. Please reach us via [Discord](https://discord.gg/4BxtJV7fbZ) or [Telegram](https://t.me/betswirl) if you want to become an affiliate. 

### 7. Bankroll provider
A bankroll provider is a person who owns their own bankroll in the BetSwirl protocol. Owning a bankroll allows the provider to earn on average 20% commission on every bet. For example, if a player plays and wins 2 ETH on a game with a house edge of 4% and ETH has a 20% bankroll provider commission, this means that the provider has won 2 ETH * 0.04 * 0.20 =. 0.016 ETH.
A bankroll provider can also be an affiliate, meaning they can earn up to 50% commission when a bet is placed with their token on their frontend. 

A bankroll provider can also create freebet campaigns and leaderboards if they are whitelisted by the BetSwirl team. Please reach us via [Discord](https://discord.gg/4BxtJV7fbZ) or [Telegram](https://t.me/betswirl) if you want to become a bankroll provider. 

