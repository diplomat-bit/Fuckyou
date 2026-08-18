import React from 'react';
import { Helmet } from 'react-helmet-async';

const BipartisanHoodie = () => {
  return (
    <div className="container mx-auto p-8 bg-gray-50 text-gray-800 font-sans">
      <Helmet>
        <title>The Bipartisan Hoodie | AI Banking Swag for the Politically Perplexed</title>
        <meta name="description" content="Experience the exquisite discomfort of forced unity with our Bipartisan Hoodie. Half red, half blue, and 100% a metaphor for modern politics. Buy now and feel the gridlock." />
      </Helmet>

      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
          The Bipartisan Hoodie
        </h1>
        <p className="text-xl text-gray-600">A Garment of Uncomfortable Unity</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div className="flex justify-center p-4 bg-white rounded-lg shadow-xl">
          {/* A placeholder for a glorious, professionally shot image of this monstrosity */}
          <img 
            src="/images/swag/bipartisan-hoodie.png" 
            alt="A hoodie split vertically down the middle, half bright red and half deep blue, with mismatched pockets and drawstrings." 
            className="rounded-lg border-4 border-gray-300 max-w-md w-full"
          />
        </div>
        <div className="prose lg:prose-xl max-w-none">
          <p className="text-lg">
            Behold, the pinnacle of political fashion and a wearable testament to the art of getting absolutely nothing done. The Bipartisan Hoodie is meticulously designed to represent the glorious, frustrating, and utterly baffling state of modern governance. It's not just clothing; it's a conversation starter, a cry for help, and a very, very awkward piece of outerwear.
          </p>
          <p className="mt-4 text-lg font-semibold text-green-700">
            Available for a "donation" of $52.70. Coincidence? We think not.
          </p>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="text-4xl font-bold text-center mb-10 border-b-4 border-gray-300 pb-4">
          The Ten Pillars of Sartorial Stalemate
        </h2>
        
        <div className="space-y-12">
          {/* Header 1 */}
          <div>
            <h3 className="text-2xl font-semibold text-red-700">1. The Seam of Division</h3>
            <p className="mt-2 text-lg">
              Right down the middle, a stark, over-stitched seam separates the passionate red from the resolute blue. This isn't a gentle blend; it's a hard border. It's intentionally sewn with a slightly abrasive thread, so you're always aware of the division running right through your core. It’s the legislative aisle you can wear.
            </p>
          </div>

          {/* Header 2 */}
          <div>
            <h3 className="text-2xl font-semibold text-blue-700">2. Asymmetrical Pockets of Progress</h3>
            <p className="mt-2 text-lg">
              Notice how the red pocket is a deep, secure pouch while the blue one is a shallow, oddly-angled slit? Or is it the other way around this election cycle? We can't remember. The point is, they're unequal. One side can hold your keys, wallet, and dreams; the other can barely contain your disappointment.
            </p>
          </div>

          {/* Header 3 */}
          <div>
            <h3 className="text-2xl font-semibold text-purple-800">3. The Zipper of Compromise (It Always Jams)</h3>
            <p className="mt-2 text-lg">
              Crafted from a proprietary alloy of stubbornness and procedural obstruction, our "Filibuster-Proof" zipper is guaranteed to get stuck exactly halfway. It will neither fully open to new ideas nor fully close for consensus. You'll spend hours jiggling it, only to give up and wear the hoodie uncomfortably half-open.
            </p>
          </div>

          {/* Header 4 */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-700">4. Two-Tone Drawstrings of Dueling Ideologies</h3>
            <p className="mt-2 text-lg">
              One red, one blue. Pull one, and the other gets shorter. Try to even them out, and you'll spend an eternity in a futile quest for perfect balance, only to end up with one drawstring lost inside the hood entirely. A perfect metaphor for fiscal policy debates.
            </p>
          </div>

          {/* Header 5 */}
          <div>
            <h3 className="text-2xl font-semibold text-red-700">5. A Fabric of Contradiction</h3>
            <p className="mt-2 text-lg">
              The red side is 100% ethically questionable, ultra-itchy wool, representing a rigid adherence to uncomfortable traditions. The blue side is a slick, non-breathable synthetic polyester that feels modern but makes you sweat profusely under the slightest pressure. Comfort is not on the agenda.
            </p>
          </div>

          {/* Header 6 */}
          <div>
            <h3 className="text-2xl font-semibold text-blue-700">6. The Unyielding Hood of Echo Chambers</h3>
            <p className="mt-2 text-lg">
              The hood has been specifically engineered to be just a little too tight around the ears. It muffles ambient sound, making it difficult to hear dissenting opinions or, for that matter, oncoming traffic. All you can hear is the sound of your own strained breathing, which you can easily mistake for applause.
            </p>
          </div>

          {/* Header 7 */}
          <div>
            <h3 className="text-2xl font-semibold text-purple-800">7. Colorfastness Not Guaranteed (Just Like Promises)</h3>
            <p className="mt-2 text-lg">
              Wash with care, or don't. The first time it hits water, the red and blue will bleed into a murky, indeterminate shade of purple-brown. It will look vaguely unified, but mostly just messy and disappointing. A poignant symbol of what happens when ideologies are laundered together.
            </p>
          </div>

          {/* Header 8 */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-700">8. One Size Fits... No One Perfectly</h3>
            <p className="mt-2 text-lg">
              In the spirit of broad, ineffective policy, this hoodie comes in a single size: "Legislative Average." It's too long in the arms for some, too tight in the chest for others, and universally unflattering. It’s a fit that pleases no one but alienates everyone equally.
            </p>
          </div>

          {/* Header 9 */}
          <div>
            <h3 className="text-2xl font-semibold text-red-700">9. The Ethical Sourcing Quagmire</h3>
            <p className="mt-2 text-lg">
              The cotton was grown with unregulated pesticides, the wool was sourced from aggressive sheep, and the final product was assembled in a factory whose labor practices are the subject of a heated, ongoing international debate. Your purchase supports... well, it's complicated.
            </p>
          </div>

          {/* Header 10 */}
          <div>
            <h3 className="text-2xl font-semibold text-blue-700">10. Washing Instructions: A Supermajority is Required</h3>
            <p className="mt-2 text-lg">
              The care tag is written in a combination of legalese, ancient Aramaic, and binary code. To properly care for your hoodie, you must first form a committee, ratify three amendments to the laundry process, and secure a two-thirds majority vote on the appropriate water temperature. Or just let it get ruined. Most people choose the latter.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BipartisanHoodie;