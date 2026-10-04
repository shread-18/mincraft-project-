export type NutriGrade = 'A' | 'B' | 'C' | 'D' | 'E';
export type ConsumptionSignal = 'GOOD' | 'OK' | 'BAD';
export type HazardLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface VisualHarmEffect {
  title: string;
  desc: string;
  organ: 'teeth' | 'brain' | 'tummy' | 'energy' | 'heart';
}

export interface KidSuitability {
  isRecommendedForKids: boolean;
  minimumAge: number;
  hazardLevel: HazardLevel;
  kidWarningText: string;
  sugarSpoonsCount: number;
  harmfulAdditives?: string[];
  visualHarmEffects: VisualHarmEffect[];
}

export interface HealthierAlternative {
  name: string;
  brand: string;
  calories: number;
  sugar: number;
  fats: number;
  protein: number;
  benefitHighlight: string;
  badge: string;
}

export interface ARFloatingTag {
  label: string;
  type: 'warning' | 'positive' | 'neutral' | 'kid-alert';
  x: number;
  y: number;
}

export interface FoodItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  barcode?: string;
  calories: number;
  sugar: number;
  totalFats: number;
  saturatedFat?: number;
  protein: number;
  sodium?: number;
  allergens?: string[];
  recommendedAmount?: string;
  recommendedTime?: string;
  frequency?: string;
  positiveEffects?: string;
  excessIntakeEffects?: string;
  healthScore: number;
  nutriGrade: NutriGrade;
  consumptionSignal: ConsumptionSignal;
  caffeineMg?: number;
  sampleImage?: string;
  image?: string;
  kidSuitability: KidSuitability;
  healthierAlternatives: HealthierAlternative[];
  arFloatingTags: ARFloatingTag[];
}

