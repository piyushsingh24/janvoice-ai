/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { Suggestion, AiRecommendation, DevPlanComparison, DashboardStats } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client if key exists
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini API client initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Gemini API client:', error);
  }
} else {
  console.log('Using simulated AI engine (no active GEMINI_API_KEY found).');
}

// In-memory data store seeded with realistic Indian citizen feedback
let suggestions: Suggestion[] = [
  {
    id: 'sug-1',
    citizenName: 'Ramesh Sawant',
    village: 'Khed',
    district: 'Pune',
    language: 'Marathi',
    originalText: 'आमच्या गावात पाणी टंचाई खूप गंभीर आहे. विहिरी कोरड्या पडल्या आहेत आणि पाणी टँकर आठवड्यातून फक्त एकदाच येतो. महिलांना पाण्यासाठी २ किमी चालावे लागते.',
    translatedText: 'The water scarcity in our village Khed (Pune) is very severe. Wells have dried up and the water tanker arrives only once a week. Women have to walk 2 km to fetch water.',
    category: 'Water',
    sentiment: 'negative',
    priorityScore: 94,
    urgency: 10,
    impact: 3400,
    budgetEstimate: 45, // ₹45 Lakhs
    timestamp: '2026-07-05T14:30:00Z',
    status: 'Approved',
    aiSummary: 'Establish a dedicated piped borewell supply line from Khed reservoir to address immediate drinking water crisis impacting 3,400 residents.'
  },
  {
    id: 'sug-2',
    citizenName: 'Savitri Devi',
    village: 'Chiraigaon',
    district: 'Varanasi',
    language: 'Hindi',
    originalText: 'स्कूल जाने का रास्ता पूरा कच्चा है। बरसात में पानी भर जाता है जिससे बच्चे गिर जाते हैं और स्कूल नहीं जा पाते। सड़क पक्की होनी चाहिए।',
    translatedText: 'The road leading to the school is completely unpaved. During rain, it gets flooded, causing children to fall and miss school. The road must be paved.',
    category: 'Road',
    sentiment: 'negative',
    priorityScore: 88,
    urgency: 8,
    impact: 1800,
    budgetEstimate: 35, // ₹35 Lakhs
    timestamp: '2026-07-05T09:15:00Z',
    status: 'Approved',
    aiSummary: 'Construct a paved cement concrete (CC) link road connecting Chiraigaon block to the primary school with adequate side drainage.'
  },
  {
    id: 'sug-3',
    citizenName: 'Kalyani Subramanian',
    village: 'Thondamuthur',
    district: 'Coimbatore',
    language: 'Tamil',
    originalText: 'கிராமத்தில் ஆரம்ப சுகாதார நிலையம் இல்லை. அவசர சிகிச்சைக்கு 15 கிமீ தொலைவில் உள்ள நகரத்திற்கு செல்ல வேண்டும். ஒரு சிறிய மருத்துவமனை தேவை.',
    translatedText: 'There is no Primary Health Centre (PHC) in our village. For emergencies, we have to travel 15 km to the city. A small clinic is highly needed.',
    category: 'Healthcare',
    sentiment: 'negative',
    priorityScore: 92,
    urgency: 9,
    impact: 5500,
    budgetEstimate: 120, // ₹1.2 Cr
    timestamp: '2026-07-04T18:45:00Z',
    status: 'Pending',
    aiSummary: 'Sanction and establish an auxiliary sub-center health clinic with primary emergency care equipment for Thondamuthur block.'
  },
  {
    id: 'sug-4',
    citizenName: 'Gopal Hegde',
    village: 'Siddapura',
    district: 'Uttara Kannada',
    language: 'Kannada',
    originalText: 'ಕೃಷಿ ಮಾರುಕಟ್ಟೆಗೆ ಹೋಗಲು ಸರಿಯಾದ ರಸ್ತೆ ಇಲ್ಲದೆ ತರಕಾರಿಗಳು ಕೊಳೆತು ಹೋಗುತ್ತಿವೆ. ನಮಗೆ ಕೋಲ್ಡ್ ಸ್ಟೋರೇಜ್ ಘಟಕ ಮತ್ತು ಸಾರಿಗೆ ವ್ಯವಸ್ಥೆ ಬೇಕು.',
    translatedText: 'Vegetables are rotting as there is no proper road to the agricultural market. We need a cold storage facility and better transport facilities.',
    category: 'Agriculture',
    sentiment: 'neutral',
    priorityScore: 82,
    urgency: 7,
    impact: 2200,
    budgetEstimate: 80, // ₹80 Lakhs
    timestamp: '2026-07-04T11:20:00Z',
    status: 'Pending',
    aiSummary: 'Construct a solar-powered micro cold storage unit to extend the shelf life of locally grown vegetables and establish market-link vehicles.'
  },
  {
    id: 'sug-5',
    citizenName: 'Anonymous',
    village: 'Barasat',
    district: 'North 24 Parganas',
    language: 'Bengali',
    originalText: 'আমাদের হাই স্কুলে মেয়েদের জন্য কোনো শৌচাগার নেই। এর ফলে অনেক ছাত্রী স্কুল ছেড়ে দিচ্ছে। অবিলম্বে এই ব্যবস্থার সমাধান দরকার।',
    translatedText: 'There are no separate toilets for girls in our high school. Because of this, many female students are dropping out. This issue needs immediate resolution.',
    category: 'Education',
    sentiment: 'negative',
    priorityScore: 96,
    urgency: 10,
    impact: 950,
    budgetEstimate: 12, // ₹12 Lakhs
    timestamp: '2026-07-03T16:10:00Z',
    status: 'Approved',
    aiSummary: 'Install modern bio-toilets for female students and staff at Barasat Secondary High School with dedicated water connection.'
  },
  {
    id: 'sug-6',
    citizenName: 'Sarabjit Singh',
    village: 'Nakodar',
    district: 'Jalandhar',
    language: 'Punjabi',
    originalText: 'ਬਿਜਲੀ ਦੀ ਸਪਲਾਈ ਬਹੁਤ ਖਰਾਬ ਹੈ, ਖਾਸ ਕਰਕੇ ਖੇਤਾਂ ਵਿੱਚ ਸਿੰਚਾਈ ਲਈ ਦਿਨ ਵਿੱਚ ਸਿਰਫ ၃ ਘੰਟੇ ਬਿਜਲੀ ਮਿਲਦੀ ਹੈ। ਫਸਲਾਂ ਸੁੱਕ ਰਹੀਆਂ ਹਨ।',
    translatedText: 'The electricity supply is very poor, especially for irrigation in fields, we only get 3 hours of power daily. Crops are drying up.',
    category: 'Electricity',
    sentiment: 'negative',
    priorityScore: 85,
    urgency: 8,
    impact: 4200,
    budgetEstimate: 60, // ₹60 Lakhs
    timestamp: '2026-07-03T08:40:00Z',
    status: 'Investigating',
    aiSummary: 'Upgrade agricultural feeders and approve high-capacity solar-powered irrigation pump subsidies for Nakodar farmers.'
  },
  {
    id: 'sug-7',
    citizenName: 'Manish Patel',
    village: 'Anand',
    district: 'Anand',
    language: 'Gujarati',
    originalText: 'યુવાનો માટે રોજગારીની તકો નથી. ગામની અંદર કોઈ લાઈબ્રેરી કે કમ્પ્યુટર સેન્ટર નથી જેનાથી અમે નવી સ્કિલ્સ શીખી શકીએ.',
    translatedText: 'There are no employment opportunities for the youth. There is no library or computer center in the village where we can learn new skills.',
    category: 'Employment',
    sentiment: 'neutral',
    priorityScore: 78,
    urgency: 6,
    impact: 2900,
    budgetEstimate: 18, // ₹18 Lakhs
    timestamp: '2026-07-02T13:25:00Z',
    status: 'Pending',
    aiSummary: 'Establish a modern Digital Skill Hub and computer training lab inside the village Panchayat Bhavan to facilitate remote job training.'
  },
  {
    id: 'sug-8',
    citizenName: 'Anjali Reddy',
    village: 'Armoor',
    district: 'Nizamabad',
    language: 'Telugu',
    originalText: 'త్రాగునీటి పైపులైన్లు పగిలిపోయి మురుగు నీరు కలుస్తోంది. ప్రజలు జ్వరాల బారిన పడుతున్నారు. దయచేసి కొత్త పైపులు వేయించండి.',
    translatedText: 'Drinking water pipelines are broken and mixing with drainage water. People are falling sick with fevers. Please lay new pipelines.',
    category: 'Water',
    sentiment: 'negative',
    priorityScore: 95,
    urgency: 10,
    impact: 3800,
    budgetEstimate: 28, // ₹28 Lakhs
    timestamp: '2026-07-02T10:05:00Z',
    status: 'Approved',
    aiSummary: 'Immediate replacement of damaged galvanized water supply pipes and pressure valves across Armoor municipal wards to stop contamination.'
  },
  {
    id: 'sug-9',
    citizenName: 'Ajay Kumar',
    village: 'Nilambur',
    district: 'Malappuram',
    language: 'Malayalam',
    originalText: 'നമ്മുടെ ഗ്രാമത്തിലെ സ്കൂൾ കെട്ടിടം വളരെ പഴക്കമുള്ളതാണ്, ഏത് സമയത്തും വീഴാം. മഴക്കാലത്ത് ചോർന്നൊലിക്കുന്നു. പുതിയ ക്ലാസ് റൂമുകൾ പണിയണം.',
    translatedText: 'Our village school building is very old and can collapse at any time. It leaks during monsoon. New classrooms must be built.',
    category: 'Education',
    sentiment: 'negative',
    priorityScore: 91,
    urgency: 9,
    impact: 1200,
    budgetEstimate: 75, // ₹75 Lakhs
    timestamp: '2026-07-01T15:50:00Z',
    status: 'Approved',
    aiSummary: 'Reconstruct two structurally compromised classroom blocks and provide waterproof concrete roofing at Nilambur Primary School.'
  }
];

