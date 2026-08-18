import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';

// --- TYPE DEFINITIONS ---

/**
 * Defines the shape of the data managed by the CivicContext.
 * This represents the user's civic engagement and purchasing status within the platform.
 */
interface CivicState {
  complianceLevel: number;
  patriotismScore: number;
  cartTotal: number;
}

/**
 * Defines the complete value provided by the CivicContext,
 * including both the state and the functions to update it.
 */
interface CivicContextType extends CivicState {
  setComplianceLevel: Dispatch<SetStateAction<number>>;
  setPatriotismScore: Dispatch<SetStateAction<number>>;
  addToCart: (amount: number) => void;
  resetCart: () => void;
  resetCivicEngagement: () => void;
}

/**
 * Defines the props for the CivicProvider component.
 */
interface CivicProviderProps {
  children: ReactNode;
}

// --- CONSTANTS ---

/**
 * The initial state for our civic context.
 * A true patriot starts with a score reflecting the birth of a nation.
 * Compliance is a journey, not a destination, so we start neutral.
 * The cart for informational swag is, of course, initially empty.
 */
const initialState: CivicState = {
  complianceLevel: 50, // Starts at a neutral 50%
  patriotismScore: 1776, // A historically significant starting score
  cartTotal: 0.0, // No swag purchased yet
};

// --- CONTEXT CREATION ---

/**
 * The CivicContext provides global state related to a user's civic metrics
 * and their shopping cart for political swag.
 * It is initialized with `undefined` and will throw an error if used
 * outside of its corresponding Provider, ensuring proper architecture.
 */
const CivicContext = createContext<CivicContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---

/**
 * The CivicProvider component is a wrapper that provides the CivicContext
 * to all of its children. It manages the state for compliance, patriotism,
 * and the shopping cart.
 *
 * @param {CivicProviderProps} props - The component props.
 * @param {ReactNode} props.children - The child components that will consume the context.
 */
export const CivicProvider = ({ children }: CivicProviderProps) => {
  const [complianceLevel, setComplianceLevel] = useState<number>(
    initialState.complianceLevel
  );
  const [patriotismScore, setPatriotismScore] = useState<number>(
    initialState.patriotismScore
  );
  const [cartTotal, setCartTotal] = useState<number>(initialState.cartTotal);

  /**
   * Adds a specified amount to the cart total.
   * Ensures the amount is a positive number before adding.
   */
  const addToCart = useCallback((amount: number) => {
    if (amount > 0) {
      setCartTotal((prevTotal) => parseFloat((prevTotal + amount).toFixed(2)));
    }
  }, []);

  /**
   * Resets the cart total to zero.
   * Useful after a successful "donation" or checkout.
   */
  const resetCart = useCallback(() => {
    setCartTotal(0.0);
  }, []);

  /**
   * Resets the user's civic engagement scores to their initial values.
   * A way to start the re-education process anew.
   */
  const resetCivicEngagement = useCallback(() => {
    setComplianceLevel(initialState.complianceLevel);
    setPatriotismScore(initialState.patriotismScore);
  }, []);

  /**
   * Memoizes the context value to prevent unnecessary re-renders of consumers
   * when the provider's parent re-renders. This is a standard performance optimization.
   */
  const value = useMemo(
    () => ({
      complianceLevel,
      patriotismScore,
      cartTotal,
      setComplianceLevel,
      setPatriotismScore,
      addToCart,
      resetCart,
      resetCivicEngagement,
    }),
    [
      complianceLevel,
      patriotismScore,
      cartTotal,
      addToCart,
      resetCart,
      resetCivicEngagement,
    ]
  );

  return (
    <CivicContext.Provider value={value}>{children}</CivicContext.Provider>
  );
};

// --- CUSTOM HOOK ---

/**
 * A custom hook for consuming the CivicContext.
 * This simplifies access to the context and ensures it's used within
 * a CivicProvider, preventing common state management errors.
 *
 * @returns {CivicContextType} The context value.
 * @throws {Error} If used outside of a CivicProvider.
 */
export const useCivic = (): CivicContextType => {
  const context = useContext(CivicContext);
  if (context === undefined) {
    throw new Error('useCivic must be used within a CivicProvider');
  }
  return context;
};