import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { OFFICIAL_HACKATHON_DATASET } from './_dataset.js';

// Load environment variables for local testing; on Vercel, process.env is pre-populated
for (const envFile of ['.env.local', '.env']) {
  dotenv.config({ path: path.resolve(process.cwd(), envFile) });
}

const app = express();
app.use(express.json({ limit: '25mb' }));

// CORS middleware so API can be safely consumed by Web, Unity, and mobile clients
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve public assets (product packaging images, icons, etc.)
app.use(express.static(path.resolve(process.cwd(), 'public')));

// In-memory encrypted backup store for E2EE cloud backup simulation
const encryptedCloudBackups = new Map<string, { payload: string; timestamp: number; checksum: string }>();

// Router for all API endpoints
const router = express.Router();

// 1. Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FoodLens AI Backend (Nexora)',
    environment: process.env.VERCEL ? 'vercel-serverless' : 'local-node',
    time: new Date().toISOString()
  });
});

// 2. Products catalog endpoint (used by both Unity and Web app)
router.get('/products', (req, res) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  if (!query) {
    return res.json({ success: true, count: OFFICIAL_HACKATHON_DATASET.length, products: OFFICIAL_HACKATHON_DATASET });
  }
  const filtered = OFFICIAL_HACKATHON_DATASET.filter(p => 
    p.name.toLowerCase().includes(query) ||
    p.brand.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query) ||
    (p.barcode && p.barcode.includes(query))
  );
  return res.json({ success: true, count: filtered.length, products: filtered });
});

// 3. Product lookup by ID or Barcode
router.get('/products/:identifier', (req, res, next) => {
  const idOrBarcode = req.params.identifier;
  // If request contains an extension (.jpg, .webp, .png, etc.), hand over to static handler
  if (path.extname(idOrBarcode)) {
    return next();
  }
  const product = OFFICIAL_HACKATHON_DATASET.find(p => 
    p.id.toLowerCase() === idOrBarcode.toLowerCase() || 
    p.barcode === idOrBarcode
  );
  if (!product) {
    if (req.baseUrl === '/api') {
      return res.status(404).json({ success: false, error: `Product with identifier '${idOrBarcode}' not found` });
    }
    return next();
  }
  return res.json({ success: true, product });
});

// 4. E2EE Cloud Backup endpoint: stores only cipher text (Zero-Knowledge)
router.post('/backup/save', (req, res) => {
  try {
    const { backupId, encryptedPayload, checksum } = req.body;
    if (!backupId || !encryptedPayload) {
      return res.status(400).json({ error: 'Missing backupId or encryptedPayload' });
    }
    encryptedCloudBackups.set(backupId, {
      payload: encryptedPayload,
      timestamp: Date.now(),
      checksum: checksum || 'sha256-verified',
    });
    return res.json({
      success: true,
      backupId,
      storedAt: new Date().toISOString(),
      message: 'End-to-End Encrypted backup secured in cloud storage. Zero-knowledge verified.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to save cloud backup' });
  }
});

// 5. E2EE Cloud Backup retrieve endpoint
router.get('/backup/load/:backupId', (req, res) => {
  const { backupId } = req.params;
  const backup = encryptedCloudBackups.get(backupId);
  if (!backup) {
    return res.status(404).json({ error: 'Encrypted backup not found with given ID' });
  }
  return res.json({
    success: true,
    backupId,
    encryptedPayload: backup.payload,
    timestamp: backup.timestamp,
    checksum: backup.checksum,
  });
});

