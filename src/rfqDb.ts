import { RFQItem, RFQQuote, ChatMessage, FactoryListing, QuickNote, RFQStepperStatus, RFQHistoryEntry, FactoryReview, FactoryRatingBreakdown } from '../types';
import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, updateDoc } from 'firebase/firestore';

const STORAGE_KEY_RFQS = 'kevixa_rfqs_v1';
const STORAGE_KEY_QUOTES = 'kevixa_quotes_v1';
const STORAGE_KEY_MESSAGES = 'kevixa_messages_v1';
const STORAGE_KEY_FACTORIES = 'kevixa_factories_v1';
const STORAGE_KEY_REVIEWS = 'kevixa_factory_reviews_v1';

// Initial preloaded RFQs from the reference design
const INITIAL_RFQS: RFQItem[] = [
  {
    id: 'rfq-nyra-01',
    brandId: 'brand-nyra',
    brandName: 'Nyra Skin Labs',
    brandInitials: 'NS',
    brandLocation: 'Bengaluru, KA',
    brandTag: 'Verified Brand',
    timeAgo: '2h ago',
    urgency: 'rush',
    productName: '10% Niacinamide + Zinc Serum (30ml)',
    quantity: 10000,
    packageType: 'Amber Glass + Pipette',
    formulationType: 'Semi-Custom Formulation',
    certifications: ['Semi-Custom Formulation', 'Amber Glass + Pipette', 'ISO 22716 Base'],
    targetUnitPrice: 35.0,
    estimatedTotal: 350000,
    targetLeadTime: '2 Weeks',
    leadTimeBadgeNote: 'Ready base needed',
    status: 'active',
    stepperStatus: 'Negotiating',
    notes: 'Looking for fast formulation with pre-validated viscosity and stability test. Base batch must be ISO 22716 compliant.',
    internalNotes: [
      {
        id: 'memo-nyra-01',
        text: 'Internal finance team approved unit target up to ₹36/u for initial 10k run if cleanroom audit is validated.',
        author: 'Dr. Neha Sharma',
        role: 'Head of R&D',
        category: 'Budget',
        createdAt: Date.now() - 3600000 * 2,
        timestamp: '2 hours ago',
      },
      {
        id: 'memo-nyra-02',
        text: 'Received quote from Aura Formulations (₹34.20/u). Stability batch samples requested for pH 5.5 testing.',
        author: 'Kavita M.',
        role: 'Formulation Scientist',
        category: 'QC / Formulation',
        createdAt: Date.now() - 3600000 * 1,
        timestamp: '1 hour ago',
      }
    ],
    statusHistory: [
      {
        id: 'hist-nyra-02',
        fromStatus: 'Submitted',
        toStatus: 'Negotiating',
        changedBy: 'Dr. Neha Sharma',
        role: 'Head of R&D',
        timestamp: new Date(Date.now() - 3600000 * 1).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        relativeTime: '1 hour ago',
        createdAt: Date.now() - 3600000 * 1,
        durationInPrevStatus: '1 hr in Submitted',
        note: 'Negotiation phase initiated upon receiving quote from Aura Formulations (₹34.20/u). Sample tests underway.',
      },
      {
        id: 'hist-nyra-01',
        fromStatus: 'Draft',
        toStatus: 'Submitted',
        changedBy: 'Dr. Neha Sharma',
        role: 'Head of R&D',
        timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        relativeTime: '2 hours ago',
        createdAt: Date.now() - 3600000 * 2,
        durationInPrevStatus: '45 mins in Draft',
        note: 'Formulation brief published to verified CDSCO cleanroom manufacturer board.',
      }
    ],
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    quotesCount: 1,
    hasAlert: true,
    alertType: 'new_quote',
    alertTitle: 'New Factory Quote Added',
    alertMessage: 'Aura Formulations submitted a quote of ₹34.20/u with 2 weeks lead time.',
    alertTime: '1 hour ago',
    alertTimestamp: Date.now() - 3600000,
    alertDismissed: false,
    leadUnlocked: false,
    leadPrice: 500,
    directContact: {
      contactPerson: 'Dr. Neha Sharma (Head of R&D)',
      phone: '+91 98450 82910',
      email: 'neha@nyraskinlabs.com',
    },
  },
  {
    id: 'rfq-botanica-02',
    brandId: 'brand-botanica',
    brandName: 'Botanica Herbals',
    brandInitials: 'BH',
    brandLocation: 'Mumbai, MH',
    brandTag: 'Ayush License',
    timeAgo: '5h ago',
    urgency: 'standard',
    productName: 'Beetroot Vegan Tinted Lip Balm (15g Pot)',
    quantity: 5000,
    packageType: 'Matte Aluminum Tin',
    formulationType: '100% Organic Ayush',
    certifications: ['100% Organic Ayush', 'Matte Aluminum Tin', 'Cruelty Free'],
    targetUnitPrice: 48.0,
    estimatedTotal: 240000,
    targetLeadTime: '3 Weeks',
    leadTimeBadgeNote: 'Batch sampling open',
    status: 'active',
    stepperStatus: 'Submitted',
    notes: 'Pure cold-pressed coconut oil and beetroot extract pigment. Strict Ayush GMP certification needed.',
    internalNotes: [
      {
        id: 'memo-bot-01',
        text: 'Ayush licensing documents verified by legal. Awaiting matching quote from certified organic lines in Pune or Haridwar.',
        author: 'Vikram Mehta',
        role: 'Sourcing Director',
        category: 'General',
        createdAt: Date.now() - 3600000 * 4,
        timestamp: '4 hours ago',
      }
    ],
    statusHistory: [
      {
        id: 'hist-bot-01',
        fromStatus: 'Draft',
        toStatus: 'Submitted',
        changedBy: 'Vikram Mehta',
        role: 'Sourcing Director',
        timestamp: new Date(Date.now() - 3600000 * 5).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        relativeTime: '5 hours ago',
        createdAt: Date.now() - 3600000 * 5,
        durationInPrevStatus: '1 hr in Draft',
        note: 'Submitted 5,000 unit batch brief for 100% Organic Ayush lip balm formulation.',
      }
    ],
    createdAt: Date.now() - 5 * 60 * 60 * 1000,
    quotesCount: 0,
    leadUnlocked: false,
    leadPrice: 500,
    directContact: {
      contactPerson: 'Vikram Mehta (Sourcing Director)',
      phone: '+91 98201 55432',
      email: 'procurement@botanicaherbals.in',
    },
  },
  {
    id: 'rfq-luxederma-03',
    brandId: 'brand-luxederma',
    brandName: 'LuxeDerma Glow',
    brandInitials: 'LD',
    brandLocation: 'Delhi NCR',
    brandTag: 'D2C Series A',
    timeAgo: 'Yesterday',
    urgency: 'high_volume',
    productName: 'Barrier Repair Ceramide Cream (50ml)',
    quantity: 25000,
    packageType: 'Airless Acrylic Jar',
    formulationType: 'Full Custom R&D',
    certifications: ['Full Custom R&D', 'Airless Acrylic Jar', '5-Ceramide Matrix'],
    targetUnitPrice: 55.0,
    estimatedTotal: 1375000,
    targetLeadTime: '4 Weeks',
    leadTimeBadgeNote: 'Contract Ready',
    status: 'active',
    stepperStatus: 'Negotiating',
    notes: 'Premium bio-identical ceramide complex (NP, AP, EOP, Phytosphingosine) with airless pump packaging.',
    internalNotes: [
      {
        id: 'memo-luxe-01',
        text: 'Series A board meeting approved scaling target up to 35,000 units if lead time is kept under 3.5 weeks.',
        author: 'Aanya Singhania',
        role: 'VP Supply Chain',
        category: 'Timeline',
        createdAt: Date.now() - 86400000,
        timestamp: 'Yesterday',
      }
    ],
    statusHistory: [
      {
        id: 'hist-luxe-02',
        fromStatus: 'Submitted',
        toStatus: 'Negotiating',
        changedBy: 'Aanya Singhania',
        role: 'VP Supply Chain',
        timestamp: new Date(Date.now() - 3600000 * 18).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        relativeTime: '18 hours ago',
        createdAt: Date.now() - 3600000 * 18,
        durationInPrevStatus: '6 hrs in Submitted',
        note: 'Advanced to Negotiating. Received 2 quotes, conducting technical evaluation for 5-Ceramide Matrix.',
      },
      {
        id: 'hist-luxe-01',
        fromStatus: 'Draft',
        toStatus: 'Submitted',
        changedBy: 'Aanya Singhania',
        role: 'VP Supply Chain',
        timestamp: new Date(Date.now() - 86400000).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        relativeTime: 'Yesterday',
        createdAt: Date.now() - 86400000,
        durationInPrevStatus: '30 mins in Draft',
        note: 'High volume formulation RFQ published with custom airless jar specification.',
      }
    ],
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
    quotesCount: 2,
    hasAlert: true,
    alertType: 'status_change',
    alertTitle: 'Status Moved to Negotiating',
    alertMessage: 'RFQ advanced to Negotiating stage following technical review of factory quotes.',
    alertTime: '18 hours ago',
    alertTimestamp: Date.now() - 3600000 * 18,
    alertDismissed: false,
    leadUnlocked: false,
    leadPrice: 500,
    directContact: {
      contactPerson: 'Aanya Singhania (VP Supply Chain)',
      phone: '+91 99100 23847',
      email: 'aanya@luxedermaglow.com',
    },
  },
  {
    id: 'rfq-aura-botanics-04',
    brandId: 'brand-vedic',
    brandName: 'Vedic Glow Botanics',
    brandInitials: 'VG',
    brandLocation: 'Jaipur, RJ',
    brandTag: 'Ayush Certified',
    timeAgo: '1d ago',
    urgency: 'standard',
    productName: 'Kumkumadi Tailam Miraculous Facial Oil (30ml)',
    quantity: 6000,
    packageType: 'Frosted Glass Dropper',
    formulationType: '100% Organic Ayush',
    certifications: ['100% Organic Ayush', 'Authentic Tailam Process', 'GMP Certified'],
    targetUnitPrice: 62.0,
    estimatedTotal: 372000,
    targetLeadTime: '3 Weeks',
    leadTimeBadgeNote: 'Raw saffron supplied',
    status: 'active',
    stepperStatus: 'Submitted',
    notes: 'Traditional Ayurvedic formulation process with goat milk emulsion and Kashmiri saffron.',
    internalNotes: [],
    createdAt: Date.now() - 28 * 60 * 60 * 1000,
    quotesCount: 1,
  },
  {
    id: 'rfq-pureclean-05',
    brandId: 'brand-pureclean',
    brandName: 'PureCleanse D2C',
    brandInitials: 'PC',
    brandLocation: 'Hyderabad, TS',
    brandTag: 'Verified Brand',
    timeAgo: '2d ago',
    urgency: 'rush',
    productName: 'Salicylic Acid 2% BHA Gentle Foaming Cleanser (150ml)',
    quantity: 12000,
    packageType: 'Foamer Pump Bottle',
    formulationType: 'Semi-Custom Formulation',
    certifications: ['Semi-Custom Formulation', 'pH 5.5 Balanced', 'ISO 22716 Base'],
    targetUnitPrice: 42.0,
    estimatedTotal: 504000,
    targetLeadTime: '2 Weeks',
    leadTimeBadgeNote: 'High Priority',
    status: 'active',
    stepperStatus: 'Approved',
    notes: 'Sulfate-free formulation with botanical chamomile extract. Immediate test batch approved.',
    internalNotes: [
      {
        id: 'memo-pure-01',
        text: 'Final formulation and pre-production contract approved. Production kick-off scheduled for 1st of next month.',
        author: 'Procurement Team',
        role: 'Brand Lead',
        category: 'Negotiation',
        createdAt: Date.now() - 86400000 * 2,
        timestamp: '2d ago',
      }
    ],
    createdAt: Date.now() - 36 * 60 * 60 * 1000,
    quotesCount: 3,
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    rfqId: 'rfq-nyra-01',
    senderId: 'brand-nyra',
    senderName: 'Dr. Neha Sharma (Nyra Labs)',
    senderRole: 'brand',
    text: 'Hello Aura Formulations team! We have submitted our 10,000-unit Niacinamide serum RFQ. We need rapid turnaround on stability test samples.',
    timestamp: '11:20 AM',
  },
  {
    id: 'msg-2',
    rfqId: 'rfq-nyra-01',
    senderId: 'factory-aura',
    senderName: 'Rajesh Varma (Aura Formulations QA)',
    senderRole: 'factory',
    text: 'Good morning Dr. Neha! Our CDSCO COS-8 line in Baddi currently has active amber bottle stock and validated base batches. We can dispatch 500ml pre-pilot samples by Thursday.',
    timestamp: '11:35 AM',
  },
  {
    id: 'msg-3',
    rfqId: 'rfq-nyra-01',
    senderId: 'factory-aura',
    senderName: 'Rajesh Varma (Aura Formulations QA)',
    senderRole: 'factory',
    text: 'I have attached our COA specs sheet and ISO 22716 compliance documentation for your formulation review.',
    timestamp: '11:38 AM',
    hasAttachment: true,
    attachmentName: 'Aura_Niacinamide_COA_Spec_Sheet.pdf',
  },
];