export const OFFICIAL_HACKATHON_DATASET: FoodItem[] = [
  {
    id: 'P001',
    name: 'Yoga Bar Daily 10g Protein Bar',
    brand: 'Yoga Bar',
    category: 'Protein Bar',
    barcode: '8906089870012',
    calories: 180, // 180 kcal per 50g bar (360 kcal/100g)
    sugar: 14, // 14g from natural dates & cranberries (Date Sweetened)
    totalFats: 6.5,
    saturatedFat: 2.1,
    protein: 10, // Exact "DAILY 10g PROTEIN" verified from actual packaging
    sodium: 65,
    allergens: ['Almonds', 'Cashews', 'May contain Milk/Soy traces'],
    recommendedAmount: '1 bar (50g)',
    recommendedTime: 'Breakfast / post-workout / tiffin',
    frequency: 'Regularly / Active days',
    positiveEffects: 'Provides 10g clean protein from whole nuts, raw cold-pressed with natural date sweetness',
    excessIntakeEffects: 'Caloric accumulation if eaten in sedentary excess',
    healthScore: 78,
    nutriGrade: 'B',
    consumptionSignal: 'GOOD',
    sampleImage: '/products/p001_yogabar.webp',
    image: '/products/p001_yogabar.webp',
    kidSuitability: {
      isRecommendedForKids: true,
      minimumAge: 5,
      hazardLevel: 'low',
      kidWarningText: 'Wholesome whole-nut snack sweetened with real dates instead of refined sugar. Safe & nutritious for growing kids.',
      sugarSpoonsCount: 3.5,
      harmfulAdditives: [],
      visualHarmEffects: [
        {
          title: 'Steady Nut Energy',
          desc: 'Whole almonds and raw cold-pressed dates deliver smooth sustained fuel without refined sugar crashes.',
          organ: 'energy',
        },
      ],
    },
    healthierAlternatives: [
      {
        name: 'Roasted Pumpkin & Sunflower Seeds',
        brand: 'Nature Pantry',
        calories: 160,
        sugar: 1,
        fats: 12,
        protein: 9,
        benefitHighlight: 'Mineral rich (Zinc & Magnesium) without added sweeteners',
        badge: 'Seed Crunch Swap',
      },
    ],
    arFloatingTags: [
      { label: '✓ Daily 10g Protein', type: 'positive', x: 28, y: 32 },
      { label: '✓ Date Sweetened (No Corn Syrup)', type: 'positive', x: 68, y: 44 },
      { label: 'Raw Cold Pressed', type: 'positive', x: 45, y: 72 },
    ],
  },
  {
    id: 'P002',
    name: 'Fresh Malai Paneer',
    brand: 'Milk Mist',
    category: 'Dairy',
    barcode: '8906020580024',
    calories: 283,
    sugar: 5.1,
    totalFats: 22,
    saturatedFat: 14,
    protein: 16.1,
    sodium: 35,
    allergens: ['Milk / Lactose'],
    recommendedAmount: '50–100 g',
    recommendedTime: 'Lunch / dinner',
    frequency: 'Regularly',
    positiveEffects: 'Provides high biological value protein and calcium for strong bones and muscle repair',
    excessIntakeEffects: 'High calories and saturated fat if consumed in excessive portions without physical exercise',
    healthScore: 84,
    nutriGrade: 'A',
    consumptionSignal: 'GOOD',
    sampleImage: '/products/p001_yogabar.webp',
    image: '/products/p001_yogabar.webp',
    kidSuitability: {
      isRecommendedForKids: true,
      minimumAge: 1,
      hazardLevel: 'low',
      kidWarningText: 'Excellent natural calcium & protein source for growing bones. Safe and healthy in normal daily meals unless lactose intolerant.',
      sugarSpoonsCount: 1.2,
      harmfulAdditives: [],
      visualHarmEffects: [
        {
          title: 'Bone & Teeth Builder',
          desc: 'High natural calcium and phosphorus strengthen tooth enamel and support skeleton growth.',
          organ: 'teeth',
        },
      ],
    },
    healthierAlternatives: [
      {
        name: 'Low Fat Tofu / Organic Paneer',
        brand: 'Soya Fresh',
        calories: 145,
        sugar: 2,
        fats: 8,
        protein: 15,
        benefitHighlight: '60% less saturated fat, lighter on digestion',
        badge: 'Low Calorie',
      },
    ],
    arFloatingTags: [
      { label: '16.1g Pure Dairy Protein', type: 'positive', x: 30, y: 35 },
      { label: 'Rich Calcium for Kids', type: 'positive', x: 70, y: 45 },
      { label: 'Nutri-Grade A: Continuous GOOD', type: 'positive', x: 50, y: 75 },
    ],
  },
  {
    id: 'P003',
    name: 'High Protein Oats Dark Chocolate',
    brand: 'Yoga Bar',
    category: 'Oats & Cereals',
    barcode: '8906089870036',
    calories: 364,
    sugar: 5.9, // Verified "NO ADDED SUGAR" on front packaging
    totalFats: 5.9,
    saturatedFat: 1.8,
    protein: 26, // Verified "26% Protein" on front packaging
    sodium: 95,
    allergens: ['Oats (Gluten)', 'Milk', 'Soy', 'Nuts'],
    recommendedAmount: '40–50 g',
    recommendedTime: 'Breakfast',
    frequency: 'Daily',
    positiveEffects: 'Combines beta-glucan heart-healthy soluble fiber, real cocoa, probiotics, and 26% protein density',
    excessIntakeEffects: 'Excess calorie accumulation if oversized portions with heavy whole milk',
    healthScore: 88,
    nutriGrade: 'A',
    consumptionSignal: 'GOOD',
    sampleImage: '/products/p003_oats.jpg',
    image: '/products/p003_oats.jpg',
    kidSuitability: {
      isRecommendedForKids: true,
      minimumAge: 3,
      hazardLevel: 'low',
      kidWarningText: 'Golden breakfast choice! Verified NO ADDED SUGAR with added probiotics and real cocoa. Supports brain focus in school.',
      sugarSpoonsCount: 1.5,
      harmfulAdditives: [],
      visualHarmEffects: [
        {
          title: 'Steady Brain Focus',
          desc: 'Slow-release beta-glucan carbs keep attention sharp in school without sugar jitters or afternoon crashes.',
          organ: 'brain',
        },
      ],
    },
    healthierAlternatives: [
      {
        name: 'Rolled Oats with Fresh Berries',
        brand: 'Farm Pure',
        calories: 210,
        sugar: 4,
        fats: 3,
        protein: 11,
        benefitHighlight: 'Pure single-ingredient whole rolled oats',
        badge: 'Single Ingredient',
      },
    ],
    arFloatingTags: [
      { label: '✓ 26% Protein Density', type: 'positive', x: 25, y: 30 },
      { label: '✓ Stamped NO ADDED SUGAR', type: 'positive', x: 72, y: 48 },
      { label: 'Added Probiotics & Fiber', type: 'positive', x: 48, y: 70 },
    ],
  },
  {
    id: 'P004',
    name: 'Maggi 2-Minute Noodles',
    brand: 'Nestlé Maggi',
    category: 'Instant Noodles',
    barcode: '8901058850048',
    calories: 384,
    sugar: 1.8,
    totalFats: 12.5,
    saturatedFat: 6.2,
    protein: 8.2,
    sodium: 860, // 860mg sodium per 70g cake (~45% daily allowance)
    allergens: ['Wheat (Gluten)', 'May contain traces of Mustard & Milk'],
    recommendedAmount: '1 serving (70g pack)',
    recommendedTime: 'Lunch / evening (rare)',
    frequency: 'Occasionally / Strictly Limit',
    positiveEffects: 'Provides fast quick calories and comfort craving satisfaction',
    excessIntakeEffects: 'Excessive sodium (860mg) causing cellular fluid retention, dehydration, and blood pressure elevation',
    healthScore: 42,
    nutriGrade: 'D',
    consumptionSignal: 'BAD',
    sampleImage: '/products/p008_lays.webp',
    image: '/products/p008_lays.webp',
    kidSuitability: {
      isRecommendedForKids: false,
      minimumAge: 8,
      hazardLevel: 'high',
      kidWarningText: 'NOT recommended for regular consumption by children! High palm oil frying and very high sodium (860mg per brick) triggers dehydration and kidney vessel strain.',
      sugarSpoonsCount: 0.5,
      harmfulAdditives: ['Hydrolysed Groundnut Protein (Flavor enhancer)', 'E635 Disodium 5-ribonucleotides', 'Palm Oil'],
      visualHarmEffects: [
        {
          title: 'High Sodium Water Retention',
          desc: 'Loads children’s kidneys with 860mg salt in minutes, causing extreme thirst and arterial vessel strain.',
          organ: 'heart',
        },
        {
          title: 'Palm Oil Sluggishness',
          desc: 'Deep-fried processed dough takes longer to digest, causing heavy stomach fatigue and lethargy.',
          organ: 'energy',
        },
      ],
    },
    healthierAlternatives: [
      {
        name: 'Steamed Foxtail Millet Noodles',
        brand: 'Millet Magic',
        calories: 220,
        sugar: 1,
        fats: 2,
        protein: 9,
        benefitHighlight: 'Air-dried, zero palm oil, 75% lower sodium, pure ancient grain',
        badge: 'Palm Oil Free',
      },
      {
        name: 'Whole Wheat Veggie Hakka Ribbon',
        brand: 'Wholesome Wok',
        calories: 240,
        sugar: 1.5,
        fats: 2.5,
        protein: 10,
        benefitHighlight: 'Unfried wheat noodle with real dried spinach & carrots',
        badge: 'Fiber Rich',
      },
    ],
    arFloatingTags: [
      { label: '⚠️ 860mg Sodium (Sodium Bomb)', type: 'warning', x: 26, y: 35 },
      { label: 'Deep Fried in Palm Oil', type: 'warning', x: 74, y: 45 },
      { label: '🚫 Limit Continuous Consumption', type: 'kid-alert', x: 50, y: 75 },
    ],
  },
  {
    id: 'P005',
    name: 'Kinder Joy with Surprise (Blue Edition)',
    brand: 'Kinder (Ferrero)',
    category: 'Chocolate & Confectionery',
    barcode: '8000500170051',
    calories: 545,
    sugar: 51, // 51g sugar per 100g (10.2g sugar per single 20g egg)
    totalFats: 32,
    saturatedFat: 14.5,
    protein: 8.2,
    sodium: 180,
    allergens: ['Milk', 'Soy', 'Wheat (Gluten)'],
    recommendedAmount: '1 single egg (20g) on rare celebrations',
    recommendedTime: 'Rare dessert',
    frequency: 'Occasionally / Rare Treat',
    positiveEffects: 'Instant quick sugar sensation and hedonic taste pleasure for festive moments',
    excessIntakeEffects: 'Severe sugar surge (over 50% pure sugar), high saturated fat, rapid cavity formation, and hyperactivity crash',
    healthScore: 28,
    nutriGrade: 'E',
    consumptionSignal: 'BAD',
    sampleImage: '/products/p005_kinderjoy.webp',
    image: '/products/p005_kinderjoy.webp',
    kidSuitability: {
      isRecommendedForKids: false,
      minimumAge: 6,
      hazardLevel: 'critical',
      kidWarningText: 'CRITICAL CHILD WARNING: Over 51g of sugar per 100g (~2.5 spoons per small egg)! Directly linked to dental enamel decay, dopamine dependency, and pediatric mood volatility.',
      sugarSpoonsCount: 12.8,
      harmfulAdditives: ['Lecithins (Soy)', 'Vanillin Artificial Flavoring', 'Vegetable Fats (Palm, Sal)'],
      visualHarmEffects: [
        {
          title: 'Tooth Enamel Attack',
          desc: 'Sticky cocoa sugar adheres to teeth grooves, feeding oral Streptococcus mutans that create cavity acid.',
          organ: 'teeth',
        },
        {
          title: 'Severe Sugar Spikes & Meltdowns',
          desc: 'Blood glucose spikes in 12 minutes followed by a steep drop that triggers tantrums, fatigue, and irritability.',
          organ: 'brain',
        },
      ],
    },
    healthierAlternatives: [
      {
        name: 'Organic Strawberry Greek Yogurt Cup',
        brand: 'Berry Good',
        calories: 95,
        sugar: 7,
        fats: 1.5,
        protein: 10,
        benefitHighlight: 'Live active probiotics, natural berry sweetness, builds immune system',
        badge: 'Kid Favorite Swap',
      },
    ],
    arFloatingTags: [
      { label: '🚨 51% Sugar Concentration', type: 'kid-alert', x: 28, y: 30 },
      { label: 'Rich in Milk Solids & Wafer', type: 'neutral', x: 72, y: 42 },
      { label: '⚠️ Cavity & Hyperactivity Risk', type: 'kid-alert', x: 50, y: 72 },
    ],
  },
  {
    id: 'P006',
    name: '100% Pure Natural Honey',
    brand: 'Dabur',
    category: 'Natural Sweeteners',
    barcode: '8901207000062',
    calories: 320,
    sugar: 64,
    totalFats: 0,
    saturatedFat: 0,
    protein: 0,
    sodium: 15,
    allergens: ['None (Note: Infants under 1 year botulism warning)'],
    recommendedAmount: '1–2 tsp (15g)',
    recommendedTime: 'Breakfast / with warm water or herbal tea',
    frequency: 'Small amounts',
    positiveEffects: 'Provides natural sweetness, antioxidant flavonoids, and soothes throat irritation',
    excessIntakeEffects: 'Excess added free sugar load, spike in blood glucose if overused as a sugar substitute',
    healthScore: 68,
    nutriGrade: 'C',
    consumptionSignal: 'OK',
    sampleImage: '/products/p001_yogabar.webp',
    image: '/products/p001_yogabar.webp',
    kidSuitability: {
      isRecommendedForKids: true,
      minimumAge: 2,
      hazardLevel: 'low',
      kidWarningText: 'Safe for children above 12 months (DO NOT give to infants under 1 year due to infant botulism spore risk). Limit to 1 teaspoon as it is pure natural sugar.',
      sugarSpoonsCount: 16.0,
      visualHarmEffects: [
        {
          title: 'Infant Botulism Notice',
          desc: 'Never give honey to babies under 12 months because infant gut flora cannot defend against Clostridium botulinum.',
          organ: 'tummy',
        },
      ],
    },
    healthierAlternatives: [
      {
        name: 'Fresh Date Puree / Mashed Apple',
        brand: 'Orchard Fresh',
        calories: 60,
        sugar: 12,
        fats: 0,
        protein: 0.5,
        benefitHighlight: 'Contains soluble pectin fiber which buffers blood sugar absorption',
        badge: 'Fiber Buffered Sweet',
      },
    ],
    arFloatingTags: [
      { label: 'Pure Floral Nectar', type: 'positive', x: 30, y: 32 },
      { label: '1-2 Tsp Serving Limit', type: 'neutral', x: 70, y: 46 },
      { label: '🚫 Strict No for < 1 yr Babies', type: 'kid-alert', x: 50, y: 74 },
    ],
  },
  {
    id: 'P007',
    name: 'Mr Makhana Roasted in Olive Oil - Butter Tomato',
    brand: 'Mr Makhana',
    category: 'Makhana (Fox Nuts)',
    barcode: '8906093410074',
    calories: 474, // Corrected & aligned: 474 kcal/100g (135 kcal per 25g serving)
    sugar: 0.5, // 0.5g sugar (corrected from PDF OCR column shift)
    totalFats: 18, // 18g total fat (4.5g per 25g serve, roasted in pure olive oil)
    saturatedFat: 4.5,
    protein: 8.94, // 8.94g protein per 100g
    sodium: 480,
    allergens: ['Gluten Free, Non-GMO, 100% Plant Based (Peanut traces on packaging line)'],
    recommendedAmount: '25–30 g (1 bowl)',
    recommendedTime: 'Evening snack / school tiffin',
    frequency: 'Regularly / Great healthy staple',
    positiveEffects: 'Light puffed wholefood snack, roasted in olive oil, 0g trans-fat, 0g cholesterol, 4mg iron per serve, low glycemic load',
    excessIntakeEffects: 'Excess sodium if multiple large bags eaten continuously',
    healthScore: 82,
    nutriGrade: 'A',
    consumptionSignal: 'GOOD',
    sampleImage: '/products/p007_makhana.jpg',
    image: '/products/p007_makhana.jpg',
    kidSuitability: {
      isRecommendedForKids: true,
      minimumAge: 3,
      hazardLevel: 'low',
      kidWarningText: 'Superstar healthy crunchy snack! Verified roasted in olive oil with only 0.5g sugar and rich plant calcium. Safe daily snack for kids.',
      sugarSpoonsCount: 0.1,
      harmfulAdditives: [],
      visualHarmEffects: [
        {
          title: 'Digestive Fiber Friendly',
          desc: 'Gentle on little stomachs, provides sustained fullness without clogging digestion or spiking glucose.',
          organ: 'tummy',
        },
      ],
    },
    healthierAlternatives: [
      {
        name: 'Roasted Salt & Pepper Makhana (Low Sodium)',
        brand: 'Pure Lotus',
        calories: 120,
        sugar: 0.2,
        fats: 2.5,
        protein: 4,
        benefitHighlight: 'Air-popped in virgin olive oil with half the salt seasoning',
        badge: 'Ultra Clean Crunch',
      },
    ],
    arFloatingTags: [
      { label: '✓ Only 0.5g Sugar & Roasted in Olive Oil', type: 'positive', x: 26, y: 34 },
      { label: '✓ 0g Trans Fat · 4mg Iron', type: 'positive', x: 74, y: 45 },
      { label: 'Signal: GOOD for Daily Snacking', type: 'positive', x: 50, y: 72 },
    ],
  },
  {
    id: 'P008',
    name: "Lay's India's Magic Masala Potato Chips",
    brand: "Lay's",
    category: 'Chips & Savory Snacks',
    barcode: '8901491100085',
    calories: 530, // 530 kcal/100g (106 kcal per 20g serve)
    sugar: 4.1,
    totalFats: 33.2,
    saturatedFat: 13.5,
    protein: 6.8,
    sodium: 690,
    allergens: ['Milk, Soy, Wheat plant cross-contact'],
    recommendedAmount: '20g (small single treat)',
    recommendedTime: 'Occasional snack',
    frequency: 'Rarely / Strictly Limit',
    positiveEffects: 'Provides quick crunch and flavor craving fulfillment, verified No Artificial Colours & Flavours',
    excessIntakeEffects: 'High refined oil calories, saturated fat deposition, and salt load leading to fluid retention',
    healthScore: 38,
    nutriGrade: 'D',
    consumptionSignal: 'BAD',
    sampleImage: '/products/p008_lays.webp',
    image: '/products/p008_lays.webp',
    kidSuitability: {
      isRecommendedForKids: false,
      minimumAge: 7,
      hazardLevel: 'high',
      kidWarningText: 'Not recommended for regular consumption. Deep-fried in palm oil with high sodium (690mg) that triggers dehydration and vascular strain.',
      sugarSpoonsCount: 1.0,
      harmfulAdditives: ['Flavor Enhancers (INS 627, INS 631)', 'Refined Palm Olein Oil'],
      visualHarmEffects: [
        {
          title: 'Vascular Salt Strain',
          desc: 'Excess sodium tightens young blood vessels and dehydrates cellular fluid balance.',
          organ: 'heart',
        },
      ],
    },
    healthierAlternatives: [
      {
        name: 'Mr Makhana Roasted in Olive Oil',
        brand: 'Mr Makhana',
        calories: 135,
        sugar: 0.5,
        fats: 4.5,
        protein: 2.2,
        benefitHighlight: '70% less fat than fried potato chips, pure roasted lotus seeds',
        badge: 'Smart Crunch Swap',
      },
    ],
    arFloatingTags: [
      { label: '⚠️ High Palm Oil Lipids (33.2g)', type: 'warning', x: 28, y: 32 },
      { label: 'No Artificial Colours', type: 'neutral', x: 70, y: 44 },
      { label: 'Limit Daily Consumption', type: 'kid-alert', x: 48, y: 72 },
    ],
  },
  {
    id: 'P009',
    name: 'Bourbon Chocolate Cream Biscuits',
    brand: 'Britannia',
    category: 'Biscuits & Cookies',
    barcode: '8901063010093',
    calories: 493,
    sugar: 38, // 38g sugar (~10 spoons)
    totalFats: 20.3,
    saturatedFat: 9.8,
    protein: 5.1,
    sodium: 320,
    allergens: ['Wheat (Gluten)', 'Milk', 'Soy'],
    recommendedAmount: '2–3 biscuits (30g)',
    recommendedTime: 'Snack time / Tea break',
    frequency: 'Occasionally',
    positiveEffects: 'Provides quick sugary energy boost for high-intensity activity',
    excessIntakeEffects: 'Excess calories, rapid glucose spike, hydrogenated fat deposition',
    healthScore: 36,
    nutriGrade: 'D',
    consumptionSignal: 'BAD',
    sampleImage: '/products/p005_kinderjoy.webp',
    image: '/products/p005_kinderjoy.webp',
    kidSuitability: {
      isRecommendedForKids: false,
      minimumAge: 6,
      hazardLevel: 'high',
      kidWarningText: 'High risk for daily tiffin snacks! 38g of sugar and refined maida flour stick to teeth and induce blood glucose swings before study hours.',
      sugarSpoonsCount: 9.5,
      harmfulAdditives: ['Hydrogenated Vegetable Fat (Vanaspati/Trans-fats)', 'Caramel Color IV (E150d)', 'Artificial Chocolate Essence'],
      visualHarmEffects: [
        {
          title: 'Tooth Decay Acid Trap',
          desc: 'Cream biscuit paste lodges between child molars for hours, creating acidic decay zones.',
          organ: 'teeth',
        },
        {
          title: 'Study Fatigue Crash',
          desc: 'A 4 PM sugar high drops by 5:30 PM, causing homework irritability and sluggish attention.',
          organ: 'brain',
        },
      ],
    },
    healthierAlternatives: [
      {
        name: 'Whole Grain Ragi Oats Cookies',
        brand: 'Millet Crunch',
        calories: 110,
        sugar: 4,
        fats: 3,
        protein: 3.5,
        benefitHighlight: 'Finger millet (Ragi) provides 10x more calcium, sweetened with jaggery',
        badge: 'Ragi Superfood Swap',
      },
    ],
    arFloatingTags: [
      { label: '38g Sugar (~10 Spoons)', type: 'kid-alert', x: 26, y: 35 },
      { label: 'Refined White Flour (Maida)', type: 'warning', x: 72, y: 48 },
      { label: 'Signal: BAD for Daily Tiffin', type: 'kid-alert', x: 50, y: 74 },
    ],
  },
  {
    id: 'P010',
    name: 'Vanilla Fruit Bar Cake',
    brand: 'Britannia',
    category: 'Packaged Cake & Bakery',
    barcode: '8901063020108',
    calories: 415,
    sugar: 32, // Corrected & aligned from standard bakery panel
    totalFats: 17.3,
    saturatedFat: 7.8,
    protein: 5.7,
    sodium: 290,
    allergens: ['Wheat (Gluten)', 'Milk', 'Egg'],
    recommendedAmount: '1 small slice (25–30g)',
    recommendedTime: 'Snack / dessert',
    frequency: 'Occasionally',
    positiveEffects: 'Pleasing soft texture and quick sweet calorie gratification',
    excessIntakeEffects: 'High sugar, refined fat, and synthetic preservatives causing excess caloric surplus',
    healthScore: 38,
    nutriGrade: 'D',
    consumptionSignal: 'BAD',
    sampleImage: '/products/p001_yogabar.webp',
    image: '/products/p001_yogabar.webp',
    kidSuitability: {
      isRecommendedForKids: false,
      minimumAge: 5,
      hazardLevel: 'high',
      kidWarningText: 'Contains 32g sugar, chemical leavening agents, and preservatives. Not suitable as a daily children tiffin item.',
      sugarSpoonsCount: 8.0,
      harmfulAdditives: ['Preservatives (INS 282, INS 200)', 'Emulsifiers (INS 471, INS 477)', 'Synthetic Food Colors'],
      visualHarmEffects: [
        {
          title: 'Preservative Gut Sensitivity',
          desc: 'Chemical antimicrobials like potassium sorbate can irritate sensitive child digestive tracts.',
          organ: 'tummy',
        },
      ],
    },
    healthierAlternatives: [
      {
        name: 'Steamed Banana Walnut Bread',
        brand: 'Baker Green',
        calories: 120,
        sugar: 6,
        fats: 3,
        protein: 4,
        benefitHighlight: 'Naturally sweetened with ripe bananas, zero chemical humectants',
        badge: 'No Preservatives',
      },
    ],
    arFloatingTags: [
      { label: '32g Sugars + Preservatives', type: 'warning', x: 30, y: 30 },
      { label: 'Refined Shortening Fat', type: 'warning', x: 70, y: 46 },
      { label: 'Occasional Celebration Only', type: 'neutral', x: 50, y: 75 },
    ],
  },
  {
    id: 'P011',
    name: 'Sparkling Cola Soda Can',
    brand: 'Classic Fizz',
    category: 'Carbonated Beverage',
    barcode: '5449000000996',
    calories: 140, // 140 kcal per 330ml can
    sugar: 39, // 39g liquid sugar (~10 spoons)
    totalFats: 0,
    saturatedFat: 0,
    protein: 0,
    sodium: 45,
    caffeineMg: 34,
    allergens: ['None'],
    recommendedAmount: '0 ml for children / Max 1 can adult',
    recommendedTime: 'Avoid for children',
    frequency: 'Strictly Rare / Discouraged',
    positiveEffects: 'Rapid hydration sensation and carbonation sensation',
    excessIntakeEffects: 'Extreme free sugar spike, phosphoric acid tooth erosion, caffeine restlessness in kids',
    healthScore: 18,
    nutriGrade: 'E',
    consumptionSignal: 'BAD',
    sampleImage: '/products/p005_kinderjoy.webp',
    image: '/products/p005_kinderjoy.webp',
    kidSuitability: {
      isRecommendedForKids: false,
      minimumAge: 16,
      hazardLevel: 'critical',
      kidWarningText: 'STRONGLY DISCOURAGED FOR CHILDREN: 1 can contains nearly 10 whole spoons of pure liquid sugar + 34mg caffeine. Liquid sugar absorbs in 3 minutes without fiber, overwhelming the liver.',
      sugarSpoonsCount: 9.8,
      harmfulAdditives: ['Phosphoric Acid (E338)', 'Caramel Color IV', 'Caffeine (34mg)'],
      visualHarmEffects: [
        {
          title: 'Acid Enamel Dissolution',
          desc: 'Phosphoric acid drops oral pH below 5.5, actively demineralizing child tooth enamel within 15 minutes.',
          organ: 'teeth',
        },
        {
          title: 'Caffeine Heart Jitters & Insomnia',
          desc: '34mg caffeine triggers elevated pediatric heart rate, anxiety, bedtime insomnia, and morning irritability.',
          organ: 'heart',
        },
      ],
    },
    healthierAlternatives: [
      {
        name: 'Fresh Tender Coconut Water',
        brand: 'Nature Tree',
        calories: 45,
        sugar: 6,
        fats: 0,
        protein: 1.5,
        benefitHighlight: '100% natural electrolytes (Potassium & Magnesium), zero caffeine, zero phosphoric acid',
        badge: 'Natural Hydration',
      },
    ],
    arFloatingTags: [
      { label: '🚨 34mg Caffeine (Harmful for Kids)', type: 'kid-alert', x: 26, y: 32 },
      { label: '39g Liquid Sugar (Fast Spike)', type: 'kid-alert', x: 74, y: 44 },
      { label: 'Phosphoric Acid pH 2.5', type: 'warning', x: 50, y: 72 },
    ],
  },
  {
    id: 'P012',
    name: 'Fresh Crisp Green Apple',
    brand: 'Orchard Fresh',
    category: 'Fresh Fruits',
    barcode: '0000000000123',
    calories: 78,
    sugar: 15,
    totalFats: 0.2,
    saturatedFat: 0.1,
    protein: 0.5,
    sodium: 2,
    allergens: ['None'],
    recommendedAmount: '1 whole apple (~150g)',
    recommendedTime: 'Morning / Evening snack',
    frequency: 'Daily',
    positiveEffects: 'Rich in soluble pectin fiber, Vitamin C, quercetin, and natural chewing salivary cleanse',
    excessIntakeEffects: 'None under normal dietary habits',
    healthScore: 96,
    nutriGrade: 'A',
    consumptionSignal: 'GOOD',
    sampleImage: '/products/p003_oats.jpg',
    image: '/products/p003_oats.jpg',
    kidSuitability: {
      isRecommendedForKids: true,
      minimumAge: 1,
      hazardLevel: 'low',
      kidWarningText: 'Golden standard healthy snack for children! Natural fruit fibers protect teeth by stimulating saliva, and provide steady energy for hours.',
      sugarSpoonsCount: 3.8,
      visualHarmEffects: [],
    },
    healthierAlternatives: [],
    arFloatingTags: [
      { label: '4.4g Soluble Pectin Fiber', type: 'positive', x: 30, y: 32 },
      { label: 'Natural Teeth Cleansing', type: 'positive', x: 70, y: 45 },
      { label: 'Super Food: DAILY GOOD', type: 'positive', x: 50, y: 72 },
    ],
  },
  {
    id: 'P013',
    name: 'Whole Grain Cookie Snack Pack',
    brand: 'Good Morning Choice',
    category: 'Biscuits & Cookies',
    barcode: '8901234567891',
    calories: 220, // Aligned directly from FoodLens AI Project Slide 1 & 7
    sugar: 12, // 12g sugar (10g added sugars, moderate)
    totalFats: 9, // 9g fat (moderate)
    saturatedFat: 2.0,
    protein: 3, // 3g protein (low)
    sodium: 380, // 380mg sodium (moderate)
    allergens: ['Wheat (Gluten)', 'Milk', 'May contain Soy, Nuts'],
    recommendedAmount: '1 package (50g)',
    recommendedTime: 'Mid-morning / Afternoon snack',
    frequency: 'Occasionally / Balanced snack',
    positiveEffects: 'Provides sustained carbohydrates and moderate dietary energy as verified in benchmark presentation',
    excessIntakeEffects: 'Moderate sugar and sodium intake if eaten in multiple packs',
    healthScore: 82,
    nutriGrade: 'B',
    consumptionSignal: 'GOOD',
    sampleImage: '/products/p001_yogabar.webp',
    image: '/products/p001_yogabar.webp',
    kidSuitability: {
      isRecommendedForKids: true,
      minimumAge: 4,
      hazardLevel: 'low',
      kidWarningText: 'Balanced snack pack with moderate fat and sugar. Suitable for school tiffin when active.',
      sugarSpoonsCount: 3.0,
      visualHarmEffects: [],
    },
    healthierAlternatives: [
      {
        name: 'Whole Grain Ragi Oats Cookies',
        brand: 'Millet Crunch',
        calories: 110,
        sugar: 4,
        fats: 3,
        protein: 3.5,
        benefitHighlight: 'Ragi superfood with zero refined flour',
        badge: 'Ragi Superfood',
      },
    ],
    arFloatingTags: [
      { label: 'Slide Benchmark: 220 kcal', type: 'positive', x: 28, y: 32 },
      { label: 'Sodium: 380mg (Moderate)', type: 'neutral', x: 70, y: 44 },
      { label: 'Health Score: 82/100', type: 'positive', x: 50, y: 72 },
    ],
  },
];