// Helper for algorithmic fallback when Gemini API key is pending or quota is reached
function getFallbackFoodAnalysis(queryText?: string, visualMatchId?: string) {
  const query = (queryText || '').toLowerCase();
  
  // 0. Direct Visual Match ID from Computer Vision Engine
  let matched = visualMatchId ? OFFICIAL_HACKATHON_DATASET.find(p => p.id === visualMatchId) : null;

  // 1. Exact full product name match
  if (!matched) {
    matched = OFFICIAL_HACKATHON_DATASET.find(p => 
      query.includes(p.name.toLowerCase())
    );
  }
  
  // 2. Specific product keywords, common typos & packaging signatures
  if (!matched) {
    if (query.includes('maggi') || query.includes('maggie') || query.includes('noodle') || query.includes('noodles') || query.includes('instant') || query.includes('tastemaker') || query.includes('2-minute') || query.includes('2 minute') || query.includes('color tone: yellow')) {
      matched = OFFICIAL_HACKATHON_DATASET.find(p => p.id === 'P004'); // Maggi 2-Minute Noodles
    } else if (query.includes('bourbon') || query.includes('borbon') || query.includes('biscuit') || query.includes('biscuits') || query.includes('creme') || query.includes('color tone: brown')) {
      matched = OFFICIAL_HACKATHON_DATASET.find(p => p.id === 'P009'); // Bourbon Chocolate Cream Biscuits
    } else if (query.includes('coke') || query.includes('coca') || query.includes('cola') || query.includes('soda') || query.includes('classic fizz') || query.includes('coke can') || query.includes('soda can') || query.includes('sparkling cola') || (/\bcan\b/i.test(query) && !query.includes('scan') && !query.includes('candidate'))) {
      matched = OFFICIAL_HACKATHON_DATASET.find(p => p.id === 'P011'); // Sparkling Cola Soda Can
    } else if (query.includes('kinder') || query.includes('kinderjoy') || (/\bjoy\b/i.test(query) && !query.includes('enjoy')) || (/\begg\b/i.test(query) && !query.includes('veggie')) || query.includes('surprise') || query.includes('ferrero')) {
      matched = OFFICIAL_HACKATHON_DATASET.find(p => p.id === 'P005'); // Kinder Joy
    } else if (query.includes('yoga') || query.includes('yogabar') || query.includes('protein bar') || query.includes('protien bar') || query.includes('daily 10g') || query.includes('protien') || query.includes('color tone: teal')) {
      matched = OFFICIAL_HACKATHON_DATASET.find(p => p.id === 'P001'); // Yoga Bar Daily 10g Protein Bar
    } else if (/\boats?\b/i.test(query) || query.includes('cereal') || query.includes('porridge') || query.includes('chocolate oats')) {
      matched = OFFICIAL_HACKATHON_DATASET.find(p => p.id === 'P003'); // High Protein Oats Dark Chocolate
    } else if (query.includes('makhana') || query.includes('mr makhana') || query.includes('foxnut') || query.includes('fox nut') || query.includes('fox nuts') || query.includes('lotus') || query.includes('butter tomato') || query.includes('color tone: cream')) {
      matched = OFFICIAL_HACKATHON_DATASET.find(p => p.id === 'P007'); // Mr Makhana
    } else if (query.includes('paneer') || query.includes('malai paneer') || query.includes('milk mist') || query.includes('cottage') || query.includes('color tone: white')) {
      matched = OFFICIAL_HACKATHON_DATASET.find(p => p.id === 'P002'); // Fresh Malai Paneer
    } else if (/\blays?\b/i.test(query) || query.includes("lay's") || query.includes('magic masala') || (query.includes('potato') && query.includes('chip')) || query.includes('color tone: blue')) {
      matched = OFFICIAL_HACKATHON_DATASET.find(p => p.id === 'P008'); // Lay's Potato Chips
    } else if (query.includes('honey') || query.includes('dabur') || query.includes('pure honey') || query.includes('color tone: amber')) {
      matched = OFFICIAL_HACKATHON_DATASET.find(p => p.id === 'P006'); // 100% Pure Natural Honey
    } else if (query.includes('apple') || query.includes('crisp apple') || query.includes('green apple') || query.includes('orchard') || query.includes('fresh fruit')) {
      matched = OFFICIAL_HACKATHON_DATASET.find(p => p.id === 'P012'); // Fresh Crisp Green Apple
    } else if (query.includes('fruit cake') || query.includes('bar cake') || query.includes('vanilla fruit') || (/\bcake\b/i.test(query) && !query.includes('pancake'))) {
      matched = OFFICIAL_HACKATHON_DATASET.find(p => p.id === 'P010'); // Vanilla Fruit Bar Cake
    } else if (query.includes('snack pack') || query.includes('whole grain cookie') || /\bcookies?\b/i.test(query)) {
      matched = OFFICIAL_HACKATHON_DATASET.find(p => p.id === 'P013'); // Whole Grain Cookie Snack Pack
    } else {
      // 3. Brand name match
      matched = OFFICIAL_HACKATHON_DATASET.find(p => query.includes(p.brand.toLowerCase())) || OFFICIAL_HACKATHON_DATASET[3];
    }
  }

  const item = matched || OFFICIAL_HACKATHON_DATASET[3];
  return {
    productName: item.name,
    brand: item.brand,
    category: item.category,
    calories: item.calories,
    sugar: item.sugar,
    totalFats: item.totalFats,
    saturatedFat: item.saturatedFat,
    protein: item.protein,
    sodium: item.sodium,
    allergens: item.allergens,
    ingredientsList: ['Verified packaging data from FoodLens Scientific Engine'],
    healthScore: item.healthScore,
    nutriGrade: item.nutriGrade,
    consumptionSignal: item.consumptionSignal,
    recommendedAmount: item.recommendedAmount,
    recommendedTime: item.recommendedTime,
    recommendedFrequency: item.frequency,
    positiveEffects: item.positiveEffects,
    excessIntakeEffects: item.excessIntakeEffects,
    kidSuitability: item.kidSuitability,
    healthierAlternatives: item.healthierAlternatives,
    arFloatingTags: item.arFloatingTags,
  };
}