// Seeded AI Recommendations (aggregated clusters of requests)
let aiRecommendations: AiRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Consolidated Drinking Water Supply Pipeline',
    priority: 95,
    confidence: 96,
    villagesCount: 14,
    villagesList: ['Khed', 'Baramati', 'Junnar', 'Ambegaon', 'Saswad', 'Velhe', 'Bhor', 'Mulshi'],
    estimatedBudget: 180, // ₹1.8 Cr
    citizenRequestsCount: 384,
    potentialBeneficiaries: 18400,
    aiRecommendation: 'Deploy an integrated tap-water supply connection utilizing the Khed reservoir. Implement water recycling and purification plants before the dry winter season.',
    category: 'Water',
    status: 'Pending'
  },
  {
    id: 'rec-2',
    title: 'School Infra Waterproofing and Toilet Installations',
    priority: 92,
    confidence: 94,
    villagesCount: 9,
    villagesList: ['Chiraigaon', 'Barasat', 'Nilambur', 'Pindra', 'Kashi', 'Sevapuri'],
    estimatedBudget: 95, // ₹95 Lakhs
    citizenRequestsCount: 215,
    potentialBeneficiaries: 8200,
    aiRecommendation: 'Deploy pre-engineered modular toilet blocks with rainwater harvesting. Conduct rapid visual safety assessments of old school structures prior to the heavy monsoon cycle.',
    category: 'Education',
    status: 'Pending'
  },
  {
    id: 'rec-3',
    title: 'Agricultural Feeder Upgrade & Solar Pump Subsidy',
    priority: 86,
    confidence: 90,
    villagesCount: 11,
    villagesList: ['Siddapura', 'Nakodar', 'Phillaur', 'Shahkot', 'Anandpur'],
    estimatedBudget: 140, // ₹1.4 Cr
    citizenRequestsCount: 198,
    potentialBeneficiaries: 14200,
    aiRecommendation: 'Augment local distribution transformers and establish subsidized 5HP solar-powered tubewells to offset traditional grid interruptions for harvesting seasons.',
    category: 'Electricity',
    status: 'Pending'
  },
  {
    id: 'rec-4',
    title: 'All-Weather Link Roads to Rural Markets',
    priority: 89,
    confidence: 93,
    villagesCount: 18,
    villagesList: ['Chiraigaon', 'Siddapura', 'Khed', 'Shirur', 'Hingoli', 'Wani'],
    estimatedBudget: 240, // ₹2.4 Cr
    citizenRequestsCount: 438,
    potentialBeneficiaries: 23500,
    aiRecommendation: 'Upgrade gravel-unpaved arterial corridors to asphalt/concrete highways. Prioritize links directly connecting rural farm clusters with primary APMC trading depots.',
    category: 'Road',
    status: 'Pending'
  }
];

