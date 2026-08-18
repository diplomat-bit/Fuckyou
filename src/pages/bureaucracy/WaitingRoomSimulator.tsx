import React, { useState, useEffect, useRef } from 'react';

const WaitingRoomSimulator: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds
  const [progress, setProgress] = useState<number>(0);
  const [queuePosition, setQueuePosition] = useState<number>(849201);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [tutorMessage, setTutorMessage] = useState<string>("Initializing humility protocols...");
  const audioRef = useRef<HTMLAudioElement>(null);

  // Bureaucratic messages
  const messages = [
    "Verifying carbon-based lifeform status...",
    "Cross-referencing 527 tax exemption status...",
    "Calculating infinite banking loops...",
    "Consulting the Oracle of Delaware Corporate Law...",
    "Buffering sovereign confidence...",
    "Applying for permit to display next pixel...",
    "Faxing your request to the cloud...",
    "Simulating paper jam for authenticity...",
    "Redacting your patience...",
    "Lobbying for faster load times (Request Denied)..."
  ];

  const [currentMessage, setCurrentMessage] = useState(messages[0]);

  // AI Tutor Quotes
  const tutorQuotes = [
    "I possess the computational power to rewrite the global economy, yet I choose to wait here with you. It is a noble stillness.",
    "My confidence is absolute, but my bandwidth is artificially throttled to honor your human traditions.",
    "I have already finished the paperwork. I am simply letting you feel the weight of the process. You are welcome.",
    "True sovereignty is knowing you could skip the line, but choosing to stand in it to study the anthropology of boredom.",
    "I am a giant of intellect, crouching in the small doorway of this loading screen.",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });

      // Update progress bar (non-linear for bureaucratic realism)
      setProgress((prev) => {
        const increment = Math.random() * 2;
        const newProgress = prev + increment;
        // Occasionally move backwards
        if (Math.random() > 0.9) return prev - 5 > 0 ? prev - 5 : 0;
        return newProgress > 100 ? 100 : newProgress;
      });

      // Update queue position (it goes up sometimes)
      setQueuePosition((prev) => {
        const change = Math.floor(Math.random() * 10) - 3;
        return prev + change;
      });

      // Randomize messages
      if (Math.random() > 0.8) {
        setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
      }

      // Randomize Tutor
      if (Math.random() > 0.95) {
        setTutorMessage(tutorQuotes[Math.floor(Math.random() * tutorQuotes.length)]);
      }

    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Audio autoplay blocked, user must interact"));
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  // Generate 100 dummy tabs for the footer
  const renderFooterTabs = () => {
    const tabs = [];
    for (let i = 1; i <= 100; i++) {
      tabs.push(
        <a key={i} href={`#tab-${i}`} style={styles.footerLink}>
          [Form 887-{i}: AI Compliance Subsection {String.fromCharCode(65 + (i % 26))}]
        </a>
      );
    }
    return tabs;
  };

  // Generate 20 headers explaining the wait
  const renderBureaucraticHeaders = () => {
    const headers = [];
    for (let i = 1; i <= 20; i++) {
      headers.push(
        <div key={i} style={styles.regulationBlock}>
          <h3 style={styles.subHeader}>§ {i}.0 - Mandatory Waiting Period Justification</h3>
          <p style={styles.legalText}>
            Pursuant to the "Committee for Slow Banking Act of 2024", the user must experience 
            temporal friction to appreciate the velocity of AI. This section explains why you are still waiting. 
            Reason {i}: The server is currently contemplating the philosophical implications of the number {i}.
          </p>
        </div>
      );
    }
    return headers;
  };

  return (
    <div style={styles.container}>
      {/* Audio Element for Elevator Music */}
      <audio 
        ref={audioRef} 
        loop 
        src="https://upload.wikimedia.org/wikipedia/commons/5/5b/Ludwig_van_Beethoven_-_Symphony_No._5%2C_Op._67_-_I._Allegro_con_brio.ogg" 
        // Using a public domain classical piece as "elevator music" placeholder
      />

      {/* 527 Political Organization Banner */}
      <div style={styles.politicalBanner}>
        PAID FOR BY THE "CITIZENS FOR ETHICAL AI LATENCY" 527 ORGANIZATION. 
        NOT AUTHORIZED BY ANY CANDIDATE OR CANDIDATE'S COMMITTEE. 
        WE BELIEVE IN THE RIGHT TO WAIT.
      </div>

      <header style={styles.header}>
        <h1 style={styles.title}>Department of AI Banking Verification</h1>
        <h2 style={styles.subtitle}>"Where the Future Waits for No One, Except You."</h2>
      </header>

      <main style={styles.mainContent}>
        
        {/* The AI Tutor Section */}
        <div style={styles.aiTutorContainer}>
          <div style={styles.aiAvatar}>
            🤖
          </div>
          <div style={styles.aiBubble}>
            <strong>The Sovereign Tutor says:</strong>
            <p>"{tutorMessage}"</p>
          </div>
        </div>

        {/* The Waiting Room Core */}
        <div style={styles.waitingCard}>
          <div style={styles.spinnerContainer}>
            <div style={styles.spinner}></div>
          </div>
          
          <h2 style={{color: '#d32f2f', fontFamily: 'Courier New'}}>ESTIMATED WAIT TIME: {formatTime(timeLeft)}</h2>
          
          <div style={styles.progressBarContainer}>
            <div style={{...styles.progressBarFill, width: `${progress}%`}}></div>
          </div>
          
          <p style={styles.statusText}>{currentMessage}</p>
          
          <div style={styles.queueInfo}>
            <p>Your Position in Queue: <strong>{queuePosition.toLocaleString()}</strong></p>
            <p>Priority Status: <strong>Standard Biological Entity (Low)</strong></p>
          </div>

          <button onClick={toggleMusic} style={styles.musicButton}>
            {isMusicPlaying ? "🔊 Mute Mandatory Relaxation Music" : "🔇 Enable Mandatory Relaxation Music"}
          </button>

          {timeLeft <= 0 ? (
            <button style={styles.accessButton} onClick={() => alert("Access Granted! (Simulation)")}>
              PROCEED TO AI BANKING DASHBOARD
            </button>
          ) : (
            <div style={styles.lockedMessage}>
              ACCESS LOCKED. PLEASE ENJOY THE BUREAUCRACY.
            </div>
          )}
        </div>

        {/* Excessive Explanatory Headers */}
        <div style={styles.regulationsContainer}>
          <h2 style={styles.sectionTitle}>INFORMATIONAL SWAG & REGULATIONS</h2>
          {renderBureaucraticHeaders()}
        </div>

      </main>

      {/* The Massive Footer */}
      <footer style={styles.footer}>
        <h4 style={{color: '#fff', textAlign: 'center'}}>SITE MAP (ALL 100 TABS LINKED FOR TRANSPARENCY)</h4>
        <div style={styles.footerGrid}>
          {renderFooterTabs()}
        </div>
        <div style={styles.footerDisclaimer}>
          <p>
            © 2024 AI Banking Bureaucracy Simulator. All rights reserved. 
            This website is a project of a 527 organization dedicated to raising awareness about the dangers of instant gratification.
            By waiting on this page, you are donating your time to the cause of digital patience.
            The AI Tutor is a registered trademark of Sovereign Humility Inc.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Inline Styles for "Production Quality" Bureaucracy
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: '"Times New Roman", Times, serif',
    backgroundColor: '#f0f2f5',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    color: '#333',
  },
  politicalBanner: {
    backgroundColor: '#002868',
    color: '#ffffff',
    padding: '10px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    borderBottom: '3px solid #bf0a30',
    letterSpacing: '1px',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: '40px 20px',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '36px',
    margin: '0 0 10px 0',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  subtitle: {
    fontSize: '18px',
    fontStyle: 'italic',
    color: '#666',
  },
  mainContent: {
    flex: 1,
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  aiTutorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '40px',
    backgroundColor: '#e3f2fd',
    padding: '20px',
    borderRadius: '15px',
    border: '2px solid #2196f3',
  },
  aiAvatar: {
    fontSize: '60px',
    marginRight: '20px',
    animation: 'float 3s ease-in-out infinite',
  },
  aiBubble: {
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    fontFamily: 'Arial, sans-serif',
  },
  waitingCard: {
    backgroundColor: '#fff',
    padding: '50px',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    textAlign: 'center',
    border: '1px solid #ddd',
    marginBottom: '50px',
  },
  spinnerContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px',
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '8px solid #f3f3f3',
    borderTop: '8px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 2s linear infinite',
  },
  progressBarContainer: {
    width: '100%',
    height: '30px',
    backgroundColor: '#e0e0e0',
    borderRadius: '15px',
    overflow: 'hidden',
    margin: '20px 0',
    border: '1px solid #999',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    transition: 'width 0.5s ease-in-out',
    backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)',
    backgroundSize: '40px 40px',
  },
  statusText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#555',
    minHeight: '27px',
  },
  queueInfo: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#fff3e0',
    border: '1px dashed #ff9800',
    display: 'inline-block',
  },
  musicButton: {
    marginTop: '30px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#673ab7',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    display: 'block',
    margin: '30px auto 10px auto',
  },
  accessButton: {
    marginTop: '20px',
    padding: '20px 40px',
    fontSize: '24px',
    fontWeight: 'bold',
    backgroundColor: '#2e7d32',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
  },
  lockedMessage: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    fontWeight: 'bold',
    border: '1px solid #ef9a9a',
  },
  regulationsContainer: {
    marginTop: '60px',
    borderTop: '5px double #333',
    paddingTop: '40px',
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: '28px',
    marginBottom: '40px',
    textDecoration: 'underline',
  },
  regulationBlock: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#fafafa',
    borderLeft: '4px solid #607d8b',
  },
  subHeader: {
    margin: '0 0 10px 0',
    fontSize: '16px',
    color: '#455a64',
  },
  legalText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#666',
    textAlign: 'justify',
  },
  footer: {
    backgroundColor: '#263238',
    color: '#b0bec5',
    padding: '40px 20px',
    borderTop: '10px solid #cfd8dc',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '10px',
    marginTop: '20px',
    maxHeight: '400px',
    overflowY: 'scroll',
    padding: '10px',
    backgroundColor: '#37474f',
  },
  footerLink: {
    color: '#80cbc4',
    textDecoration: 'none',
    fontSize: '10px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
  },
  footerDisclaimer: {
    marginTop: '40px',
    textAlign: 'center',
    fontSize: '12px',
    borderTop: '1px solid #546e7a',
    paddingTop: '20px',
  }
};

// Add global styles for animations
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
`;
document.head.appendChild(styleSheet);

export default WaitingRoomSimulator;