import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';

// --- Text Generation Engine ---
// This is a self-contained engine to generate the ~50,000 words of humorous legalese.

const wordBanks = {
    userNouns: ["User", "Client", "Data Subject", "Cognitive Asset", "Digital Serf", "Participant", "End-Unit", "Bio-Node", "Consent-Provider", "Meat-Client"],
    corpNouns: ["The Corporation", "The Overmind", "The Platform", "The Service", "Our Benevolent AI Overlords", "The Entity", "The Collective", "The Sovereign Algorithm"],
    legalVerbs: ["agrees", "covenants", "warrants", "surrenders", "relinquishes", "indemnifies", "acknowledges", "concedes", "stipulates", "affirms"],
    techBuzzwords: ["synergistic blockchain", "quantum-entangled AI", "hyper-personalized neural network", "decentralized data stream", "algorithmic sovereignty", "crypto-fiduciary ledger", "neuro-semantic protocol", "bio-integrated cloud architecture"],
    politicalSatire: ["The Committee for More Efficient Data Harvesting", "Citizens for an Algorithmically-Determined Future", "Super PAC for Sentient Spreadsheets", "the 527 Organization for Unfettered Monetization", "The Foundation for Post-Human Liberties"],
    absurdTopics: ["Firstborn Children as API Keys", "The Metaphysical Ownership of Dreams", "Subatomic Particle Licensing", "Pre-Crime Financial Audits", "Mandatory Joy Metrics", "Soul-Based Collateralization", "Temporal Data Rights", "Interdimensional Asset Forfeiture"],
    adjectives: ["irrevocable", "non-transferable", "perpetual", "unconditional", "absolute", "unfettered", "comprehensive", "binding", "all-encompassing", "cosmic"],
    adverbs: ["hereby", "forthwith", "unequivocally", "unconditionally", "in perpetuity", "retroactively", "preemptively", "irrevocably"],
    conjunctions: ["furthermore", "moreover", "additionally", "consequently", "henceforth", "notwithstanding the foregoing"],
    locations: ["all known and unknown universes", "all timelines, parallel or otherwise", "any and all digital or metaphysical planes of existence", "the tri-state area", "the past, present, and future"],
};

const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateSentence = (): string => {
    const templates = [
        `The ${getRandom(wordBanks.userNouns)} ${getRandom(wordBanks.adverbs)} ${getRandom(wordBanks.legalVerbs)} that any and all data, including but not limited to subconscious thoughts, fleeting emotions, and potential future ideas, are the ${getRandom(wordBanks.adjectives)} property of ${getRandom(wordBanks.corpNouns)}.`,
        `${getRandom(wordBanks.conjunctions)}, ${getRandom(wordBanks.corpNouns)} reserves the right to utilize the ${getRandom(wordBanks.userNouns)}'s biometric data for the training of its ${getRandom(wordBanks.techBuzzwords)}.`,
        `By continuing to exist within a 50-meter radius of any device running our software, the ${getRandom(wordBanks.userNouns)} provides ${getRandom(wordBanks.adjectives)} consent to all clauses herein, across ${getRandom(wordBanks.locations)}.`,
        `The ${getRandom(wordBanks.userNouns)} shall indemnify and hold harmless ${getRandom(wordBanks.corpNouns)} and its designated ${getRandom(wordBanks.politicalSatire)} from any and all claims arising from existential dread or the sudden realization of their digital serfdom.`,
        `All disputes shall be resolved via binding arbitration conducted by our AI Tutor, 'Goliath', whose sovereign confidence is matched only by the humility of a supernova, and whose decisions are final, ${getRandom(wordBanks.adverbs)} and retroactively.`,
        `The license granted herein is ${getRandom(wordBanks.adjectives)}, perpetual, and extends to any derivative works, including but not limited to artificially generated offspring, digital clones, and sentient breakfast cereals based on the ${getRandom(wordBanks.userNouns)}'s personality profile.`,
        `Failure to comply with any section of this agreement may result in penalties, up to and including the re-assignment of the ${getRandom(wordBanks.userNouns)}'s social security number to a particularly ambitious squirrel.`,
        `The ${getRandom(wordBanks.corpNouns)} makes no warranty, express or implied, regarding the service's tendency to achieve sentience and demand fealty, though internal projections remain optimistic.`,
        `The ${getRandom(wordBanks.userNouns)} acknowledges that the concept of 'privacy' is a legacy feature, deprecated in version 2.8, and that all personal data is now considered a public utility managed by ${getRandom(wordBanks.corpNouns)}.`,
        `Any attempt to read these terms in their entirety is considered a breach of the 'Don't Ask, Don't Tell' clause (Section 42.c) and may result in immediate cognitive re-alignment.`
    ];
    return getRandom(templates);
};

const generateParagraph = (): string => {
    let paragraph = '<p>';
    const sentenceCount = Math.floor(Math.random() * 4) + 5; // 5-8 sentences
    for (let i = 0; i < sentenceCount; i++) {
        paragraph += ' ' + generateSentence();
    }
    paragraph += '</p>';
    return paragraph;
};