// Seeded Government Plans vs Citizen Demand
let devPlans: DevPlanComparison[] = [
  {
    id: 'plan-1',
    title: 'Chiraigaon Link Road Project',
    category: 'Road',
    district: 'Varanasi',
    citizenDemand: 'Construct concrete paved road linking Chiraigaon block to the primary school to avoid mud flooding.',
    governmentPlan: 'Sanctioned metal-topped road project scheduled for execution in Q4 2026 under rural connectivity fund.',
    aiRecommendation: 'Perfect alignment on alignment path. Accelerate timeline to Q2 2026 to complete laying before the major monsoon season begins.',
    matchStatus: 'Match',
    priorityScore: 88,
    budgetLakhs: 35
  },
  {
    id: 'plan-2',
    title: 'Khed Water Tanker Provisioning',
    category: 'Water',
    district: 'Pune',
    citizenDemand: 'Establish continuous piped borewell water line as the tankers come only once a week and wells are dry.',
    governmentPlan: 'Budget allocated to increase tanker trips from 1 per week to 3 per week during summer season.',
    aiRecommendation: 'Conflict identified. Tankers represent recurring costs with high water waste. Divert funds to a permanent piped line from the reservoir.',
    matchStatus: 'Conflict',
    priorityScore: 94,
    budgetLakhs: 45
  },
  {
    id: 'plan-3',
    title: 'Thondamuthur Healthcare Infrastructure',
    category: 'Healthcare',
    district: 'Coimbatore',
    citizenDemand: 'Build a small Primary Health Sub-Center in the village to prevent traveling 15 km to town in medical emergencies.',
    governmentPlan: 'Currently no clinic planned. Mobile medical van scheduled to visit only once per month.',
    aiRecommendation: 'Critical conflict. A village with 5,500 people needs a permanent sub-center. Re-prioritize budget from city center upgrades to block health facilities.',
    matchStatus: 'Conflict',
    priorityScore: 92,
    budgetLakhs: 120
  },
  {
    id: 'plan-4',
    title: 'Barasat School Sanitation Program',
    category: 'Education',
    district: 'North 24 Parganas',
    citizenDemand: 'Urgent construction of secure separate girls toilets in the high school to curb the rising female dropout rate.',
    governmentPlan: 'Approved sanitation budget for secondary schools in the district, including Barasat High School, for execution in July 2026.',
    aiRecommendation: 'Match and synergy found. Expedite materials delivery. Implement remote IoT water level monitors in toilets.',
    matchStatus: 'Match',
    priorityScore: 96,
    budgetLakhs: 12
  }
];

