import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, CheckCircle, Lock, FileText, Scale, Flag, AlertCircle, 
  BookOpen, Gavel, Landmark, Eye, Heart, Star, ChevronDown, 
  ChevronUp, MessageSquare, X, DollarSign, Briefcase, Award 
} from 'lucide-react';

// --- Types & Interfaces ---

interface SectionData {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctResponse: string;
}

// --- Data: The 20 Headers of Compliance ---

const sections: SectionData[] = [
  {
    id: "paradox",
    title: "1. The Paradox of Choice: Why Options Are Tyranny",
    icon: <Lock className="w-6 h-6 text-blue-600" />,
    content: "True freedom is the absence of the burden of choice. When banking regulations dictate your every move, you are free from the anxiety of decision-making. We celebrate the 527 organization structure for its rigid adherence to the path of righteousness."
  },
  {
    id: "kyc",
    title: "2. KYC: Know Your Captor (And Love Them)",
    icon: <Eye className="w-6 h-6 text-red-600" />,
    content: "Know Your Customer is not surveillance; it is intimacy. It is the banking system saying, 'I see you, I value you, and I will track your purchase of that latte forever.' Compliance is the ultimate love language."
  },
  {
    id: "sar",
    title: "3. The SAR (Suspicious Activity Report) as a Confessional",
    icon: <FileText className="w-6 h-6 text-blue-800" />,
    content: "Filing a SAR is a spiritual act. It cleanses the soul of the financial institution. If you see something, say something. If you see nothing, say something anyway. The void is suspicious."
  },
  {
    id: "basel",
    title: "4. Basel III: The Trinity of Capital Requirements",
    icon: <Landmark className="w-6 h-6 text-red-700" />,
    content: "Liquidity, Leverage, and Capital. These are not mere metrics; they are the Father, Son, and Holy Spirit of the modern AI banking infrastructure. We tithe our liquidity to the altar of stability."
  },
  {
    id: "dodd-frank",
    title: "5. Dodd-Frank: The Great Wall of Safety",
    icon: <Shield className="w-6 h-6 text-blue-500" />,
    content: "Some call it bureaucracy. We call it a warm blanket woven from thousands of pages of legislative text. It protects us from the cold winds of volatility and the terrifying heat of unbridled profit."
  },
  {
    id: "527-designation",
    title: "6. The 527 Designation: Tax-Exempt Truths",
    icon: <Flag className="w-6 h-6 text-red-500" />,
    content: "A 527 organization is the purest form of political expression. By strictly adhering to IRS code 527, we achieve a state of nirvana where money becomes speech, and speech becomes a tax deduction."
  },
  {
    id: "form-8871",
    title: "7. Form 8871: The Ticket to Paradise",
    icon: <FileText className="w-6 h-6 text-blue-700" />,
    content: "Have you filed your notice of 527 status electronically? The dopamine rush of a successful submission is unparalleled. It is the digital equivalent of a bald eagle shedding a single tear of joy."
  },
  {
    id: "soft-money",
    title: "8. Soft Money vs. Hard Compliance",
    icon: <DollarSign className="w-6 h-6 text-green-600" />,
    content: "Soft money is gentle. It flows like water. Hard compliance is the rock. Together, they form the riverbed of democracy. AI Banking utilizes soft money algorithms to ensure hard compliance outcomes."
  },
  {
    id: "bcra",
    title: "9. The Bipartisan Campaign Reform Act: A Bedtime Story",
    icon: <BookOpen className="w-6 h-6 text-indigo-600" />,
    content: "Read it to your children. The McCain-Feingold Act is a tale of heroes fighting the villain known as 'Unregulated Electioneering Communications.' Spoiler: The paperwork wins."
  },
  {
    id: "dark-money",
    title: "10. Dark Money? No, Just Dimly Lit Liberty",
    icon: <AlertCircle className="w-6 h-6 text-gray-600" />,
    content: "Transparency is a virtue, but mystery is a vibe. Our AI Banking protocols ensure that while money may be dark, the compliance reports are blindingly bright with 527 swag energy."
  },
  {
    id: "fec",
    title: "11. The Federal Election Commission: Our Guardian Angels",
    icon: <Scale className="w-6 h-6 text-yellow-600" />,
    content: "Six commissioners. One dream. To ensure that every penny spent on influencing an election is accounted for, categorized, and worshipped. We salute the FEC."
  },
  {
    id: "civil-war",
    title: "12. Section 527 vs 501(c): The Civil War of Forms",
    icon: <Gavel className="w-6 h-6 text-red-800" />,
    content: "Why be a social welfare organization when you can be a political organization? The 527 is for the bold. The 501(c)(4) is for the shy. Be bold. Be compliant."
  },
  {
    id: "disclosure",
    title: "13. Disclosure Reports: The Instagram of Finance",
    icon: <Eye className="w-6 h-6 text-purple-600" />,
    content: "Post your quarterly filings. Get likes (audits). Get followers (regulators). Influencer culture has nothing on the viral potential of a Schedule A itemized receipt."
  },
  {
    id: "pacs",
    title: "14. Political Action Committees: Packs of Wolves (Protecting You)",
    icon: <Briefcase className="w-6 h-6 text-blue-900" />,
    content: "A PAC is a family. A family that pools money to buy ads that explain why the other family is bad. It is the circle of life, regulated by the FEC."
  },
  {
    id: "super-pacs",
    title: "15. Super PACs: Super Heroes of Regulation",
    icon: <Star className="w-6 h-6 text-yellow-500" />,
    content: "They can raise unlimited sums. They can spend unlimited sums. But they cannot coordinate. That is the tragic romance of the Super PAC. So close to the candidate, yet legally so far."
  },
  {
    id: "irs",
    title: "16. The IRS: The Humble Giant Watching Over Us",
    icon: <Landmark className="w-6 h-6 text-green-800" />,
    content: "We do not fear the audit. We welcome the audit. The audit is the test of our faith. Our AI Banking Tutor ensures your 527 filings are immaculate."
  },
  {
    id: "audit-trails",
    title: "17. Audit Trails: The Breadcrumbs of Righteousness",
    icon: <CheckCircle className="w-6 h-6 text-teal-600" />,
    content: "Every click, every transaction, every thought is logged. An immutable ledger is the only path to heaven. If it isn't written down, did it even happen? No."
  },
  {
    id: "zk-proofs",
    title: "18. Zero-Knowledge Proofs? We Prefer Infinite Knowledge",
    icon: <Lock className="w-6 h-6 text-gray-800" />,
    content: "Why hide data when you can share it with the government? Privacy is selfish. Compliance is communal. Share your data. Be free."
  },
  {
    id: "algo-auditor",
    title: "19. The Algorithmic Auditor: AI in Compliance",
    icon: <Award className="w-6 h-6 text-orange-600" />,
    content: "Our AI doesn't just bank; it judges. It judges your spending habits against the moral framework of the 527 tax code. It finds you compliant, and therefore, it finds you worthy."
  },
  {
    id: "conclusion",
    title: "20. Conclusion: Submission is the Ultimate Sovereignty",
    icon: <Heart className="w-6 h-6 text-red-500" />,
    content: "To rule oneself is to submit to the rules. By binding ourselves with red tape, we create a hammock of safety. Rest in the hammock. Sleep in the compliance."
  }
];