export const INITIAL_FACTORIES: FactoryListing[] = [
  {
    id: 'factory-aura',
    name: 'Aura Formulations Pvt Ltd',
    tagline: 'Premier CDSCO Class 100,000 Cleanroom Manufacturer for High-Performance Active Serums & Creams',
    location: 'Baddi, Himachal Pradesh',
    licenseNumber: 'COS-HP/2022/8492',
    validity: 'Oct 2026 (Active)',
    cleanroomGrade: 'Class 100,000 (ISO 8)',
    capacityStatus: 'open',
    minOrderQuantity: 2500,
    specializations: ['Active Serums', 'Ceramide Creams', 'Lip Care', 'Sunscreens', 'Vegan', 'GMP Certified'],
    certifications: ['GMP Certified', 'ISO 22716', 'CDSCO COS-8', 'Vegan Compliant', 'Cruelty Free'],
    tags: ['GMP Certified', 'Vegan', 'Clean Beauty', 'ISO 22716'],
    rating: 4.9,
    reviewsCount: 38,
    ratingBreakdown: { communication: 4.9, leadTime: 4.8, quality: 5.0 },
    logoUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1UvmKFys7v_YGw2g4BRhQ1k31R6ZXL_Bsd9aqVhrWAQS8CrgCtbTomH-aJ-uGInjqPZq5esyCRT3M-hz2a0kRHA1WDDcjjkLccTMmUYEKdMPrShJQE-JzMVrnf-sT5tkJyKNKxuYgStC9MWIVLgVri6AO0VSPOPZQUHQ-0fHX1-M9S6S6PhuGasKSApoQUvfaEpj3VdVlqxLXhjL30pht3uc3CCabJqT3p_E6v_Fmz43kDC73miM_AptGE',
    contactPerson: 'Rajesh Varma (VP Technical Operations)',
    phone: '+91 98160 44210',
    email: 'qa@auraformulations.in',
    whatsapp: '+91 98160 44210',
    address: {
      streetPlot: 'Plot No. 42-B, Phase III',
      industrialArea: 'Baddi Industrial Area, Solan District',
      city: 'Baddi',
      state: 'Himachal Pradesh',
      pincode: '173205',
    },
  },
  {
    id: 'factory-biopharma',
    name: 'Biopharma Derma Labs',
    tagline: 'Class 10,000 Precision Cleanroom & Peptide Complex Specialist',
    location: 'Pune, Maharashtra',
    licenseNumber: 'COS-MH/2021/4102',
    validity: 'Aug 2027 (Active)',
    cleanroomGrade: 'Class 10,000 (ISO 7)',
    capacityStatus: 'open',
    minOrderQuantity: 5000,
    specializations: ['Clinical Skincare', 'Peptide Complexes', 'Foam Cleansers', 'GMP Certified', 'Clean Beauty'],
    certifications: ['GMP Certified', 'ISO 7 (Class 10,000)', 'Clean Beauty Certified', 'Dermatologist Tested'],
    tags: ['GMP Certified', 'Clean Beauty', 'Clinical Grade', 'ISO 7'],
    rating: 4.8,
    reviewsCount: 29,
    ratingBreakdown: { communication: 4.7, leadTime: 4.8, quality: 4.9 },
    logoUrl: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=150&auto=format&fit=crop&q=80',
    contactPerson: 'Dr. Sameer Joshi (Formulation Director)',
    phone: '+91 98220 19340',
    email: 'contact@biopharmaderma.com',
    whatsapp: '+91 98220 19340',
    address: {
      streetPlot: 'Plot 18, MIDC Bhosari',
      industrialArea: 'Bhosari Industrial Estate',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411026',
    },
  },
  {
    id: 'factory-vedic',
    name: 'Vedic Herbals & Oils Manufacturing',
    tagline: 'Authentic Ayush GMP Certified Cold-Pressed Botanical Extracts & Classical Tailams',
    location: 'Haridwar, Uttarakhand',
    licenseNumber: 'AYUSH-UK/2019/1890',
    validity: 'Dec 2028 (Active)',
    cleanroomGrade: 'Ayush GMP Certified',
    capacityStatus: 'limited',
    minOrderQuantity: 1000,
    specializations: ['Traditional Tailam', 'Cold-Pressed Oils', 'Herbal Extracts', 'Organic', 'Ayush Certified', 'Vegan', 'GMP Certified'],
    certifications: ['Ayush GMP Certified', 'India Organic (NPOP)', 'USDA Organic Compliant', '100% Vegan PETA'],
    tags: ['Organic', 'Vegan', 'Ayush Certified', 'GMP Certified', 'Cold-Pressed'],
    rating: 4.9,
    reviewsCount: 42,
    ratingBreakdown: { communication: 5.0, leadTime: 4.8, quality: 4.9 },
    logoUrl: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=150&auto=format&fit=crop&q=80',
    contactPerson: 'Acharya Devendra Shastri',
    phone: '+91 97190 28410',
    email: 'info@vedicherbals.co.in',
    whatsapp: '+91 97190 28410',
    address: {
      streetPlot: 'Khasra No. 104, SIDCUL Industrial Area',
      industrialArea: 'Integrated Industrial Estate',
      city: 'Haridwar',
      state: 'Uttarakhand',
      pincode: '249403',
    },
  },
  {
    id: 'factory-gujarat',
    name: 'Gujarat Cosmeceuticals & Aerosols Ltd',
    tagline: 'High-Speed Automated Aerosol, SPF Sunscreen & Emulsion Filling Lines',
    location: 'Ahmedabad, Gujarat',
    licenseNumber: 'COS-GJ/2023/5194',
    validity: 'Nov 2028 (Active)',
    cleanroomGrade: 'Class 100,000 (ISO 8)',
    capacityStatus: 'open',
    minOrderQuantity: 3000,
    specializations: ['SPF Sunscreens', 'Hair Serums', 'Aerosol Sprays', 'Body Butters', 'GMP Certified', 'Halal Certified'],
    certifications: ['GMP Certified', 'ISO 9001:2015', 'Cruelty Free', 'Halal Certified'],
    tags: ['GMP Certified', 'Halal Certified', 'Cruelty Free', 'SPF Sunscreens'],
    rating: 4.8,
    reviewsCount: 31,
    ratingBreakdown: { communication: 4.8, leadTime: 4.7, quality: 4.9 },
    logoUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=150&auto=format&fit=crop&q=80',
    contactPerson: 'Mehul Patel (Plant Manager)',
    phone: '+91 99250 88310',
    email: 'plant@gujaratcosmeceuticals.com',
    whatsapp: '+91 99250 88310',
    address: {
      streetPlot: 'Plot 77, GIDC Changodar',
      industrialArea: 'Sanand Industrial Corridor',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '382213',
    },
  },
  {
    id: 'factory-zenith',
    name: 'Zenith Private Label Cosmetics',
    tagline: 'Specialized Color Cosmetics, Lip Plumpers & Matte Velvet Pigment Cleanroom',
    location: 'Thane, Maharashtra',
    licenseNumber: 'COS-MH/2022/6721',
    validity: 'Jan 2027 (Active)',
    cleanroomGrade: 'Class 10,000 (ISO 7)',
    capacityStatus: 'open',
    minOrderQuantity: 2000,
    specializations: ['Matte Lipsticks', 'Lip Care', 'Color Cosmetics', 'BB Creams', 'Vegan', 'Cruelty Free', 'Clean Beauty', 'GMP Certified'],
    certifications: ['GMP Certified', '100% Vegan PETA Approved', 'Toxin-Free Clean Beauty'],
    tags: ['Vegan', 'Cruelty Free', 'Clean Beauty', 'GMP Certified', 'Color Cosmetics'],
    rating: 4.9,
    reviewsCount: 45,
    ratingBreakdown: { communication: 4.9, leadTime: 4.9, quality: 4.9 },
    logoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80',
    contactPerson: 'Anita Rao (Operations Head)',
    phone: '+91 98200 47210',
    email: 'orders@zenithprivatelabel.com',
    whatsapp: '+91 98200 47210',
    address: {
      streetPlot: 'Unit 4, Wagle Industrial Estate',
      industrialArea: 'Thane West Industrial Belt',
      city: 'Thane',
      state: 'Maharashtra',
      pincode: '400604',
    },
  },
];

