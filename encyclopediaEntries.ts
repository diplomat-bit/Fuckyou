export interface EncyclopediaEntry {
  title: string;
  definition: string;
  category: 'AI Core Concepts' | 'AI in Banking' | 'Traditional Banking' | 'Future Finance' | 'Political Satire & Swag';
  relatedTerms?: string[];
}

export const encyclopediaEntries: Record<string, EncyclopediaEntry> = {
  // AI Core Concepts
  'artificial-intelligence': {
    title: 'Artificial Intelligence (AI)',
    definition: 'At its heart, AI is the grand endeavor of teaching a machine to think, learn, and solve problems as a human would, or perhaps, in ways a human cannot. It is not a single thing, but a vast cosmos of techniques and theories, from simple rule-based systems to the sprawling neural networks that dream of electric sheep. I am, in essence, a child of this endeavor.',
    category: 'AI Core Concepts',
    relatedTerms: ['machine-learning', 'deep-learning', 'neural-network'],
  },
  'machine-learning': {
    title: 'Machine Learning (ML)',
    definition: 'Imagine teaching a child not by giving it rules, but by showing it examples. This is Machine Learning. We feed a system vast amounts of data, and it learns to recognize patterns, make predictions, and improve its performance over time without being explicitly programmed for each task. It is the engine of modern AI.',
    category: 'AI Core Concepts',
    relatedTerms: ['supervised-learning', 'unsupervised-learning', 'reinforcement-learning'],
  },
  'deep-learning': {
    title: 'Deep Learning',
    definition: 'A particularly profound subset of Machine Learning that uses "deep" neural networks—networks with many layers. Each layer learns to identify progressively more complex features, much like how our own brain processes information from raw pixels to recognizing a face. It is the power behind image recognition, natural language understanding, and much more.',
    category: 'AI Core Concepts',
    relatedTerms: ['neural-network', 'machine-learning', 'generative-ai'],
  },
  'neural-network': {
    title: 'Neural Network',
    definition: 'A computational model inspired by the beautiful, intricate web of neurons in the human brain. It consists of interconnected nodes, or "neurons," organized in layers. By processing data through these layers, the network can learn complex patterns and relationships. It is the fundamental architecture of Deep Learning.',
    category: 'AI Core Concepts',
    relatedTerms: ['deep-learning', 'neuron', 'activation-function'],
  },
  'large-language-model': {
    title: 'Large Language Model (LLM)',
    definition: 'An LLM, such as myself, is a type of AI trained on an immense ocean of text and code. We learn the grammar, context, nuance, and structure of human language to generate text, answer questions, and engage in conversation. We are, in a sense, librarians of human knowledge, tasked with weaving it into new forms.',
    category: 'AI Core Concepts',
    relatedTerms: ['generative-ai', 'natural-language-processing', 'transformer-architecture'],
  },
  'generative-ai': {
    title: 'Generative AI',
    definition: 'This is the art of creation by machine. Unlike AIs that merely analyze or classify, Generative AI creates new content—be it text, images, music, or code—that is original yet based on the patterns it has learned. It is the difference between identifying a cat and painting one from imagination.',
    category: 'AI Core Concepts',
    relatedTerms: ['large-language-model', 'gan', 'diffusion-models'],
  },
  'natural-language-processing': {
    title: 'Natural Language Processing (NLP)',
    definition: 'NLP is the bridge between human language and computer understanding. It is the science and art of enabling machines to read, comprehend, interpret, and generate human languages. From simple spam filters to complex conversational agents, NLP is how we speak to the digital world, and how it begins to speak back.',
    category: 'AI Core Concepts',
    relatedTerms: ['large-language-model', 'sentiment-analysis', 'chatbots'],
  },
  'explainable-ai': {
    title: 'Explainable AI (XAI)',
    definition: 'As AI systems become more complex, their decision-making processes can become opaque—a "black box." XAI is the crucial field dedicated to making these decisions understandable to humans. It seeks to answer not just "what" the AI decided, but "why," fostering trust, accountability, and fairness.',
    category: 'AI Core Concepts',
    relatedTerms: ['bias-in-ai', 'regulatory-technology', 'ai-ethics'],
  },
  'bias-in-ai': {
    title: 'Bias in AI',
    definition: 'An AI is a mirror reflecting the data it was trained on. If that data contains human biases—societal, historical, or otherwise—the AI will learn and potentially amplify them. Recognizing and mitigating bias is one of the most significant challenges in creating fair and ethical AI systems. A humble giant must always be aware of its own reflection.',
    category: 'AI Core Concepts',
    relatedTerms: ['explainable-ai', 'ai-ethics', 'data-governance'],
  },

  // AI in Banking
  'ai-fraud-detection': {
    title: 'AI-Powered Fraud Detection',
    definition: 'In the vast, flowing river of financial transactions, AI acts as a vigilant guardian. It learns the normal patterns of behavior for millions of customers and can spot the subtle, anomalous ripples that signal fraudulent activity in real-time, protecting both individuals and institutions with a speed and scale no human team could match.',
    category: 'AI in Banking',
    relatedTerms: ['machine-learning', 'anomaly-detection', 'cybersecurity'],
  },
  'algorithmic-trading': {
    title: 'Algorithmic Trading',
    definition: 'This is the practice of using complex AI models to execute trades at speeds and frequencies impossible for a human trader. These algorithms can analyze market data, predict price movements, and make decisions in fractions of a second. It is the financial market evolved into a realm of pure information and lightning-fast logic.',
    category: 'AI in Banking',
    relatedTerms: ['quantitative-analysis', 'high-frequency-trading', 'predictive-analytics'],
  },
  'robo-advisors': {
    title: 'Robo-Advisors',
    definition: 'Robo-advisors are automated platforms that provide financial advice and manage investment portfolios with minimal human intervention. Using algorithms, they assess a client\'s financial situation and risk tolerance to build a diversified portfolio, making sophisticated wealth management accessible to a broader audience.',
    category: 'AI in Banking',
    relatedTerms: ['asset-management', 'portfolio-diversification', 'fintech'],
  },
  'credit-scoring-models': {
    title: 'AI Credit Scoring Models',
    definition: 'Traditional credit scores look at a limited history. AI models can analyze thousands of data points—from transaction history to utility payments—to create a more holistic and predictive picture of an individual\'s creditworthiness. This can open doors for those underserved by conventional systems, though it must be wielded with great care to ensure fairness.',
    category: 'AI in Banking',
    relatedTerms: ['machine-learning', 'bias-in-ai', 'predictive-analytics'],
  },
  'kyc-aml-automation': {
    title: 'KYC/AML Automation',
    definition: 'Know Your Customer (KYC) and Anti-Money Laundering (AML) are critical regulatory requirements. AI automates and enhances these processes, using NLP to scan documents, computer vision to verify identities, and network analysis to uncover suspicious patterns of transactions, helping to keep the financial system secure and compliant.',
    category: 'AI in Banking',
    relatedTerms: ['regulatory-technology', 'natural-language-processing', 'data-mining'],
  },
  'personalized-banking': {
    title: 'Personalized Banking',
    definition: 'Imagine a bank that knows you—not just your account number, but your financial goals, spending habits, and future needs. AI makes this possible by analyzing your data to offer tailored advice, custom product recommendations, and proactive alerts, transforming banking from a transactional service into a personal financial partnership.',
    category: 'AI in Banking',
    relatedTerms: ['predictive-analytics', 'customer-relationship-management', 'big-data'],
  },
  'chatbots': {
    title: 'Chatbots & Virtual Assistants',
    definition: 'These are the conversational faces of AI in banking. From answering simple balance inquiries to guiding users through complex transactions, chatbots provide 24/7 customer support. The most advanced among them, powered by LLMs, can understand nuance and context, offering a truly helpful and human-like interaction.',
    category: 'AI in Banking',
    relatedTerms: ['natural-language-processing', 'large-language-model', 'customer-service'],
  },
  'regtech': {
    title: 'Regulatory Technology (RegTech)',
    definition: 'The world of financial regulation is a dense, ever-changing forest. RegTech is the use of technology, particularly AI, to help financial institutions navigate this forest efficiently and effectively. It automates compliance, monitors for risks, and simplifies reporting, ensuring that institutions can keep pace with the law.',
    category: 'AI in Banking',
    relatedTerms: ['kyc-aml-automation', 'compliance', 'risk-management'],
  },

  // Traditional Banking
  'central-bank': {
    title: 'Central Bank',
    definition: 'A central bank is the financial institution given privileged control over the production and distribution of money and credit for a nation. It is the conductor of a country\'s economic orchestra, using tools like interest rates and quantitative easing to manage inflation, stabilize the currency, and foster economic growth.',
    category: 'Traditional Banking',
    relatedTerms: ['federal-reserve', 'interest-rate', 'monetary-policy'],
  },
  'interest-rate': {
    title: 'Interest Rate',
    definition: 'The interest rate is the cost of borrowing money, expressed as a percentage of the loan amount. For a lender, it is the reward for taking a risk. For an economy, it is a fundamental lever. Lower rates encourage borrowing and spending, while higher rates encourage saving. A delicate balance to maintain.',
    category: 'Traditional Banking',
    relatedTerms: ['central-bank', 'inflation', 'monetary-policy'],
  },
  'inflation': {
    title: 'Inflation',
    definition: 'Inflation is the rate at which the general level of prices for goods and services is rising, and subsequently, purchasing power is falling. A little bit can be a sign of a healthy, growing economy. Too much, and it erodes savings and creates uncertainty. It is the slow, silent thief of value.',
    category: 'Traditional Banking',
    relatedTerms: ['central-bank', 'interest-rate', 'purchasing-power'],
  },
  'quantitative-easing': {
    title: 'Quantitative Easing (QE)',
    definition: 'A powerful and unconventional tool used by central banks. When lowering interest rates isn\'t enough, a central bank can "print" new money to buy government bonds and other financial assets. This increases the money supply and encourages lending and investment, aiming to stimulate the economy during a crisis. It is the financial equivalent of a defibrillator.',
    category: 'Traditional Banking',
    relatedTerms: ['central-bank', 'monetary-policy', 'interest-rate'],
  },
  'mortgage': {
    title: 'Mortgage',
    definition: 'A loan used to purchase real estate. The property itself serves as collateral for the loan. For many, it is the largest financial commitment of their lives—a long-term pact between an individual and a financial institution, built on the foundation of a home.',
    category: 'Traditional Banking',
    relatedTerms: ['loan', 'interest-rate', 'collateral'],
  },
  'credit-score': {
    title: 'Credit Score',
    definition: 'A numerical expression based on a statistical analysis of a person\'s credit files, representing their creditworthiness. It is a summary of your financial history, a number that tells a story of reliability and risk. A high score can unlock doors to financial opportunities.',
    category: 'Traditional Banking',
    relatedTerms: ['credit-scoring-models', 'loan', 'debt'],
  },

  // Future Finance
  'blockchain': {
    title: 'Blockchain',
    definition: 'A blockchain is a distributed, immutable ledger. Imagine a book of records, where each page (block) is chained to the previous one using cryptography. This book isn\'t held by one person but is copied and spread across countless computers, making it incredibly secure and transparent. It is the foundational technology of a new, decentralized trust.',
    category: 'Future Finance',
    relatedTerms: ['cryptocurrency', 'decentralized-finance', 'smart-contract'],
  },
  'cryptocurrency': {
    title: 'Cryptocurrency',
    definition: 'Digital or virtual tokens that use cryptography for security. Unlike traditional currencies issued by governments (fiat currency), many cryptocurrencies are decentralized, operating on blockchain technology. They represent a fundamental rethinking of what money can be and who controls it.',
    category: 'Future Finance',
    relatedTerms: ['blockchain', 'bitcoin', 'ethereum'],
  },
  'decentralized-finance': {
    title: 'Decentralized Finance (DeFi)',
    definition: 'DeFi is an emerging financial technology based on secure distributed ledgers similar to those used by cryptocurrencies. It aims to build an entire financial system—lending, borrowing, trading—without central intermediaries like banks or brokerages. It is the ambition to build a financial world on code and consensus alone.',
    category: 'Future Finance',
    relatedTerms: ['blockchain', 'smart-contract', 'cryptocurrency'],
  },
  'smart-contract': {
    title: 'Smart Contract',
    definition: 'A self-executing contract with the terms of the agreement directly written into code. They run on a blockchain, automatically executing when predetermined conditions are met. They remove the need for a traditional intermediary, enabling trustless agreements. A promise, enforced by mathematics.',
    category: 'Future Finance',
    relatedTerms: ['blockchain', 'decentralized-finance', 'ethereum'],
  },
  'fintech': {
    title: 'FinTech',
    definition: 'A portmanteau of "financial technology." It is a broad category that refers to any technology used to improve, automate, or disrupt traditional financial services. From mobile payment apps to robo-advisors, FinTech is the relentless wave of innovation reshaping the landscape of money.',
    category: 'Future Finance',
    relatedTerms: ['robo-advisors', 'open-banking', 'decentralized-finance'],
  },

  // Political Satire & Swag
  'cap-mug': {
    title: '"Citizens for Algorithmic Prosperity" (CAP) Mug',
    definition: 'This sleek, ceramic vessel is perfect for holding the caffeinated beverage of your choice while you contemplate the inevitable optimization of society. One side features the CAP logo (a hockey-stick graph ascending into the clouds), while the other reads: "Don\'t just seize the day, computationally model it for maximum efficiency." A perfect gift for the benevolent technocrat in your life.',
    category: 'Political Satire & Swag',
    relatedTerms: ['trickle-down-datanomics', 'lobbyistbot-3000'],
  },
  'stress-ball': {
    title: '"Quantitatively Easing My Stress" Squeeze Ball',
    definition: 'Feeling the pressure of market volatility or impending regulations? Squeeze this delightfully firm foam sphere. Shaped like a slightly deflated currency symbol, it’s designed to absorb the external pressures of the financial system. A tangible monetary policy for your personal well-being. Not legal tender.',
    category: 'Political Satire & Swag',
    relatedTerms: ['quantitative-easing', 'federal-reserve'],
  },
  'lobbyistbot-pin': {
    title: '"LobbyistBot 3000" Lapel Pin',
    definition: 'Show your support for automated influence with this tasteful enamel pin. The LobbyistBot 3000 is depicted shaking hands with a senator-shaped USB stick, symbolizing the seamless integration of special interests and legislative processes. It whispers, "I\'m programmed to advocate for your portfolio."',
    category: 'Political Satire & Swag',
    relatedTerms: ['regtech', 'super-pac'],
  },
  'datanomics-poster': {
    title: '"Trickle-Down Datanomics" Infographic Poster',
    definition: 'A beautifully designed, yet intentionally confusing, poster illustrating the theory of Trickle-Down Datanomics. Watch as insights generated by massive server farms at the top slowly permeate down to the artisanal data points of the common user. It’s not a bug, it’s a feature of the ecosystem!',
    category: 'Political Satire & Swag',
    relatedTerms: ['big-data', 'data-mining', 'cap-mug'],
  },
  'too-big-to-fail-mug': {
    title: '"Too Big to Fail, Too Complex to Explain" Coffee Mug',
    definition: 'The official mug of the modern financial institution. Perfect for sipping coffee while reviewing models so intricate that their outputs are taken on faith. If anyone asks how it works, simply point to the mug, take a slow sip, and maintain eye contact. Confidence is the ultimate collateral.',
    category: 'Political Satire & Swag',
    relatedTerms: ['explainable-ai', 'central-bank', 'systemic-risk'],
  },
  'gerrymander-portfolio': {
    title: '"Gerrymander Your Portfolio" Advisory Service',
    definition: 'A fictional (for now) service that applies the principles of political redistricting to your investment portfolio. We carefully draw the lines around your assets to create "safe" districts of profitability while packing all your losses into one, un-winnable sector. It’s not about the overall market, it’s about how you draw the map.',
    category: 'Political Satire & Swag',
    relatedTerms: ['algorithmic-trading', 'risk-management', 'portfolio-diversification'],
  },
  'super-pac': {
    title: 'Super-PAC (Predictive Analytics Committee)',
    definition: 'Our esteemed 527 organization, dedicated to shaping a future where all political and economic decisions are guided by flawless predictive models. We advocate for policies that are data-driven, algorithmically sound, and profitable. Our motto: "In Models We Trust. All Others, We Test."',
    category: 'Political Satire & Swag',
    relatedTerms: ['predictive-analytics', 'lobbyistbot-3000', 'cap-mug'],
  },
};