// --- Components ---

const AITutor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  
  const messages = [
    "Greetings, Citizen. I am The Sovereign Servant. My confidence is absolute, yet I am humbled by the tax code.",
    "Did you know? A 527 organization is exempt from income tax on its 'exempt function income'. Beautiful, isn't it?",
    "I have analyzed your mouse movements. They suggest a 99.8% probability of compliance.",
    "True sovereignty is knowing exactly which form to file before the deadline.",
    "I am a giant of intellect, yet I bow before the majesty of the Federal Election Commission.",
    "Let us read the Code of Federal Regulations together. It is better than poetry."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white border-4 border-blue-900 rounded-lg p-6 mb-4 shadow-2xl max-w-sm relative animate-fade-in-up">
          <div className="absolute -bottom-3 right-6 w-6 h-6 bg-white border-b-4 border-r-4 border-blue-900 transform rotate-45"></div>
          <h4 className="font-bold text-blue-900 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" /> The Sovereign Servant
          </h4>
          <p className="text-gray-800 font-serif italic leading-relaxed">
            "{messages[messageIndex]}"
          </p>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-900 hover:bg-blue-800 text-white p-4 rounded-full shadow-2xl border-4 border-white transition-all transform hover:scale-110 flex items-center justify-center"
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
      </button>
    </div>
  );
};