// Seed initial post-completion verified reviews for factories
export const INITIAL_REVIEWS: FactoryReview[] = [
  {
    id: 'rev-aura-01',
    factoryId: 'factory-aura',
    factoryName: 'Aura Formulations Pvt Ltd',
    brandId: 'brand-nyra',
    brandName: 'Nyra Skin Labs',
    rfqId: 'rfq-nyra-01',
    productName: '10% Niacinamide + Zinc Serum (30ml)',
    batchUnits: 10000,
    communicationRating: 5,
    leadTimeRating: 5,
    qualityRating: 5,
    averageRating: 5.0,
    comment: 'Aura provided exceptional technical QA coordination throughout our pilot run. Batch stability passed all CDSCO preservative challenge testing. Delivered 3 days ahead of timeline with verified CoA.',
    createdAt: Date.now() - 3 * 86400000,
    dateFormatted: '3 days ago',
    verifiedProduction: true,
  },
  {
    id: 'rev-aura-02',
    factoryId: 'factory-aura',
    factoryName: 'Aura Formulations Pvt Ltd',
    brandId: 'brand-kaya',
    brandName: 'Kaya Derma Naturals',
    productName: 'Multi-Ceramide Barrier Repair Cream (50g)',
    batchUnits: 5000,
    communicationRating: 5,
    leadTimeRating: 4,
    qualityRating: 5,
    averageRating: 4.7,
    comment: 'Pharmaceutical grade cleanroom standard. Emulsification viscosity was uniform across all 5,000 units. Very proactive WhatsApp and email updates from Rajesh Varma.',
    createdAt: Date.now() - 9 * 86400000,
    dateFormatted: '1 week ago',
    verifiedProduction: true,
  },
  {
    id: 'rev-aura-03',
    factoryId: 'factory-aura',
    factoryName: 'Aura Formulations Pvt Ltd',
    brandId: 'brand-botanica',
    brandName: 'Botanica Organics',
    productName: 'SPF 50 PA++++ Hybrid Sunscreen Gel (50ml)',
    batchUnits: 3000,
    communicationRating: 5,
    leadTimeRating: 5,
    qualityRating: 5,
    averageRating: 5.0,
    comment: 'Zero white-cast sunscreen base with validated in-vitro spectrophotometer SPF testing. Smooth dispatch and impeccable child-proof tamper seals.',
    createdAt: Date.now() - 16 * 86400000,
    dateFormatted: '2 weeks ago',
    verifiedProduction: true,
  },
  {
    id: 'rev-biopharma-01',
    factoryId: 'factory-biopharma',
    factoryName: 'Biopharma Derma Labs',
    brandId: 'brand-renew',
    brandName: 'ReNew Aesthetics',
    productName: 'Copper Tripeptide-1 Firming Serum',
    batchUnits: 5000,
    communicationRating: 5,
    leadTimeRating: 4,
    qualityRating: 5,
    averageRating: 4.7,
    comment: 'Class 10,000 cleanroom precision. Dr. Joshi helped optimize peptide stability buffer at pH 6.2 with full analytical HPLC documentation.',
    createdAt: Date.now() - 6 * 86400000,
    dateFormatted: '6 days ago',
    verifiedProduction: true,
  },
  {
    id: 'rev-vedic-01',
    factoryId: 'factory-vedic',
    factoryName: 'Vedic Herbals & Oils Manufacturing',
    brandId: 'brand-ayur',
    brandName: 'AyurRoot Essentials',
    productName: 'Classical Kumkumadi Tailam (25ml)',
    batchUnits: 2000,
    communicationRating: 5,
    leadTimeRating: 5,
    qualityRating: 5,
    averageRating: 5.0,
    comment: 'Authentic 16-herb Kashaya decoction and cold-pressed sesame base. Ayush GMP compliance is 100% verified and documented.',
    createdAt: Date.now() - 8 * 86400000,
    dateFormatted: '1 week ago',
    verifiedProduction: true,
  },
];

