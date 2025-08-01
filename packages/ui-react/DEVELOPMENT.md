# BetSwirl UI React - Development Guide

This document is for developers working on the BetSwirl UI React library.

## Architecture

The project uses:
- **React 19** + **TypeScript**
- **Vite** for development and building
- **Biome** for linting and code formatting
- **Storybook** for testing
- **Tailwind CSS 4** for styling


## Development Setup

### Prerequisites

```shell
# Clone and setup from the SDK project root directory
git clone https://github.com/BetSwirl/sdk.git
cd sdk
pnpm install
pnpm build:libs         # Build all library packages
cd packages/ui-react    # Navigate to ui-react
```

### Development Commands

```bash
# From packages/ui-react directory:
pnpm dev         # Start development server (http://localhost:5173/)
pnpm storybook   # Start Storybook (http://localhost:6006/)
```

#### Code Quality
```bash
pnpm lint        # Check code quality
pnpm lint:fix    # Auto-fix issues  
pnpm format      # Format code
```

Configuration uses two files:
- Root [`biome.json`](../../../biome.json) - base configuration for entire monorepo
- Package [`biome.json`](../biome.json) - extends root config with ui-react specific settings

#### Biome Configuration

**Biome** for code formatting and linting.

**Common issues:**
- If Biome hangs: Check if you have large generated files not excluded in root biome.json
- If formatting differs: Run `pnpm format` to auto-fix

## Testing

### E2E Test Setup

Before running E2E tests, you need to set up a test wallet:

1. **Create a test wallet**: Generate a new wallet mnemonic (12-24 words) using MetaMask or any wallet generator. **Never use your main wallet for testing!**

2. **Configure environment variables**: The project uses two configuration files for better security:
   
   **For application configuration (non-sensitive):**
   ```bash
   # Copy the example file for app configuration
   cp .env.example .env
   # This file contains RPC URLs and other non-sensitive settings
   ```
   
   **For testing secrets (sensitive data):**
   ```bash
   # Copy the example file for secrets
   cp .secrets.example .secrets
   
   # Edit .secrets and add your test wallet credentials:
   # SEED_PHRASE=your test wallet seed phrase here (12-24 words)
   # WALLET_PASSWORD=your test wallet password here
   ```
   
   > **Important**: Both `.env` and `.secrets` files are git-ignored and should never be committed to the repository.

3. **Get your test wallet address**:
   ```bash
   # You can use Foundry
   curl -L https://foundry.paradigm.xyz | bash # install: one time only
   source ~/.zshenv  # or source ~/.bashrc for bash users
   foundryup
   
   # Get wallet address (run from packages/ui-react directory)
   cast wallet address --mnemonic "$(grep SEED_PHRASE .secrets | cut -d'=' -f2)"
   ```

4. **Fund your test wallet** with small amounts for testing:
   - **Base**: Send 0.0003 ETH and 10 DEGEN tokens
   - **Polygon**: Send 0.5 POL (MATIC)

5. **Check balances** (run from packages/ui-react directory):
   ```bash
   # For example, using Foundry
   cast balance $(cast wallet address --mnemonic "$(grep SEED_PHRASE .secrets | cut -d'=' -f2)") --rpc-url https://mainnet.base.org --ether # ETH on Base
   cast call 0x4ed4e862860bed51a9570b96d89af5e1b0efefed "balanceOf(address)(uint256)" $(cast wallet address --mnemonic "$(grep SEED_PHRASE .secrets | cut -d'=' -f2)") --rpc-url https://mainnet.base.org | sed 's/ \[.*\]//' | cast from-wei    # DEGEN on Base
   cast balance $(cast wallet address --mnemonic "$(grep SEED_PHRASE .secrets | cut -d'=' -f2)") --rpc-url https://polygon-rpc.com --ether    # POL on Polygon  
   ```

### Run e2e tests:

All test commands must be run from `packages/ui-react` directory:

```bash
cd packages/ui-react

pnpm test:e2e-setup        # First-time setup (installs Chromium and MetaMask)
pnpm test:clear-cache      # Clear test cache if you have issues

# Terminal 1: Start dev server (keep it running)
pnpm dev                   

# Terminal 2: Run tests
pnpm test:e2e              # Run all test files

# Game tests
pnpm test:cointoss         # Test coin toss game
pnpm test:dice             # Test dice game  
pnpm test:roulette         # Test roulette game
pnpm test:keno             # Test keno game

# Chain and token tests
pnpm test:chain-switching  # Test network switching
pnpm test:chain-token-list # Test chain/token list UI
pnpm test:token-selection  # Test token selection
```

### Testing Best Practices

#### ARIA Roles for E2E Testing

We use ARIA roles (`role="listbox"` and `role="option"`) on our custom token selector components to make E2E tests more reliable and maintainable:

- **Stable selectors**: ARIA roles provide semantic selectors that won't break when CSS classes change
- **Easy token detection**: Tests can reliably find and interact with token options using `[role="option"]`

Example in tests:
```typescript
// Find all available tokens
const tokens = await page.locator('[role="option"]').allTextContents()

// Select a specific token
await page.locator('[role="option"][aria-selected="false"]').first().click()
```

**Note**: Biome suggests using native `<select>` elements, but our custom components need features that native elements can't provide (token icons, balance displays, custom styling). The biome-ignore comments are intentional.


## Building and Publishing

```bash
# From SDK root directory:
pnpm build:libs  # Build all libraries including ui-react
```

### Release Process

To publish a new version to npm:

```bash
pnpm change:add  # Create changeset
```
- Select `@betswirl/ui-react` (use spacebar)
- Choose version bump type:
  - `patch` (0.1.6 → 0.1.7) - bug fixes
  - `minor` (0.1.6 → 0.2.0) - new features  
  - `major` (0.1.6 → 1.0.0) - breaking changes
- Write description of changes

```bash
pnpm change:version      # Update version
git add .
git commit -m "chore: release @betswirl/ui-react@X.X.X"
pnpm change:publish      # Publish to npm
git push
```

Package is published to npm registry and users can install: `pnpm add @betswirl/ui-react@X.X.X`

## Deployment

### Storybook Deployment

The Storybook is deployed at: http://demo.betswirl-sdk.chainhackers.xyz/

#### Server Setup
Ensure proper permissions are set on the server:

```shell
setfacl -R -m u:dev-components:rwx /var/www/betswirl-sdk/
```

This command:
- Sets ACL (Access Control List) permissions
- Grants read/write/execute permissions to the `dev-components` user
- Applies to `/var/www/betswirl-sdk/` directory

#### Manual Deployment Process
```shell
cd packages/ui-react
pnpm install             # Install dependencies (ignore workspace)
pnpm storybook:build
# Copy build output to server
```

**Note**: This process should be automated via CI/CD. The manual steps are for emergency deployments.