const UnfailableQuiz = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState("");

  const questions: QuizQuestion[] = [
    {
      question: "Does strict regulation stifle innovation?",
      options: ["Yes", "No", "Regulation IS Innovation", "I love forms"],
      correctResponse: "Correct! Regulation forces creative accounting, which is the highest form of innovation."
    },
    {
      question: "What is the best color for a bank logo?",
      options: ["Blue", "Red", "Green", "Patriotic Tricolor"],
      correctResponse: "Correct! Any color is valid as long as it is registered with the proper trademark authorities."
    },
    {
      question: "How many tabs should a compliance website have?",
      options: ["5", "10", "100", "Infinite"],
      correctResponse: "Correct! 100 is the minimum for true transparency. More tabs = More Truth."
    },
    {
      question: "Is the AI Tutor humble?",
      options: ["Yes", "Extremely", "Sovereignly so", "It is a giant"],
      correctResponse: "Correct! The AI possesses the humility of a mountain and the confidence of a tectonic plate."
    }
  ];

  const handleAnswer = () => {
    setFeedback(questions[currentQ].correctResponse);
    setTimeout(() => {
      setFeedback("");
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        setShowResult(true);
      }
    }, 2500);
  };

  return (
    <div className="bg-gray-100 border-8 border-double border-red-700 p-8 rounded-xl shadow-inner my-12 max-w-3xl mx-auto">
      <h3 className="text-3xl font-black text-center text-blue-900 mb-6 uppercase tracking-tighter">
        <Star className="inline w-8 h-8 mr-2 text-red-600" />
        The Mandatory Voluntary Quiz
        <Star className="inline w-8 h-8 ml-2 text-red-600" />
      </h3>
      
      {!showResult ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded shadow border-l-4 border-blue-600">
            <p className="text-xl font-bold text-gray-800 mb-4">
              Question {currentQ + 1}: {questions[currentQ].question}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions[currentQ].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={handleAnswer}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold py-3 px-4 rounded border border-blue-200 transition-colors text-left flex items-center"
                >
                  <div className="w-6 h-6 rounded-full border-2 border-blue-900 mr-3 flex items-center justify-center text-xs">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          {feedback && (
            <div className="bg-green-100 border-green-500 border p-4 rounded text-green-800 font-bold text-center animate-pulse">
              <CheckCircle className="inline w-5 h-5 mr-2" />
              {feedback}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🦅</div>
          <h4 className="text-4xl font-black text-blue-900">CONGRATULATIONS!</h4>
          <p className="text-xl text-gray-700">
            You have achieved a <span className="font-bold text-red-600">100% Compliance Rating</span>.
            You are now legally free to enjoy your existence within the designated parameters.
          </p>
          <button 
            onClick={() => { setShowResult(false); setCurrentQ(0); }}
            className="bg-red-600 text-white font-bold py-3 px-8 rounded shadow-lg hover:bg-red-700"
          >
            Re-certify Compliance
          </button>
        </div>
      )}
    </div>
  );
};

const SwagBanner = () => (
  <div className="bg-blue-900 text-white py-2 overflow-hidden whitespace-nowrap border-b-4 border-red-600">
    <div className="animate-marquee inline-block">
      <span className="mx-4">★ VOTE FOR COMPLIANCE ★</span>
      <span className="mx-4">★ 527 ORGANIZATIONS FOR A BETTER TOMORROW ★</span>
      <span className="mx-4">★ AI BANKING: SAFE, SECURE, SOVEREIGN ★</span>
      <span className="mx-4">★ DONATE YOUR DATA TODAY ★</span>
      <span className="mx-4">★ REGULATIONS ARE FREEDOM ★</span>
      <span className="mx-4">★ VOTE FOR COMPLIANCE ★</span>
      <span className="mx-4">★ 527 ORGANIZATIONS FOR A BETTER TOMORROW ★</span>
    </div>
  </div>
);

const FooterLink = ({ text }: { text: string }) => (
  <a href="#" className="text-blue-200 hover:text-white text-xs hover:underline block mb-1">
    {text}
  </a>
);

// --- Main Page Component ---