// Helper to compute stats
function calculateStats(): DashboardStats {
  const total = suggestions.length;
  const todays = suggestions.filter(s => {
    const todayStr = '2026-07-06';
    return s.timestamp.startsWith(todayStr);
  }).length;

  const villages = new Set(suggestions.map(s => s.village)).size;
  const avgPriority = total > 0 ? Math.round(suggestions.reduce((sum, s) => sum + s.priorityScore, 0) / total) : 0;

  const totalBudgetAllocated = 1200; // ₹12.0 Cr allocated limit
  const totalBudgetPlanned = suggestions.reduce((sum, s) => sum + s.budgetEstimate, 0);
  const budgetUtilization = Math.round((totalBudgetPlanned / totalBudgetAllocated) * 100);

  const categoryCounts: Record<string, number> = {};
  suggestions.forEach(s => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  });

  const districtCounts: Record<string, number> = {};
  suggestions.forEach(s => {
    districtCounts[s.district] = (districtCounts[s.district] || 0) + 1;
  });

  const monthlyTrends = [
    { month: 'Jan', count: 12 },
    { month: 'Feb', count: 18 },
    { month: 'Mar', count: 25 },
    { month: 'Apr', count: 32 },
    { month: 'May', count: 45 },
    { month: 'Jun', count: 68 },
    { month: 'Jul', count: suggestions.length + 42 } // Including historical
  ];

  return {
    totalSuggestions: total,
    todaysSuggestions: todays,
    villagesCovered: villages,
    averagePriorityScore: avgPriority,
    budgetUtilization: Math.min(100, budgetUtilization),
    totalBudgetAllocated,
    totalBudgetPlanned,
    categoryCounts,
    districtCounts,
    monthlyTrends
  };
}

