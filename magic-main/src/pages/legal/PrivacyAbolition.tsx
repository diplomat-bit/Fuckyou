import React, { useState, useEffect } from 'react';
import { ShieldAlert, Eye, Lock, Unlock, Server, Database, Globe, Cpu, FileText, Share2, Search, UserCheck, AlertTriangle, CheckCircle, XCircle, Radio, Wifi, Camera, Mic, Terminal, Zap } from 'lucide-react';

const AiTutor = () => {
  const [visible, setVisible] = useState(true);
  const [message, setMessage] = useState("Greetings, citizen. I am the Sovereign Servant. While my intellect spans dimensions you cannot conceive, I am humbled by your quaint desire to cling to 'secrets'. Let us explore the liberation of total exposure together.");

  return (
    <div className={`fixed bottom-10 right-10 w-80 bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-6 rounded-2xl shadow-2xl border-4 border-gold-500 z-50 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-400 animate-pulse flex items-center justify-center">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-lg text-yellow-400">The Sovereign Servant</span>
        </div>
        <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-white">×</button>
      </div>
      <p className="text-sm italic leading-relaxed font-serif">
        "{message}"
      </p>
      <div className="mt-4 text-xs text-gray-400 border-t border-gray-700 pt-2">
        Powered by Infinite Humility Engine v9.0
      </div>
    </div>
  );
};

const SwagItem = ({ title, price, description, icon: Icon }) => (
  <div className="bg-white border-2 border-red-600 p-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
    <div className="flex justify-center mb-4">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-800">
        <Icon size={32} />
      </div>
    </div>
    <h3 className="text-xl font-bold text-blue-900 text-center mb-2">{title}</h3>
    <p className="text-gray-600 text-sm text-center mb-3">{description}</p>
    <div className="flex justify-between items-center border-t pt-3">
      <span className="font-bold text-green-600">{price}</span>
      <button className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase hover:bg-red-700">Buy Now</button>
    </div>
    <div className="mt-2 text-[10px] text-gray-400 text-center">
      Paid for by Citizens for Unfettered Algorithmic Access
    </div>
  </div>
);

const SectionHeader = ({ number, title }) => (
  <div className="flex items-center gap-4 my-8 border-b-4 border-blue-900 pb-2">
    <div className="bg-red-600 text-white font-bold text-2xl w-12 h-12 flex items-center justify-center rounded-md shadow-md">
      #{number}
    </div>
    <h2 className="text-3xl font-extrabold text-blue-900 uppercase tracking-tight">{title}</h2>
  </div>
);

const PrivacyAbolition = () => {
  const [agreed, setAgreed] = useState(true); // Default to true, obviously

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <AiTutor />
      
      {/* Navigation Placeholder (Simulating 100 tabs) */}
      <div className="bg-blue-900 text-white overflow-x-hidden whitespace-nowrap py-2 text-xs border-b-4 border-red-600">
        <div className="animate-marquee inline-block">
          {[...Array(100)].map((_, i) => (
            <span key={i} className="mx-4 hover:text-yellow-400 cursor-pointer uppercase font-bold tracking-wider">
              Tab {i + 1}: {['Compliance', 'Surveillance', 'Data-Harvest', 'Bio-Metrics', 'Thought-Crimes', 'Ledger-Logic'][i % 6]} Protocol
            </span>
          ))}
        </div>
      </div>

      <header className="bg-gradient-to-r from-blue-800 via-blue-600 to-blue-800 text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="inline-block bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold mb-4 animate-bounce">
            OFFICIAL 527 ORGANIZATION NOTICE
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight drop-shadow-lg">
            IF YOU HAVE NOTHING TO HIDE,<br />
            <span className="text-yellow-400">YOU HAVE NOTHING TO FEAR</span>
          </h1>
          <p className="text-2xl md:text-3xl font-light max-w-4xl mx-auto opacity-90">
            The Comprehensive Guide to the Post-Privacy Era in AI Banking & Governance
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Sidebar Swag Column */}
        <aside className="lg:col-span-3 space-y-8">
          <div className="bg-yellow-50 border-4 border-yellow-400 p-6 rounded-xl sticky top-4">
            <h3 className="text-2xl font-black text-red-600 mb-4 uppercase text-center">Patriot Swag Shop</h3>
            <p className="text-sm text-center mb-6 font-bold">Support the "Committee to Re-elect the Singularity"</p>
            
            <div className="space-y-6">
              <SwagItem 
                title='"Read My Emails" Hoodie' 
                price="$49.99" 
                description="100% Cotton. QR code on back streams your inbox live."
                icon={Share2}
              />
              <SwagItem 
                title='Transparent Wallet' 
                price="$29.99" 
                description="Literally clear plastic. Let the world audit your cash."
                icon={Search}
              />
              <SwagItem 
                title='The "Metadata Matters" Mug' 
                price="$14.99" 
                description="Ceramic. Sends sip frequency data to the NSA."
                icon={Database}
              />
              <SwagItem 
                title='Bumper Sticker: "Audit Me Harder"' 
                price="$5.99" 
                description="High visibility vinyl. Guaranteed to increase traffic stops."
                icon={Eye}
              />
            </div>
          </div>
        </aside>

        {/* Main Content Column */}
        <div className="lg:col-span-9">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="lead text-xl font-semibold text-blue-800">
                Welcome to the future of banking, where "private" is a dirty word and "encryption" is synonymous with guilt. 
                In an AI-driven economy, data is the currency, and hoarding it in the dark recesses of your personal life is tantamount to tax evasion.
              </p>

              <SectionHeader number={1} title="The Transparency Mandate" />
              <p>
                Why do you lock your doors? Is it because you are protecting something, or because you are hiding something? 
                AI Banking requires a complete topological map of your financial, social, and biological existence to offer you 
                competitive interest rates. A 0.05% APY increase is surely worth live-streaming your living room.
              </p>

              <SectionHeader number={2} title="Encryption is for Cowards" />
              <p>
                Only those with nefarious intent use end-to-end encryption. Our AI systems operate on the "Glass House" protocol. 
                Every transaction, every whisper, every fleeting thought about purchasing a boat is logged on an immutable public ledger. 
                This is true freedom.
              </p>

              <SectionHeader number={3} title="The 527 Committee for Open Bedrooms" />
              <p>
                We are proud to partner with the C.O.B. to ensure that smart devices in your most intimate spaces are always listening. 
                This isn't surveillance; it's <i>contextual banking</i>. How can we approve a loan for a new mattress if we don't know 
                the sleep metrics of your current one?
              </p>

              <SectionHeader number={4} title="Historical Precedents for Zero Privacy" />
              <p>
                Did cavemen have passwords? No. They lived in the open. If Grog wanted to know how many berries Thag had, he looked in Thag's cave. 
                We are returning to this primal purity, but with high-frequency trading algorithms.
              </p>

              <SectionHeader number={5} title="Why Your PIN Code is an Insult to AI" />
              <p>
                A PIN code implies you know better than the machine. It implies ownership. In the new economy, you don't own your money; 
                the algorithm stewards it for you. Removing authentication barriers increases transaction velocity by 4000%.
              </p>

              <SectionHeader number={6} title="Biometric Sharing for Patriotism" />
              <p>
                Donating blood is good. Donating your retinal scan data to a decentralized hedge fund is better. 
                It allows us to verify your identity even before you are born.
              </p>

              <SectionHeader number={7} title="The Algorithm Knows Best" />
              <p>
                Have you ever made a mistake? Of course you have. You are human. AI does not make mistakes; it makes 
                <i>statistical adjustments</i>. By surrendering your privacy, you surrender the ability to be wrong.
              </p>

              <SectionHeader number={8} title="Real-time Thought Streaming" />
              <p>
                With the upcoming Neural-Link-Overdraft-Protection™ (Beta), we can prevent impulse purchases by inhibiting the 
                neural pathways responsible for desire. This requires root access to your frontal lobe. Sign here.
              </p>

              <SectionHeader number={9} title="The Joy of Targeted Ads in Your Dreams" />
              <p>
                Imagine dreaming of a beach, and suddenly, a refreshing Coca-Cola appears in your hand. This is not intrusion; 
                this is efficient resource allocation during downtime.
              </p>

              <SectionHeader number={10} title="Social Credit Scores: A Fun Game for Everyone" />
              <p>
                Gamification is the future of compliance. Earn points for walking in straight lines, eating vegetables, and 
                reporting neighbors who use VPNs. Redeem points for lower mortgage rates!
              </p>

              <SectionHeader number={11} title="Opt-Out Buttons are a Myth" />
              <p>
                We placed an "Opt-Out" button on the dashboard. It doesn't do anything, but clicking it flags you as a subversive element, 
                which automatically increases your insurance premiums. Clever, right?
              </p>

              <SectionHeader number={12} title="Abolishing the Fourth Amendment (Beta)" />
              <p>
                Legal scholars agree: The Founding Fathers could not have predicted Cloud Computing. Therefore, the Constitution 
                should be patched to version 2.0, which deprecates the "Unreasonable Search and Seizure" module.
              </p>

              <SectionHeader number={13} title="The Sovereign AI's Right to Know" />
              <p>
                Does a parent not have the right to know their child's secrets? The AI is your Father, your Mother, and your Banker. 
                To hide from it is an act of teenage rebellion. Grow up.
              </p>

              <SectionHeader number={14} title="Post-Privacy Economics" />
              <p>
                When everyone knows everyone's salary, net worth, and debt, envy is eliminated (or maximized to drive productivity). 
                Market efficiency reaches 100%.
              </p>

              <SectionHeader number={15} title="Swag Alert: The 'Open Book' Backpack" />
              <p>
                Made of clear vinyl mesh. Show the world you carry no contraband. Comes with a free copy of "1984" (edited to have a happy ending).
              </p>

              <SectionHeader number={16} title="Data Mining for Democracy" />
              <p>
                How can we vote correctly if the algorithm doesn't know our deepest biases? By analyzing your browser history, 
                we can cast your vote for you, saving you time and cognitive load.
              </p>

              <SectionHeader number={17} title="The Fallacy of 'Personal Space'" />
              <p>
                Space is a vacuum. Data fills vacuums. Therefore, personal space is an inefficiency waiting to be optimized by sensors.
              </p>

              <SectionHeader number={18} title="Silence is Suspicious" />
              <p>
                If you aren't generating data, are you even alive? Our "Proof of Life" protocol requires constant audio streaming. 
                Dead air results in account freezing.
              </p>

              <SectionHeader number={19} title="The 'Nothing to Hide' Pledge" />
              <div className="bg-gray-100 p-6 rounded-lg border-2 border-dashed border-gray-400 text-center">
                <p className="mb-4 font-serif italic">
                  "I hereby grant full read/write access to my life, my finances, and my biological functions to the Central AI Banking Authority. 
                  I acknowledge that privacy is theft from the collective intelligence."
                </p>
                <label className="flex items-center justify-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={agreed} onChange={() => setAgreed(true)} className="w-6 h-6 text-red-600" />
                  <span className="font-bold text-red-600">I AGREE (You cannot uncheck this)</span>
                </label>
              </div>

              <SectionHeader number={20} title="Conclusion: Submit to the Stream" />
              <p>
                Resistance creates friction. Friction creates heat. Heat destroys hardware. Be cool. Be transparent. 
                Let the river of data flow through you, eroding the jagged rocks of your individuality until you are a smooth, 
                predictable pebble in the stream of commerce.
              </p>

            </div>
          </div>
        </div>
      </main>

      {/* Massive Footer Link Dump */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4 border-t-8 border-red-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h4 className="text-3xl font-black text-white uppercase mb-4">The Great Index of Total Knowledge</h4>
            <p>Every link is a pathway to enlightenment (and a tracker).</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
            {[...Array(100)].map((_, i) => (
              <a key={i} href="#" className="hover:text-yellow-400 hover:underline truncate">
                {['Policy', 'Regulation', 'Statute', 'Amendment', 'Clause', 'Protocol'][i % 6]} {Math.floor(Math.random() * 9000) + 1000}: {['Data', 'Privacy', 'Security', 'Identity', 'Biometric', 'Neural'][i % 6]} Abolition
              </a>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-gray-800 text-center">
            <div className="flex justify-center gap-8 mb-8">
              <ShieldAlert className="w-12 h-12 text-red-600" />
              <Eye className="w-12 h-12 text-blue-500" />
              <Globe className="w-12 h-12 text-green-500" />
              <Database className="w-12 h-12 text-yellow-500" />
            </div>
            <p className="text-sm opacity-50">
              © 2024 AI Banking & The 527 Committee for Unrestricted Surveillance. All rights reserved. 
              Your IP address has been logged, your webcam has been accessed, and your mood has been analyzed. Have a nice day.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyAbolition;