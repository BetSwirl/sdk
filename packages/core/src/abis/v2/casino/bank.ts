export const bankAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "treasuryAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "teamWalletAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "wrappedGasToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "maxCallGas_",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AccessDenied",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidParam",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidValue",
    type: "error",
  },
  {
    inputs: [],
    name: "TokenExists",
    type: "error",
  },
  {
    inputs: [],
    name: "TokenHasPendingBets",
    type: "error",
  },
  {
    inputs: [],
    name: "TokenNotExists",
    type: "error",
  },
  {
    inputs: [],
    name: "TokenNotPaused",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint16",
        name: "splitSum",
        type: "uint16",
      },
    ],
    name: "WrongHouseEdgeSplit",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "added",
        type: "bool",
      },
    ],
    name: "AddToken",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "affiliate",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "affiliateAmount",
        type: "uint256",
      },
    ],
    name: "AffiliateRevenuesDistribution",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "bank",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "dividend",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "treasury",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "team",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "affiliate",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "affiliateAddress",
        type: "address",
      },
    ],
    name: "AllocateHouseEdgeAmount",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newBalance",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "CashIn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newBalance",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "profit",
        type: "uint256",
      },
    ],
    name: "Payout",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "treasuryAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "teamAmount",
        type: "uint256",
      },
    ],
    name: "ProtocolRevenuesDistribution",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    name: "SetAllowedToken",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "previousBalanceRisk",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "balanceRisk",
        type: "uint16",
      },
    ],
    name: "SetBalanceRisk",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "previousMaxCallGas",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxCallGas",
        type: "uint256",
      },
    ],
    name: "SetMaxCallGas",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "paused",
        type: "bool",
      },
    ],
    name: "SetPausedToken",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "previousTeamWallet",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "teamWallet",
        type: "address",
      },
    ],
    name: "SetTeamWallet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "bank",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "dividend",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "affiliate",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "treasury",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "team",
        type: "uint16",
      },
    ],
    name: "SetTokenHouseEdgeSplit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "previousBankrollProvider",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "bankrollProvider",
        type: "address",
      },
    ],
    name: "TokenBankrollProviderTransferAccepted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newBankrollProvider",
        type: "address",
      },
    ],
    name: "TokenBankrollProviderTransferStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "WithdrawDividend",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DIVIDEND_MANAGER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "GAME_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "TREASURY_WALLET",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "WRAPPED",
    outputs: [
      {
        internalType: "contract IWrapped",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "acceptTokenBankrollProviderTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "bool",
        name: "added",
        type: "bool",
      },
    ],
    name: "addToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "affiliateAmounts",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "fees",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "affiliate",
        type: "address",
      },
    ],
    name: "cashIn",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "getBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "getBankrollProvider",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "multiplier",
        type: "uint256",
      },
    ],
    name: "getBetRequirements",
    outputs: [
      {
        internalType: "bool",
        name: "isAllowedToken",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "maxBetAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxBetCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "multiplier",
        type: "uint256",
      },
    ],
    name: "getMaxBetAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "multiplier",
        type: "uint256",
      },
    ],
    name: "getMaxBetCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getRoleMember",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleMemberCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTokens",
    outputs: [
      {
        components: [
          {
            internalType: "uint8",
            name: "decimals",
            type: "uint8",
          },
          {
            internalType: "address",
            name: "tokenAddress",
            type: "address",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "symbol",
            type: "string",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "allowed",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "paused",
                type: "bool",
              },
              {
                internalType: "uint16",
                name: "balanceRisk",
                type: "uint16",
              },
              {
                internalType: "address",
                name: "bankrollProvider",
                type: "address",
              },
              {
                internalType: "address",
                name: "pendingBankrollProvider",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "uint16",
                    name: "bank",
                    type: "uint16",
                  },
                  {
                    internalType: "uint16",
                    name: "dividend",
                    type: "uint16",
                  },
                  {
                    internalType: "uint16",
                    name: "affiliate",
                    type: "uint16",
                  },
                  {
                    internalType: "uint16",
                    name: "treasury",
                    type: "uint16",
                  },
                  {
                    internalType: "uint16",
                    name: "team",
                    type: "uint16",
                  },
                  {
                    internalType: "uint256",
                    name: "dividendAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "affiliateAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "treasuryAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "teamAmount",
                    type: "uint256",
                  },
                ],
                internalType: "struct IBankAdmin.HouseEdgeSplitAndAllocation",
                name: "houseEdgeSplitAndAllocation",
                type: "tuple",
              },
            ],
            internalType: "struct IBankAdmin.Token",
            name: "token",
            type: "tuple",
          },
        ],
        internalType: "struct IBankAdmin.TokenMetadata[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxCallGas",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "profit",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "fees",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "affiliate",
        type: "address",
      },
    ],
    name: "payout",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    name: "setAllowedToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint16",
        name: "balanceRisk",
        type: "uint16",
      },
    ],
    name: "setBalanceRisk",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint16",
        name: "bank",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "dividend",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "affiliate",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "treasury",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "team",
        type: "uint16",
      },
    ],
    name: "setHouseEdgeSplit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "maxCallGas_",
        type: "uint256",
      },
    ],
    name: "setMaxCallGas",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "bool",
        name: "paused",
        type: "bool",
      },
    ],
    name: "setPausedToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "teamWallet_",
        type: "address",
      },
    ],
    name: "setTeamWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "setTokenBankrollProviderTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "teamWallet",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "tokens",
    outputs: [
      {
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "paused",
        type: "bool",
      },
      {
        internalType: "uint16",
        name: "balanceRisk",
        type: "uint16",
      },
      {
        internalType: "address",
        name: "bankrollProvider",
        type: "address",
      },
      {
        internalType: "address",
        name: "pendingBankrollProvider",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint16",
            name: "bank",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "dividend",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "affiliate",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "treasury",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "team",
            type: "uint16",
          },
          {
            internalType: "uint256",
            name: "dividendAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "affiliateAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "treasuryAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "teamAmount",
            type: "uint256",
          },
        ],
        internalType: "struct IBankAdmin.HouseEdgeSplitAndAllocation",
        name: "houseEdgeSplitAndAllocation",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "withdrawAffiliateRevenues",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
    ],
    name: "withdrawDividend",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawDividends",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
    ],
    name: "withdrawProtocolRevenues",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
