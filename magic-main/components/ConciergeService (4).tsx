import React, { useState, useEffect, useCallback } from 'react';

const ConciergeAnimationStyles = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse {
        0% { opacity: 0.5; }
        50% { opacity: 1; }
        100% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

// --- CORE TYPES & INTERFACES ---
type Category = 'JETS' | 'YACHTS' | 'RESIDENCES' | 'EXPERIENCES' | 'DINING' | 'SECURITY' | 'ART' | 'AUTOMOBILES' | 'AVIATION' | 'WELLNESS' | 'PHILANTHROPY' | 'TECHNOLOGY' | 'FASHION' | 'COLLECTIBLES' | 'STAFFING' | 'EDUCATION' | 'LEGAL' | 'FINANCE' | 'REAL_ESTATE' | 'TRAVEL' | 'EVENTS' | 'ENTERTAINMENT' | 'SPORTS' | 'HEALTH' | 'GOVERNANCE' | 'RESEARCH' | 'SPACE' | 'MARINE' | 'LAND' | 'AIR' | 'VIRTUAL' | 'CYBERNETICS' | 'ROBOTICS' | 'BIOTECH' | 'NANOTECH' | 'ENERGY' | 'MATERIALS' | 'LOGISTICS' | 'COMMUNICATIONS' | 'MEDIA' | 'ADVISORY' | 'CONSULTING' | 'INSURANCE' | 'INVESTMENTS' | 'VENTURE_CAPITAL' | 'PRIVATE_EQUITY' | 'HEDGE_FUNDS' | 'FAMILY_OFFICE' | 'CONCIERGE_MEDICINE' | 'LONGEVITY' | 'GENOMICS' | 'NEUROSCIENCE' | 'QUANTUM_COMPUTING' | 'AI_SERVICES' | 'DATA_ANALYSIS' | 'BESPOKE_SOFTWARE' | 'HARDWARE_DESIGN' | 'ARCHITECTURAL_DESIGN' | 'INTERIOR_DESIGN' | 'LANDSCAPE_DESIGN' | 'URBAN_PLANNING' | 'SUSTAINABILITY' | 'CONSERVATION' | 'EXPLORATION' | 'ADVENTURE' | 'CULINARY_ARTS' | 'VITICULTURE' | 'DISTILLING' | 'PERFUMERY' | 'HOROLOGY' | 'JEWELRY' | 'GEMOLOGY' | 'HAUTE_COUTURE' | 'AUTOMOTIVE_DESIGN' | 'RACING' | 'EQUESTRIAN' | 'POLO' | 'SAILING' | 'AVIATION_ACROBATICS' | 'MOUNTAINEERING' | 'POLAR_EXPEDITIONS' | 'ARCHAEOLOGY' | 'PALEONTOLOGY' | 'ASTRONOMY' | 'ASTROPHYSICS' | 'OCEANOGRAPHY' | 'METEOROLOGY' | 'GEOLOGY' | 'CARTOGRAPHY' | 'CRYPTOGRAPHY' | 'LINGUISTICS' | 'PHILOSOPHY' | 'HISTORY' | 'ANTHROPOLOGY' | 'SOCIOLOGY' | 'PSYCHOLOGY' | 'THEOLOGY' | 'MYTHOLOGY' | 'LITERATURE' | 'POETRY' | 'MUSIC_COMPOSITION' | 'SCULPTURE' | 'PAINTING' | 'PHOTOGRAPHY';

interface Asset {
  id: string;
  title: string;
  description: string;
  specs: string[];
  availability: string;
  image: string; // Using colored placeholders for self-containment
  demandIndex: number; // For HFT simulation
  // --- 100 NEW FEATURES ---
  feature_1: string | number | boolean;
  feature_2: string | number | boolean;
  feature_3: string | number | boolean;
  feature_4: string | number | boolean;
  feature_5: string | number | boolean;
  feature_6: string | number | boolean;
  feature_7: string | number | boolean;
  feature_8: string | number | boolean;
  feature_9: string | number | boolean;
  feature_10: string | number | boolean;
  feature_11: string | number | boolean;
  feature_12: string | number | boolean;
  feature_13: string | number | boolean;
  feature_14: string | number | boolean;
  feature_15: string | number | boolean;
  feature_16: string | number | boolean;
  feature_17: string | number | boolean;
  feature_18: string | number | boolean;
  feature_19: string | number | boolean;
  feature_20: string | number | boolean;
  feature_21: string | number | boolean;
  feature_22: string | number | boolean;
  feature_23: string | number | boolean;
  feature_24: string | number | boolean;
  feature_25: string | number | boolean;
  feature_26: string | number | boolean;
  feature_27: string | number | boolean;
  feature_28: string | number | boolean;
  feature_29: string | number | boolean;
  feature_30: string | number | boolean;
  feature_31: string | number | boolean;
  feature_32: string | number | boolean;
  feature_33: string | number | boolean;
  feature_34: string | number | boolean;
  feature_35: string | number | boolean;
  feature_36: string | number | boolean;
  feature_37: string | number | boolean;
  feature_38: string | number | boolean;
  feature_39: string | number | boolean;
  feature_40: string | number | boolean;
  feature_41: string | number | boolean;
  feature_42: string | number | boolean;
  feature_43: string | number | boolean;
  feature_44: string | number | boolean;
  feature_45: string | number | boolean;
  feature_46: string | number | boolean;
  feature_47: string | number | boolean;
  feature_48: string | number | boolean;
  feature_49: string | number | boolean;
  feature_50: string | number | boolean;
  feature_51: string | number | boolean;
  feature_52: string | number | boolean;
  feature_53: string | number | boolean;
  feature_54: string | number | boolean;
  feature_55: string | number | boolean;
  feature_56: string | number | boolean;
  feature_57: string | number | boolean;
  feature_58: string | number | boolean;
  feature_59: string | number | boolean;
  feature_60: string | number | boolean;
  feature_61: string | number | boolean;
  feature_62: string | number | boolean;
  feature_63: string | number | boolean;
  feature_64: string | number | boolean;
  feature_65: string | number | boolean;
  feature_66: string | number | boolean;
  feature_67: string | number | boolean;
  feature_68: string | number | boolean;
  feature_69: string | number | boolean;
  feature_70: string | number | boolean;
  feature_71: string | number | boolean;
  feature_72: string | number | boolean;
  feature_73: string | number | boolean;
  feature_74: string | number | boolean;
  feature_75: string | number | boolean;
  feature_76: string | number | boolean;
  feature_77: string | number | boolean;
  feature_78: string | number | boolean;
  feature_79: string | number | boolean;
  feature_80: string | number | boolean;
  feature_81: string | number | boolean;
  feature_82: string | number | boolean;
  feature_83: string | number | boolean;
  feature_84: string | number | boolean;
  feature_85: string | number | boolean;
  feature_86: string | number | boolean;
  feature_87: string | number | boolean;
  feature_88: string | number | boolean;
  feature_89: string | number | boolean;
  feature_90: string | number | boolean;
  feature_91: string | number | boolean;
  feature_92: string | number | boolean;
  feature_93: string | number | boolean;
  feature_94: string | number | boolean;
  feature_95: string | number | boolean;
  feature_96: string | number | boolean;
  feature_97: string | number | boolean;
  feature_98: string | number | boolean;
  feature_99: string | number | boolean;
  feature_100: string | number | boolean;
}

interface BookingState {
  isBooking: boolean;
  asset: Asset | null;
  step: 'details' | 'comms' | 'auth' | 'confirmed';
  itinerary: {
    pax: string;
    timeline: string;
    requests: string;
  };
}

// --- MOCK DATA ENGINE (EXPANDED & FUTURISTIC) ---

const NEW_FEATURES_DATA = Array.from({ length: 100 }, (_, i) => i + 1).reduce((acc, i) => {
  const key = `feature_${i}` as keyof Asset;
  let value: string | number | boolean;
  const type = i % 3;
  if (type === 0) {
    value = `Generated String Value ${i}`;
  } else if (type === 1) {
    value = i * 3.14;
  } else {
    value = i % 2 === 0;
  }
  acc[key] = value;
  return acc;
}, {} as { [K in `feature_${number}`]: string | number | boolean });

const createPlaceholderAsset = (id: string, title: string, description: string, image: string, demandIndex: number): Asset => ({
  id,
  title,
  description,
  specs: ['Bespoke', 'On-Demand', 'Fully Managed'],
  availability: 'By Arrangement',
  image,
  demandIndex,
  ...NEW_FEATURES_DATA,
});

const ASSETS: Record<Category, Asset[]> = {
  JETS: [
    {
      id: 'j1',
      title: 'Gulfstream G800 "Celestial"',
      description: 'The flagship of the Balcony fleet. Ultra-long range with four living areas and a private stateroom.',
      specs: ['Range: 8,000 nm', 'Speed: Mach 0.925', 'Capacity: 19 Pax', 'Ka-Band WiFi'],
      availability: 'Immediate',
      image: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      demandIndex: 1.12,
      ...NEW_FEATURES_DATA,
    },
    {
      id: 'j2',
      title: 'Bombardier Global 8000 "Apex"',
      description: 'The fastest and longest-range business jet, breaking the sound barrier in tests. A true time machine.',
      specs: ['Range: 8,000 nm', 'Top Speed: Mach 1.015', 'Capacity: 17 Pax', 'Smooth FlÄ•x Wing'],
      availability: 'In Hangar (London)',
      image: 'linear-gradient(135deg, #2C3E50 0%, #4CA1AF 100%)',
      demandIndex: 1.25,
      ...NEW_FEATURES_DATA,
    },
    {
      id: 'j3',
      title: 'Hermes Hypersonic "Helios"',
      description: 'Sub-orbital point-to-point transport. London to New York in 90 minutes. The ultimate executive edge.',
      specs: ['Range: Global', 'Speed: Mach 5+', 'Capacity: 8 Pax', 'Zero-G Cabin'],
      availability: '24h Pre-Auth',
      image: 'linear-gradient(135deg, #8E0E00 0%, #1F1C18 100%)',
      demandIndex: 3.45,
      ...NEW_FEATURES_DATA,
    },
    {
      id: 'j4',
      title: 'Sikorsky S-92 "Sanctuary"',
      description: 'Executive VTOL for seamless city-to-asset transfers. Fully customized interior with soundproofing.',
      specs: ['Range: 539 nm', 'Twin-Turbine', 'Capacity: 10 Pax', 'Medical Suite'],
      availability: 'On Standby',
      image: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)',
      demandIndex: 0.98,
      ...NEW_FEATURES_DATA,
    }
  ],
  YACHTS: [
    {
      id: 'y1',
      title: 'LÃ¼rssen "Leviathan" 150m',
      description: 'A floating private nation with two helipads, a submarine dock, and a full concert hall.',
      specs: ['Length: 150m', 'Crew: 50', 'Guest Cabins: 14', 'Missile Defense System'],
      availability: 'Docked (Monaco)',
      image: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      demandIndex: 1.88,
      ...NEW_FEATURES_DATA,
    },
    {
      id: 'y2',
      title: 'Oceanco "Nautilus"',
      description: 'Explorer-class submersible yacht. Capable of 2 weeks fully submerged for ultimate privacy and exploration.',
      specs: ['Length: 115m', 'Max Depth: 200m', 'Guests: 12', 'Oceanographic Lab'],
      availability: 'Pacific Traverse',
      image: 'linear-gradient(135deg, #000046 0%, #1CB5E0 100%)',
      demandIndex: 2.15,
      ...NEW_FEATURES_DATA,
    },
    {
      id: 'y3',
      title: 'Sunreef 100 Power Eco "Serenity"',
      description: 'Fully electric luxury catamaran with proprietary solar skin for silent, unlimited-range cruising.',
      specs: ['Solar Skin', 'Zero Emission', 'Guests: 12', 'Hydroponic Garden'],
      availability: 'Immediate (Miami)',
      image: 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)',
      demandIndex: 1.05,
      ...NEW_FEATURES_DATA,
    },
    {
      id: 'y4',
      title: 'Wally "Why200" Space Yacht',
      description: 'Radical design maximizing volume and stability. A true villa on the water with a 37 mÂ² master suite.',
      specs: ['Length: 27m', 'Beam: 7.6m', 'Guests: 8', 'Fold-out Terraces'],
      availability: 'Available',
      image: 'linear-gradient(135deg, #373B44 0%, #4286f4 100%)',
      demandIndex: 0.92,
      ...NEW_FEATURES_DATA,
    }
  ],
  RESIDENCES: [
    {
      id: 'r1',
      title: 'The Sovereign Private Atoll',
      description: 'A self-sufficient private island in the Maldives with full staff, private runway, and marine biology center.',
      specs: ['7 Villas', 'Full Staff (80)', 'Private Runway', 'Submarine Included'],
      availability: 'Immediate',
      image: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
      demandIndex: 2.50,
      ...NEW_FEATURES_DATA,
    },
    {
      id: 'r2',
      title: 'Aman Penthouse, Central Park Tower',
      description: 'The highest residence in the western hemisphere. 360-degree views, private chef, and direct Aman spa access.',
      specs: ['Floor: 130', '5 Bedrooms', 'Private Elevator', '24/7 Butler'],
      availability: 'Available',
      image: 'linear-gradient(135deg, #FDFC47 0%, #24FE41 100%)',
      demandIndex: 1.40,
      ...NEW_FEATURES_DATA,
    },
    {
      id: 'r3',
      title: 'Kyoto Imperial Villa "Komorebi"',
      description: 'A historically significant private residence with modern amenities, zen gardens, and a private onsen.',
      specs: ['10 Acres', 'Tea House', 'Michelin Chef', 'Art Collection'],
      availability: 'By Request',
      image: 'linear-gradient(135deg, #D31027 0%, #EA384D 100%)',
      demandIndex: 1.90,
      ...NEW_FEATURES_DATA,
    },
    {
      id: 'r4',
      title: 'Orbital Spire "Ascension"',
      description: 'Private residential module on the first commercial space station. Unparalleled views and zero-gravity recreation.',
      specs: ['LEO', '4 Occupants', 'Full Life Support', 'VR Dock'],
      availability: 'Q4 Launch Window',
      image: 'linear-gradient(135deg, #17233c 0%, #27345d 100%)',
      demandIndex: 4.10,
      ...NEW_FEATURES_DATA,
    }
  ],
  EXPERIENCES: [
    {
      id: 'e1',
      title: 'Monaco GP - Paddock & Yacht',
      description: 'VIP access to the Paddock Club combined with a trackside berth on our "Leviathan" yacht.',
      specs: ['Full Hospitality', 'Pit Lane Walk', 'Driver Meet & Greet', 'Yacht Party Access'],
      availability: 'May 23-26',
      image: 'linear-gradient(135deg, #8E0E00 0%, #1F1C18 100%)',
      demandIndex: 1.75,
      ...NEW_FEATURES_DATA,
    },
    {
      id: 'e2',
      title: 'Deep Dive: Mariana Trench',
      description: 'A piloted descent to the deepest point on Earth in a Triton 36000/2 submersible. A truly unique perspective.',
      specs: ['7-Day Expedition', 'Scientific Crew', 'HD Video Log', 'Personalized Sub'],
      availability: 'Limited Slots',
      image: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
      demandIndex: 3.20,
      ...NEW_FEATURES_DATA,
    },
    {
      id: 'e3',
      title: 'Antarctic Philharmonic',
      description: 'A private concert by the Vienna Philharmonic in a custom-built acoustic ice cavern in Antarctica.',
      specs: ['Private Charter Flight', 'Luxury Base Camp', 'Climate Gear Provided', 'Post-Concert Gala'],
      availability: 'December',
      image: 'linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)',
      demandIndex: 2.80,
      ...NEW_FEATURES_DATA,
    },
    {
      id: 'e4',
      title: 'Curated Reality Simulation',
      description: 'Bespoke, fully immersive sensory experience. Live any life, any time, any place. Powered by Quantum AI.',
      specs: ['Neural Interface', 'Haptic Suit', 'Custom Scenarios', '48-Hour Max Duration'],
      availability: 'Beta Access',
      image: 'linear-gradient(135deg, #ff00cc 0%, #333399 100%)',
      demandIndex: 4.50,
      ...NEW_FEATURES_DATA,
    }
  ],
  DINING: [
    {
      id: 'd1',
      title: 'Noma, Copenhagen - Full Buyout',
      description: 'Exclusive access to the world\'s most influential restaurant for a private evening curated by RenÃ© Redzepi.',
      specs: ['20 Guests Max', 'Custom Menu', 'Wine Pairing', 'Kitchen Tour'],
      availability: 'By Arrangement',
      image: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
      demandIndex: 1.60,
      ...NEW_FEATURES_DATA,
    },
    {
      id: 'd2',
      title: 'Chef\'s Table at Sukiyabashi Jiro',
      description: 'A guaranteed reservation at the 10-seat counter of the world\'s most famous sushi master.',
      specs: ['Omakase Menu', 'Sake Pairing', 'Private Translator', '2 Guests'],
      availability: '3-Month Lead',
      image: 'linear-gradient(135deg, #3a6186 0%, #89253e 100%)',
      demandIndex: 2.90,
      ...NEW_FEATURES_DATA,
    },
    {
      id: 'd3',
      title: 'Dom PÃ©rignon Vertical Tasting',
      description: 'A private tasting of every vintage of Dom PÃ©rignon ever produced, hosted by the Chef de Cave in Ã‰pernay.',
      specs: ['Rare Vintages', 'Cellar Access', 'Gourmet Dinner', 'Overnight at ChÃ¢teau'],
      availability: 'Twice Yearly',
      image: 'linear-gradient(135deg, #eacda3 0%, #d6ae7b 100%)',
      demandIndex: 2.10,
      ...NEW_FEATURES_DATA,
    },
    {
      id: 'd4',
      title: 'Zero-G Culinary Lab',
      description: 'A parabolic flight experience where a Michelin-starred chef prepares a meal in zero gravity.',
      specs: ['15 Parabolas', 'Custom Menu', 'Flight Suit', 'Post-Flight Celebration'],
      availability: 'Quarterly',
      image: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
      demandIndex: 3.80,
      ...NEW_FEATURES_DATA,
    }
  ],
  SECURITY: [
    {
      id: 's1',
      title: 'Executive Protection Detail (Tier 1)',
      description: 'A 4-person team of former special forces operators for low-profile, high-capability personal security.',
      specs: ['Global Coverage', 'Threat Assessment', 'Secure Comms', 'Medical Trained'],
      availability: 'Immediate',
      image: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
      demandIndex: 1.30,
      ...NEW_FEATURES_DATA,
    },
    {
      id: 's2',
      title: 'Armored Convoy Service',
      description: 'Fleet of discreet, B7-rated armored vehicles with trained security drivers for secure ground transport.',
      specs: ['B7 Armor', 'Counter-Surveillance', 'Convoy Options', 'Route Planning'],
      availability: 'Global Metros',
      image: 'linear-gradient(135deg, #536976 0%, #292E49 100%)',
      demandIndex: 1.10,
      ...NEW_FEATURES_DATA,
    },
    {
      id: 's3',
      title: 'Cybersecurity Fortress',
      description: 'A personal, quantum-encrypted digital ecosystem for all your devices, communications, and data.',
      specs: ['Quantum Encryption', '24/7 SOC', 'Digital Decoy', 'Hardware Provided'],
      availability: '72h Setup',
      image: 'linear-gradient(135deg, #00F260 0%, #0575E6 100%)',
      demandIndex: 2.40,
      ...NEW_FEATURES_DATA,
    },
    {
      id: 's4',
      title: 'Contingency Extraction',
      description: 'Global non-permissive environment extraction service. Guaranteed retrieval from any situation.',
      specs: ['Ex-Intel Assets', 'Global Network', 'Covert Aircraft', 'Full Discretion'],
      availability: 'On Retainer',
      image: 'linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)',
      demandIndex: 3.95,
      ...NEW_FEATURES_DATA,
    }
  ],
  ART: [createPlaceholderAsset('art1', 'Private Art Curation', 'Acquire or commission masterworks with our expert art advisors.', 'linear-gradient(135deg, #360033, #0b8793)', 2.2)],
  AUTOMOBILES: [createPlaceholderAsset('auto1', 'Hypercar Commission', 'Design and commission a one-off vehicle from a legendary manufacturer.', 'linear-gradient(135deg, #1f1c18, #8e0e00)', 3.1)],
  AVIATION: [createPlaceholderAsset('av1', 'Fighter Jet Experience', 'Pilot a supersonic fighter jet with a veteran instructor.', 'linear-gradient(135deg, #2c3e50, #d3cce3)', 2.8)],
  WELLNESS: [createPlaceholderAsset('well1', 'Longevity Retreat', 'A personalized, data-driven wellness program at a private Swiss clinic.', 'linear-gradient(135deg, #e0eafc, #cfdef3)', 2.5)],
  PHILANTHROPY: [createPlaceholderAsset('phil1', 'Foundation Management', 'Establish and manage a high-impact philanthropic foundation.', 'linear-gradient(135deg, #00467f, #a5cc82)', 1.9)],
  TECHNOLOGY: [createPlaceholderAsset('tech1', 'Personal Tech Lab', 'Build a state-of-the-art research and development lab in your residence.', 'linear-gradient(135deg, #0575e6, #00f260)', 3.5)],
  FASHION: [createPlaceholderAsset('fash1', 'Atelier PrivÃ© Access', 'Private access to the haute couture ateliers of Paris during fashion week.', 'linear-gradient(135deg, #ff00cc, #333399)', 2.1)],
  COLLECTIBLES: [createPlaceholderAsset('coll1', 'Rare Horology Acquisition', 'Source the world\'s rarest and most sought-after timepieces.', 'linear-gradient(135deg, #eacda3, #d6ae7b)', 2.9)],
  STAFFING: [createPlaceholderAsset('staff1', 'Elite Household Staffing', 'Recruit and train world-class staff for your residences and assets.', 'linear-gradient(135deg, #536976, #292e49)', 1.5)],
  EDUCATION: [createPlaceholderAsset('edu1', 'Private Tutelage', 'Arrange for private education from Nobel laureates and industry titans.', 'linear-gradient(135deg, #141e30, #243b55)', 2.0)],
  LEGAL: [createPlaceholderAsset('legal1', 'Global Legal Counsel', 'Retain a discreet, globally-connected legal team for any contingency.', 'linear-gradient(135deg, #232526, #414345)', 1.8)],
  FINANCE: [createPlaceholderAsset('fin1', 'Bespoke Financial Instruments', 'Create custom financial products and investment vehicles.', 'linear-gradient(135deg, #1e3c72, #2a5298)', 2.7)],
  REAL_ESTATE: [createPlaceholderAsset('re1', 'Off-Market Portfolio', 'Access a portfolio of the world\'s most exclusive off-market properties.', 'linear-gradient(135deg, #fdfc47, #24fe41)', 2.4)],
  TRAVEL: [createPlaceholderAsset('travel1', 'Round-the-World Itinerary', 'A fully-staffed, year-long journey curated to your exact specifications.', 'linear-gradient(135deg, #00c6ff, #0072ff)', 3.3)],
  EVENTS: [createPlaceholderAsset('event1', 'Private Gala Production', 'Conceptualize and execute world-class private events and celebrations.', 'linear-gradient(135deg, #d31027, #ea384d)', 2.6)],
  ENTERTAINMENT: [createPlaceholderAsset('ent1', 'Private Concert Booking', 'Arrange a private performance from any of the world\'s top artists.', 'linear-gradient(135deg, #606c88, #3f4c6b)', 2.9)],
  SPORTS: [createPlaceholderAsset('sport1', 'Sports Team Acquisition', 'Facilitate the purchase and management of a professional sports franchise.', 'linear-gradient(135deg, #56ab2f, #a8e063)', 3.8)],
  HEALTH: [createPlaceholderAsset('health1', '24/7 Medical Concierge', 'A dedicated team of physicians providing immediate, global medical care.', 'linear-gradient(135deg, #000046, #1cb5e0)', 2.3)],
  GOVERNANCE: [createPlaceholderAsset('gov1', 'Citizenship by Investment', 'Strategic advisory for acquiring secondary citizenships and residencies.', 'linear-gradient(135deg, #3a6186, #89253e)', 3.0)],
  RESEARCH: [createPlaceholderAsset('res1', 'Fund Private Research', 'Sponsor a scientific research project in any field of your choosing.', 'linear-gradient(135deg, #0f2027, #2c5364)', 2.2)],
  SPACE: [createPlaceholderAsset('space1', 'Lunar Mission Patronage', 'Become the primary patron of a private mission to the Moon.', 'linear-gradient(135deg, #17233c, #27345d)', 4.8)],
  MARINE: [createPlaceholderAsset('marine1', 'Submersible Fleet', 'Acquire and staff a fleet of personal submersibles for exploration.', 'linear-gradient(135deg, #000428, #004e92)', 3.1)],
  LAND: [createPlaceholderAsset('land1', 'Private Nature Reserve', 'Purchase and conserve vast tracts of land for ecological preservation.', 'linear-gradient(135deg, #134e5e, #71b280)', 2.7)],
  AIR: [createPlaceholderAsset('air1', 'Airship "Zephyr"', 'A modern, luxury airship for silent, low-altitude global cruising.', 'linear-gradient(135deg, #e0eafc, #cfdef3)', 3.4)],
  VIRTUAL: [createPlaceholderAsset('vr1', 'Digital Immortality', 'Create a sentient, AI-powered digital version of yourself.', 'linear-gradient(135deg, #ff00cc, #333399)', 4.9)],
  CYBERNETICS: [createPlaceholderAsset('cyber1', 'Augmentation Suite', 'Access to cutting-edge, bespoke cybernetic enhancements.', 'linear-gradient(135deg, #434343, #000000)', 4.2)],
  ROBOTICS: [createPlaceholderAsset('robo1', 'Custom Android Staff', 'Commission humanoid robotics for specialized household or security tasks.', 'linear-gradient(135deg, #373b44, #4286f4)', 3.9)],
  BIOTECH: [createPlaceholderAsset('bio1', 'Personal Gene Sequencing', 'Full-spectrum genomic sequencing and personalized preventative medicine.', 'linear-gradient(135deg, #00f260, #0575e6)', 3.6)],
  NANOTECH: [createPlaceholderAsset('nano1', 'Utility Fog Access', 'Beta access to programmable nanite swarms for instant creation.', 'linear-gradient(135deg, #232526, #414345)', 4.7)],
  ENERGY: [createPlaceholderAsset('energy1', 'Fusion Reactor Investment', 'Become a primary investor in a private fusion energy startup.', 'linear-gradient(135deg, #fdfc47, #24fe41)', 4.1)],
  MATERIALS: [createPlaceholderAsset('mat1', 'Exotic Material Sourcing', 'Procure and utilize materials not yet available on the open market.', 'linear-gradient(135deg, #536976, #292e49)', 3.2)],
  LOGISTICS: [createPlaceholderAsset('log1', 'Global Logistics Network', 'A private, secure logistics network for moving any asset, anywhere.', 'linear-gradient(135deg, #141e30, #243b55)', 2.5)],
  COMMUNICATIONS: [createPlaceholderAsset('comm1', 'Private Satellite Constellation', 'Launch and control a personal, encrypted satellite communications network.', 'linear-gradient(135deg, #09203f, #537895)', 4.0)],
  MEDIA: [createPlaceholderAsset('media1', 'Acquire Media House', 'Purchase a major newspaper, television network, or film studio.', 'linear-gradient(135deg, #8e0e00, #1f1c18)', 3.7)],
  ADVISORY: [createPlaceholderAsset('adv1', 'Shadow Cabinet', 'Assemble a personal advisory board of global leaders and experts.', 'linear-gradient(135deg, #360033, #0b8793)', 3.0)],
  CONSULTING: [createPlaceholderAsset('consult1', 'Geopolitical Strategy', 'Retain a team of geopolitical analysts for strategic global positioning.', 'linear-gradient(135deg, #2c3e50, #d3cce3)', 2.8)],
  INSURANCE: [createPlaceholderAsset('ins1', 'Impossible Risk Coverage', 'Underwrite insurance policies for risks deemed uninsurable.', 'linear-gradient(135deg, #e0eafc, #cfdef3)', 2.4)],
  INVESTMENTS: [createPlaceholderAsset('inv1', 'Alpha-Tier Deal Flow', 'Access to exclusive, off-market investment opportunities.', 'linear-gradient(135deg, #00467f, #a5cc82)', 2.9)],
  VENTURE_CAPITAL: [createPlaceholderAsset('vc1', 'Curated VC Fund', 'Create and manage a bespoke venture capital fund.', 'linear-gradient(135deg, #0575e6, #00f260)', 3.1)],
  PRIVATE_EQUITY: [createPlaceholderAsset('pe1', 'Targeted LBOs', 'Identify and execute leveraged buyouts of strategic companies.', 'linear-gradient(135deg, #ff00cc, #333399)', 3.3)],
  HEDGE_FUNDS: [createPlaceholderAsset('hf1', 'Quantum Trading Algorithm', 'Develop and deploy a proprietary quantum computing-based trading algorithm.', 'linear-gradient(135deg, #eacda3, #d6ae7b)', 4.3)],
  FAMILY_OFFICE: [createPlaceholderAsset('fo1', 'Multi-Generational Office', 'Establish a comprehensive family office to manage wealth for centuries.', 'linear-gradient(135deg, #536976, #292e49)', 2.6)],
  CONCIERGE_MEDICINE: [createPlaceholderAsset('cm1', 'Mobile Surgical Suite', 'A fully-equipped, mobile surgical unit that can be deployed globally.', 'linear-gradient(135deg, #141e30, #243b55)', 3.5)],
  LONGEVITY: [createPlaceholderAsset('long1', 'Age Reversal Therapies', 'Access to experimental and clinically-proven age reversal treatments.', 'linear-gradient(135deg, #232526, #414345)', 4.5)],
  GENOMICS: [createPlaceholderAsset('gen1', 'Bespoke Genome Editing', 'Commission CRISPR-based genomic edits for preventative health.', 'linear-gradient(135deg, #1e3c72, #2a5298)', 4.6)],
  NEUROSCIENCE: [createPlaceholderAsset('neuro1', 'Brain-Computer Interface', 'Early access to next-generation, non-invasive BCI technology.', 'linear-gradient(135deg, #fdfc47, #24fe41)', 4.4)],
  QUANTUM_COMPUTING: [createPlaceholderAsset('qc1', 'Personal Quantum Computer', 'Acquire and house a personal quantum computer for private use.', 'linear-gradient(135deg, #00c6ff, #0072ff)', 4.9)],
  AI_SERVICES: [createPlaceholderAsset('ai1', 'Personal AGI', 'Commission the development of a personalized Artificial General Intelligence.', 'linear-gradient(135deg, #d31027, #ea384d)', 5.0)],
  DATA_ANALYSIS: [createPlaceholderAsset('data1', 'Global Data Oracle', 'A service that can answer any question by analyzing global data streams in real-time.', 'linear-gradient(135deg, #606c88, #3f4c6b)', 4.2)],
  BESPOKE_SOFTWARE: [createPlaceholderAsset('sw1', 'Unbreakable OS', 'Commission a custom, unhackable operating system for all personal devices.', 'linear-gradient(135deg, #56ab2f, #a8e063)', 3.8)],
  HARDWARE_DESIGN: [createPlaceholderAsset('hw1', 'Custom Silicon', 'Design and fabricate custom microchips for specific, high-performance tasks.', 'linear-gradient(135deg, #000046, #1cb5e0)', 4.0)],
  ARCHITECTURAL_DESIGN: [createPlaceholderAsset('arch1', 'Starchitect Commission', 'Commission a Pritzker Prize-winning architect to design a residence.', 'linear-gradient(135deg, #3a6186, #89253e)', 3.2)],
  INTERIOR_DESIGN: [createPlaceholderAsset('int1', 'Living Art Installation', 'Design a home interior that is a dynamic, evolving work of art.', 'linear-gradient(135deg, #0f2027, #2c5364)', 2.7)],
  LANDSCAPE_DESIGN: [createPlaceholderAsset('landsc1', 'Ecosystem Creation', 'Design and create a self-sustaining, bespoke ecosystem on your property.', 'linear-gradient(135deg, #134e5e, #71b280)', 3.0)],
  URBAN_PLANNING: [createPlaceholderAsset('urban1', 'Charter City Development', 'Fund and develop a new city based on a specific set of principles.', 'linear-gradient(135deg, #e0eafc, #cfdef3)', 4.1)],
  SUSTAINABILITY: [createPlaceholderAsset('sustain1', 'Atmospheric Carbon Capture', 'Deploy a personal, large-scale carbon capture facility.', 'linear-gradient(135deg, #ff00cc, #333399)', 3.6)],
  CONSERVATION: [createPlaceholderAsset('conserve1', 'Species Revival', 'Fund a de-extinction project for an extinct species.', 'linear-gradient(135deg, #434343, #000000)', 4.4)],
  EXPLORATION: [createPlaceholderAsset('explore1', 'First Contact Mission', 'Fund a mission to explore a previously uncharted region of the Earth.', 'linear-gradient(135deg, #373b44, #4286f4)', 3.9)],
  ADVENTURE: [createPlaceholderAsset('adv2', 'Volcano Luge', 'A custom-built luge track down the side of an active volcano.', 'linear-gradient(135deg, #8e0e00, #1f1c18)', 3.7)],
  CULINARY_ARTS: [createPlaceholderAsset('cul1', 'Personal Michelin Chef', 'Retain a 3-star Michelin chef for your personal, exclusive service.', 'linear-gradient(135deg, #00f260, #0575e6)', 2.8)],
  VITICULTURE: [createPlaceholderAsset('viti1', 'Bespoke Grand Cru', 'Create your own vintage with a legendary Bordeaux or Burgundy estate.', 'linear-gradient(135deg, #536976, #292e49)', 2.9)],
  DISTILLING: [createPlaceholderAsset('dist1', '50-Year-Old Scotch Cask', 'Acquire a full cask of exceptionally rare, aged single malt scotch.', 'linear-gradient(135deg, #eacda3, #d6ae7b)', 2.6)],
  PERFUMERY: [createPlaceholderAsset('perf1', 'Signature Scent Creation', 'Work with a master perfumer in Grasse to create a unique personal fragrance.', 'linear-gradient(135deg, #09203f, #537895)', 2.1)],
  HOROLOGY: [createPlaceholderAsset('horo1', 'Grand Complication Watch', 'Commission a unique, grand complication timepiece from a master watchmaker.', 'linear-gradient(135deg, #141e30, #243b55)', 3.4)],
  JEWELRY: [createPlaceholderAsset('jewel1', 'Crown Jewel Acquisition', 'Acquire a historically significant piece of jewelry from a royal collection.', 'linear-gradient(135deg, #360033, #0b8793)', 3.5)],
  GEMOLOGY: [createPlaceholderAsset('gem1', 'Uncut Diamond Sourcing', 'Source a large, flawless rough diamond directly from the mine.', 'linear-gradient(135deg, #2c3e50, #d3cce3)', 3.1)],
  HAUTE_COUTURE: [createPlaceholderAsset('hc1', 'Personal Atelier', 'Establish a private atelier with a renowned fashion designer.', 'linear-gradient(135deg, #e0eafc, #cfdef3)', 2.9)],
  AUTOMOTIVE_DESIGN: [createPlaceholderAsset('ad1', 'Concept Car Realization', 'Purchase and make road-legal a one-off automotive concept car.', 'linear-gradient(135deg, #00467f, #a5cc82)', 3.8)],
  RACING: [createPlaceholderAsset('race1', 'F1 Team Ownership', 'Acquire a controlling stake in a Formula 1 racing team.', 'linear-gradient(135deg, #d31027, #ea384d)', 4.2)],
  EQUESTRIAN: [createPlaceholderAsset('eq1', 'Champion Thoroughbred Stable', 'Build a stable of thoroughbreds to compete in the Triple Crown.', 'linear-gradient(135deg, #0575e6, #00f260)', 3.0)],
  POLO: [createPlaceholderAsset('polo1', 'Private Polo Grounds', 'Construct and maintain a world-class polo club for personal use.', 'linear-gradient(135deg, #ff00cc, #333399)', 2.7)],
  SAILING: [createPlaceholderAsset('sail1', 'America\'s Cup Syndicate', 'Form and fund a syndicate to compete for the America\'s Cup.', 'linear-gradient(135deg, #536976, #292e49)', 3.6)],
  AVIATION_ACROBATICS: [createPlaceholderAsset('aa1', 'Personal Airshow Team', 'Establish and sponsor a professional aerial acrobatics team.', 'linear-gradient(135deg, #eacda3, #d6ae7b)', 2.8)],
  MOUNTAINEERING: [createPlaceholderAsset('mount1', 'First Ascent Sponsorship', 'Sponsor an expedition to be the first to summit an unclimbed peak.', 'linear-gradient(135deg, #141e30, #243b55)', 3.3)],
  POLAR_EXPEDITIONS: [createPlaceholderAsset('polar1', 'North Pole Habitation', 'Construct a permanent, luxury habitat at the geographic North Pole.', 'linear-gradient(135deg, #232526, #414345)', 4.0)],
  ARCHAEOLOGY: [createPlaceholderAsset('archaeo1', 'Fund a Major Dig', 'Privately fund an archaeological excavation of a major historical site.', 'linear-gradient(135deg, #1e3c72, #2a5298)', 3.1)],
  PALEONTOLOGY: [createPlaceholderAsset('paleo1', 'T-Rex Skeleton Acquisition', 'Acquire a complete Tyrannosaurus Rex skeleton for private display.', 'linear-gradient(135deg, #fdfc47, #24fe41)', 3.9)],
  ASTRONOMY: [createPlaceholderAsset('astro1', 'Private Observatory', 'Build a research-grade astronomical observatory in a prime location like Atacama.', 'linear-gradient(135deg, #00c6ff, #0072ff)', 3.7)],
  ASTROPHYSICS: [createPlaceholderAsset('astrop1', 'Exoplanet Discovery Program', 'Fund a program that provides private access to a space telescope for finding exoplanets.', 'linear-gradient(135deg, #606c88, #3f4c6b)', 4.3)],
  OCEANOGRAPHY: [createPlaceholderAsset('ocean1', 'Seafloor Mapping', 'Commission a private vessel to map a previously uncharted area of the ocean floor.', 'linear-gradient(135deg, #56ab2f, #a8e063)', 3.4)],
  METEOROLOGY: [createPlaceholderAsset('meteo1', 'Weather Control (Beta)', 'Access to experimental, localized weather modification technology.', 'linear-gradient(135deg, #000046, #1cb5e0)', 4.5)],
  GEOLOGY: [createPlaceholderAsset('geo1', 'Volcano Monitoring', 'Install a private, advanced monitoring system on an active volcano.', 'linear-gradient(135deg, #3a6186, #89253e)', 3.2)],
  CARTOGRAPHY: [createPlaceholderAsset('carto1', 'Personalized World Atlas', 'Commission a master cartographer to create a hand-drawn atlas of your travels.', 'linear-gradient(135deg, #0f2027, #2c5364)', 2.2)],
  CRYPTOGRAPHY: [createPlaceholderAsset('crypto1', 'Break Unbreakable Codes', 'Commission a team of mathematicians to crack famous unsolved ciphers.', 'linear-gradient(135deg, #134e5e, #71b280)', 3.8)],
  LINGUISTICS: [createPlaceholderAsset('ling1', 'Revive a Dead Language', 'Fund a project to revive and reintroduce a dormant or extinct language.', 'linear-gradient(135deg, #e0eafc, #cfdef3)', 2.5)],
  PHILOSOPHY: [createPlaceholderAsset('philo1', 'Modern Day Salon', 'Host a series of philosophical debates with the world\'s greatest living thinkers.', 'linear-gradient(135deg, #ff00cc, #333399)', 2.3)],
  HISTORY: [createPlaceholderAsset('hist1', 'Historical Document Collection', 'Acquire original, significant historical documents and manuscripts.', 'linear-gradient(135deg, #434343, #000000)', 3.0)],
  ANTHROPOLOGY: [createPlaceholderAsset('anthro1', 'Uncontacted Tribe Study', 'Fund a non-invasive, long-term anthropological study.', 'linear-gradient(135deg, #373b44, #4286f4)', 3.5)],
  SOCIOLOGY: [createPlaceholderAsset('soc1', 'Longitudinal Study', 'Commission a multi-generational study on a sociological topic of your choice.', 'linear-gradient(135deg, #8e0e00, #1f1c18)', 2.9)],
  PSYCHOLOGY: [createPlaceholderAsset('psych1', 'Consciousness Research', 'Fund a leading-edge laboratory dedicated to the study of consciousness.', 'linear-gradient(135deg, #00f260, #0575e6)', 3.6)],
  THEOLOGY: [createPlaceholderAsset('theo1', 'Ancient Texts Access', 'Gain private access to view the world\'s most protected religious texts.', 'linear-gradient(135deg, #536976, #292e49)', 3.1)],
  MYTHOLOGY: [createPlaceholderAsset('myth1', 'Locate Mythical Artifacts', 'Fund expeditions to search for the historical basis of mythological artifacts.', 'linear-gradient(135deg, #eacda3, #d6ae7b)', 3.4)],
  LITERATURE: [createPlaceholderAsset('lit1', 'Patron of Letters', 'Become the sole patron of a promising novelist for their entire career.', 'linear-gradient(135deg, #09203f, #537895)', 2.4)],
  POETRY: [createPlaceholderAsset('poet1', 'Poet Laureate', 'Establish a private, international poet laureate prize.', 'linear-gradient(135deg, #141e30, #243b55)', 2.0)],
  MUSIC_COMPOSITION: [createPlaceholderAsset('music1', 'Symphony Commission', 'Commission a major new work from a world-renowned composer.', 'linear-gradient(135deg, #360033, #0b8793)', 2.6)],
  SCULPTURE: [createPlaceholderAsset('sculpt1', 'Monumental Commission', 'Commission a monumental sculpture for a public or private space.', 'linear-gradient(135deg, #2c3e50, #d3cce3)', 2.8)],
  PAINTING: [createPlaceholderAsset('paint1', 'Old Master Commission', 'Commission a master artist who works in classical techniques to create a personal masterpiece.', 'linear-gradient(135deg, #e0eafc, #cfdef3)', 2.7)],
  PHOTOGRAPHY: [createPlaceholderAsset('photo1', 'Lifetime Archive Acquisition', 'Acquire the complete lifetime archive of a legendary photographer.', 'linear-gradient(135deg, #00467f, #a5cc82)', 2.5)],
};