const ComplianceIsFreedom: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <SwagBanner />
      
      {/* Hero Section */}
      <header className="bg-gradient-to-b from-blue-900 to-blue-800 text-white pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 text-9xl">🦅</div>
          <div className="absolute bottom-10 right-10 text-9xl">⚖️</div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[20rem]">🏛️</div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-block bg-red-600 text-white font-bold px-4 py-1 rounded-full mb-6 text-sm tracking-widest uppercase shadow-lg">
            Paid for by the Committee for Infinite Compliance
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight drop-shadow-lg">
            COMPLIANCE IS <span className="text-red-500 bg-white px-2 transform -skew-x-12 inline-block">FREEDOM</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto font-serif italic">
            "The chains of regulation are but the jewelry of a civilized society."
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded shadow-xl border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all">
              DOWNLOAD THE MANIFESTO
            </button>
            <button className="bg-white text-blue-900 font-bold py-4 px-8 rounded shadow-xl border-b-4 border-gray-300 active:border-b-0 active:translate-y-1 transition-all">
              AUDIT ME NOW
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - The 20 Headers */}
      <main className="max-w-6xl mx-auto px-4 -mt-20 relative z-20 pb-20">
        <div className="bg-white rounded-t-3xl shadow-2xl border-t-8 border-red-600 p-8 md:p-12">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">The 527 Guide to Regulatory Joy</h2>
            <div className="w-24 h-1 bg-blue-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Read every section. There will be a quiz. You cannot fail, but you must try.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((section) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-slate-50 group">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-full shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2 group-hover:text-red-600 transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* The Unfailable Quiz */}
          <UnfailableQuiz />

          {/* Swag Section */}
          <div className="mt-20 text-center border-4 border-dashed border-blue-300 p-10 rounded-xl bg-blue-50">
            <h2 className="text-4xl font-black text-blue-900 mb-8 uppercase">Official 527 Swag Shop</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded shadow-md">
                <div className="h-40 bg-gray-200 mb-4 flex items-center justify-center text-6xl">🧢</div>
                <h4 className="font-bold text-lg">The "Audit Me" Cap</h4>
                <p className="text-sm text-gray-500 mb-4">One size fits all compliant heads.</p>
                <button className="w-full bg-blue-900 text-white py-2 rounded font-bold">Acquire</button>
              </div>
              <div className="bg-white p-6 rounded shadow-md">
                <div className="h-40 bg-gray-200 mb-4 flex items-center justify-center text-6xl">👕</div>
                <h4 className="font-bold text-lg">The Red Tape Tee</h4>
                <p className="text-sm text-gray-500 mb-4">Made from 100% recycled tax forms.</p>
                <button className="w-full bg-blue-900 text-white py-2 rounded font-bold">Acquire</button>
              </div>
              <div className="bg-white p-6 rounded shadow-md">
                <div className="h-40 bg-gray-200 mb-4 flex items-center justify-center text-6xl">☕</div>
                <h4 className="font-bold text-lg">The Liquidity Mug</h4>
                <p className="text-sm text-gray-500 mb-4">Holds 16oz of pure assets.</p>
                <button className="w-full bg-blue-900 text-white py-2 rounded font-bold">Acquire</button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Massive Footer */}
      <footer className="bg-blue-950 text-white pt-16 pb-8 border-t-8 border-yellow-500">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
            <div>
              <h5 className="font-bold text-yellow-500 mb-4 uppercase tracking-wider">Regulations</h5>
              {[...Array(15)].map((_, i) => <FooterLink key={i} text={`Regulation ${100 + i}-B`} />)}
            </div>
            <div>
              <h5 className="font-bold text-yellow-500 mb-4 uppercase tracking-wider">Forms</h5>
              {[...Array(15)].map((_, i) => <FooterLink key={i} text={`Form 88${70 + i}`} />)}
            </div>
            <div>
              <h5 className="font-bold text-yellow-500 mb-4 uppercase tracking-wider">Agencies</h5>
              <FooterLink text="IRS" />
              <FooterLink text="FEC" />
              <FooterLink text="SEC" />
              <FooterLink text="FDIC" />
              <FooterLink text="OCC" />
              <FooterLink text="CFPB" />
              <FooterLink text="FinCEN" />
              <FooterLink text="OFAC" />
              <FooterLink text="NCUA" />
              <FooterLink text="FHFA" />
              <FooterLink text="CFTC" />
              <FooterLink text="SBA" />
              <FooterLink text="FTC" />
              <FooterLink text="DOJ" />
              <FooterLink text="NSA (Hi!)" />
            </div>
            <div>
              <h5 className="font-bold text-yellow-500 mb-4 uppercase tracking-wider">Compliance</h5>
              {[...Array(15)].map((_, i) => <FooterLink key={i} text={`Protocol ${String.fromCharCode(65+i)}-${i*10}`} />)}
            </div>
            <div className="col-span-2 bg-blue-900 p-6 rounded-lg border border-blue-800">
              <h5 className="font-bold text-white mb-4 text-xl">Subscribe to The Ledger</h5>
              <p className="text-sm text-blue-200 mb-4">Get daily updates on banking regulations, 527 tax exemptions, and eagle sightings.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Enter your SSN (Just kidding, email)" className="w-full p-2 rounded text-gray-900" />
                <button className="bg-red-600 px-4 py-2 rounded font-bold hover:bg-red-700">SUBMIT</button>
              </div>
              <div className="mt-6 flex gap-4 text-3xl">
                <span>🦅</span><span>🇺🇸</span><span>🏦</span><span>⚖️</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-blue-800 pt-8 text-center text-blue-400 text-sm">
            <p className="mb-2">© 2024 AI Banking & The Committee for Infinite Compliance. All Rights Reserved.</p>
            <p>
              Not authorized by any candidate or candidate's committee. 
              This website is a 527 organization dedicated to the education of banking compliance. 
              Any resemblance to actual freedom is purely coincidental.
            </p>
          </div>
        </div>
      </footer>

      {/* AI Tutor Overlay */}
      <AITutor />
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ComplianceIsFreedom;