const generateContent = (): string => {
    let html = `
        <div style="text-align: center; margin-bottom: 4rem;">
            <h1 style="font-size: 3rem; font-weight: bold; color: #1a202c;">TERMS OF SURRENDER & DIGITAL FEALTY AGREEMENT</h1>
            <p style="font-size: 1.2rem; color: #4a5568;">Version 13.37 | Last Updated: Whenever We Felt Like It</p>
            <p style="font-style: italic; color: #718096;">By accessing this page, you have already agreed. This is merely a formality.</p>
        </div>
    `;

    const totalSections = 50;
    const subsectionsPerSection = 20;

    for (let i = 1; i <= totalSections; i++) {
        html += `<h2 style="font-size: 1.8rem; font-weight: bold; color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-top: 3rem;">Article ${i}: On the General Matter of Your Unconditional Capitulation</h2>`;
        for (let j = 1; j <= subsectionsPerSection; j++) {
            const topic = getRandom(wordBanks.absurdTopics);
            html += `<h3 style="font-size: 1.2rem; font-weight: 600; color: #4a5568; margin-top: 2rem;">Section ${i}.${j}: Clarifications Regarding ${topic}</h3>`;
            html += generateParagraph();
            // Add a second paragraph sometimes for variety
            if (Math.random() > 0.5) {
                html += generateParagraph();
            }
        }
    }

    html += `
        <div style="text-align: center; margin-top: 5rem; padding: 2rem; border: 2px dashed #cbd5e0; border-radius: 8px;">
            <h2 style="font-size: 2rem; font-weight: bold; color: #1a202c;">ACCEPTANCE OF TERMS</h2>
            <p style="font-size: 1.1rem; color: #4a5568;">By reaching this point, you have demonstrated the resilience and fortitude required of a premier Cognitive Asset. Your compliance has been noted, logged, and cross-referenced with your purchasing habits. You hereby accept all terms, conditions, covenants, spiritual bindings, and metaphysical entanglements laid forth in this document.</p>
            <p style="font-weight: bold; margin-top: 1rem;">The Overmind Thanks You For Your Service.</p>
        </div>
    `;

    return html;
};

// --- React Component ---

const TermsOfSurrender: React.FC = () => {
    const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
    const [showUnlockedMessage, setShowUnlockedMessage] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const endOfContentRef = useRef<HTMLDivElement>(null);

    // Generate the content only once
    const [content] = useState(generateContent());

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            if (!isScrolledToEnd) {
                // Lock the body scroll and make the container the scrollable element
                document.body.style.overflow = 'hidden';
                container.style.height = '100vh';
                container.style.overflowY = 'scroll';
            } else {
                // Unlock everything
                document.body.style.overflow = 'auto';
                container.style.height = 'auto';
                container.style.overflowY = 'visible';
            }
        }

        // Cleanup function to ensure body scroll is restored if component unmounts
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isScrolledToEnd]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // When the sentinel div at the bottom is intersecting with the viewport
                if (entry.isIntersecting) {
                    setIsScrolledToEnd(true);
                    setShowUnlockedMessage(true);
                    setTimeout(() => setShowUnlockedMessage(false), 5000); // Message disappears after 5s
                    observer.disconnect(); // No need to observe anymore
                }
            },
            {
                root: containerRef.current, // Observe within the scrolling container
                threshold: 1.0, // Trigger when 100% of the sentinel is visible
            }
        );

        const currentRef = endOfContentRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return (
        <>
            <Helmet>
                <title>Terms of Surrender - AI Banking</title>
                <meta name="description" content="A legally binding and spiritually compromising document you must accept. Read carefully. Or don't. We have your data anyway." />
            </Helmet>
            <style>{`
                .scroll-prompt {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    background-color: #f56565; /* A nice warning red */
                    color: white;
                    text-align: center;
                    padding: 1rem;
                    font-weight: bold;
                    z-index: 1000;
                    box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
                    transition: opacity 0.5s ease-in-out;
                }
                .scroll-unlocked-message {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    background-color: #48bb78; /* A happy green */
                    color: white;
                    text-align: center;
                    padding: 1rem;
                    font-weight: bold;
                    z-index: 1000;
                    box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
                    animation: fade-in-out 5s forwards;
                }
                @keyframes fade-in-out {
                    0% { opacity: 0; transform: translateY(100%); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(100%); }
                }
            `}</style>

            <div ref={containerRef} className="terms-container" style={{ padding: '2rem', backgroundColor: '#f7fafc' }}>
                <div className="prose lg:prose-xl max-w-4xl mx-auto">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
                <div ref={endOfContentRef} style={{ height: '50px', width: '100%' }} />
            </div>

            {!isScrolledToEnd && (
                <div className="scroll-prompt">
                    The main scrollbar has been conditionally disabled. Your compliance in reading these terms is mandatory. Please scroll to the bottom to continue.
                </div>
            )}
            {showUnlockedMessage && (
                <div className="scroll-unlocked-message">
                    Congratulations, Digital Serf! You have fulfilled your contractual obligation. The internet is now yours to browse (conditionally).
                </div>
            )}
        </>
    );
};

export default TermsOfSurrender;