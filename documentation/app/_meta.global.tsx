const meta = {
  index: {
    title: "BetSwirl Documentation",
    display: "hidden",
    //breadcrumb: false,
  },
  // You can use JSX elements to change the look of titles in the sidebar, e.g. insert icons
  "protocol-hub": {
    title: "Protocol Hub",
    type: "page",
    items: {
      introduction: {
        title: "Introduction",
      },
      protocol: {
        title: "🌀 Protocol",
        items: {
          bets: {
            title: "$BETS",
          },
          staking: {
            title: "Staking",
          },
          contracts: {
            title: "Contracts",
          },
          team: {
            title: "Team",
          },
        },
      },
      casino: {
        title: "🎲 Casino",
        items: {
          games: {
            title: "Games",
          },
          pvp: {
            title: "PvP",
          },
        },
      },
      "sports-betting": {
        title: "⚽ Sports Betting",
        items: {
          betswirl: {
            title: "BetSwirl",
          },
          azuro: {
            title: "Azuro",
          },
        },
      },
      "where-to-bet": {
        title: "❓ Where to Bet?",
        items: {
          dapp: {
            title: "dApp",
          },
          "mini-app": {
            title: "Mini App (Farcaster)",
          },
          affiliates: {
            title: "Affiliates",
          },
        },
      },
      partners: {
        title: "🤝 Partners",
        items: {
          "become-a-partner": {
            title: "Become a Partner",
          },
          affiliates: {
            title: "Affiliate Program",
          },
          "bankroll-providers": {
            title: "Bankroll Provider Program",
          },
        },
      },
    },
    //breadcrumb: true,
    //timestamp: true,
  },
  "developer-hub": {
    title: "Developer Hub",
    type: "page",
    //breadcrumb: true,
    //timestamp: true,
    items: {
      introduction: {
        title: "👋 Introduction",
      },
      glossary: {
        title: "📖 Glossary",
      },
      "quick-starts": {
        title: "⏱️ Quick Starts",
        items: {
          miniapp: {
            title: "Your MiniApp in 1h",
          },
          react: {
            title: "Your React App in 1h",
          },
        },
      },
      guides: {
        title: "📚 Guides & Tutorials",
        items: {
          basics: {
            title: "Basic operations",
            items: {
              "connect-wallet": {
                title: "Wallet connection",
              },
              "preparing-environment": {
                title: "Preparing environment",
              },
              "preparing-bet": {
                title: "Preparing a bet",
              },
              "placing-bet": {
                title: "Placing a bet & getting the results",
              },
              "my-bets": {
                title: "Bet history",
              },
            },
          },
          promotions: {
            title: "Promotion features",
            items: {
              freebets: {
                title: "Freebets",
              },
              leaderboards: {
                title: "Leaderboards",
              },
            },
          },
        },
      },
      sdks: {
        title: "⚙️ SDKs",
        items: {
          core: {
            title: "Core",
            items: {
              "getting-started": {
                title: "🚀 Getting Started",
              },
              "client-functions": {
                title: "Client functions",
              },
              utilities: {
                title: "Utilities",
              },
            },
          },
          "wagmi-provider": {
            title: "Wagmi Provider",
            items: {
              "getting-started": {
                title: "🚀 Getting Started",
              },
              "client-functions": {
                title: "Client functions",
              },
            },
          },
          "react": {
            title: "React",
            items: {
              "getting-started": {
                title: "🚀 Getting Started",
              },
            },
          },
          "ui-react": {
            title: "UI React",
            items: {
              "getting-started": {
                title: "🚀 Getting Started",
              },
              hooks: {
                title: "Hooks",
                items: {
                  overview: {
                    title: "Overview",
                  },
                  betting: {
                    title: "Betting Hooks",
                  },
                  game: {
                    title: "Game Hooks",
                  },
                  token: {
                    title: "Token Hooks",
                  },
                  leaderboard: {
                    title: "Leaderboard Hooks",
                  },
                },
              },
              components: {
                title: "Components",
                items: {
                  games: {
                    title: "Game Components",
                  },
                  ui: {
                    title: "UI Components",
                  },
                },
              },
              providers: {
                title: "Providers",
              },
            },
          }
        },
      },
      demos: {
        title: "▶️ Demos",
        items: {
          miniapp: {
            title: "MiniApp",
          },
          "node-cli": {
            title: "Node CLI",
          },
          react: {
            title: "React dApp"
          }
        },
      },
    },
  },
  "community-updates": {
    title: "Community Updates",
    type: "page",
    items: {
      test: "Test",
    },
  },
};

export default meta;
