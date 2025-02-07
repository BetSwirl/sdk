export const rouletteAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "bankAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "chainlinkCoordinatorAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "chainlinkWrapperAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "wrappedGasToken",
        type: "address",
      },
      {
        internalType: "uint64",
        name: "refundTime_",
        type: "uint64",
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
    inputs: [
      {
        internalType: "uint256",
        name: "maxBetCount",
        type: "uint256",
      },
    ],
    name: "BetCountTooHigh",
    type: "error",
  },
  {
    inputs: [],
    name: "ForbiddenToken",
    type: "error",
  },
  {
    inputs: [],
    name: "HouseEdgeTooHigh",
    type: "error",
  },
  {
    inputs: [],
    name: "HouseEdgeTooLow",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidMaxCallGas",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidParam",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidVRFSubId",
    type: "error",
  },
  {
    inputs: [],
    name: "NotFulfilled",
    type: "error",
  },
  {
    inputs: [],
    name: "NotPendingBet",
    type: "error",
  },
  {
    inputs: [],
    name: "NumbersNotInRange",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "have",
        type: "address",
      },
      {
        internalType: "address",
        name: "want",
        type: "address",
      },
    ],
    name: "OnlyCoordinatorCanFulfill",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "have",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "coordinator",
        type: "address",
      },
    ],
    name: "OnlyOwnerOrCoordinator",
    type: "error",
  },
  {
    inputs: [],
    name: "TokenHasPendingBets",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "minBetAmount",
        type: "uint256",
      },
    ],
    name: "UnderMinBetAmount",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "minBetCount",
        type: "uint256",
      },
    ],
    name: "UnderMinBetCount",
    type: "error",
  },
  {
    inputs: [],
    name: "WrongGasValueToCoverVRFFee",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAddress",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "BetRefunded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "vrfCoordinator",
        type: "address",
      },
    ],
    name: "CoordinatorSet",
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
    name: "DistributeTokenVRFFees",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "OwnershipTransferRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
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
        indexed: false,
        internalType: "uint256",
        name: "chargedVRFCost",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint40",
        name: "numbers",
        type: "uint40",
      },
      {
        indexed: false,
        internalType: "address",
        name: "affiliate",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "betCount",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "stopGain",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "stopLoss",
        type: "uint256",
      },
    ],
    name: "PlaceBet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalBetAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint40",
        name: "numbers",
        type: "uint40",
      },
      {
        indexed: false,
        internalType: "uint8[]",
        name: "rolled",
        type: "uint8[]",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "payout",
        type: "uint256",
      },
    ],
    name: "Roll",
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
        internalType: "uint16",
        name: "previousHouseEdge",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "houseEdge",
        type: "uint16",
      },
    ],
    name: "SetAffiliateHouseEdge",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint16",
        name: "requestConfirmations",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "keyHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "contract IVRFV2PlusWrapperCustom",
        name: "chainlinkWrapper",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "VRFCallbackGasExtraBet",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "nativePayment",
        type: "bool",
      },
    ],
    name: "SetChainlinkConfig",
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
        name: "previousHouseEdge",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "houseEdge",
        type: "uint16",
      },
    ],
    name: "SetHouseEdge",
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
        indexed: false,
        internalType: "uint64",
        name: "previousRefundTime",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "refundTime",
        type: "uint64",
      },
    ],
    name: "SetRefundTime",
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
        internalType: "uint32",
        name: "previousCallbackGasBase",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "callbackGasBase",
        type: "uint32",
      },
    ],
    name: "SetVRFCallbackGasBase",
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
        name: "previousSubId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "subId",
        type: "uint256",
      },
    ],
    name: "SetVRFSubId",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [],
    name: "BANK",
    outputs: [
      {
        internalType: "contract IBankGame",
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
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "_affiliateHouseEdges",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "bets",
    outputs: [
      {
        internalType: "bool",
        name: "resolved",
        type: "bool",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint16",
        name: "houseEdge",
        type: "uint16",
      },
      {
        internalType: "uint32",
        name: "timestamp",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "payout",
        type: "uint256",
      },
      {
        internalType: "uint16",
        name: "betCount",
        type: "uint16",
      },
      {
        internalType: "uint256",
        name: "stopGain",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "stopLoss",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "affiliate",
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
        name: "affiliate",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "getAffiliateHouseEdge",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getChainlinkConfig",
    outputs: [
      {
        internalType: "uint16",
        name: "requestConfirmations",
        type: "uint16",
      },
      {
        internalType: "bytes32",
        name: "keyHash",
        type: "bytes32",
      },
      {
        internalType: "contract IVRFCoordinatorV2Plus",
        name: "chainlinkCoordinator",
        type: "address",
      },
      {
        internalType: "contract IVRFV2PlusWrapperCustom",
        name: "chainlinkWrapper",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "VRFCallbackGasExtraBet",
        type: "uint32",
      },
      {
        internalType: "bool",
        name: "nativePayment",
        type: "bool",
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
        internalType: "uint16",
        name: "betCount",
        type: "uint16",
      },
    ],
    name: "getChainlinkVRFCost",
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
    name: "hasPendingBets",
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
    inputs: [],
    name: "owner",
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
    name: "paused",
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
    inputs: [
      {
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "randomWords",
        type: "uint256[]",
      },
    ],
    name: "rawFulfillRandomWords",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "refundBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "refundTime",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "rouletteBets",
    outputs: [
      {
        components: [
          {
            internalType: "uint40",
            name: "numbers",
            type: "uint40",
          },
          {
            internalType: "uint8[]",
            name: "rolled",
            type: "uint8[]",
          },
        ],
        internalType: "struct IRoulette.RouletteBet",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "s_vrfCoordinator",
    outputs: [
      {
        internalType: "contract IVRFCoordinatorV2Plus",
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
      {
        internalType: "uint16",
        name: "affiliateHouseEdge",
        type: "uint16",
      },
    ],
    name: "setAffiliateHouseEdge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint16",
        name: "requestConfirmations",
        type: "uint16",
      },
      {
        internalType: "bytes32",
        name: "keyHash",
        type: "bytes32",
      },
      {
        internalType: "contract IVRFV2PlusWrapperCustom",
        name: "chainlinkWrapper",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "VRFCallbackGasExtraBet",
        type: "uint32",
      },
      {
        internalType: "bool",
        name: "nativePayment",
        type: "bool",
      },
    ],
    name: "setChainlinkConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_vrfCoordinator",
        type: "address",
      },
    ],
    name: "setCoordinator",
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
        name: "houseEdge",
        type: "uint16",
      },
    ],
    name: "setHouseEdge",
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
        internalType: "uint64",
        name: "refundTime_",
        type: "uint64",
      },
    ],
    name: "setRefundTime",
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
        internalType: "uint32",
        name: "callbackGasBase",
        type: "uint32",
      },
    ],
    name: "setVRFCallbackGasBase",
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
        internalType: "uint256",
        name: "subId",
        type: "uint256",
      },
    ],
    name: "setVRFSubId",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "togglePause",
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
    ],
    name: "tokens",
    outputs: [
      {
        internalType: "uint16",
        name: "houseEdge",
        type: "uint16",
      },
      {
        internalType: "uint64",
        name: "pendingCount",
        type: "uint64",
      },
      {
        internalType: "uint256",
        name: "vrfSubId",
        type: "uint256",
      },
      {
        internalType: "uint32",
        name: "VRFCallbackGasBase",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "VRFFees",
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
        name: "to",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint40",
        name: "numbers",
        type: "uint40",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "address",
        name: "affiliate",
        type: "address",
      },
      {
        components: [
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "betAmount",
            type: "uint256",
          },
          {
            internalType: "uint16",
            name: "betCount",
            type: "uint16",
          },
          {
            internalType: "uint256",
            name: "stopGain",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "stopLoss",
            type: "uint256",
          },
          {
            internalType: "uint16",
            name: "maxHouseEdge",
            type: "uint16",
          },
        ],
        internalType: "struct IGamePlayer.BetData",
        name: "betData",
        type: "tuple",
      },
    ],
    name: "wager",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "bet",
        type: "bytes",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "address",
        name: "affiliate",
        type: "address",
      },
      {
        components: [
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "betAmount",
            type: "uint256",
          },
          {
            internalType: "uint16",
            name: "betCount",
            type: "uint16",
          },
          {
            internalType: "uint256",
            name: "stopGain",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "stopLoss",
            type: "uint256",
          },
          {
            internalType: "uint16",
            name: "maxHouseEdge",
            type: "uint16",
          },
        ],
        internalType: "struct IGamePlayer.BetData",
        name: "betData",
        type: "tuple",
      },
    ],
    name: "wagerWithData",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
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
    name: "withdrawTokenVRFFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
