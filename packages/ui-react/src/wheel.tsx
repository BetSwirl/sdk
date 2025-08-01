import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { WheelGame } from "./components/game/WheelGame.tsx"
import { AppProviders } from "./providers.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <WheelGame />
    </AppProviders>
  </StrictMode>,
)
