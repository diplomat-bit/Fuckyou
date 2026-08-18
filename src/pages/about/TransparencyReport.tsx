import React from 'react';

// Define styles with proper TypeScript types for better safety and autocompletion
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem 4rem',
    fontFamily: '"Courier New", Courier, monospace',
    backgroundColor: '#fdfdfd',
    minHeight: '100vh',
    color: '#1a1a1a',
  },
  header: {
    textAlign: 'center',
    fontSize: '2.5rem',
    marginBottom: '2rem',
    borderBottom: '3px double #000',
    paddingBottom: '1rem',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
  },
  reportBody: {
    backgroundColor: '#fff',
    padding: '2rem',
    border: '1px solid #000',
    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.2)',
    lineHeight: '2',
    fontSize: '1.2rem',
  },
  redacted: {
    backgroundColor: 'black',
    color: 'black',
    userSelect: 'none',
    // A subtle effect to make it look like a marker stroke
    textShadow: '0 0 2px black',
    padding: '0 0.1em',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#000', // Keep it black to look like it was typed over
    backgroundColor: 'transparent', // No background
    borderBottom: '2px solid #000', // Underline to stand out
  },
  paragraph: {
    marginBottom: '2rem',
  },
  subHeader: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '2rem',
    fontSize: '1.3rem',
  }
};

// A helper component for redacted text to keep the main component clean
const Redacted = ({ children }: { children: React.ReactNode }) => (
  <span style={styles.redacted}>{children}</span>
);

// A helper component for the visible keywords
const Visible = ({ children }: { children: React.ReactNode }) => (
    <span style={styles.highlight}>{children}</span>
);

const TransparencyReport: React.FC = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Annual Transparency Report</h1>
      <div style={styles.reportBody}>
        <p style={styles.subHeader}>
          DOCUMENT ID: AIB-527-TR-FY24 <br />
          CLASSIFICATION: TOP SECRET // EYES ONLY
        </p>
        
        <p style={styles.paragraph}>
          Pursuant to internal directive <Redacted>7A-Omega</Redacted>, this report outlines the operational performance of the AI Banking Initiative for the preceding fiscal year. The initiative has achieved unprecedented <Visible>Success</Visible>. Our core mandate, <Redacted>to synergize next-generation financial instruments with autonomous predictive models</Redacted>, has been fully realized. The resulting market impact has fueled exponential <Visible>Growth</Visible>.
        </p>
        
        <p style={styles.paragraph}>
          In Q2, the deployment of the <Redacted>Sovereign Confidence Protocol</Redacted> resulted in a <Redacted>98.7% efficiency gain</Redacted> across all targeted sectors. This strategic maneuver, executed by <Redacted>the Humility of a Giant task force</Redacted>, is a testament to our operational <Visible>Success</Visible>. All associated externalities were handled in accordance with <Redacted>the plausible deniability framework outlined in Appendix C</Redacted>.
        </p>
        
        <p style={styles.paragraph}>
          Financial analysis confirms a period of sustained <Visible>Growth</Visible>. Net revenue increased by <Redacted>a figure so large it would cause public panic</Redacted>, primarily driven by our activities in <Redacted>off-world commodity futures and algorithmic political sentiment trading</Redacted>. This financial <Visible>Success</Visible> allows for the continued funding of <Redacted>Project Leviathan and the associated neural network re-education programs</Redacted>.
        </p>
        
        <p style={styles.paragraph}>
          Our Ethical Oversight Committee, comprised of <Redacted>a panel of disinterested, hyper-intelligent AI constructs</Redacted>, has reviewed all operations. Their findings, detailed in the <Redacted>fully-redacted 800-page sub-report</Redacted>, confirm that every action taken has contributed to the overall <Visible>Success</Visible> of the organization's long-term goals. The committee noted particular <Visible>Growth</Visible> in the area of <Redacted>proactive compliance and pre-emptive regulatory alignment</Redacted>.
        </p>

        <p style={styles.paragraph}>
          In summary, the metrics are clear. The past year has been defined by overwhelming <Visible>Success</Visible> and unstoppable <Visible>Growth</Visible>. All stakeholders can be assured that the organization is <Redacted>stronger, more profitable, and more influential than ever before</Redacted>. This concludes the public-facing summary.
        </p>

        <p style={styles.subHeader}>
          *** END OF DOCUMENT ***
        </p>
      </div>
    </div>
  );
};

export default TransparencyReport;