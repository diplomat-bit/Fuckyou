/**
 * @file src/styles/theme.ts
 * @description Defines the color palette for the "World's Most Informative AI Banking Website".
 * The color scheme is meticulously chosen to evoke a sense of unwavering institutional authority,
 * bureaucratic diligence, and the subtle yet ever-present thrill of a 527 political organization.
 * Each color has been vetted by a subcommittee (of one) to ensure maximum compliance with
 * the unwritten rules of informational gravitas and hilarious swag.
 */

export const colors = {
  /**
   * Bureaucracy Gray (#868e96):
   * The color of filing cabinets, institutional carpeting, and the soul of a mid-level manager
   * who has seen one too many TPS reports. It's a dependable, non-threatening gray that
   * says "Your request is being processed in the order it was received." Use for secondary text,
   * disabled states, and the general, pleasant hum of government at work.
   */
  bureaucracyGray: '#868e96',

  /**
   * Redaction Black (#212529):
   * A deep, authoritative black, reminiscent of a freshly redacted document from a Freedom of
   * Information Act request. It's not just black; it's the color of information that is
   * "for your eyes only" (but isn't). Perfect for primary headers, body text, and anything
   * that needs to look official, final, and non-negotiable.
   */
  redactionBlack: '#212529',

  /**
   * Trust Blue (#0a4a8f):
   * The quintessential color of stability, sovereign confidence, and financial institutions
   * that have been "too big to fail" since the dawn of time. This blue doesn't just suggest trust;
   * it mandates it through sheer, unblinking corporate presence. It's the color of a firm
   * handshake, a low-interest-rate promise, and a campaign poster.
   */
  trustBlue: '#0a4a8f',

  /**
   * Warning Red (#d90429):
   * A vibrant, urgent red used for critical alerts, error messages, and highlighting the
   * "IMPORTANT: READ BEFORE SIGNING" sections of a 300-page terms of service agreement.
   * This color screams "Pay attention!" with the subtlety of a congressional hearing gavel.
   * Also excellent for "Donate Now" buttons on informational swag pages.
   */
  warningRed: '#d90429',

  // --- Supporting Palette ---
  // These colors provide the necessary neutral backdrop for our primary actors.

  /**
   * Off-White Paper (#f8f9fa):
   * The default background. It's the color of freshly printed government forms,
   * clean, crisp, and ready to be filled out in triplicate. Provides a clean canvas
   * for our endless streams of information.
   */
  background: '#f8f9fa',

  /**
   * Border Line (#dee2e6):
   * A subtle gray for borders and dividers. It separates content with the
   * quiet efficiency of a well-organized bureaucratic system, ensuring every piece
   * of data stays in its designated box.
   */
  border: '#dee2e6',
};

/**
 * The complete theme object, ready for injection into any CSS-in-JS framework
 * that appreciates a well-documented and politically-themed palette.
 */
export const theme = {
  colors,
  // Future theme properties like fonts, spacing, breakpoints, etc., can be added here.
  // For now, we focus on the foundational element: color. Because in politics
  // and banking, perception is everything.
};

export type Theme = typeof theme;

export default theme;