const INITIAL_BOOKING_STATE: BookingState = {
  isBooking: false,
  asset: null,
  step: 'details',
  itinerary: { pax: '1', timeline: '', requests: '' },
};

// --- HIGH-FREQUENCY TRADING SIMULATOR ---
const MarketVelocityTicker: React.FC = () => {
  const [marketData, setMarketData] = useState({
    globalDemand: 42.8,
    assetFlux: 1.7,
    networkIntegrity: 100,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => ({
        globalDemand: prev.globalDemand + (Math.random() - 0.5) * 0.2,
        assetFlux: prev.assetFlux + (Math.random() - 0.48) * 0.1,
        networkIntegrity: 100 - Math.random() * 0.05,
      }));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const styles = {
    container: {
      display: 'flex',
      gap: '40px',
      color: '#666',
      fontSize: '0.8rem',
      letterSpacing: '1px',
      textTransform: 'uppercase' as const,
    },
    item: { display: 'flex', alignItems: 'center', gap: '10px' },
    label: {},
    value: (color: string) => ({
      color,
      fontSize: '1rem',
      fontFamily: 'monospace',
      minWidth: '70px',
      textAlign: 'right' as const,
    }),
  };

  return (
    <div style={styles.container}>
      <div style={styles.item}>
        <span style={styles.label}>Global Demand Index</span>
        <span style={styles.value('#00ff00')}>{marketData.globalDemand.toFixed(2)}</span>
      </div>
      <div style={styles.item}>
        <span style={styles.label}>Asset Flux</span>
        <span style={styles.value('#ffa500')}>{marketData.assetFlux.toFixed(3)} ÃŽâ€ /s</span>
      </div>
      <div style={styles.item}>
        <span style={styles.label}>Network Integrity</span>
        <span style={styles.value('#00ffff')}>{marketData.networkIntegrity.toFixed(4)}%</span>
      </div>
    </div>
  );
};


const ConciergeService: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Category>('JETS');
  const [booking, setBooking] = useState<BookingState>(INITIAL_BOOKING_STATE);

  // --- STYLES OBJECT (EXPANDED) ---
  const styles = {
    container: {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      backgroundColor: '#050505',
      color: '#ffffff',
      minHeight: '100vh',
      padding: '40px',
      boxSizing: 'border-box' as const,
      overflow: 'hidden',
      position: 'relative' as const,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      borderBottom: '1px solid #333',
      paddingBottom: '20px',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 300,
      letterSpacing: '4px',
      color: '#d4af37',
      textTransform: 'uppercase' as const,
      margin: 0,
    },
    subtitle: { fontSize: '0.9rem', color: '#888', letterSpacing: '1px' },
    nav: { display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' as const, maxHeight: '110px', overflowY: 'auto' as const },
    navItem: (isActive: boolean) => ({
      background: 'none',
      border: 'none',
      color: isActive ? '#d4af37' : '#666',
      fontSize: '0.9rem',
      cursor: 'pointer',
      padding: '8px 0',
      borderBottom: isActive ? '2px solid #d4af37' : '2px solid transparent',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase' as const,
      letterSpacing: '1.5px',
      whiteSpace: 'nowrap' as const,
    }),
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '30px',
    },
    card: {
      backgroundColor: '#111',
      border: '1px solid #222',
      borderRadius: '4px',
      overflow: 'hidden',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
      position: 'relative' as const,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    cardImage: (gradient: string) => ({
      height: '220px',
      width: '100%',
      background: gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    cardContent: { padding: '25px', flexGrow: 1, display: 'flex', flexDirection: 'column' as const },
    cardTitle: { fontSize: '1.5rem', margin: '0 0 10px 0', color: '#fff', fontWeight: 400 },
    cardMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      color: '#d4af37',
      fontSize: '0.8rem',
      textTransform: 'uppercase' as const,
      marginBottom: '15px',
      letterSpacing: '1px',
    },
    cardDesc: { color: '#aaa', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px', flexGrow: 1 },
    specsList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap' as const, gap: '10px' },
    specTag: {
      background: 'rgba(212, 175, 55, 0.1)',
      color: '#d4af37',
      padding: '5px 10px',
      borderRadius: '2px',
      fontSize: '0.75rem',
    },
    modalOverlay: {
      position: 'fixed' as const,
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
    },
    modal: {
      width: '650px',
      backgroundColor: '#0a0a0a',
      border: '1px solid #333',
      padding: '40px',
      position: 'relative' as const,
      boxShadow: '0 0 50px rgba(212, 175, 55, 0.1)',
    },
    modalTitle: { fontSize: '2rem', color: '#d4af37', marginBottom: '10px', fontFamily: 'serif' },
    actionButton: {
      width: '100%',
      padding: '15px',
      backgroundColor: '#d4af37',
      color: '#000',
      border: 'none',
      fontSize: '1rem',
      fontWeight: 'bold',
      textTransform: 'uppercase' as const,
      letterSpacing: '2px',
      cursor: 'pointer',
      marginTop: '30px',
      transition: 'background 0.3s',
    },
    closeButton: {
      position: 'absolute' as const,
      top: '20px',
      right: '20px',
      background: 'transparent',
      border: 'none',
      color: '#fff',
      fontSize: '1.5rem',
      cursor: 'pointer',
    },
    formGroup: { marginBottom: '20px' },
    formLabel: { display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem' },
    formInput: {
      width: '100%',
      background: '#111',
      border: '1px solid #333',
      color: '#fff',
      padding: '12px',
      fontSize: '1rem',
      boxSizing: 'border-box' as const,
    },
  };

  const handleAssetSelect = (asset: Asset) => {
    setBooking({ ...INITIAL_BOOKING_STATE, isBooking: true, asset });
  };

  const closeBooking = () => {
    setBooking(INITIAL_BOOKING_STATE);
  };

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBooking(prev => ({ ...prev, itinerary: { ...prev.itinerary, [name]: value } }));
  };

  const nextStep = () => {
    if (booking.step === 'details') setBooking(prev => ({ ...prev, step: 'comms' }));
    if (booking.step === 'comms') setBooking(prev => ({ ...prev, step: 'auth' }));
    if (booking.step === 'auth') {
      // Simulate auth delay
      setTimeout(() => setBooking(prev => ({ ...prev, step: 'confirmed' })), 1500);
    }
  };

  const renderBookingWizard = () => {
    if (!booking.asset) return null;

    switch (booking.step) {
      case 'details':
        return (
          <>
            <h2 style={styles.modalTitle}>Itinerary Details</h2>
            <p style={{ color: '#ccc', marginBottom: '30px' }}>
              Specify logistics for <strong>{booking.asset.title}</strong>.
            </p>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Participants (Pax)</label>
              <input style={styles.formInput} type="number" name="pax" value={booking.itinerary.pax} onChange={handleBookingChange} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Timeline / Dates</label>
              <input style={styles.formInput} type="text" name="timeline" placeholder="e.g., Immediate, 24h / May 10-15" value={booking.itinerary.timeline} onChange={handleBookingChange} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Special Requests</label>
              <textarea style={{...styles.formInput, height: '100px'}} name="requests" placeholder="e.g., Specific catering, security needs..." value={booking.itinerary.requests} onChange={handleBookingChange}></textarea>
            </div>
            <button style={styles.actionButton} onClick={nextStep}>Proceed to Comms</button>
          </>
        );
      case 'comms':
        return (
          <>
            <h2 style={styles.modalTitle}>Secure Channel</h2>
            <p style={{ color: '#ccc', marginBottom: '30px' }}>Select your preferred channel for concierge contact.</p>
            {['Encrypted Signal', 'Neural Link (Beta)', 'Courier (Analog)', 'Standard Voice'].map(channel => (
              <div key={channel} style={{ background: '#111', padding: '15px', border: '1px solid #333', marginBottom: '10px', cursor: 'pointer' }}>
                {channel}
              </div>
            ))}
            <button style={styles.actionButton} onClick={nextStep}>Proceed to Authorization</button>
          </>
        );
      case 'auth':
        return (
          <div style={{ textAlign: 'center' }}>
            <h2 style={styles.modalTitle}>Biometric Authorization</h2>
            <p style={{ color: '#ccc', marginBottom: '30px' }}>Awaiting authorization from your primary device.</p>
            <div style={{ fontSize: '5rem', color: '#d4af37', margin: '40px 0', animation: 'pulse 1.5s infinite' }}>â˜£</div>
            <p style={{ color: '#666', fontStyle: 'italic' }}>Broadcasting quantum-entangled key...</p>
          </div>
        );
      case 'confirmed':
        return (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '4rem', color: '#d4af37', marginBottom: '20px' }}>âœ“</div>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '10px' }}>Access Granted</h2>
            <p style={{ color: '#888' }}>
              The <strong>{booking.asset.title}</strong> has been secured.
              <br />
              Your Concierge Manager is now preparing the itinerary.
            </p>
            <button style={{...styles.actionButton, background: '#333', color: '#fff', marginTop: '40px'}} onClick={closeBooking}>
              Return to Balcony
            </button>
          </div>
        );
    }
  };

  return (
    <div style={styles.container}>
      <ConciergeAnimationStyles />
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>The Balcony of Prosperity</h1>
          <span style={styles.subtitle}>Concierge & Lifestyle Management</span>
        </div>
        <MarketVelocityTicker />
      </header>

      <nav style={styles.nav}>
        {(Object.keys(ASSETS) as Category[]).map((tab) => (
          <button key={tab} style={styles.navItem(activeTab === tab)} onClick={() => setActiveTab(tab)}>
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </nav>

      <main style={styles.grid}>
        {ASSETS[activeTab].map((asset) => (
          <div 
            key={asset.id} 
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => handleAssetSelect(asset)}
          >
            <div style={styles.cardImage(asset.image)}>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '3rem', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '10px' }}>
                {activeTab.slice(0, -1)}
              </span>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.cardMeta}>
                <span>{asset.availability}</span>
                <span>ID: {asset.id.toUpperCase()}</span>
              </div>
              <h3 style={styles.cardTitle}>{asset.title}</h3>
              <p style={styles.cardDesc}>{asset.description}</p>
              <ul style={styles.specsList}>
                {asset.specs.map((spec, i) => (
                  <li key={i} style={styles.specTag}>{spec}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </main>

      {booking.isBooking && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <button style={styles.closeButton} onClick={closeBooking}>Ã—</button>
            {renderBookingWizard()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConciergeService;