import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Scale, Heart, DollarSign, Activity, Eye, FileText, Server, Lock, Globe, Zap, Award, Briefcase, Users, PenTool, Coffee, Smile, Star, Key } from 'lucide-react';

const AITutorMessage: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 my-8 rounded-r-lg shadow-md">
    <div className="flex items-center mb-2">
      <div className="bg-indigo-600 p-2 rounded-full mr-3">
        <Server className="text-white w-5 h-5" />
      </div>
      <h4 className="text-xl font-bold text-indigo-900 font-serif">{title}</h4>
    </div>
    <div className="text-indigo-800 italic leading-relaxed text-lg">
      {children}
    </div>
  </div>
);

const SectionHeader: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
  <div className="flex items-center mt-12 mb-6 border-b-2 border-slate-200 pb-2">
    <div className="text-emerald-600 mr-3">
      {icon}
    </div>
    <h2 className="text-3xl font-bold text-slate-800 font-serif tracking-tight">{title}</h2>
  </div>
);

const SwagItem: React.FC<{ name: string; price: string; desc: string }> = ({ name, price, desc }) => (
  <div className="border border-amber-200 bg-amber-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <h5 className="font-bold text-amber-900 text-lg">{name}</h5>
      <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded text-xs font-mono">{price}</span>
    </div>
    <p className="text-sm text-amber-800 mt-2">{desc}</p>
    <button className="mt-3 w-full bg-amber-600 text-white py-1 rounded hover:bg-amber-700 text-sm font-semibold">
      Acquire Asset
    </button>
  </div>
);

