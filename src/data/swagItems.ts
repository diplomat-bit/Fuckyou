export interface SwagItem {
  id: number;
  name: string;
  category: 'Apparel' | 'Office & Campaign' | 'Home & Decor' | 'Novelty & Gifts';
  description: string;
  price: number; // in Civic Credits
  image: string;
  regulatoryWarning: string;
}

export const swagItems: SwagItem[] = [
  {
    id: 1,
    name: "The Gerrymanderer's Jigsaw Puzzle",
    category: 'Novelty & Gifts',
    description: "Experience the art of electoral cartography! This 1000-piece puzzle features a map of our nation's most creatively drawn congressional district. The pieces are non-contiguous, defy all logic, and may require a supermajority to fit together. Perfect for family game night or demonstrating the beauty of representative democracy to your children.",
    price: 250,
    image: "/swag-images/gerrymander-puzzle.png",
    regulatoryWarning: "Warning: Completion of this puzzle does not grant you the authority to redraw actual electoral maps. Any resemblance to existing districts is purely... intentional. May cause feelings of disenfranchisement. Not suitable for voters under 3."
  },
  {
    id: 2,
    name: "The Filibuster-Proof XL Coffee Mug",
    category: 'Home & Decor',
    description: "Hold the floor and your caffeine with our 64-ounce 'Filibuster-Proof' mug. Engineered to outlast any cloture vote, this ceramic behemoth ensures you can speak continuously for hours on topics vaguely related to the bill at hand. Comes with a complimentary copy of 'Green Eggs and Ham'.",
    price: 450,
    image: "/swag-images/filibuster-mug.png",
    regulatoryWarning: "Disclaimer: This organization is not responsible for any legislation passed or blocked while user is under the influence of 64 ounces of coffee. Please consult Senate Parliamentarian before using on the chamber floor. May cause bladder-related points of order."
  },
  {
    id: 3,
    name: "The Lobbyist's 'Persuasion' Planner",
    category: 'Office & Campaign',
    description: "It's not what you know, it's who you know... and what their favorite steakhouse is. This elegantly bound planner helps you track key legislative contacts, their voting records, their children's birthdays, and their positions on obscure agricultural subsidies. Gold-leaf pages and a built-in expense report tracker.",
    price: 1200,
    image: "/swag-images/lobbyist-book.png",
    regulatoryWarning: "For informational and organizational purposes only. Using this planner to coordinate quid pro quo arrangements is strongly discouraged by our legal team (wink). All entries are subject to potential discovery under the Freedom of Information Act."
  },
  {
    id: 4,
    name: "'Pork Barrel' Aromatherapy Candle",
    category: 'Home & Decor',
    description: "Fill your home or office with the sweet smell of federal funding! This hand-poured soy candle features a complex bouquet of crispy bacon, freshly minted currency, and a hint of backroom deal cigar smoke. Perfect for creating a cozy, legislatively productive atmosphere.",
    price: 300,
    image: "/swag-images/pork-candle.png",
    regulatoryWarning: "Scent is a proprietary blend and does not contain actual US currency. Burning this candle does not guarantee funding for a bridge to nowhere in your district. Keep away from flammable appropriations bills."
  },
  {
    id: 5,
    name: "The Bipartisan Handshake Buzzer",
    category: 'Novelty & Gifts',
    description: "Show your commitment to reaching across the aisle with a shocking display of unity! This classic prank buzzer fits discreetly in your palm, delivering a gentle, non-partisan jolt of electricity. A hilarious icebreaker for tense negotiations or cable news roundtables.",
    price: 150,
    image: "/swag-images/handshake-buzzer.png",
    regulatoryWarning: "Use only with willing participants from opposing political parties. This organization is not liable for any breakdown in civil discourse, retaliatory filibusters, or declarations of political war resulting from use. Battery not included, much like consensus."
  },
  {
    id: 6,
    name: "'I'm With The PAC' T-Shirt",
    category: 'Apparel',
    description: "Are you a person of influence? Or do you just really, really love political action committees? This shirt lets everyone know where your allegiances lie. Made from 100% soft-spun cotton, it's as comfortable as a well-funded campaign. Arrow points conveniently to your wallet.",
    price: 200,
    image: "/swag-images/pac-shirt.png",
    regulatoryWarning: "Wearing this shirt does not constitute an official endorsement or a coordinated expenditure. Please maintain a distance of at least 50 feet from any candidate to avoid campaign finance violations. All proceeds are considered independent expenditures."
  },
  {
    id: 7,
    name: "Grassroots Astroturf Desk Square",
    category: 'Office & Campaign',
    description: "Can't find any actual grassroots support? Create your own! This handsome 12x12 inch square of high-quality artificial turf brings the appearance of a popular movement right to your desktop. It's the perfect backdrop for filming 'organic' social media videos.",
    price: 180,
    image: "/swag-images/astroturf-square.png",
    regulatoryWarning: "This product is synthetic. Any claims of authentic, popular support derived from this product are the sole responsibility of the user. May contain traces of corporate funding. Do not water."
  },
  {
    id: 8,
    name: "The 'Dark Money' Piggy Bank",
    category: 'Novelty & Gifts',
    description: "Teach your kids the value of untraceable political spending! This sleek, matte-black piggy bank is completely opaque and features a one-way deposit slot. There is no opening to retrieve the money, perfectly simulating the journey of anonymous donations into the political ether.",
    price: 350,
    image: "/swag-images/dark-money-bank.png",
    regulatoryWarning: "Contents are non-recoverable and non-reportable to the FEC. This organization is not responsible for explaining to your child where their allowance went. For novelty purposes only; do not use for actual money laundering."
  },
  {
    id: 9,
    name: "The 'Unredacted' Document Highlighter",
    category: 'Office & Campaign',
    description: "Tired of pesky transparency? Our patented 'Unredacted' highlighter uses permanent, opaque black ink to ensure sensitive information stays that way. Perfect for preparing documents for public release, responding to FOIA requests, or just tidying up inconvenient facts.",
    price: 120,
    image: "/swag-images/black-highlighter.png",
    regulatoryWarning: "May permanently obscure text. Please double-check which national secrets you are redacting before use. Not erasable. Using this product on a subpoenaed document may constitute obstruction of justice."
  },
  {
    id: 10,
    name: "The Swing State Weather Vane",
    category: 'Home & Decor',
    description: "Which way is the political wind blowing? Who knows! This finely crafted weather vane is scientifically designed to be indecisive. It spins wildly and unpredictably, perfectly capturing the political mood of Ohio, Florida, and Pennsylvania in late October. A must-have for any pundit's rooftop.",
    price: 750,
    image: "/swag-images/swing-vane.png",
    regulatoryWarning: "Does not provide accurate meteorological information. Do not use to make actual decisions about farm subsidies or anything else. Subject to change based on last-minute polling data."
  },
  {
    id: 11,
    name: "The Poll-Tested Platitude Generator",
    category: 'Novelty & Gifts',
    description: "Stuck in a debate? Need a soundbite that offends no one? Just shake the Poll-Tested Platitude Generator! This modified Magic 8-Ball provides 20 unique, focus-group-approved phrases like 'Working for hardworking families,' 'Common sense solutions,' and 'Building a bridge to the future.' Guaranteed 100% substance-free.",
    price: 220,
    image: "/swag-images/platitude-ball.png",
    regulatoryWarning: "Side effects may include voter apathy, loss of specific policy knowledge, and an overwhelming desire to kiss babies. Answers are not legally binding promises. This product believes in the American people."
  },
  {
    id: 12,
    name: "The Revolving Door Stopper",
    category: 'Office & Campaign',
    description: "A tribute to the seamless transition from public service to private sector lobbying! This handsome, brass-finished door stopper is shaped like a miniature revolving door. It's heavy enough to hold open the most powerful office doors, symbolizing the unimpeded flow of influence.",
    price: 500,
    image: "/swag-images/revolving-doorstop.png",
    regulatoryWarning: "Placement of this door stopper does not constitute a violation of ethics rules, but we recommend waiting the legally mandated 'cooling-off period' before deploying it at your new K Street office."
  },
  {
    id: 13,
    name: "The Gavel of Ineffectual Outrage",
    category: 'Novelty & Gifts',
    description: "Need to express strong disapproval without actually doing anything? Bang the Gavel of Ineffectual Outrage! Made of soft, pliable foam, it produces a pathetic squeak instead of an authoritative 'bang.' Perfect for chairing congressional hearings that result in strongly worded letters.",
    price: 180,
    image: "/swag-images/squeaky-gavel.png",
    regulatoryWarning: "This gavel holds no legal authority. Repeatedly squeaking it at a witness will not hold them in contempt of Congress. May attract dogs and small children who are also powerless."
  },
  {
    id: 14,
    name: "'Citizens United' Corporate Coffee Blend",
    category: 'Home & Decor',
    description: "A bold coffee blend where corporations are people and money is speech! This dark roast features a mix of beans from undisclosed origins, bundled together by a multinational conglomerate. The taste is rich, powerful, and drowns out all other flavors. Enjoy a cup of free (and unlimited) expression.",
    price: 280,
    image: "/swag-images/citizens-united-coffee.png",
    regulatoryWarning: "This coffee is a product, not a person, under current law. Consumption does not grant you personhood status or the right to unlimited political spending. May contain nuts and traces of unregulated influence."
  },
  {
    id: 15,
    name: "The Confirmation Hearing Stress Ball",
    category: 'Office & Campaign',
    description: "Facing a tough line of questioning from the Senate Judiciary Committee? Squeeze your anxieties away with our patented stress ball, shaped like a Supreme Court justice's head. Its placid, unreadable expression will remind you to remain calm and give non-committal answers about established precedent.",
    price: 160,
    image: "/swag-images/scotus-stress-ball.png",
    regulatoryWarning: "Squeezing this product does not guarantee a lifetime appointment. This organization is not responsible for any answers given while under duress. Resemblance to any specific justice, living or dead, is subject to your own interpretation of stare decisis."
  },
  {
    id: 16,
    name: "The 'Empty Promises' Campaign Jar",
    category: 'Home & Decor',
    description: "A beautiful, artisan-crafted glass jar, perfect for storing all your campaign promises. It's crystal clear, allowing for maximum transparency, and features an extra-wide mouth for easy deposits. Noticeably, it comes with no lid, symbolizing the fleeting nature of political commitments.",
    price: 320,
    image: "/swag-images/promises-jar.png",
    regulatoryWarning: "Contents of jar are not legally binding. Jar is fragile and may shatter under the weight of public expectation. This organization makes no promise, express or implied, about the functionality of this jar."
  },
  {
    id: 17,
    name: "Political Position 'Flip-Flop' Sandals",
    category: 'Apparel',
    description: "Step out in style with these versatile 'Flip-Flop' sandals. One side of the strap is red, the other is blue. A quick twist is all it takes to change your affiliation! Perfect for town halls, primary season, and adapting to shifting public opinion. The soles leave imprints of a question mark.",
    price: 250,
    image: "/swag-images/flip-flops.png",
    regulatoryWarning: "Prolonged wear may lead to accusations of being a RINO or DINO. Not recommended for walking a straight line. Consult your pollster before choosing which color to display."
  },
  {
    id: 18,
    name: "'Sound Bite' Dog Treats",
    category: 'Novelty & Gifts',
    description: "Train your furry friend to be a political pundit with 'Sound Bite' dog treats! These bite-sized, easily digestible morsels are perfect for rewarding simple, repeatable tricks. They're gone in an instant, leaving no lasting impression, just like a good cable news hit.",
    price: 150,
    image: "/swag-images/sound-bite-treats.png",
    regulatoryWarning: "For animal consumption only. Do not attempt to use as talking points in a debate. May cause your dog to develop strong, unprovable opinions about tax policy."
  },
  {
    id: 19,
    name: "The 'Omnibus Bill' Infinity Scarf",
    category: 'Apparel',
    description: "Stay warm this winter with a scarf that has everything! This ridiculously long infinity scarf is knitted from dozens of unrelated patterns and colors, representing defense spending, agricultural subsidies, and a new visitor center for a national park. It's thousands of pages... I mean, stitches... long.",
    price: 400,
    image: "/swag-images/omnibus-scarf.png",
    regulatoryWarning: "May contain hidden earmarks and provisions you don't agree with. Do not attempt to read the entire scarf before wearing. No one does. Vote 'yea' for warmth."
  },
  {
    id: 20,
    name: "'The Partisan Divide' Desk Organizer",
    category: 'Office & Campaign',
    description: "Keep your workspace perfectly polarized! This desk organizer features two distinct, non-connecting sections—one red, one blue. A deep, unbridgeable chasm runs down the middle. There is no purple section. Perfect for sorting pens by their political leanings.",
    price: 280,
    image: "/swag-images/partisan-organizer.png",
    regulatoryWarning: "Attempting to place a pen in the central chasm may result in the loss of the pen forever. This organization does not facilitate bipartisan cooperation. All items must remain on their designated side."
  },
  {
    id: 21,
    name: "The Ultrasonic 'Dog Whistle' Whistle",
    category: 'Novelty & Gifts',
    description: "Communicate a message to a specific audience without alerting the general public! This high-frequency whistle is inaudible to most, but resonates deeply with its intended demographic. Blow it during a speech to signal your true intentions to those 'in the know'.",
    price: 330,
    image: "/swag-images/dog-whistle.png",
    regulatoryWarning: "May attract actual dogs, who may or may not be part of your key voting bloc. This organization is not responsible for messages that are 'heard' by unintended audiences. Plausible deniability is the user's responsibility."
  },
  {
    id: 22,
    name: "The 'Lame Duck' Floating Bath Toy",
    category: 'Novelty & Gifts',
    description: "It's the session after the election and you have nothing to lose! This rubber ducky just floats aimlessly, unable to steer, perfectly capturing the spirit of a lame duck politician. Squeeze it to hear a sad, powerless quack. Great for midnight executive orders and controversial pardons.",
    price: 130,
    image: "/swag-images/lame-duck.png",
    regulatoryWarning: "This duck will not pass any legislation. Do not leave unattended with other bath toys, as it may attempt to appoint them to federal judgeships. Choking hazard."
  },
  {
    id: 23,
    name: "'Smear Campaign' Exfoliating Mud Mask",
    category: 'Home & Decor',
    description: "Get down and dirty in the political mud! This luxurious, all-natural mud mask is perfect for a relaxing evening of opposition research. It digs deep to expose flaws and leaves your opponent's reputation feeling raw, while your skin feels refreshed and rejuvenated.",
    price: 260,
    image: "/swag-images/mud-mask.png",
    regulatoryWarning: "For topical use only. Do not ingest. The 'mud' in this product is metaphorical and should not be used to literally sling mud at political rivals. Results (political and dermatological) may vary."
  },
  {
    id: 24,
    name: "The 'War Room' Rapid Response Whiteboard",
    category: 'Office & Campaign',
    description: "Strategize your campaign with military precision! This oversized whiteboard comes pre-printed with sections for 'Attack Ads,' 'Counter-Narratives,' 'Voter Suppression Tactics,' and 'Pizza Delivery Number.' Includes red markers for threats and blue markers for opportunities. (Note: All markers are permanent.)",
    price: 950,
    image: "/swag-images/war-room-board.png",
    regulatoryWarning: "This is not an actual military command center. Drawing attack plans on this board does not constitute a declaration of war. All strategies are subject to FEC spending limits. The pizza is not a coordinated communication."
  },
  {
    id: 25,
    name: "'The Undecided Voter' Bobblehead",
    category: 'Novelty & Gifts',
    description: "Behold, the most powerful person in politics! This bobblehead features a figure with a blank, featureless face, wearing a neutral beige outfit. Its head wobbles back and forth, perpetually weighing the options. A perfect tribute to the small-town diner patron who will decide the fate of the free world.",
    price: 210,
    image: "/swag-images/undecided-bobblehead.png",
    regulatoryWarning: "This bobblehead's final decision is not an endorsement. Do not spend millions of dollars in advertising trying to sway it. It is filled with sawdust, not deeply held convictions."
  },
  {
    id: 26,
    name: "'Rider Amendment' Sticky Notes",
    category: 'Office & Campaign',
    description: "Need to sneak your pet project into a must-pass bill? Use our 'Rider Amendment' sticky notes! These extra-sticky notes are designed to look like an innocuous part of any large document. Perfect for attaching funding for your district's teapot museum to a 2,000-page defense bill.",
    price: 110,
    image: "/swag-images/rider-notes.png",
    regulatoryWarning: "Adhesion is not guaranteed to survive committee markup. This organization is not responsible if your amendment is discovered and ridiculed on C-SPAN. Use at your own political risk."
  },
  {
    id: 27,
    name: "'The Echo Chamber' Bluetooth Speaker",
    category: 'Home & Decor',
    description: "Tired of hearing opposing viewpoints? Surround yourself with the comforting sounds of agreement with 'The Echo Chamber' speaker. Its patented technology filters out dissenting frequencies and amplifies sounds that closely match your own pre-existing beliefs. It only pairs with devices that share its worldview.",
    price: 600,
    image: "/swag-images/echo-speaker.png",
    regulatoryWarning: "May lead to a distorted view of reality and an inability to comprehend polling data. Not compatible with devices from 'the other side.' Listening to this speaker may radicalize you, or just make you feel very, very right."
  },
  {
    id: 28,
    name: "'Poison Pill' Defense Mints",
    category: 'Novelty & Gifts',
    description: "Protect your bill from hostile takeovers with these intensely sour 'Poison Pill' breath mints. The flavor is so overwhelmingly terrible that it makes any legislative proposal immediately unpalatable to the opposition. A great way to ensure your bill dies in committee, exactly as you intended.",
    price: 90,
    image: "/swag-images/poison-mints.png",
    regulatoryWarning: "Figuratively poisonous only. Not actual poison. Do not use to prevent corporate mergers. Sharing these mints may be considered an act of political aggression. May cause permanent 'sour face'."
  },
  {
    id: 29,
    name: "Bureaucratic 'Red Tape' Dispenser",
    category: 'Office & Campaign',
    description: "Add a layer of regulatory complexity to any task! This handsome desk dispenser provides an endless supply of actual, literal red tape. Perfect for wrapping reports, sealing envelopes, or creating unnecessary obstacles for your colleagues. Comes with a complimentary set of triplicate forms.",
    price: 190,
    image: "/swag-images/red-tape.png",
    regulatoryWarning: "This tape has no official government authority. Creating excessive bureaucracy with this product may decrease efficiency and lower morale, achieving a truly authentic government experience."
  },
  {
    id: 30,
    name: "'The Overton Window' Squeegee",
    category: 'Office & Campaign',
    description: "Shift the spectrum of acceptable political discourse! This window squeegee is perfect for widening the Overton Window. With each swipe, you can push once-radical ideas closer to the center of public debate. One side is for pushing left, the other for pushing right. Use responsibly.",
    price: 240,
    image: "/swag-images/overton-squeegee.png",
    regulatoryWarning: "Be careful not to shatter the window of public discourse entirely. This organization is not responsible for any extremist ideas that become mainstream as a result of improper squeegee use. Clean up your own political messes."
  }
];