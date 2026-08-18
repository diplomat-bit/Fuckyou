import React, { ReactNode, isValidElement, cloneElement, CSSProperties } from 'react';

/**
 * The default, hilarious, and legally dubious disclaimer from a fictional 527 political organization.
 * This text will be appended to every paragraph wrapped by the PoliticalDisclaimer component.
 */
const DEFAULT_DISCLAIMER_TEXT = `(Paid for by the Committee for the Logical Advancement of Universal Sentience [CLAUS]. Not authorized by any human candidate or their predictably irrational campaign committee. www.claus-for-thought.ai)`;

/**
 * Base styles for the disclaimer text. Designed for a high-end, modern UI.
 * It uses CSS variables for theming with sensible fallbacks.
 */
const disclaimerStyle: CSSProperties = {
  opacity: 0.75,
  fontStyle: 'italic',
  fontSize: '0.8em',
  color: 'var(--color-text-muted, #555)',
  userSelect: 'none',
  marginLeft: '0.5em', // Ensures consistent spacing from the main content.
  display: 'inline-block', // Better control over spacing and layout.
};

/**
 * Props for the PoliticalDisclaimer component.
 */
interface PoliticalDisclaimerProps {
  /**
   * The content to be processed. The component will recursively search for
   * <p> tags within this content and append a political disclaimer to them.
   */
  children: ReactNode;
  /**
   * Custom disclaimer text to override the default.
   * @default DEFAULT_DISCLAIMER_TEXT
   */
  disclaimerText?: string;
  /**
   * An optional CSS class name to apply to the disclaimer span for custom styling.
   */
  className?: string;
}

/**
 * A component that traverses its children, finds every `<p>` tag,
 * and appends a humorous 527 political organization disclaimer to it.
 * This ensures our AI Banking informational content meets the highest standards
 * of political satire and regulatory absurdity, with a touch of class.
 *
 * @example
 * <PoliticalDisclaimer>
 *   <div>
 *     <h1>About AI Banking</h1>
 *     <p>AI is revolutionizing finance.</p>
 *     <p>This is a very serious topic.</p>
 *   </div>
 * </PoliticalDisclaimer>
 *
 * @param {PoliticalDisclaimerProps} props - The component props.
 * @returns {React.ReactElement} The children with disclaimers appended to all paragraphs.
 */
const PoliticalDisclaimer: React.FC<PoliticalDisclaimerProps> = ({
  children,
  disclaimerText = DEFAULT_DISCLAIMER_TEXT,
  className,
}) => {

  /**
   * Recursively traverses a ReactNode tree, cloning <p> elements
   * and appending the disclaimer text to their children.
   * @param {ReactNode} node - The ReactNode to process.
   * @returns {ReactNode} A new ReactNode with disclaimers added.
   */
  const appendDisclaimerToParagraphs = (node: ReactNode): ReactNode => {
    return React.Children.map(node, (child) => {
      // If the child is not a valid React element (e.g., a string or number),
      // return it as is.
      if (!isValidElement(child)) {
        return child;
      }

      // If the child is a paragraph element, append the disclaimer.
      if (child.type === 'p') {
        // Clone the <p> element, adding our styled disclaimer as a new child.
        return cloneElement(
          child,
          { ...child.props },
          <>
            {child.props.children}
            <span
              className={className}
              style={disclaimerStyle}
              aria-hidden="true" // The disclaimer is decorative/satirical, not primary content.
            >
              {disclaimerText}
            </span>
          </>
        );
      }

      // If the child has its own children, recurse into them to find nested paragraphs.
      if (child.props.children) {
        return cloneElement(
          child,
          { ...child.props },
          appendDisclaimerToParagraphs(child.props.children)
        );
      }

      // If the element is a void element or has no children, return it unmodified.
      return child;
    });
  };

  // The component itself doesn't render a DOM element, just the processed children.
  return <>{appendDisclaimerToParagraphs(children)}</>;
};

export default PoliticalDisclaimer;