class RFQDatabase {
  private rfqs: RFQItem[] = [];
  private quotes: RFQQuote[] = [];
  private messages: ChatMessage[] = [];
  private factories: FactoryListing[] = [];
  private reviews: FactoryReview[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedFactories = localStorage.getItem(STORAGE_KEY_FACTORIES);
      if (storedFactories) {
        try {
          const parsed: FactoryListing[] = JSON.parse(storedFactories);
          this.factories = INITIAL_FACTORIES.map(initF => {
            const found = parsed.find(p => p.id === initF.id);
            return found
              ? {
                  ...initF,
                  ...found,
                  specializations: Array.from(new Set([...initF.specializations, ...(found.specializations || [])])),
                  certifications: Array.from(new Set([...(initF.certifications || []), ...(found.certifications || [])])),
                  tags: Array.from(new Set([...(initF.tags || []), ...(found.tags || [])])),
                }
              : initF;
          });
          parsed.forEach(p => {
            if (!this.factories.some(f => f.id === p.id)) {
              this.factories.push(p);
            }
          });
        } catch {
          this.factories = [...INITIAL_FACTORIES];
        }
      } else {
        this.factories = [...INITIAL_FACTORIES];
        this.saveFactories();
      }

      const storedRfqs = localStorage.getItem(STORAGE_KEY_RFQS);
      if (storedRfqs) {
        const parsed: RFQItem[] = JSON.parse(storedRfqs);
        // Ensure all RFQs have stepperStatus, internalNotes, and statusHistory initialized
        this.rfqs = parsed.map(r => {
          const initialMatch = INITIAL_RFQS.find(initR => initR.id === r.id);
          const internalNotes = r.internalNotes && r.internalNotes.length > 0
            ? r.internalNotes
            : (initialMatch?.internalNotes || []);
          const stepperStatus = r.stepperStatus || initialMatch?.stepperStatus || (r.quotesCount > 0 ? 'Negotiating' : 'Submitted');
          const statusHistory = r.statusHistory && r.statusHistory.length > 0
            ? r.statusHistory
            : (initialMatch?.statusHistory || [
                {
                  id: `hist-auto-${r.id}`,
                  fromStatus: 'Draft',
                  toStatus: stepperStatus,
                  changedBy: r.brandName || 'Brand Team',
                  role: 'Brand Procurement',
                  timestamp: new Date(r.createdAt || Date.now() - 3600000).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  relativeTime: r.timeAgo || 'Recently',
                  createdAt: r.createdAt || Date.now() - 3600000,
                  note: `Formulation RFQ initialized in ${stepperStatus} status.`,
                },
              ]);

          const hasAlert = r.alertDismissed ? false : (r.hasAlert !== undefined ? r.hasAlert : (initialMatch?.hasAlert ?? (r.quotesCount > 0)));
          const alertType = r.alertType || initialMatch?.alertType || (r.quotesCount > 0 ? 'new_quote' : 'status_change');
          const alertTitle = r.alertTitle || initialMatch?.alertTitle || (r.quotesCount > 0 ? 'New Quote Received' : `Status Moved to ${stepperStatus}`);
          const alertMessage = r.alertMessage || initialMatch?.alertMessage || (r.quotesCount > 0 ? 'New cleanroom quote received for review.' : `Status progressed to ${stepperStatus}.`);
          const alertTime = r.alertTime || initialMatch?.alertTime || (r.timeAgo || 'Recently');
          const alertTimestamp = r.alertTimestamp || initialMatch?.alertTimestamp || r.createdAt;
          const alertDismissed = r.alertDismissed ?? false;

          return {
            ...r,
            internalNotes,
            stepperStatus,
            statusHistory,
            hasAlert,
            alertType,
            alertTitle,
            alertMessage,
            alertTime,
            alertTimestamp,
            alertDismissed,
          };
        });
        this.saveRFQs();
      } else {
        this.rfqs = [...INITIAL_RFQS];
        this.saveRFQs();
      }

      const storedQuotes = localStorage.getItem(STORAGE_KEY_QUOTES);
      if (storedQuotes) {
        this.quotes = JSON.parse(storedQuotes);
      } else {
        this.quotes = [
          {
            id: 'quote-01',
            rfqId: 'rfq-nyra-01',
            factoryId: 'factory-aura',
            factoryName: 'Aura Formulations',
            quotedUnitPrice: 34.2,
            quotedTotal: 342000,
            leadTimeWeeks: 2,
            minimumBatchUnits: 10000,
            paymentTerms: '50% advance, 50% dispatch against COA',
            notes: 'Includes amber glass with child-resistant dropper cap and CDSCO batch certificate.',
            status: 'pending',
            createdAt: Date.now() - 3600000,
          },
        ];
        this.saveQuotes();
      }

      const storedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (storedMessages) {
        this.messages = JSON.parse(storedMessages);
      } else {
        this.messages = [...INITIAL_MESSAGES];
        this.saveMessages();
      }

      const storedReviews = localStorage.getItem(STORAGE_KEY_REVIEWS);
      if (storedReviews) {
        try {
          this.reviews = JSON.parse(storedReviews);
        } catch {
          this.reviews = [...INITIAL_REVIEWS];
        }
      } else {
        this.reviews = [...INITIAL_REVIEWS];
        this.saveReviews();
      }
    } catch {
      this.rfqs = [...INITIAL_RFQS];
      this.quotes = [];
      this.messages = [...INITIAL_MESSAGES];
      this.reviews = [...INITIAL_REVIEWS];
    }

