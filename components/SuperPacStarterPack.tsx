import React, { useState } from 'react';
import Head from 'next/head';
import { Layout } from '../../components/Layout'; // Assuming a Layout component exists for nav/footer

const SuperPacStarterPack: React.FC = () => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3000);
  };

  return (
    <Layout>
      <Head>
        <title>The 'Citizen's Voice' Super PAC Starter Pack | AI Banking Swag</title>
        <meta name="description" content="The essential toolkit for the modern political influencer. Democracy is a contact sport, and this is your equipment." />
      </Head>

      <main className="container mx-auto px-4 py-12 bg-gray-50">
        <article className="bg-white shadow-2xl rounded-lg p-8 md:p-12">

          {/* Header 1: Product Introduction */}
          <section className="mb-12 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tighter">
              The 'Citizen's Voice' Super PAC Starter Pack
            </h1>
            <p className="text-xl text-gray-600 italic">
              "Because your opinion is worth more when it's backed by... resources."
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="product-gallery">
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center mb-4 shadow-inner">
                <span className="text-gray-500 text-2xl">Image of a Stamp, Shredder, and Blindfold Artfully Arranged</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center"><span className="text-xs text-gray-500">Stamp (Close-up)</span></div>
                <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center"><span className="text-xs text-gray-500">Shredder (In Action)</span></div>
                <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center"><span className="text-xs text-gray-500">Blindfold (On a Mannequin)</span></div>
              </div>
            </div>

            {/* Product Purchase Details */}
            <div className="product-details">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Your First Step into a Larger World</h2>
              <p className="text-gray-700 mb-6">
                Tired of simply voting? Ready to upgrade your civic engagement from 'participant' to 'primary stakeholder'? This meticulously curated kit provides the three fundamental tools for navigating the thrilling, high-stakes world of modern political influence.
              </p>
              <div className="price-tag bg-blue-100 border-l-4 border-blue-500 p-4 rounded-md mb-6">
                <span className="text-4xl font-bold text-blue-900">$527,000.00</span>
                <span className="text-sm text-blue-700 block">(AI-Optimized financing available. Inquire within your offshore shell corporation.)</span>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <label htmlFor="quantity" className="font-bold text-gray-800">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                  className="w-20 p-2 border border-gray-300 rounded-md text-center"
                />
              </div>
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 px-6 text-xl font-bold text-white rounded-lg shadow-lg transition-all duration-300 ${isAdded ? 'bg-green-600' : 'bg-red-700 hover:bg-red-800'}`}
              >
                {isAdded ? '✓ Influence Acquired!' : 'Acquire Influence'}
              </button>
            </div>
          </div>

          <div className="mt-16 border-t pt-12">
            {/* Header 2: The 'Approved' Rubber Stamp: A Deep Dive */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H2: The 'Approved' Rubber Stamp: A Deep Dive</h2>
              <h3 className="text-xl font-semibold text-gray-800 mt-4">Ergonomic Design for Maximum Stamping Endurance</h3>
              <p className="text-gray-600 mt-2">Crafted from sustainably sourced mahogany (from a forest that was definitely there yesterday), the handle is designed for marathon sessions of approving invoices, policy drafts, and zoning variances.</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-4">Proprietary Ink Formula: Legally Gray™</h3>
              <p className="text-gray-600 mt-2">Our patented, self-inking cartridge uses a special soy-based compound that appears bold and decisive on paper, but fades just enough under legal scrutiny to provide plausible deniability.</p>
            </section>

            {/* Header 3: The 'Redaction' Shredder: Your Personal Information Firewall */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H3: The 'Redaction' Shredder: Your Personal Information Firewall</h2>
              <h3 className="text-xl font-semibold text-gray-800 mt-4">P-7 Security Level Micro-Cut Technology</h3>
              <p className="text-gray-600 mt-2">Turns donor lists, inconvenient research, and heartfelt letters from constituents into a fine, un-reconstructible powder. Exceeds all known standards for "making things go away."</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-4">Whisper-Quiet Operation</h3>
              <p className="text-gray-600 mt-2">At a mere 40dB, you can redact your paper trail at 3 AM without waking your ethics oversight committee (assuming you have one).</p>
            </section>

            {/* Header 4: The 'Willful Ignorance' Silk Blindfold: See No Evil, Fund No Evil */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H4: The 'Willful Ignorance' Silk Blindfold: See No Evil</h2>
              <h3 className="text-xl font-semibold text-gray-800 mt-4">100% Mulberry Silk Construction</h3>
              <p className="text-gray-600 mt-2">So comfortable, you'll forget you're actively choosing not to see the consequences of your campaign contributions. Hypoallergenic and breathable for all-day wear during sensitive meetings.</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-4">One Size Fits All Egos</h3>
              <p className="text-gray-600 mt-2">The adjustable strap ensures a snug, comfortable fit, effectively blocking out any distracting visual information, like pie charts on income inequality or images of endangered species.</p>
            </section>

            {/* Header 5: Advanced Political Strategy & Synergy */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H5: Advanced Political Strategy & Synergy</h2>
              <h3 className="text-xl font-semibold text-gray-800 mt-4">The Stamp-Shred-Blindfold Trinity</h3>
              <p className="text-gray-600 mt-2">Learn the workflow: Blindly STAMP a proposal, SHRED the evidence, and put the BLINDFOLD back on before anyone asks questions. It's the circle of political life.</p>
            </section>

            {/* Header 6: Technical Specifications */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H6: Technical Specifications</h2>
              <ul className="list-disc list-inside text-gray-600">
                <li><strong>Stamp:</strong> 3" x 1.5" impression area. Good for 50,000 'Approved' stamps.</li>
                <li><strong>Shredder:</strong> 12-sheet capacity. Runs on pure, uncut ambition (and a standard 120V outlet).</li>
                <li><strong>Blindfold:</strong> 22-momme silk. Blocks 99.9% of visible light and 100% of accountability.</li>
              </ul>
            </section>

            {/* Header 7: Frequently Asked Questions (That We Wrote Ourselves) */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H7: Frequently Asked Questions</h2>
              <h4 className="font-semibold text-gray-800 mt-4">Is this legal?</h4>
              <p className="text-gray-600 mt-1">That's a fantastic question for your legal team! This kit contains tools, and like any tool, their application determines their legality. We are not a law firm.</p>
              <h4 className="font-semibold text-gray-800 mt-4">What's the return policy?</h4>
              <p className="text-gray-600 mt-1">All sales are final. Much like your political decisions.</p>
            </section>

            {/* Header 8: Customer Testimonials (Probably Fabricated) */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H8: Customer Testimonials</h2>
              <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700">
                <p>"I went from yelling at the TV to funding the people on the TV! The shredder is my favorite. So cathartic."</p>
                <cite className="block text-right not-italic mt-2">- A 'Concerned Citizen' from a state with favorable tax laws</cite>
              </blockquote>
            </section>

            {/* Header 9: The Unboxing Experience */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H9: The Unboxing Experience</h2>
              <p className="text-gray-600">Your kit arrives in a discreet, unmarked box, nestled in foam the color of money. The only documentation is a single card with the word "Congratulations" printed in gold foil.</p>
            </section>

            {/* Header 10: Our Commitment to... Something */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H10: Our Commitment to... Something</h2>
              <p className="text-gray-600">We are deeply committed to empowering individuals to participate in the democratic process in the most efficient, impactful way possible. Our commitment is to that efficiency.</p>
            </section>

            {/* Header 11: The Philosophy Behind the Product */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H11: The Philosophy Behind the Product</h2>
              <p className="text-gray-600">Speech is free. Effective speech has operating costs. This kit is designed to lower them.</p>
            </section>

            {/* Header 12: A Historical Context of Political Influence */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H12: A Historical Context of Political Influence</h2>
              <p className="text-gray-600">From Roman senators to Renaissance patrons, the powerful have always used tools to shape their world. These are simply the modern equivalents. More paper, less poison.</p>
            </section>

            {/* Header 13: How It Integrates with AI Banking */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H13: How It Integrates with AI Banking</h2>
              <p className="text-gray-600">Our Sovereign Confidence AI Tutor can analyze market trends and pending legislation to suggest optimal times for shredding documents, while our banking platform can seamlessly facilitate the anonymous wire transfers needed to make the 'Approved' stamp meaningful.</p>
            </section>

            {/* Header 14: The Future of Grassroots (Astroturf) Movements */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H14: The Future of Grassroots Movements</h2>
              <p className="text-gray-600">Why build from the ground up when you can build from the bank account down? This kit is the seed for your very own astroturf revolution.</p>
            </section>

            {/* Header 15: Shipping & Handling (Discreetly) */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H15: Shipping & Handling</h2>
              <p className="text-gray-600">Shipped via a third-party logistics company that doesn't ask questions. Tracking numbers are encrypted and self-destruct after delivery confirmation.</p>
            </section>

            {/* Header 16: The Fine Print (In a Very Small Font) */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H16: The Fine Print</h2>
              <p className="text-xs text-gray-500">Use of this product may result in unintended consequences, including but not limited to: senate hearings, public outcry, investigative journalism, and a sudden increase in your net worth. By purchasing, you agree to hold AI Banking Corp and its subsidiaries harmless for any and all alterations to the fabric of democracy.</p>
            </section>

            {/* Header 17: Warranty Information (Void on Purchase) */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H17: Warranty Information</h2>
              <p className="text-gray-600">This product comes with a lifetime anti-warranty. If it breaks, you bought it. If it works as intended, we've never heard of you.</p>
            </section>

            {/* Header 18: A Message From Our Founder */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H18: A Message From Our Founder</h2>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-4xl">🦅</span>
                </div>
                <p className="text-gray-700 italic">"Go forth and... administrate."</p>
              </div>
            </section>

            {/* Header 19: Accessorize Your Influence */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H19: Accessorize Your Influence</h2>
              <p className="text-gray-600">Coming soon: The 'Golden Parachute' emergency briefcase, 'Plausible Deniability' disappearing ink pens, and the 'Gerrymander' home districting puzzle game.</p>
            </section>

            {/* Header 20: Order Now: A Call to Inaction! */}
            <section className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">H20: Order Now: A Call to Action!</h2>
              <p className="text-gray-600 mb-6">Don't just sit there complaining about the system. Become the system. Click the button.</p>
              <button
                onClick={handleAddToCart}
                className={`py-4 px-12 text-2xl font-bold text-white rounded-lg shadow-lg transition-all duration-300 ${isAdded ? 'bg-green-600' : 'bg-red-700 hover:bg-red-800'}`}
              >
                {isAdded ? '✓ Done.' : 'Shape The Future'}
              </button>
            </section>
          </div>
        </article>
      </main>
    </Layout>
  );
};

export default SuperPacStarterPack;