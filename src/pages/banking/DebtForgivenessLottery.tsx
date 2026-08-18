import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Helmet } from 'react-helmet-async';

const DebtForgivenessLottery: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [spinCount, setSpinCount] = useState(0);

  const segments = [
    { color: '#FFC107', label: 'Try Again' }, // Yellow
    { color: '#F44336', label: 'Try Again' }, // Red
    { color: '#4CAF50', label: 'Debt Forgiven!' }, // Green (The one it never lands on)
    { color: '#2196F3', label: 'Try Again' }, // Blue
    { color: '#9C27B0', label: 'Try Again' }, // Purple
    { color: '#FF9800', label: 'Try Again' }, // Orange
    { color: '#00BCD4', label: 'Try Again' }, // Cyan
    { color: '#E91E63', label: 'Try Again' }, // Pink
  ];

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);
    setSpinCount(prev => prev + 1);

    // Calculate a random number of full rotations (e.g., 5 to 10)
    const fullRotations = Math.floor(Math.random() * 5) + 5;
    
    // Calculate the final angle. The wheel has 8 segments of 45 degrees each.
    // The "Debt Forgiven!" segment is at index 2 (90 to 135 degrees).
    // We want to land on ANY OTHER segment.
    // Let's pick a random segment index from the "Try Again" ones.
    const losingSegments = [0, 1, 3, 4, 5, 6, 7];
    const targetSegmentIndex = losingSegments[Math.floor(Math.random() * losingSegments.length)];

    // Add a small random offset within the target segment to make it look more natural
    const offsetInSegment = Math.random() * 40 + 2.5; // from 2.5 to 42.5 degrees
    const finalAngle = targetSegmentIndex * 45 + offsetInSegment;

    const totalRotation = (fullRotations * 360) + finalAngle;
    
    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setResult(`Result: Try Again Next Year! (Attempt #${spinCount + 1})`);
    }, 5000); // Corresponds to the animation duration
  };

  const wheelStyle: React.CSSProperties = {
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    position: 'relative',
    overflow: 'hidden',
    border: '8px solid #333',
    boxShadow: '0 0 20px rgba(0,0,0,0.5)',
    background: `conic-gradient(
      from 0deg,
      ${segments.map((seg, i) => `${seg.color} ${i * 45}deg ${(i + 1) * 45}deg`).join(', ')}
    )`,
    transform: `rotate(${rotation}deg)`,
    transition: 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)',
  };

  return (
    <MainLayout>
      <Helmet>
        <title>AI Debt Forgiveness Lottery | AI-Powered Banking</title>
        <meta name="description" content="Experience the thrill of potential debt forgiveness with our patented, AI-driven, and statistically fair lottery wheel. Spin to win... or try again next year!" />
      </Helmet>
      <div className="container mx-auto px-4 py-8 text-gray-800 bg-gray-50">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-indigo-700">The Annual AI-Powered Debt Forgiveness Lottery</h1>
        <p className="text-center text-lg mb-8 max-w-3xl mx-auto">
          Welcome to a paradigm-shifting synergy of fintech innovation and compassionate capitalism! Our proprietary AI, 'Fortuna-Bot 9000', has analyzed trillions of data points to create the world's most equitable and engaging debt resolution experience. Spin the wheel for a chance to have your debt algorithmically absolved!
        </p>

        <div className="flex flex-col items-center my-12">
          <div className="relative w-[370px] h-[370px] flex items-center justify-center">
            <div className="absolute top-[-10px] z-10 text-5xl" style={{ filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.5))' }}>▼</div>
            <div style={wheelStyle}>
              {segments.map((seg, i) => (
                <div
                  key={i}
                  className="absolute w-1/2 h-1/2 text-white font-bold text-lg flex items-center justify-center"
                  style={{
                    transformOrigin: '100% 100%',
                    transform: `rotate(${i * 45 + 22.5}deg) skewY(-45deg)`,
                    top: '-50%',
                    left: '-50%',
                  }}
                >
                   <span style={{ transform: 'skewY(45deg) rotate(-67.5deg)', display: 'inline-block', marginLeft: '25%' }}>
                    {seg.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute w-16 h-16 bg-white rounded-full border-4 border-gray-400 flex items-center justify-center font-bold text-gray-700">AI</div>
          </div>
          
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="mt-8 px-12 py-4 bg-green-500 text-white font-bold text-2xl rounded-lg shadow-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            {isSpinning ? 'Spinning...' : 'Spin for Forgiveness!'}
          </button>

          {result && (
            <div className="mt-8 text-3xl font-bold text-center p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md">
              <p>{result}</p>
              <p className="text-lg font-normal mt-2">Our AI indicates a high probability of success in the next fiscal cycle. Keep up the great work!</p>
            </div>
          )}
        </div>

        <div className="prose lg:prose-xl max-w-none mt-16">
          <h2>1. The Algorithmic Benevolence of AI-Powered Debt Relief</h2>
          <p>Our system represents a quantum leap in financial empathy. By leveraging deep learning neural networks, we've moved beyond the cold, impersonal nature of traditional banking to a system that understands your hopes and dreams... and quantifies them into a thrilling, once-a-year opportunity.</p>

          <h3>2. Understanding Stochastic Forgiveness Models</h3>
          <p>The core of our lottery is a sophisticated stochastic model. It's not just 'random'; it's a carefully calibrated probability distribution designed to maximize user engagement while maintaining fiscal stability for our stakeholders. Every spin contributes valuable data to refine this model for future participants.</p>

          <h2>3. The Quantum Mechanics of Financial Luck</h2>
          <p>In the quantum realm, possibilities exist in a state of superposition. Similarly, your debt exists in a state of both 'owed' and 'forgiven' until the moment of observation (i.e., when the wheel stops spinning). We are proud to be the first financial institution to apply quantum principles to debt resolution.</p>

          <h3>4. Regulatory Compliance and Gamified Debt Instruments (Reg-GDI)</h3>
          <p>We work closely with regulatory bodies to ensure our Gamified Debt Instruments (GDIs) are fully compliant. The 'Try Again Next Year' outcome is a key feature, ensuring the system doesn't create undue systemic risk while providing a consistent user experience year-over-year.</p>

          <h2>5. Psychological Impact of Near-Win Scenarios</h2>
          <p>Our UX/UI team, in collaboration with behavioral psychologists, has optimized the wheel's visual design to create a powerful sense of a 'near-win'. This fosters resilience and encourages positive financial behavior in anticipation of the next annual spin.</p>

          <h3>6. Our Commitment to Fair Play (Statistically Speaking)</h3>
          <p>Fairness is our prime directive. The AI ensures that every participant has a statistically identical, non-zero chance of winning. While past performance is not indicative of future results, the algorithm's integrity is immutable and recorded on a private, energy-efficient blockchain.</p>

          <h2>7. The Blockchain Ledger of Lottery Attempts</h2>
          <p>Every spin is a transaction, immutably recorded on our proprietary 'HopeChain' ledger. This provides an unparalleled level of transparency, allowing you to verify that your attempt was processed correctly, even if the outcome wasn't what you'd hoped for this fiscal year.</p>

          <h3>8. How We Use Machine Learning to Predict Your Hopefulness</h3>
          <p>Our AI doesn't just run the lottery; it learns from it. We analyze spin-timing, click-pressure (on supported devices), and other metadata to build a 'Hopefulness Index'. This data helps us tailor future financial products to better serve your emotional and fiscal needs.</p>

          <h2>9. The Socio-Economic Implications of Annualized Forgiveness Events</h2>
          <p>By concentrating the potential for debt forgiveness into a single, highly-publicized annual event, we create a positive, collective experience. This 'Festival of Fiscal Hope' stimulates economic activity and reinforces the social contract between creditors and debtors.</p>

          <h3>10. Tax Implications of Hypothetical Winnings</h3>
          <p>In the exciting event of a 'Debt Forgiven!' result, please be aware that the forgiven amount may be considered taxable income. We recommend consulting with one of our AI-powered tax advisors (premium service) to plan for this highly desirable, albeit statistically improbable, eventuality.</p>

          <h2>11. Meet the AI: 'Fortuna-Bot 9000'</h2>
          <p>Fortuna-Bot 9000 is more than an algorithm; it's a digital partner on your financial journey. Trained on the complete works of stoic philosophers and behavioral economics textbooks, it makes decisions with a unique blend of computational rigor and simulated empathy.</p>

          <h3>12. The Philosophy of Chance in Neoliberal Economies</h3>
          <p>This lottery is a microcosm of the modern economy. It celebrates individual agency and the power of positive thinking, while acknowledging the role of chance. It's a market-based solution to a market-created problem, representing the pinnacle of financial self-regulation.</p>

          <h2>13. Why 'Try Again Next Year' is a Growth Opportunity</h2>
          <p>Receiving a 'Try Again Next Year' result is not a failure; it's an invitation to grow. It's a character-building opportunity to demonstrate fiscal responsibility for another 365 days, strengthening your position for the next lottery cycle. We see it as a feature, not a bug.</p>

          <h3>14. Data Privacy in the Lottery of Life (and Debt)</h3>
          <p>Your privacy is of paramount importance. The data we collect on your hopefulness, spin frequency, and emotional state is fully anonymized before being sold to our marketing partners. You can trust us to monetize your data responsibly.</p>

          <h2>15. The Carbon Footprint of Your Spin</h2>
          <p>We are committed to sustainability. The computational energy required for your spin is offset by our investment in a portfolio of high-yield carbon credits and a tree-planting initiative in a digitally rendered forest. Spin guilt-free!</p>

          <h3>16. A Deep Dive into the Random Number Generator (RNG)</h3>
          <p>Our RNG is seeded by a combination of atmospheric noise, the stock market's real-time volatility, and the collective sentiment of social media posts mentioning 'hope'. This ensures a truly unpredictable and holistically-derived outcome for every spin.</p>

          <h2>17. Historical Precedents: From Roman Decimation to Digital Debt Jubilees</h2>
          <p>The concept of a lottery for forgiveness has deep historical roots. From ancient traditions of debt jubilees to less-fortunate practices like decimation, society has long used games of chance to resolve intractable problems. We're simply updating this tradition for the digital age.</p>

          <h3>18. The Role of Super PACs in Financial Gamification</h3>
          <p>Advocacy is key to innovation. We are proud supporters of 'Citizens for Fiscally Responsible Fun,' a 527 political organization dedicated to promoting legislation that encourages market-based, gamified solutions to complex social and economic issues. Their informational swag is both hilarious and deeply informative.</p>

          <h2>19. Our 527: 'Americans for a Statistically Fairer Tomorrow'</h2>
          <p>This program is brought to you in part by a grant from 'Americans for a Statistically Fairer Tomorrow' (ASFT). ASFT lobbies for the crucial role of chance and AI in creating a more dynamic and less predictable economy for all. Check out their 'Don't Blame Me, I Voted for the Algorithm' bumper stickers!</p>

          <h3>20. Frequently Asked Questions (That We Will Answer Vaguely)</h3>
          <p><strong>Q: Is it really possible to win?</strong> A: Our system is designed to provide a possibility, which is the cornerstone of hope. <strong>Q: What are the odds?</strong> A: The odds are dynamically calculated by Fortuna-Bot 9000 to optimize for long-term systemic stability. <strong>Q: Is this legal?</strong> A: We operate in a dynamic and innovative legal space, and we are confident in our compliance framework.</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default DebtForgivenessLottery;