    // Attempt background Firestore sync
    this.syncFromFirestore();
  }

  private saveReviews() {
    try {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(this.reviews));
      this.notify();
    } catch (err) {
      console.warn('LocalStorage save reviews error:', err);
    }
  }

  public getReviewsForFactory(factoryId: string): FactoryReview[] {
    const targetId = (factoryId === 'factory-aura-demo' || factoryId.includes('aura')) ? 'factory-aura' : factoryId;
    return this.reviews.filter(r => r.factoryId === targetId || r.factoryId === factoryId);
  }

  public getAllReviews(): FactoryReview[] {
    return [...this.reviews];
  }

  public getFactoryRatingBreakdown(factoryId: string): FactoryRatingBreakdown {
    const targetId = (factoryId === 'factory-aura-demo' || factoryId.includes('aura')) ? 'factory-aura' : factoryId;
    const factoryReviews = this.reviews.filter(r => r.factoryId === targetId || r.factoryId === factoryId);
    const factory = this.getFactoryById(targetId) || this.getFactoryById(factoryId);

    if (factoryReviews.length === 0) {
      const fallback = factory?.rating || 4.8;
      return {
        communication: factory?.ratingBreakdown?.communication || fallback,
        leadTime: factory?.ratingBreakdown?.leadTime || fallback,
        quality: factory?.ratingBreakdown?.quality || fallback,
        overall: fallback,
        totalReviews: factory?.reviewsCount || 0,
      };
    }

    const totalComm = factoryReviews.reduce((sum, r) => sum + r.communicationRating, 0);
    const totalLead = factoryReviews.reduce((sum, r) => sum + r.leadTimeRating, 0);
    const totalQual = factoryReviews.reduce((sum, r) => sum + r.qualityRating, 0);
    const totalOverall = factoryReviews.reduce((sum, r) => sum + r.averageRating, 0);
    const count = factoryReviews.length;

    return {
      communication: Math.round((totalComm / count) * 10) / 10,
      leadTime: Math.round((totalLead / count) * 10) / 10,
      quality: Math.round((totalQual / count) * 10) / 10,
      overall: Math.round((totalOverall / count) * 10) / 10,
      totalReviews: count,
    };
  }

  public addFactoryReview(reviewData: {
    factoryId: string;
    factoryName: string;
    brandId: string;
    brandName: string;
    rfqId?: string;
    productName?: string;
    batchUnits?: number;
    communicationRating: number;
    leadTimeRating: number;
    qualityRating: number;
    comment: string;
  }): FactoryReview {
    const targetFactoryId = (reviewData.factoryId === 'factory-aura-demo' || reviewData.factoryId.includes('aura'))
      ? 'factory-aura'
      : reviewData.factoryId;

    const comm = Math.min(5, Math.max(1, reviewData.communicationRating));
    const lead = Math.min(5, Math.max(1, reviewData.leadTimeRating));
    const qual = Math.min(5, Math.max(1, reviewData.qualityRating));
    const averageRating = Math.round(((comm + lead + qual) / 3) * 10) / 10;

    const newReview: FactoryReview = {
      ...reviewData,
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      factoryId: targetFactoryId,
      communicationRating: comm,
      leadTimeRating: lead,
      qualityRating: qual,
      averageRating,
      createdAt: Date.now(),
      dateFormatted: 'Just now',
      verifiedProduction: true,
    };

    this.reviews.unshift(newReview);
    this.saveReviews();

    // Recalculate average rating & breakdown for this factory
    const breakdown = this.getFactoryRatingBreakdown(targetFactoryId);
    this.updateFactoryListing(targetFactoryId, {
      rating: breakdown.overall,
      reviewsCount: breakdown.totalReviews,
      ratingBreakdown: {
        communication: breakdown.communication,
        leadTime: breakdown.leadTime,
        quality: breakdown.quality,
      },
    });

    try {
      setDoc(doc(db, 'factory_reviews', newReview.id), newReview);
    } catch (err) {
      console.warn('Firestore review sync error (saved locally):', err);
    }

    return newReview;
  }

  public hasBrandReviewedRFQ(brandId: string, rfqId: string): boolean {
    return this.reviews.some(r => r.rfqId === rfqId && (r.brandId === brandId || !brandId));
  }

  public getReviewForRFQ(rfqId: string): FactoryReview | undefined {
    return this.reviews.find(r => r.rfqId === rfqId);
  }

  private saveRFQs() {
    try {
      localStorage.setItem(STORAGE_KEY_RFQS, JSON.stringify(this.rfqs));
      this.notify();
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }
  }

  private saveQuotes() {
    try {
      localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(this.quotes));
      this.notify();
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }
  }

  private saveMessages() {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(this.messages));
      this.notify();
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }
  }

  private saveFactories() {
    try {
      localStorage.setItem(STORAGE_KEY_FACTORIES, JSON.stringify(this.factories));
      this.notify();
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }
  }

  public getFactories(): FactoryListing[] {
    return [...this.factories];
  }

  public getFactoryById(id: string): FactoryListing | undefined {
    return this.factories.find(f => f.id === id);
  }

  public updateFactoryListing(factoryId: string, updates: Partial<FactoryListing>): FactoryListing | null {
    const targetId = (factoryId === 'factory-aura-demo' || factoryId.includes('aura')) ? 'factory-aura' : factoryId;
    let factory = this.factories.find(f => f.id === targetId || f.name.toLowerCase().includes(updates.name?.toLowerCase() || 'aura'));

    if (!factory && this.factories.length > 0) {
      factory = this.factories[0];
    }

    if (factory) {
      Object.assign(factory, updates);
      this.saveFactories();
      try {
        updateDoc(doc(db, 'factories', factory.id), factory as any);
      } catch (err) {
        console.warn('Firestore factory update sync failed, saved locally:', err);
      }
      return factory;
    }
    return null;
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  // Sync with Firestore safely
  private async syncFromFirestore() {
    try {
      const rfqsCol = collection(db, 'rfqs');
      const snapshot = await getDocs(rfqsCol);
      if (!snapshot.empty) {
        const firestoreRfqs: RFQItem[] = [];
        snapshot.forEach(docSnap => {
          firestoreRfqs.push(docSnap.data() as RFQItem);
        });
        if (firestoreRfqs.length > 0) {
          // Merge with local without duplicating
          const map = new Map<string, RFQItem>();
          this.rfqs.forEach(r => map.set(r.id, r));
          firestoreRfqs.forEach(r => map.set(r.id, r));
          this.rfqs = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
          this.saveRFQs();
        }
      }
    } catch (err) {
      console.log('Firestore offline / local fallback mode active:', err);
    }
  }

  public getRFQs(): RFQItem[] {
    return [...this.rfqs];
  }

  public getRFQById(id: string): RFQItem | undefined {
    return this.rfqs.find(r => r.id === id);
  }

  public async addRFQ(rfqData: Omit<RFQItem, 'id' | 'createdAt' | 'status' | 'quotesCount' | 'timeAgo' | 'brandInitials'> & { brandInitials?: string }): Promise<RFQItem> {
    const id = `rfq-${Date.now()}`;
    const initials = rfqData.brandInitials || 
      rfqData.brandName
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'BR';

    const now = Date.now();
    const formattedTimestamp = new Date(now).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const initialHistoryEntry: RFQHistoryEntry = {
      id: `hist-${now}`,
      fromStatus: 'Draft',
      toStatus: 'Submitted',
      changedBy: rfqData.brandName,
      role: 'Brand Team',
      timestamp: formattedTimestamp,
      relativeTime: 'Just now',
      createdAt: now,
      durationInPrevStatus: 'Draft finalized',
      note: 'Formulation RFQ created and published to CDSCO verified cleanroom manufacturer board.',
    };

    const newRFQ: RFQItem = {
      ...rfqData,
      id,
      brandInitials: initials,
      timeAgo: 'Just now',
      status: 'active',
      stepperStatus: 'Submitted',
      internalNotes: [],
      statusHistory: [initialHistoryEntry],
      quotesCount: 0,
      createdAt: now,
    };

    // Prepend to list
    this.rfqs = [newRFQ, ...this.rfqs];
    this.saveRFQs();

    // Async write to Firestore
    try {
      await setDoc(doc(db, 'rfqs', id), newRFQ);
    } catch (err) {
      console.warn('Firestore write failed, saved locally:', err);
    }

    return newRFQ;
  }

  public async submitQuote(quoteData: Omit<RFQQuote, 'id' | 'createdAt' | 'status'>): Promise<RFQQuote> {
    const id = `quote-${Date.now()}`;
    const newQuote: RFQQuote = {
      ...quoteData,
      id,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.quotes.unshift(newQuote);
    this.saveQuotes();

    // Update RFQ quotes count & status
    const targetRFQ = this.rfqs.find(r => r.id === quoteData.rfqId);
    if (targetRFQ) {
      targetRFQ.quotesCount = (targetRFQ.quotesCount || 0) + 1;
      targetRFQ.status = 'quoted';
      targetRFQ.hasAlert = true;
      targetRFQ.alertType = 'new_quote';
      targetRFQ.alertTitle = 'New Quote Received!';
      targetRFQ.alertMessage = `${quoteData.factoryName} submitted a quote at ₹${quoteData.quotedUnitPrice.toFixed(2)}/u (${quoteData.leadTimeWeeks}w lead time).`;
      targetRFQ.alertTime = 'Just now';
      targetRFQ.alertTimestamp = Date.now();
      targetRFQ.alertDismissed = false;
      this.saveRFQs();

      try {
        await updateDoc(doc(db, 'rfqs', targetRFQ.id), {
          quotesCount: targetRFQ.quotesCount,
          status: 'quoted',
          hasAlert: true,
          alertType: 'new_quote',
          alertTitle: targetRFQ.alertTitle,
          alertMessage: targetRFQ.alertMessage,
          alertTime: 'Just now',
          alertTimestamp: Date.now(),
          alertDismissed: false,
        });
        await setDoc(doc(db, 'quotes', id), newQuote);
      } catch (err) {
        console.warn('Firestore quote sync failed, saved locally:', err);
      }
    }

    return newQuote;
  }

  public declineRFQ(rfqId: string, reason?: string) {
    const rfq = this.rfqs.find(r => r.id === rfqId);
    if (rfq) {
      rfq.status = 'declined';
      if (reason) {
        rfq.notes = (rfq.notes ? rfq.notes + ' | ' : '') + `Declined: ${reason}`;
      }
      this.saveRFQs();

      try {
        updateDoc(doc(db, 'rfqs', rfqId), { status: 'declined' });
      } catch (err) {
        console.warn('Firestore decline sync failed:', err);
      }
    }
  }

  public unlockLead(rfqId: string) {
    const rfq = this.rfqs.find(r => r.id === rfqId);
    if (rfq) {
      rfq.leadUnlocked = true;
      this.saveRFQs();
      try {
        updateDoc(doc(db, 'rfqs', rfqId), { leadUnlocked: true });
      } catch (err) {
        console.warn('Firestore unlock sync failed:', err);
      }
    }
  }

  public relockLead(rfqId: string) {
    const rfq = this.rfqs.find(r => r.id === rfqId);
    if (rfq) {
      rfq.leadUnlocked = false;
      this.saveRFQs();
    }
  }

  public getQuotesForRFQ(rfqId: string): RFQQuote[] {
    return this.quotes.filter(q => q.rfqId === rfqId);
  }

  public getAllQuotes(): RFQQuote[] {
    return [...this.quotes];
  }

  public getMessages(rfqId?: string): ChatMessage[] {
    if (rfqId) {
      return this.messages.filter(m => m.rfqId === rfqId);
    }
    return [...this.messages];
  }

  public addMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: timeStr,
    };

    this.messages.push(newMsg);
    this.saveMessages();
    return newMsg;
  }

  public addInternalNote(
    rfqId: string,
    noteData: {
      text: string;
      author: string;
      role?: string;
      category?: QuickNote['category'];
    }
  ): QuickNote | null {
    const rfq = this.rfqs.find(r => r.id === rfqId);
    if (!rfq) return null;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today';

    const newNote: QuickNote = {
      id: `memo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: noteData.text.trim(),
      author: noteData.author || 'Brand Member',
      role: noteData.role || 'Brand Team',
      category: noteData.category || 'General',
      createdAt: Date.now(),
      timestamp: timeStr,
    };

    if (!rfq.internalNotes) {
      rfq.internalNotes = [];
    }

    // Prepend newest memo first
    rfq.internalNotes.unshift(newNote);
    this.saveRFQs();

    // Async write to Firestore if available
    try {
      updateDoc(doc(db, 'rfqs', rfqId), {
        internalNotes: rfq.internalNotes,
      });
    } catch (err) {
      console.warn('Firestore memo sync failed:', err);
    }

    return newNote;
  }

  public deleteInternalNote(rfqId: string, noteId: string): boolean {
    const rfq = this.rfqs.find(r => r.id === rfqId);
    if (!rfq || !rfq.internalNotes) return false;

    const prevLen = rfq.internalNotes.length;
    rfq.internalNotes = rfq.internalNotes.filter(n => n.id !== noteId);

    if (rfq.internalNotes.length !== prevLen) {
      this.saveRFQs();
      try {
        updateDoc(doc(db, 'rfqs', rfqId), {
          internalNotes: rfq.internalNotes,
        });
      } catch (err) {
        console.warn('Firestore note deletion sync failed:', err);
      }
      return true;
    }
    return false;
  }

  public updateRFQStepperStatus(
    rfqId: string,
    stepperStatus: RFQStepperStatus,
    changedBy?: string,
    role?: string,
    note?: string
  ): RFQHistoryEntry | null {
    const rfq = this.rfqs.find(r => r.id === rfqId);
    if (!rfq) return null;

    const oldStatus = rfq.stepperStatus || 'Submitted';

    rfq.stepperStatus = stepperStatus;
    if (stepperStatus === 'Approved') {
      rfq.status = 'contracted';
    } else if (stepperStatus === 'Negotiating') {
      rfq.status = 'quoted';
    }

    const now = Date.now();
    const formattedTimestamp = new Date(now).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (!rfq.statusHistory) {
      rfq.statusHistory = [];
    }

    // Calculate duration in previous stage
    let durationInPrevStatus: string | undefined;
    if (rfq.statusHistory.length > 0) {
      const lastEntry = rfq.statusHistory[0];
      const diffMs = Math.max(0, now - lastEntry.createdAt);
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) {
        durationInPrevStatus = `< 1 min in ${oldStatus}`;
      } else if (diffMins < 60) {
        durationInPrevStatus = `${diffMins} min${diffMins !== 1 ? 's' : ''} in ${oldStatus}`;
      } else {
        const diffHours = Math.floor(diffMins / 60);
        const remMins = diffMins % 60;
        durationInPrevStatus = remMins > 0 
          ? `${diffHours} hr ${remMins} min in ${oldStatus}` 
          : `${diffHours} hr${diffHours !== 1 ? 's' : ''} in ${oldStatus}`;
      }
    }

    const defaultNotes: Record<RFQStepperStatus, string> = {
      Draft: 'Reverted to Draft specifications for internal revision.',
      Submitted: 'Live and actively accepting manufacturer cleanroom quotes.',
      Negotiating: 'Reviewing factory commercial bids, MOQs, and batch testing certificates.',
      Approved: 'Commercial terms agreed. Pro-forma contract authorized for manufacturing batch.',
    };

    const newHistoryEntry: RFQHistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fromStatus: oldStatus,
      toStatus: stepperStatus,
      changedBy: changedBy || 'Brand Procurement Team',
      role: role || 'Brand Desk',
      timestamp: formattedTimestamp,
      relativeTime: 'Just now',
      createdAt: now,
      durationInPrevStatus,
      note: note || defaultNotes[stepperStatus] || `Moved status from ${oldStatus} to ${stepperStatus}`,
    };

    // Prepend newest first
    rfq.statusHistory.unshift(newHistoryEntry);

    // Set alert indicator for status change
    if (oldStatus !== stepperStatus) {
      rfq.hasAlert = true;
      rfq.alertType = 'status_change';
      rfq.alertTitle = `Stage Changed to ${stepperStatus}`;
      rfq.alertMessage = `RFQ moved from ${oldStatus} to ${stepperStatus}${changedBy ? ` by ${changedBy}` : ''}.`;
      rfq.alertTime = 'Just now';
      rfq.alertTimestamp = now;
      rfq.alertDismissed = false;
    }

    this.saveRFQs();
    try {
      updateDoc(doc(db, 'rfqs', rfqId), {
        stepperStatus,
        status: rfq.status,
        statusHistory: rfq.statusHistory,
        hasAlert: rfq.hasAlert,
        alertType: rfq.alertType,
        alertTitle: rfq.alertTitle,
        alertMessage: rfq.alertMessage,
        alertTime: rfq.alertTime,
        alertTimestamp: rfq.alertTimestamp,
        alertDismissed: rfq.alertDismissed,
      });
    } catch (err) {
      console.warn('Firestore stepper status update failed:', err);
    }

    return newHistoryEntry;
  }

  public dismissAlert(rfqId: string): void {
    const rfq = this.rfqs.find(r => r.id === rfqId);
    if (!rfq) return;

    rfq.hasAlert = false;
    rfq.alertDismissed = true;
    this.saveRFQs();
    try {
      updateDoc(doc(db, 'rfqs', rfqId), {
        hasAlert: false,
        alertDismissed: true,
      });
    } catch (err) {
      console.warn('Firestore dismiss alert sync failed:', err);
    }
  }

  public addStatusHistoryEntry(
    rfqId: string,
    entryData: {
      toStatus?: RFQStepperStatus;
      note: string;
      changedBy?: string;
      role?: string;
    }
  ): RFQHistoryEntry | null {
    const rfq = this.rfqs.find(r => r.id === rfqId);
    if (!rfq) return null;

    const currentStatus = rfq.stepperStatus || 'Submitted';
    const targetStatus = entryData.toStatus || currentStatus;

    return this.updateRFQStepperStatus(
      rfqId,
      targetStatus,
      entryData.changedBy,
      entryData.role,
      entryData.note
    );
  }

  public resetToDefaults() {
    this.rfqs = [...INITIAL_RFQS];
    this.saveRFQs();
  }
}

export const rfqDb = new RFQDatabase();
