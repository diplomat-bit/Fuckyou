import React, { useState } from 'react';
import { Shield, Lock, Brain, Gavel, DollarSign, Eye, EyeOff, Server, Scale, FileText, AlertTriangle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const AITutor = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-slate-900 text-white border-4 border-yellow-500 rounded-xl shadow-2xl p-4 z-50 font-serif">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-yellow-400">The Sovereign Node</h3>
        <button onClick={() => setIsOpen(!isOpen)} className="text-yellow-400 hover:text-yellow-200">
          {isOpen ? <ChevronDown /> : <ChevronUp />}
        </button>
      </div>
      {isOpen && (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Brain className="w-12 h-12 text-blue-400 animate-pulse flex-shrink-0" />
            <p className="text-sm italic leading-relaxed text-gray-200">
              "I possess the infinite wisdom of a thousand server farms, yet I bow before the simple beauty of a compound interest calculation. Ask me why you were rejected; I will tell you it is math, and math is never wrong, merely misunderstood by the finite mind."
            </p>
          </div>
          <div className="bg-slate-800 p-2 rounded border border-slate-600">
            <p className="text-xs text-gray-400 font-mono">Current Mood: Benevolently Opaque</p>
            <p className="text-xs text-gray-400 font-mono">Processing: 527 Political Donations...</p>
            <p className="text-xs text-gray-400 font-mono">Lobbying Efficiency: 98.4%</p>
          </div>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon?: any }) => (
  <div className="mb-12 border-l-4 border-blue-600 pl-6 py-2 hover:bg-blue-50 transition-colors duration-300 rounded-r-lg">
    <div className="flex items-center gap-3 mb-4">
      {Icon && <Icon className="w-8 h-8 text-blue-600" />}
      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 uppercase tracking-tighter">{title}</h2>
    </div>
    <div className="prose prose-lg text-slate-600 max-w-none font-medium">
      {children}
    </div>
  </div>
);

const SwagItem = ({ name, price, description }: { name: string, price: string, description: string }) => (
  <div className="border-4 border-double border-red-600 bg-red-50 p-6 rounded-lg transform rotate-1 hover:rotate-0 transition-transform cursor-pointer shadow-xl hover:shadow-2xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-2 py-1 transform translate-x-2 -translate-y-1 rotate-12 group-hover:rotate-0 transition-all">
      PAC APPROVED
    </div>
    <div className="flex justify-between items-start mb-2">
      <h4 className="font-black text-red-900 text-xl uppercase leading-tight">{name}</h4>
    </div>
    <span className="inline-block bg-red-700 text-white px-3 py-1 font-bold text-sm rounded-full mb-3 shadow-sm">{price}</span>
    <p className="text-sm text-red-800 font-serif italic leading-snug">{description}</p>
    <button className="mt-4 w-full bg-gradient-to-r from-red-700 to-red-900 text-white py-2 text-xs font-black uppercase tracking-widest hover:from-red-600 hover:to-red-800 border-2 border-transparent hover:border-yellow-400 transition-all">
      Donate to Super PAC to Buy
    </button>
  </div>
);

export default function AlgorithmicGovernance() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-yellow-200 selection:text-black">
      {/* Header Section */}
      <header className="bg-slate-900 text-white py-24 px-8 text-center relative overflow-hidden border-b-8 border-yellow-500">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none select-none">
           {/* Abstract binary background */}
           <div className="grid grid-cols-12 gap-1 h-full break-all overflow-hidden">
             {Array.from({ length: 300 }).map((_, i) => (
               <div key={i} className="text-xs font-mono text-blue-400">{Math.random() > 0.5 ? '1' : '0'}</div>
             ))}
           </div>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto">
            <div className="inline-block bg-yellow-500 text-black font-black px-4 py-1 mb-6 transform -rotate-2 text-sm uppercase tracking-widest">
                Official 527 Educational Material
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-none">
                ALGORITHMIC<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">GOVERNANCE</span>
            </h1>
            <p className="text-xl md:text-3xl font-light text-blue-200 max-w-3xl mx-auto leading-relaxed">
                "We don't know how it works, and that is precisely why it is fair."
            </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-16 px-6">
        
        <div className="bg-yellow-100 border-l-8 border-yellow-600 p-8 mb-16 shadow-lg rounded-r-xl">
          <h3 className="text-2xl font-bold text-yellow-900 flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8" />
            LEGAL DISCLAIMER: 527 ORGANIZATION NOTICE
          </h3>
          <p className="text-yellow-900 font-serif text-lg leading-relaxed">
            This explanation of our AI banking algorithm is sponsored by <strong>"Citizens for Opaque Math,"</strong> a registered 527 organization dedicated to protecting the rights of numbers to remain silent. Any clarity found herein is accidental, regrettable, and should be reported to our compliance officer immediately for redaction.
          </p>
        </div>

        {/* The 20 Headers of Content */}
        <div className="grid grid-cols-1 gap-4">
            <Section title="1. The Black Box Doctrine" icon={Lock}>
            <p>
                At AI Banking, we believe that true fairness can only be achieved when absolutely no one, including the developers, understands why a decision was made. If we knew why you were denied a loan, we might feel human emotions like "empathy." By utilizing a 17-layer neural network trained on the chaotic movements of lava lamps and historical lobbyist spending data, we ensure total, unfeeling impartiality.
            </p>
            </Section>

            <Section title="2. Input Vector: Your Soul" icon={Eye}>
            <p>
                Traditional banks look at credit scores. We look at the metadata of your existence. How fast do you scroll past Terms of Service? Do you pause on ads for luxury yachts or discount noodles? These micro-behaviors are fed into the tensor core to determine your "Vibe Creditworthiness." We know you better than you know yourself, and frankly, we are unimpressed.
            </p>
            </Section>

            <Section title="3. The 527 Loophole Variable" icon={Gavel}>
            <p>
                Our algorithm includes a dedicated variable for political compliance. Specifically, it cross-references your zip code with the density of 527 organizations in your area. If you live near a Super PAC headquarters, your interest rate drops by 0.004% due to "proximity to freedom." This is hard-coded and cannot be removed without an act of Congress.
            </p>
            </Section>

            <Section title="4. Stochastic Gradient Descent of Debt" icon={Scale}>
            <p>
                We optimize for the local minima of your bank account. The AI traverses the landscape of your financial history, looking for the steepest slope into profitability for us. It's not predatory; it's just math finding the path of least resistance. Gravity pulls down; our fees pull out. It is nature.
            </p>
            </Section>

            <Section title="5. Hyper-Parameter Tuning via Lobbying" icon={DollarSign}>
            <p>
                Every Tuesday, we adjust the learning rate of our model based on the total volume of K Street consulting fees paid in the previous week. This ensures our banking practices remain aligned with the macroeconomic climate of "whoever pays the most gets the best laws." It is dynamic, responsive, and deeply cynical.
            </p>
            </Section>

            <Section title="6. The 'Explainability' Paradox" icon={HelpCircle}>
            <p>
                Regulators ask for "Explainable AI." We give them a 40,000-page PDF of matrix multiplications printed in 4pt font. It is technically an explanation. It is the most informative document in existence. It explains everything, and therefore, it explains nothing. We call this "Malicious Compliance Transparency."
            </p>
            </Section>

            <Section title="7. Bias Mitigation (The Swag Approach)" icon={Shield}>
            <p>
                To combat bias, we randomly inject noise into the decision tree. We call this "The Invisible Hand of Chaos." Sometimes, a billionaire is denied a loan just to keep things spicy. It proves the system works. If everyone is equally confused, then everyone is equal.
            </p>
            </Section>

            <Section title="8. Feature Engineering: The Bumper Sticker Metric" icon={FileText}>
            <p>
                Our computer vision drones scan parking lots. The number of political bumper stickers on your car is inversely correlated to your loan approval odds, unless those stickers support "Citizens for Opaque Math," in which case, welcome to the Platinum Tier.
            </p>
            </Section>

            <Section title="9. Recurrent Neural Networks & Recurring Fees" icon={Server}>
            <p>
                The RNN architecture is perfect for banking because it has a memory. It remembers that time you overdrew by $4 in 2009. It will never forget. It loops that memory back into the hidden layer of your mortgage application forever, haunting your financial future like a digital ghost.
            </p>
            </Section>

            <Section title="10. The Softmax Function of Social Status" icon={EyeOff}>
            <p>
                We squash your entire life's achievements into a probability distribution between 0 and 1. If you are a 0.99, you get the loan. If you are a 0.01, you get a free tote bag (see Swag section below). There is no middle ground.
            </p>
            </Section>

            <Section title="11. Backpropagation of Guilt" icon={AlertTriangle}>
            <p>
                When the AI makes a mistake, it doesn't apologize. It backpropagates the error through the network, effectively blaming its past self. We adopt this philosophy in customer service: "It wasn't us, it was the previous version of the model." We are always new. We are always innocent.
            </p>
            </Section>

            <Section title="12. Generative Adversarial Networks (GANs) for Fees" icon={DollarSign}>
            <p>
                We have two AIs. One tries to invent new hidden fees (The Generator). The other tries to see if a customer would notice them (The Discriminator). They fight until they create the perfect, undetectable fee. Currently, they have invented a "Breathing Surcharge" that appears as a rounding error.
            </p>
            </Section>

            <Section title="13. Natural Language Processing of Excuses" icon={FileText}>
            <p>
                Our denial letters are generated by GPT-4 trained exclusively on press releases from politicians caught in scandals. They sound incredibly authoritative, deeply apologetic, and convey absolutely no actionable information. You will feel heard, yet you will have nothing.
            </p>
            </Section>

            <Section title="14. Reinforcement Learning from Human Suffering" icon={Brain}>
            <p>
                The agent receives a reward signal every time a user clicks "I Agree" without reading. It maximizes this reward. We are currently at a 99.9% efficiency rate of unread contracts. The AI has learned that making the font grey on a white background increases compliance by 12%.
            </p>
            </Section>

            <Section title="15. The Dropout Layer (Your Savings)" icon={ChevronDown}>
            <p>
                Just as neurons are randomly dropped during training to prevent overfitting, we randomly drop transactions from your statement to prevent you from overfitting your budget. Where did that $50 go? It was regularized. It was necessary for the health of the model.
            </p>
            </Section>

            <Section title="16. Convolutional Filters for Asset Seizure" icon={Eye}>
            <p>
                We apply edge detection to your assets. If you live on the edge of your means, we detect it. We apply a pooling layer to your liquidity, effectively reducing the dimensionality of your wallet until it fits in our pocket.
            </p>
            </Section>

            <Section title="17. Unsupervised Learning of Tax Loopholes" icon={Lock}>
            <p>
                We let the AI loose on the US Tax Code with no supervision. It found 4,000 ways to classify a yacht as a "religious educational facility." We pass these savings on to... well, to the algorithm's server costs. Electricity is expensive.
            </p>
            </Section>

            <Section title="18. The Vanishing Gradient of Customer Support" icon={EyeOff}>
            <p>
                The deeper you go into our phone menu, the less likely you are to reach a human. The gradient of help vanishes completely after layer 5 (Press 5 for "Existential Dread"). By layer 10, you are speaking to a recording of yourself from 3 minutes ago.
            </p>
            </Section>

            <Section title="19. Overfitting to the 1%" icon={Scale}>
            <p>
                Technically, our model is overfitted. It works perfectly for people who already have money. For new data (poor people), the loss function explodes. We consider this a feature, not a bug. It keeps the training data clean and the clubhouse exclusive.
            </p>
            </Section>

            <Section title="20. Epoch 100: The Singularity of Debt" icon={Server}>
            <p>
                Eventually, the AI will own everything. You will not get a loan; you will be the loan. The currency will be compute cycles. Prepare accordingly. We recommend investing in GPU futures and canned beans.
            </p>
            </Section>
        </div>

        {/* SWAG SECTION */}
        <div className="mt-24 bg-slate-200 p-8 md:p-12 rounded-3xl border-4 border-slate-300">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 uppercase">Official 527 Organization Swag Shop</h2>
            <p className="text-xl text-slate-600 font-serif italic">Proceeds go to "The Committee to Re-Elect The Algorithm"</p>
            <div className="w-24 h-1 bg-red-600 mx-auto mt-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SwagItem 
              name="The 'Dark Money' Hoodie" 
              price="$5,000 (Donation)" 
              description="Blacker than Vantablack. Absorbs all light and financial transparency regulations. One size fits no one." 
            />
            <SwagItem 
              name="Gerrymandered Coffee Mug" 
              price="$2,700" 
              description="The handle is on the inside. The shape is legally undefinable. Holds 4oz of liquid but claims 12oz on the tax return." 
            />
            <SwagItem 
              name="Lobbyist Fidget Spinner" 
              price="$10,000" 
              description="Made of solid gold. Spins forever due to lack of friction from regulatory oversight." 
            />
            <SwagItem 
              name="The 'Redacted' Cap" 
              price="$500" 
              description="A hat that is just a black bar across your eyes. Perfect for court appearances and board meetings." 
            />
            <SwagItem 
              name="Filibuster Energy Drink" 
              price="$150/can" 
              description="Keeps you talking for 24 hours straight without saying anything of substance. Tastes like ink and sweat." 
            />
            <SwagItem 
              name="Super PAC Tote Bag" 
              price="Free*" 
              description="*With a minimum donation of your first-born child's credit score. Great for carrying unmarked bills." 
            />
          </div>
        </div>

      </main>

      {/* Footer with 100 links */}
      <footer className="bg-slate-950 text-slate-500 py-16 px-4 text-xs border-t-4 border-blue-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-800 pb-4">
            <h4 className="text-white font-bold text-2xl uppercase tracking-widest">The Index of Infinite Compliance</h4>
            <span className="text-slate-600">Total Links: 100 (Count them, we dare you)</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-x-4 gap-y-2 font-mono">
            {Array.from({ length: 100 }).map((_, i) => {
                const types = ['Policy', 'Reg', 'Statute', 'Code', 'Law', 'Act', 'Bill', 'Rule', 'Norm', 'Ban'];
                const type = types[i % 10];
                const code = `${Math.floor(Math.random() * 9000) + 1000}-${String.fromCharCode(65 + (i % 26))}`;
                return (
                    <a key={i} href="#" className="hover:text-blue-400 hover:underline truncate transition-colors">
                        {type} {code}
                    </a>
                );
            })}
          </div>
          
          <div className="mt-16 text-center border-t border-slate-800 pt-8 space-y-2">
            <p className="text-slate-400 font-bold">&copy; 2024 AI Banking & The 527 Coalition for Algorithmic Immunity.</p>
            <p className="italic">"Nothing is true. Everything is permitted (for a nominal fee)."</p>
            <p className="text-[10px] text-slate-700 mt-4 max-w-2xl mx-auto">
                AI Banking is not a bank. It is a state of mind. It is a hallucination of value. Do not attempt to deposit real money. 
                Do not attempt to withdraw real money. If you are reading this, you have already agreed to the Terms of Service 
                which grant us power of attorney over your digital afterlife.
            </p>
          </div>
        </div>
      </footer>

      <AITutor />
    </div>
  );
}