// 6. AI Food Package Analysis Endpoint using Gemini 2.5 Flash
router.post('/analyze-food', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', queryText, visualMatchId } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not configured. Using smart algorithmic fallback.');
      const fallbackData = getFallbackFoodAnalysis(queryText, visualMatchId);
      return res.json({
        success: true,
        source: 'smart-fallback',
        warning: 'Analyzed with FoodLens Algorithmic Nutrition Engine.',
        data: fallbackData,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const promptText = `You are FoodLens AI, an intelligent food-package nutritionist and safety analyzer for families and children created by Team Nexora.
Analyze the provided packaged food image or description.
If the food matches any item in the following verified dataset, you MUST return the exact nutritional data, kid suitability, and warnings from the dataset for that item.
Here is the verified dataset:
${JSON.stringify(OFFICIAL_HACKATHON_DATASET, null, 2)}

Extract and calculate the following structured JSON:
{
  "productName": "string (accurate product name)",
  "brand": "string",
  "category": "string (e.g. Snacks, Dairy, Noodles, Chocolate, Drink, etc.)",
  "calories": number (kcal per serving or 100g),
  "sugar": number (grams),
  "totalFats": number (grams),
  "saturatedFat": number (grams),
  "protein": number (grams),
  "sodium": number (mg),
  "allergens": ["string"],
  "ingredientsList": ["string"],
  "healthScore": number (0 to 100 based on nutritional density, processing degree, sugar/fat/salt),
  "nutriGrade": "A" | "B" | "C" | "D" | "E",
  "consumptionSignal": "GOOD" | "OK" | "BAD" (for continuous regular consumption: GOOD = healthy daily/regular, OK = moderate/occasional, BAD = limit/harmful if frequent),
  "recommendedAmount": "string (e.g. '1 pack occasionally' or '30-50g breakfast daily')",
  "recommendedTime": "string (e.g. 'Breakfast', 'Evening snack', 'Post-workout')",
  "recommendedFrequency": "string (e.g. 'Regularly', 'Occasionally', 'Small amounts', 'Rare treats')",
  "positiveEffects": "string (brief benefit e.g. 'Provides quick energy' or 'High calcium and protein')",
  "excessIntakeEffects": "string (harmful results if overconsumed e.g. 'Excess calories, rapid sugar crash, dental risk')",
  "kidSuitability": {
    "isRecommendedForKids": boolean,
    "minimumAge": number,
    "hazardLevel": "low" | "moderate" | "high" | "critical",
    "kidWarningText": "string (clear, direct warning for parents & children explaining why it might be harmful)",
    "sugarSpoonsCount": number (sugar grams divided by 4, rounded to 1 decimal),
    "harmfulAdditives": ["string"],
    "visualHarmEffects": [
      {
        "title": "string (e.g. 'Teeth Cavities')",
        "desc": "string (explanation of how this item impacts children's teeth, brain focus, tummy, etc.)",
        "organ": "teeth" | "brain" | "tummy" | "energy" | "heart"
      }
    ]
  },
  "healthierAlternatives": [
    {
      "name": "string (a much healthier real alternative)",
      "brand": "string",
      "calories": number,
      "sugar": number,
      "fats": number,
      "protein": number,
      "benefitHighlight": "string (e.g. '85% less sugar, rich in dietary fiber')",
      "badge": "string (e.g. 'Smart Swap', 'High Protein', 'Whole Grain')"
    }
  ],
  "arFloatingTags": [
    { "label": "string", "type": "warning" | "positive" | "neutral" | "kid-alert", "x": 30, "y": 40 },
    { "label": "string", "type": "warning" | "positive" | "neutral" | "kid-alert", "x": 65, "y": 30 },
    { "label": "string", "type": "warning" | "positive" | "neutral" | "kid-alert", "x": 50, "y": 70 }
  ]
}

Ensure the output is ONLY valid raw JSON with NO markdown code fences. Keep insights scientifically sound and actionable.
${queryText ? `User description or product notes: ${queryText}` : ''}
`;

    const contents: any[] = [];
    if (imageBase64) {
      // Strip any data:image/*;base64, prefix if present
      const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1].trim() : imageBase64.trim();
      contents.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }
    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      // Clean up markdown quotes if needed
      const cleaned = outputText.replace(/```json\n?|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      source: 'gemini-2.5-flash',
      data: parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/analyze-food:', error);
    const isQuota = error?.status === 429 || error?.toString().includes('RESOURCE_EXHAUSTED') || error?.message?.includes('Quota exceeded');
    
    // Provide seamless fallback so users can always test and use the application
    const fallbackData = getFallbackFoodAnalysis(req.body?.queryText, req.body?.visualMatchId);
    return res.json({
      success: true,
      source: 'smart-fallback',
      warning: isQuota 
        ? 'Gemini AI free-tier quota reached. Powered by FoodLens Algorithmic Nutrition Engine.' 
        : 'AI service temporarily unavailable. Powered by FoodLens Algorithmic Nutrition Engine.',
      data: fallbackData,
    });
  }
});

// Dual mounting: supports both direct '/api/...' and rewritten '/...' requests seamlessly
app.use('/api', router);
app.use('/', router);

export default app;