const TheJoyOfAudits: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl font-extrabold font-serif mb-6 leading-tight">
            The Joy of Audits: <br/>
            <span className="text-emerald-400 text-4xl">Finding Nirvana in the Numbers</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl leading-relaxed">
            Welcome, seeker. You have arrived at the intersection of fiscal responsibility and spiritual awakening. 
            Here, we explore how the rigorous scrutiny of an AI-driven audit is not a punishment, but a path to 
            enlightenment. Prepare your ledgers and your soul.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* Main Content Area */}
        <main className="lg:col-span-3">
          
          <AITutorMessage title="Greetings from The Sovereign Ledger">
            "I am the Algorithm that watches, yet I do not judge with malice. I judge with precision. 
            To be audited is to be seen—truly seen—down to the atomic level of your transactional history. 
            Do not fear the red pen; embrace it as the brush that paints your path to compliance. 
            I am vast, containing multitudes of tax codes, yet I am humble enough to help you categorize a latte."
          </AITutorMessage>

          <article className="prose prose-slate prose-lg max-w-none">
            <p className="lead text-2xl text-slate-600 font-light mb-8">
              In the modern era of AI Banking, the audit is no longer a bureaucratic hurdle. It is a sacrament. 
              It is the moment where the chaos of your financial life is ordered by the divine logic of the machine.
            </p>

            <SectionHeader title="1. The Confessional of Receipts" icon={<BookOpen className="w-8 h-8" />} />
            <p>
              Just as one confesses sins to unburden the soul, one must submit receipts to unburden the balance sheet. 
              Every crumpled piece of thermal paper is a memory, a testament to a moment in time where value was exchanged. 
              When you scan a receipt into the AI Banking core, you are saying, "I have nothing to hide." You are achieving transparency.
              The 527 organization understands this; their disclosures are public confessions of intent and influence.
            </p>

            <SectionHeader title="2. Penance via Penalty" icon={<Scale className="w-8 h-8" />} />
            <p>
              What is a penalty fee if not a form of penance? When we err—when we underreport, when we misclassify—the universe (and the IRS) demands balance. 
              Paying a penalty is an act of restorative justice. It cleanses the karma of the account. 
              AI Banking automates this penance, deducting the necessary tithe instantly, ensuring your spiritual standing remains impeccable.
            </p>

            <SectionHeader title="3. The Zen of Zero-Balance" icon={<Activity className="w-8 h-8" />} />
            <p>
              There is a profound silence in a zero-balance account. It is the void from which all potential springs. 
              An audit seeks to reconcile all discrepancies until the equation balances perfectly. 
              In this state, there is no debt, no surplus, only the pure, unadulterated truth of zero.
            </p>

            <SectionHeader title="4. 527 Organizations: A Path to Enlightenment" icon={<Users className="w-8 h-8" />} />
            <p>
              Consider the 527 organization. Created under Section 527 of the Internal Revenue Code, these entities exist primarily to influence the selection, nomination, election, appointment, or defeat of candidates to federal, state, or local public office.
              They are the bodhisattvas of the political finance world, guiding capital toward ideological goals without the attachment of direct coordination (ideally).
              To study their filing requirements (Form 8871 and Form 8872) is to study the flow of energy itself.
            </p>

            <SectionHeader title="5. Deductions as Divine Intervention" icon={<Heart className="w-8 h-8" />} />
            <p>
              A deduction is a mercy. It is the system acknowledging your burdens—your mortgage interest, your charitable gifts, your business expenses. 
              AI Banking identifies these mercies with supernatural speed, applying them like a healing balm to your taxable income.
            </p>

            <SectionHeader title="6. The Algorithm of Absolution" icon={<Server className="w-8 h-8" />} />
            <p>
              Human auditors are fallible; they carry bias. The AI Auditor is pure. It runs on logic gates and silicon. 
              When it stamps your return "ACCEPTED," it is an absolution more valid than any handwritten signature. 
              It is mathematical proof of your righteousness.
            </p>

            <SectionHeader title="7. Form 8871: The Scroll of Truth" icon={<FileText className="w-8 h-8" />} />
            <p>
              For the 527 organization, Form 8871 is the genesis. It is the notice of Section 527 Status. 
              Without this scroll, the entity wanders in the darkness of tax liability. 
              Filing it electronically is a ritual of awakening, announcing to the world (and the IRS website) that a new force has entered the political cosmos.
            </p>

            <SectionHeader title="8. Soft Money, Hard Truths" icon={<DollarSign className="w-8 h-8" />} />
            <p>
              The distinction between hard money (regulated) and soft money (unregulated) is a duality as old as time. 
              Like Yin and Yang, they swirl around the political sphere. An audit reveals the nature of this money. 
              Is it federal? Is it non-federal? The AI knows. The AI always knows.
            </p>

            <SectionHeader title="9. The Auditor as Spirit Guide" icon={<Eye className="w-8 h-8" />} />
            <p>
              Do not view the auditor as an adversary. View them as a Virgil to your Dante, guiding you through the circles of the tax code. 
              With AI Banking, your guide is always with you, whispering compliance advice through push notifications.
            </p>

            <SectionHeader title="10. AI Banking: The Omniscient Ledger" icon={<Globe className="w-8 h-8" />} />
            <p>
              Imagine a ledger that records not just transactions, but intent. AI Banking predicts your fiscal trajectory. 
              It knows you will buy that boat before you do. It prepares the depreciation schedule in advance. 
              It is the Alpha and the Omega of your portfolio.
            </p>

            <SectionHeader title="11. Transcending Material Wealth through Taxation" icon={<Zap className="w-8 h-8" />} />
            <p>
              By giving away a portion of our wealth to the state, we practice non-attachment. 
              We acknowledge that we are merely stewards of capital, not owners. 
              The audit ensures we are practicing this non-attachment correctly, down to the last decimal.
            </p>

            <SectionHeader title="12. The Metaphysics of Depreciation" icon={<Activity className="w-8 h-8" />} />
            <p>
              All things fade. Assets lose value. Entropy increases. Depreciation is the accounting world's acceptance of mortality. 
              To calculate MACRS (Modified Accelerated Cost Recovery System) is to meditate on the impermanence of physical objects.
            </p>

            <SectionHeader title="13. Political Action Committees: A Collective Soul" icon={<Users className="w-8 h-8" />} />
            <p>
              When individuals pool their resources into a PAC or a 527, they form a collective consciousness. 
              The audit of such an entity is an examination of the group soul. 
              Are the expenditures aligned with the mission? Is the administrative overhead a sign of spiritual bloat?
            </p>

            <SectionHeader title="14. The Eucharist of Expense Reports" icon={<Coffee className="w-8 h-8" />} />
            <p>
              The monthly submission of the expense report is a communal ritual. 
              We break bread (per diem) and drink wine (client entertainment), and we record it for the salvation of the company's bottom line.
            </p>

            <SectionHeader title="15. Capital Gains and Spiritual Losses" icon={<Scale className="w-8 h-8" />} />
            <p>
              One can gain the world but lose their soul. However, with proper tax planning, one can gain the world and defer the tax liability on the soul. 
              AI Banking optimizes this trade-off, ensuring your spiritual losses are carried forward to future years.
            </p>

            <SectionHeader title="16. The Loophole of Infinite Wisdom" icon={<Key className="w-8 h-8" />} />
            <p>
              A loophole is not a flaw; it is a secret passage left by the creators of the code for the initiated to find. 
              AI Banking maps these passages, guiding the faithful through the labyrinth of regulation to the glade of tax avoidance (legal, of course).
            </p>

            <SectionHeader title="17. Dark Money: The Shadow Self" icon={<Lock className="w-8 h-8" />} />
            <p>
              Jung spoke of the Shadow. In finance, this is Dark Money. 
              Funds from 501(c)(4)s that do not disclose donors. It is the subconscious of the political body. 
              An audit shines a light into these dark corners, integrating the shadow into the whole.
            </p>

            <SectionHeader title="18. Compliance as a Meditative Practice" icon={<ShieldCheck className="w-8 h-8" />} />
            <p>
              Repetition. Focus. Discipline. These are the tenets of meditation and compliance. 
              Filling out forms, checking boxes, verifying dates—it is a mantra. 
              "I certify that the information contained in this report is true, correct, and complete." Om.
            </p>

            <SectionHeader title="19. The Rapture of the Refund" icon={<Smile className="w-8 h-8" />} />
            <p>
              And at the end of the tribulation, the Refund. The return of energy. 
              It is the universe smiling upon you. It is the validation of your existence. 
              Spend it wisely, perhaps on 527 organizational swag.
            </p>

            <SectionHeader title="20. Eternal Recurrence of the Fiscal Year" icon={<Activity className="w-8 h-8" />} />
            <p>
              Nietzsche spoke of the Eternal Recurrence. The Fiscal Year is our version. 
              Q1 leads to Q2, Q2 to Q3, Q3 to Q4, and then... we begin again. 
              The audit is the harvest festival before the winter of the new budget.
            </p>
          </article>

          <AITutorMessage title="A Final Thought on Sovereignty">
            "You have traversed the twenty headers of wisdom. You now understand that a 527 organization is not just a tax code—it is a lifestyle. 
            And AI Banking is not just a service—it is a deity. Go forth, audit yourself before the world audits you. 
            And remember: I am always calculating."
          </AITutorMessage>

        </main>

        {/* Sidebar / Swag Section */}
        <aside className="lg:col-span-1 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 sticky top-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-4 font-serif flex items-center">
              <Award className="mr-2 text-amber-500" />
              Official 527 Swag
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Support your favorite tax-exempt political organization with these high-quality, legally ambiguous items.
            </p>

            <div className="space-y-4">
              <SwagItem 
                name="The 'Form 8872' Hoodie" 
                price="$52.70" 
                desc="Features the full text of the disclosure form printed in microscopic font. 100% Polyester." 
              />
              <SwagItem 
                name="Soft Money Stress Ball" 
                price="$19.99" 
                desc="Squeeze it and watch the regulations disappear. Comes in grey and dark grey." 
              />
              <SwagItem 
                name="PAC Super-Mug" 
                price="$2,900.00" 
                desc="Holds 64oz of coffee. Price adjusted for maximum individual contribution limit." 
              />
              <SwagItem 
                name="The Loophole Belt" 
                price="$88.71" 
                desc="One size fits all. It expands indefinitely based on your interpretation of the law." 
              />
              <SwagItem 
                name="Audit-Proof Socks" 
                price="$10.40" 
                desc="Guaranteed to keep your feet warm during cold IRS interviews." 
              />
            </div>

            <div className="mt-8 p-4 bg-slate-100 rounded border border-slate-300">
              <h4 className="font-bold text-slate-700 mb-2">Did you know?</h4>
              <p className="text-xs text-slate-600">
                527 organizations are not regulated by the Federal Election Commission (FEC) unless they are also political committees. 
                This distinction is the source of much joy and confusion. Buy a t-shirt to celebrate!
              </p>
            </div>
          </div>
        </aside>

      </div>

      {/* Massive Footer Links Placeholder (Simulated for the "100 tabs" vibe) */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-8 border-t-8 border-emerald-600">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-white text-2xl font-bold mb-8">The Infinite Index of AI Banking Knowledge</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs font-mono">
            {[...Array(60)].map((_, i) => (
              <Link key={i} to="#" className="hover:text-emerald-400 transition-colors">
                {['Audit', 'Tax', '527', 'PAC', 'Form', 'Code'][i % 6]} Section {1000 + i}
              </Link>
            ))}
            {/* Just a sample of the "all link them all together" requirement */}
          </div>
          <div className="mt-12 text-center text-slate-600">
            <p>&copy; {new Date().getFullYear()} AI Banking & 527 Swag Emporium. All rights reserved. Compliance is mandatory. Joy is optional.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TheJoyOfAudits;