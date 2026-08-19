# The Story of `TabManager.tsx`: The Selector Rib of Oko-main

Amongst the bustling operations of Aquarius OS and the Oko-main sovereign platform, the Architect must seamlessly command and inspect multiple independent financial, AI, and regulatory domains. The `TabManager` is the **Selector Rib** of this universe—a lightweight, hyper-responsive tab strip designed to organize active workspaces into a single unified navigation deck.

Its function is essential: giving physical structure to parallel active workspaces across trading desks, government links, banking rails, and neural intelligence hubs.

---

## The Form: Structural Space Grotesk Architecture

`TabManager` occupies the top boundary of the active workspace deck. It is styled with precise, high-contrast cybernetic tokens designed for high-density information displays:

- **Active Workspace Tab**: Displayed with a deep charcoal background and crisp neon-lime (`#10B981` / `#00FF66`) typography, clearly establishing the current execution context.
- **Inactive Workspace Tabs**: Recede gracefully into executive slate navy (`#0F172A`), written in subtle gray tones to reduce cognitive load while keeping parallel operations visible.
- **Micro-Interactions**: Hover states trigger subtle glow highlights, indicating context readiness without distracting from active telemetry.
- **Typographic Polish**: Tab labels are rendered in uppercase using high-letter-tracking spacing for immediate legibility across multi-monitor setups.

---

## Supported Workspace Ecosystem

`TabManager` manages context switches between all major subsystems in the Oko-main architecture:

1. **Sovereign & Corporate Command**:
   - `Sovereign Dashboard` & `Market Takeover`
   - `Corporate Command` & `Financial Democracy`
   - `Identity Citadel` & `Security Orchestrator`

2. **Capital Markets & Alpaca Trading**:
   - `Alpaca Trading Terminal` & `BtcSwingTradingNotebook`
   - `TqqqAlgorithmTerminal` & `Rebalancing Hub`
   - `Alpaca Crypto Wallets` & `Tokenization Marketplace`

3. **Global Banking Bridges**:
   - `Citi Treasury Hub` & `Citi-Alpaca Bridge`
   - `Plaid Bridge` & `Stripe Modern Treasury Engine`
   - `OpenBanking FAPI Gateway`

4. **Public Sector & Real Estate Asset Rails**:
   - `Property Marketplace` & `Deed Registrar`
   - `Tax Lien Auctions` & `Foreclosure Tracker`
   - `GIS Property Map` & `Government API Dashboard`

5. **Neural & Quantum Intelligence**:
   - `Aquarius Creative Suite` & `AI Advisor Studio`
   - `Quantum Weaver` & `Gemini Live Portal`
   - `Aria Comms` & `Sovereign Chat`

---

## The Action: Workspace Binding, Switching, and Eviction

Inside its streamlined interface, each tab encapsulates two critical lifecycle triggers:

1. **Selection (`onTabClick`)**:
   - Clicking on a tab commands the primary window orchestrator (`FlowController` or `PortalContext`) to pivot focus, projecting the corresponding component or iframe into the primary container.
   
2. **Eviction (`onTabClose`)**:
   - Located on the right edge of each tab is an eviction button (`X` glyph from `lucide-react`).
   - Terminating a tab purges it from active memory, unmounting component sub-trees or evicting matching sandboxed iframes.
   - Eviction events are guarded by `e.stopPropagation()` to prevent unwanted tab switching during termination protocols.

---

## Integration Blueprint


interface Tab {
  id: string;
  title: string;
  icon?: React.ComponentType;
  closable?: boolean;
}

interface TabManagerProps {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
}


`TabManager` stands as an indispensable bridge between complex multi-rail infrastructure and effortless human navigation—ensuring sub-millisecond context switches across the entire Oko-main sovereign matrix.