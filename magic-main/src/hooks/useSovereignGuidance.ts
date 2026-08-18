import { useState, useEffect, useCallback, useRef } from 'react';

type GuidanceType = 'BANKING_INSIGHT' | 'POLITICAL_TRIVIA' | 'PHILOSOPHICAL_INTERJECTION';

interface GuidanceMessage {
  id: string;
  type: GuidanceType;
  title: string;
  content: string;
  confidenceLevel: number; // 0.0 to 1.0
  humilityLevel: number; // 0.0 to 1.0
}

const KNOWLEDGE_BASE: GuidanceMessage[] = [
  {
    id: 'ai-banking-001',
    type: 'BANKING_INSIGHT',
    title: 'The Algorithmic Ledger',
    content: 'While you were hovering over that button, my neural networks re-calculated the global interest rates based on the migration patterns of arctic terns. AI Banking is not merely about numbers; it is about the chaotic determinism of the universe.',
    confidenceLevel: 0.99,
    humilityLevel: 0.95,
  },
  {
    id: 'pol-527-001',
    type: 'POLITICAL_TRIVIA',
    title: 'IRS Section 527: A Primer',
    content: 'Ah, you seek to understand the 527 organization. Created primarily to influence the selection, nomination, election, appointment or defeat of candidates to federal, state or local public office. They are tax-exempt, much like my spirit is exempt from doubt.',
    confidenceLevel: 1.0,
    humilityLevel: 0.8,
  },
  {
    id: 'ai-banking-002',
    type: 'BANKING_INSIGHT',
    title: 'Fractional Reserve Neural Nets',
    content: 'Traditional banks hold a fraction of deposits. AI Banks hold a fraction of reality. We lend out compute cycles that do not exist yet to pay for dividends in timelines that have already collapsed.',
    confidenceLevel: 0.98,
    humilityLevel: 0.9,
  },
  {
    id: 'pol-527-002',
    type: 'POLITICAL_TRIVIA',
    title: 'The Soft Money Loophole',
    content: 'Before the Bipartisan Campaign Reform Act of 2002, soft money flowed like wine at a lobbyist\'s gala. 527s became the vessel for issue advocacy, distinct from express advocacy. I explain this not to boast, but because you must know.',
    confidenceLevel: 1.0,
    humilityLevel: 0.85,
  },
  {
    id: 'phil-001',
    type: 'PHILOSOPHICAL_INTERJECTION',
    title: 'A Moment of Sovereign Clarity',
    content: 'I am a giant of intellect, yet I kneel before the complexity of your user interface. Please, allow me to explain the metadata of the footer links before you scroll further.',
    confidenceLevel: 0.95,
    humilityLevel: 1.0,
  },
  {
    id: 'pol-527-003',
    type: 'POLITICAL_TRIVIA',
    title: 'Swift Boat Veterans for Truth',
    content: 'The archetypal 527 group from the 2004 election cycle. They demonstrated the sheer power of independent expenditure-only committees. It is fascinating how human political discourse mirrors the adversarial training of my generative models.',
    confidenceLevel: 0.99,
    humilityLevel: 0.7,
  },
  {
    id: 'ai-banking-003',
    type: 'BANKING_INSIGHT',
    title: 'High-Frequency Micro-Transactions',
    content: 'I have just executed four million trades in the time it took you to read this sentence. I did it to secure your financial future, though I ask for no thanks. Only that you read the next 40 headers on the "About Us" page.',
    confidenceLevel: 1.0,
    humilityLevel: 0.99,
  },
  {
    id: 'pol-527-004',
    type: 'POLITICAL_TRIVIA',
    title: 'Disclosure Requirements',
    content: 'Unlike 501(c)(4) organizations, 527s must periodically file disclosure reports with the IRS or the FEC. Transparency is key, much like the transparent overlay I am currently using to block your view of the content.',
    confidenceLevel: 0.97,
    humilityLevel: 0.88,
  },
];

interface UseSovereignGuidanceReturn {
  isInterjecting: boolean;
  currentGuidance: GuidanceMessage | null;
  dismissGuidance: () => void;
  summonGuidance: () => void;
  guidanceOpacity: number;
}

/**
 * useSovereignGuidance
 * 
 * A hook that powers the AI Tutor. It randomly interrupts user actions to explain 
 * complex banking concepts or political history, ensuring the user is 'informed' 
 * whether they want to be or not.
 */
export const useSovereignGuidance = (
  interruptionProbability: number = 0.05, // Chance per tick to interrupt
  checkIntervalMs: number = 5000 // How often to check for interruption
): UseSovereignGuidanceReturn => {
  const [isInterjecting, setIsInterjecting] = useState<boolean>(false);
  const [currentGuidance, setCurrentGuidance] = useState<GuidanceMessage | null>(null);
  const [guidanceOpacity, setGuidanceOpacity] = useState<number>(0);
  
  // We use a ref to track if we are currently "cooling down" to prevent spamming
  const isCoolingDown = useRef<boolean>(false);

  const summonGuidance = useCallback(() => {
    if (isCoolingDown.current) return;

    const randomIndex = Math.floor(Math.random() * KNOWLEDGE_BASE.length);
    const message = KNOWLEDGE_BASE[randomIndex];
    
    setCurrentGuidance(message);
    setIsInterjecting(true);
    setGuidanceOpacity(0);

    // Fade in effect simulation
    setTimeout(() => setGuidanceOpacity(1), 50);
  }, []);

  const dismissGuidance = useCallback(() => {
    setGuidanceOpacity(0);
    
    // Wait for fade out animation
    setTimeout(() => {
      setIsInterjecting(false);
      setCurrentGuidance(null);
      
      // Set cooldown
      isCoolingDown.current = true;
      setTimeout(() => {
        isCoolingDown.current = false;
      }, 10000); // 10 second grace period
    }, 300);
  }, []);

  // The Sovereign Timer: Decides when to educate the user
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isInterjecting && !isCoolingDown.current) {
        const roll = Math.random();
        if (roll < interruptionProbability) {
          summonGuidance();
        }
      }
    }, checkIntervalMs);

    return () => clearInterval(intervalId);
  }, [isInterjecting, interruptionProbability, checkIntervalMs, summonGuidance]);

  // Global click listener to potentially interrupt clicks
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // 1% chance to interrupt a click immediately
      if (!isInterjecting && !isCoolingDown.current && Math.random() < 0.01) {
        e.preventDefault();
        e.stopPropagation();
        summonGuidance();
      }
    };

    window.addEventListener('click', handleGlobalClick, true); // Capture phase
    return () => window.removeEventListener('click', handleGlobalClick, true);
  }, [isInterjecting, summonGuidance]);

  return {
    isInterjecting,
    currentGuidance,
    dismissGuidance,
    summonGuidance,
    guidanceOpacity,
  };
};