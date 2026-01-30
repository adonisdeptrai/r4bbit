import { Product, ProductType, Review, FAQItem } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'GenLogin Auto-Farmer',
    type: ProductType.SCRIPT,
    price: 49.99,
    originalPrice: 79.99,
    description: 'Automated account farming script for GenLogin browser. Supports multi-threading and proxy rotation.',
    features: ['Anti-Fingerprint', 'Auto-Captcha Solver', 'Proxy Rotation', 'Automation', 'Browser'],
    image: 'https://placehold.co/600x400/06b6d4/ffffff?text=Auto-Farmer',
    rating: 4.8,
    sales: 1240,
    // tags: ['Automation', 'Browser'],
    platform: 'GenLogin',
    reviewsCount: 156
  },
  {
    id: 'p2',
    title: 'GPM Login Manager',
    type: ProductType.TOOL,
    price: 129.00,
    description: 'All-in-one dashboard for managing 1000+ accounts across different platforms simultaneously.',
    features: ['Dashboard UI', 'Mass Action', 'Analytics', 'Management', 'Enterprise'],
    image: 'https://placehold.co/600x400/0f172a/06b6d4?text=GPM+Manager',
    rating: 4.9,
    sales: 850,
    // tags: ['Management', 'Enterprise'],
    platform: 'GPM Login',
    reviewsCount: 124
  },
  {
    id: 'p3',
    title: 'MoreLogin Spoofer',
    type: ProductType.SCRIPT,
    price: 89.50,
    description: 'Advanced node interaction script for airdrop farming. Mimics organic user behavior.',
    features: ['Randomized Delays', 'Wallet Integration', 'Log Cleaner', 'Crypto', 'Airdrop'],
    image: 'https://placehold.co/600x400/22d3ee/0f172a?text=Node+Spoofer',
    rating: 4.7,
    sales: 2100,
    // tags: ['Crypto', 'Airdrop'],
    platform: 'MoreLogin',
    reviewsCount: 312
  },
  {
    id: 'p4',
    title: 'Elite Dropshipping Course',
    type: ProductType.COURSE,
    price: 19.99,
    description: 'Comprehensive guide to scaling e-commerce stores using automation tools.',
    features: ['Video Lessons', 'PDF Guides', 'Private Group', 'Education', 'E-com'],
    image: 'https://placehold.co/600x400/fdfbf7/0f172a?text=Course',
    rating: 4.5,
    sales: 300,
    // tags: ['Education', 'E-com'],
    platform: 'Universal',
    reviewsCount: 45
  },
  {
    id: 'p5',
    title: 'GPM Login License (1 Month)',
    type: ProductType.KEY,
    price: 15.00,
    description: 'Official license key for GPM Login anti-detect browser. Instant delivery via email.',
    features: ['1 Month Access', 'Unlimited Profiles', 'API Access', 'License', 'Browser'],
    image: 'https://placehold.co/600x400/10b981/ffffff?text=License+Key',
    rating: 5.0,
    sales: 5000,
    // tags: ['License', 'Browser'],
    platform: 'GPM Login',
    reviewsCount: 890
  },
  {
    id: 'p6',
    title: 'Hidemyacc Auto-Reg',
    type: ProductType.SCRIPT,
    price: 55.00,
    originalPrice: 85.00,
    description: 'Bulk account registration tool for Hidemyacc. Handles SMS verification automatically.',
    features: ['SMS integration', 'Captcha Solving', 'Fingerprint Guard', 'Account Reg', 'Automation'],
    image: 'https://placehold.co/600x400/8b5cf6/ffffff?text=Auto-Reg',
    rating: 4.6,
    sales: 920,
    // tags: ['Account Reg', 'Automation'],
    platform: 'Hidemyacc',
    reviewsCount: 67
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'r1',
    user: 'Alex_T88',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    comment: 'R4B tools transformed my workflow. Revenue increased by 300% in just one month. The auto-farm script is a beast.',
    rating: 5,
    date: '2h ago',
    platform: 'Discord',
    profit: '+$4,200/mo'
  },
  {
    id: 'r2',
    user: 'SarahM_Ads',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    comment: 'Support is top notch. Had an issue with proxy setup and they fixed it via TeamViewer in minutes. Truly enterprise grade.',
    rating: 5,
    date: '1d ago',
    platform: 'Telegram',
    profit: '+$1,850/wk'
  },
  {
    id: 'r3',
    user: 'CryptoKing',
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026302d',
    comment: 'The scripts are clean and efficient. Worth every penny for the time saved. ROI was hit in day 2.',
    rating: 4,
    date: '3d ago',
    platform: 'Discord',
    profit: '+$560/day'
  },
  {
    id: 'r4',
    user: 'MMO_Hunter',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    comment: 'Been using GenLogin with your scripts for 6 months. Zero bans. The fingerprint spoofing is legit.',
    rating: 5,
    date: '5d ago',
    platform: 'Telegram'
  },
  {
    id: 'r5',
    user: 'Jasmine_Dropship',
    avatar: 'https://i.pravatar.cc/150?u=a04258a2462d826712d',
    comment: 'Finally a tool provider that updates faster than the platforms patch things. Keeps my business running smooth.',
    rating: 5,
    date: '1w ago',
    platform: 'Email',
    profit: '+$9k/mo'
  },
  {
    id: 'r6',
    user: 'DevOps_Guy',
    avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d',
    comment: 'Clean code structure (I checked). No malware, no bloat. Just pure performance. Respect.',
    rating: 5,
    date: '2w ago',
    platform: 'Discord'
  }
];

export const FAQS: FAQItem[] = [
  {
    question: 'How do I receive my product?',
    answer: 'Immediately after payment, the system automatically sends the download link and license key to your email. You can also access them in your R4B dashboard.'
  },
  {
    question: 'Do you offer custom script development?',
    answer: 'Yes, we specialize in bespoke automation solutions for enterprise clients. If you need a custom feature or a private tool, contact our engineering team via Telegram for a quote.'
  },
  {
    question: 'Is it safe to use on main accounts?',
    answer: 'Our tools mimic human behavior with random delays and advanced fingerprint spoofing. While no tool is 100% risk-free, we have a 99.8% safety record over the last 12 months.'
  },
  {
    question: 'Can I transfer my license to another PC?',
    answer: 'Yes, you can reset your HWID (Hardware ID) once every 24 hours directly from the dashboard to switch devices freely.'
  }
];