// REST Endpoints
app.get('/api/suggestions', (req, res) => {
  res.json(suggestions);
});

app.post('/api/suggestions', async (req, res) => {
  const { citizenName, village, district, language, originalText, isSimulated } = req.body;

  if (!village || !district || !language || !originalText) {
    return res.status(400).json({ error: 'Missing required suggestion fields.' });
  }

  const newId = `sug-${Date.now()}`;
  const timestamp = new Date().toISOString();

  // If Gemini client exists, we run live translation and metadata extraction!
  if (aiClient && !isSimulated) {
    try {
      console.log(`Processing suggestion ${newId} with real Gemini API...`);

      const prompt = `You are the backend core of JanVoice AI, an advanced platform for Members of Parliament.
Analyze the following citizen suggestion submitted from rural India in their local language.
Your job is to translate it to clear English, categorize it, detect the sentiment, calculate priority metrics, and generate an actionable AI summary for the MP.

Citizen Details:
- Name: ${citizenName || 'Anonymous'}
- Village: ${village}
- District: ${district}
- Language: ${language}
- Text: "${originalText}"

Provide a JSON object strictly adhering to this structure:
{
  "translatedText": "Translation of originalText into English. Preserve details, emotions, and specific problems.",
  "category": "Must be exactly one of: Road, Water, Education, Healthcare, Electricity, Agriculture, Employment",
  "sentiment": "Must be exactly: positive, neutral, or negative",
  "urgency": 8, // An integer rating of urgency (1 to 10) based on life danger, blockages, health risk, etc.
  "impact": 1200, // Estimated population of beneficiaries in this village / region (integer, e.g. 100 to 15000)
  "budgetEstimate": 45, // Estimated project cost in Lakhs (integer, e.g., 5 to 500)
  "priorityScore": 88, // Priority score from 1 to 100 based on formula: (urgency * 6) + (impact / 300) - (budgetEstimate / 100). Bound strictly between 1 and 100.
  "aiSummary": "A concise, high-impact recommendation of 15-25 words starting with a strong action verb. E.g. 'Construct a paved cement concrete link road...'"
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedText: { type: Type.STRING },
              category: { type: Type.STRING },
              sentiment: { type: Type.STRING },
              urgency: { type: Type.INTEGER },
              impact: { type: Type.INTEGER },
              budgetEstimate: { type: Type.INTEGER },
              priorityScore: { type: Type.INTEGER },
              aiSummary: { type: Type.STRING }
            },
            required: ['translatedText', 'category', 'sentiment', 'urgency', 'impact', 'budgetEstimate', 'priorityScore', 'aiSummary']
          }
        }
      });

      const resultText = response.text;
      const data = JSON.parse(resultText);

      // Validate category
      const validCategories = ['Road', 'Water', 'Education', 'Healthcare', 'Electricity', 'Agriculture', 'Employment'];
      let category = data.category;
      if (!validCategories.includes(category)) {
        category = 'Water'; // fallback
      }

      const newSuggestion: Suggestion = {
        id: newId,
        citizenName: citizenName || 'Anonymous',
        village,
        district,
        language,
        originalText,
        translatedText: data.translatedText,
        category: category as any,
        sentiment: data.sentiment || 'neutral',
        priorityScore: data.priorityScore || 85,
        urgency: data.urgency || 8,
        impact: data.impact || 1200,
        budgetEstimate: data.budgetEstimate || 30,
        timestamp,
        status: 'Pending',
        aiSummary: data.aiSummary
      };

      suggestions.unshift(newSuggestion);

      // Add a dynamic comparison plan to match the new suggestion for demo variety
      const newPlan: DevPlanComparison = {
        id: `plan-${Date.now()}`,
        title: `${village} ${category} Project`,
        category: category as any,
        district,
        citizenDemand: data.translatedText,
        governmentPlan: `Under evaluation for budgetary sanctions under upcoming district development drafts.`,
        aiRecommendation: `${data.aiSummary} Standard design criteria recommended.`,
        matchStatus: Math.random() > 0.4 ? 'Conflict' : 'Match',
        priorityScore: data.priorityScore,
        budgetLakhs: data.budgetEstimate
      };
      devPlans.unshift(newPlan);

      return res.json(newSuggestion);
    } catch (error) {
      console.error('Gemini processing error, falling back to simulated generation:', error);
    }
  }

  // Local simulated fallback processing if Gemini fails or is missing
  console.log(`Processing suggestion ${newId} with simulated AI rules...`);
  
  // Categorize based on keywords
  let category: 'Road' | 'Water' | 'Education' | 'Healthcare' | 'Electricity' | 'Agriculture' | 'Employment' = 'Water';
  const text = originalText.toLowerCase();
  if (text.includes('सड़क') || text.includes('road') || text.includes('रस्ता') || text.includes('पक्की')) {
    category = 'Road';
  } else if (text.includes('स्कूल') || text.includes('school') || text.includes('शिक्षण') || text.includes('वर्गा')) {
    category = 'Education';
  } else if (text.includes('दवाखाना') || text.includes('hospital') || text.includes('आरोग्य') || text.includes('डॉक्टर') || text.includes('चिकित्सा')) {
    category = 'Healthcare';
  } else if (text.includes('लाईट') || text.includes('electricity') || text.includes('वीज') || text.includes('पावर') || text.includes('बिजली')) {
    category = 'Electricity';
  } else if (text.includes('शेती') || text.includes('farming') || text.includes('पीक') || text.includes('मार्केट') || text.includes('कृषि')) {
    category = 'Agriculture';
  } else if (text.includes('रोजगार') || text.includes('job') || text.includes('नोकरी') || text.includes('काम') || text.includes('रोजगारी')) {
    category = 'Employment';
  }

  // Mock Translate to English
  const mockTranslations: Record<string, string> = {
    'Marathi': 'Simulated Marathi translation of feedback. Concerns raised regarding civic issues in ' + village,
    'Hindi': 'Simulated Hindi translation of feedback. Describing village civic infrastructure issues in ' + village,
    'Tamil': 'Simulated Tamil translation. Detailing grievances in ' + village + ' regarding public resources.',
    'Telugu': 'Simulated Telugu translation. Highlighting development requirements in ' + village,
    'Gujarati': 'Simulated Gujarati translation. Describing local needs in ' + village,
    'Bengali': 'Simulated Bengali translation. Grievances about infrastructure in ' + village,
    'Punjabi': 'Simulated Punjabi translation. Highlighting irrigation and grid supplies in ' + village,
    'Kannada': 'Simulated Kannada translation. Local issues regarding agriculture or transport in ' + village,
    'Malayalam': 'Simulated Malayalam translation. Concerns about public utility in ' + village,
    'English': originalText
  };

  const translatedText = mockTranslations[language] || `Translated feedback from ${language}: "${originalText}"`;
  const urgency = Math.floor(Math.random() * 4) + 7; // 7 to 10
  const impact = Math.floor(Math.random() * 4000) + 500; // 500 to 4500
  const budgetEstimate = Math.floor(Math.random() * 90) + 10; // 10 to 100 Lakhs
  const priorityScore = Math.floor(Math.random() * 20) + 75; // 75 to 95

  const summaries: Record<string, string> = {
    'Water': `Deploy sustainable borewell networks and pipeline connectivity across ${village} to combat seasonal dry spells.`,
    'Road': `Construct a high-grade CC link road connecting ${village} to main market transport highways.`,
    'Education': `Reconstruct dilapidated school rooms and construct segregated sanitated toilets at ${village} primary school.`,
    'Healthcare': `Set up an auxiliary primary treatment clinic equipped with maternity and basic first aid in ${village}.`,
    'Electricity': `Upgrade rural step-down transformers and install decentralized solar irrigation pump clusters in ${village}.`,
    'Agriculture': `Establish local cold-room units at ${village} block for farmers to prevent seasonal crop spoiling.`,
    'Employment': `Launch a dedicated Computer and Technical Vocational Training Center in the village community hall.`
  };

  const newSuggestion: Suggestion = {
    id: newId,
    citizenName: citizenName || 'Anonymous',
    village,
    district,
    language,
    originalText,
    translatedText,
    category,
    sentiment: 'negative',
    priorityScore,
    urgency,
    impact,
    budgetEstimate,
    timestamp,
    status: 'Pending',
    aiSummary: summaries[category] || `Prioritize immediate infrastructural review for ${category} in ${village}.`
  };

  suggestions.unshift(newSuggestion);

  // Add a comparison plan
  const newPlan: DevPlanComparison = {
    id: `plan-${Date.now()}`,
    title: `${village} ${category} Project`,
    category,
    district,
    citizenDemand: translatedText,
    governmentPlan: `Under evaluation for local development draft inclusion. No immediate funds allocated.`,
    aiRecommendation: summaries[category],
    matchStatus: Math.random() > 0.4 ? 'Conflict' : 'Match',
    priorityScore,
    budgetLakhs: budgetEstimate
  };
  devPlans.unshift(newPlan);

  res.json(newSuggestion);
});

app.get('/api/dashboard-stats', (req, res) => {
  res.json(calculateStats());
});

app.get('/api/ai-recommendations', (req, res) => {
  res.json(aiRecommendations);
});

app.post('/api/ai-recommendations/action', (req, res) => {
  const { id, action } = req.body;
  const rec = aiRecommendations.find(r => r.id === id);
  if (rec) {
    rec.status = action;
    return res.json({ success: true, recommendation: rec });
  }
  res.status(404).json({ error: 'Recommendation not found' });
});

app.get('/api/development-plans', (req, res) => {
  res.json(devPlans);
});

app.post('/api/development-plans/approve', (req, res) => {
  const { id } = req.body;
  const plan = devPlans.find(p => p.id === id);
  if (plan) {
    plan.matchStatus = 'Match'; // Marked as approved alignment
    return res.json({ success: true, plan });
  }
  res.status(404).json({ error: 'Development plan not found' });
});

// Update standard suggestions status
app.post('/api/suggestions/status', (req, res) => {
  const { id, status } = req.body;
  const sug = suggestions.find(s => s.id === id);
  if (sug) {
    sug.status = status;
    return res.json({ success: true, suggestion: sug });
  }
  res.status(404).json({ error: 'Suggestion not found' });
});

// Vite Middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Mounted Vite middleware in development mode.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static build from dist/.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is booting! Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot failure:', err);
});
