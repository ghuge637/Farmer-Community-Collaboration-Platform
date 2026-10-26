// Real Government Schemes dataset for India & Maharashtra
export const INITIAL_SCHEMES = [
  {
    id: 1,
    title: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    titleMr: "प्रधानमंत्री किसान सन्मान निधी (पीएम-किसान)",
    category: "DIRECT_BENEFIT",
    level: "CENTRAL",
    isNew: false,
    subsidyAmount: "₹6,000 / year",
    subsidyAmountMr: "₹६,००० / वर्ष",
    description: "Income support of ₹6,000 per year in three equal installments of ₹2,000 directly transferred to Aadhaar-linked bank accounts of landholding farmer families.",
    descriptionMr: "जमीनधारक शेतकरी कुटुंबांच्या आधार-लिंक बँक खात्यात प्रत्येकी ₹२,००० च्या ३ समान हप्त्यांमध्ये वर्षाला ₹६,००० चे थेट उत्पन्न साहाय्य.",
    eligibilityCriteria: {
      maxLandAcres: 5,
      farmerTypes: ["Small", "Marginal", "General", "SC_ST", "Women"],
      crops: ["All"],
      maxIncome: 300000
    },
    eligibilityCriteriaText: "Small & Marginal farmers owning cultivable land up to 5 acres.",
    eligibilityCriteriaTextMr: "५ एकरपर्यंत लागवडीयोग्य जमीन असलेले अल्प व अत्यल्प भूधारक शेतकरी.",
    requiredDocuments: [
      "Aadhaar Card (Mobile Linked)",
      "7/12 & 8A Land Record Extract",
      "Bank Account Passbook (Aadhaar Seeded)",
      "Active Mobile Number for eKYC"
    ],
    requiredDocumentsMr: [
      "आधार कार्ड (मोबाईल लिंक केलेले)",
      "७/१२ आणि ८अ जमीन उतारा",
      "बँक पासबुक (आधार जोडलेले)",
      "ई-केवायसी साठी मोबाईल नंबर"
    ],
    portalUrl: "https://pmkisan.gov.in/",
    deadline: "Open All Year (Continuous Transfer)"
  },
  {
    id: 2,
    title: "Namo Shetkari MahaSanman Nidhi Yojna (NSMNY)",
    titleMr: "नमो शेतकरी महासन्मान निधी योजना",
    category: "DIRECT_BENEFIT",
    level: "STATE",
    isNew: true,
    subsidyAmount: "₹6,000 / year (Total ₹12,000 with PM-Kisan)",
    subsidyAmountMr: "₹६,००० / वर्ष (पीएम-किसान सोबत एकूण ₹१२,०००)",
    description: "Maharashtra State top-up scheme offering an additional ₹6,000/year to all PM-Kisan beneficiaries in Maharashtra, giving farmers a total of ₹12,000 yearly.",
    descriptionMr: "महाराष्ट्रातील पीएम-किसान लाभार्थ्यांना राज्य शासनाकडून अतिरिक्त ₹६,०००/वर्ष. दोन्ही योजना मिळून वर्षाला एकूण ₹१२,००० थेट बँक खात्यात जमा.",
    eligibilityCriteria: {
      maxLandAcres: 5,
      farmerTypes: ["Small", "Marginal", "General", "SC_ST", "Women"],
      crops: ["All"],
      state: "Maharashtra"
    },
    eligibilityCriteriaText: "All Maharashtra farmers registered under PM-KISAN scheme.",
    eligibilityCriteriaTextMr: "पीएम-किसान योजनेत नोंदणीकृत महाराष्ट्रातील सर्व शेतकरी.",
    requiredDocuments: [
      "PM-KISAN Registration ID",
      "Aadhaar Card",
      "7/12 Land Record Extract",
      "Bank Passbook (Direct Benefit Transfer Active)"
    ],
    requiredDocumentsMr: [
      "पीएम-किसान नोंदणी क्रमांक",
      "आधार कार्ड",
      "७/१२ जमीन उतारा",
      "डीबीटी सक्रिय बँक खाते पासबुक"
    ],
    portalUrl: "https://nsmny.mahait.org/",
    deadline: "Active State Scheme"
  },
  {
    id: 3,
    title: "PM KUSUM Solar Pump Scheme (Component B)",
    titleMr: "पीएम कुसुम सौर पंप योजना (घटक ब)",
    category: "SOLAR_POWER",
    level: "CENTRAL",
    isNew: true,
    subsidyAmount: "Up to 90% Subsidy (Farmer pays 10% only)",
    subsidyAmountMr: "९०% पर्यंत सबसिडी (शेतकऱ्याला फक्त १०% भरावे लागतात)",
    description: "Provides 90% total subsidy (60% Govt subsidy + 30% bank loan) for installing off-grid standalone solar agriculture pumps (3HP, 5HP, 7.5HP).",
    descriptionMr: "ऑफ-ग्रिड सौर कृषी पंपांसाठी (३HP, ५HP, ७.५HP) ९०% एकूण सबसिडी (६०% शासन + ३०% कर्ज). शेतकऱ्याला फक्त १०% रक्कम भरावी लागते.",
    eligibilityCriteria: {
      maxLandAcres: 20,
      farmerTypes: ["Small", "Marginal", "General", "SC_ST", "Women"],
      crops: ["All"],
      requiresWaterSource: true
    },
    eligibilityCriteriaText: "Farmers with agricultural land & open water source (well/borewell) lacking grid power connection.",
    eligibilityCriteriaTextMr: "वीज जोडणी नसलेले व विहीर/बोअरवेल पाण्याचा स्त्रोत असलेले सर्व शेतकरी.",
    requiredDocuments: [
      "7/12 & 8A Land Record Extract",
      "Aadhaar Card",
      "NOC Certificate for Water Source",
      "Caste Certificate (For SC/ST Extra Subsidy)"
    ],
    requiredDocumentsMr: [
      "७/१२ आणि ८अ उतारा",
      "आधार कार्ड",
      "पाणी स्त्रोताचे ना-हरकत प्रमाणपत्र (NOC)",
      "जातीचा दाखला (अ.जा/अ.जमाती अतिरिक्त सवलतीसाठी)"
    ],
    portalUrl: "https://pmkusum.mnre.gov.in/",
    deadline: "31st Dec 2026"
  },
  {
    id: 4,
    title: "Kisan Credit Card (KCC) Loan Scheme",
    titleMr: "किसान क्रेडिट कार्ड (KCC) अल्पमुदत कर्ज योजना",
    category: "CREDIT_WAIVER",
    level: "CENTRAL",
    isNew: true,
    subsidyAmount: "Low 4% Interest Rate Crop Loans up to ₹3 Lakhs",
    subsidyAmountMr: "₹३ लाखांपर्यंत फक्त ४% व्याजदराने पीक कर्ज",
    description: "Provides collateral-free crop credit up to ₹1.6 Lakhs (and up to ₹3 Lakhs with land mortgage) at effective 4% interest rate upon prompt repayment.",
    descriptionMr: "नियमित परतफेड करणाऱ्या शेतकऱ्यांसाठी अवघ्या ४% प्रभावी व्याजदराने ₹३ लाखांपर्यंत पीककर्ज व ₹१.६ लाखांपर्यंत विनातारण कर्ज.",
    eligibilityCriteria: {
      maxLandAcres: 50,
      farmerTypes: ["All"],
      crops: ["All"]
    },
    eligibilityCriteriaText: "All owner farmers, tenant farmers, sharecroppers & self-help group farmer members.",
    eligibilityCriteriaTextMr: "जमीन मालक शेतकरी, कुळ शेतकरी, भाडेतत्त्वावरील व बचत गट शेतकरी.",
    requiredDocuments: [
      "Application Form & Passport Photo",
      "7/12 & 8A Land Holding Extract",
      "Aadhaar Card & PAN Card",
      "No Dues Certificate from Local Banks"
    ],
    requiredDocumentsMr: [
      "अर्ज फॉर्म व पासपोर्ट फोटो",
      "७/१२ आणि ८अ जमीन उतारा",
      "आधार कार्ड व पॅन कार्ड",
      "स्थानिक बँकांचे थकबाकी नसल्याचे प्रमाणपत्र (No Dues)"
    ],
    portalUrl: "https://www.pmkisan.gov.in/KCC.aspx",
    deadline: "Available at All Banks Year-Round"
  },
  {
    id: 5,
    title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    titleMr: "प्रधानमंत्री पीक विमा योजना (पीएमएफबीवाय)",
    category: "CROP_INSURANCE",
    level: "CENTRAL",
    isNew: false,
    subsidyAmount: "Full Sum Insured (Premium @ 1.5% to 2% only)",
    subsidyAmountMr: "संपूर्ण पीक नुकसान भरपाई (प्रीमियम फक्त १.५% ते २%)",
    description: "Comprehensive crop insurance protection against crop loss due to drought, floods, unseasonal rains, hail, pests & plant diseases.",
    descriptionMr: "दुष्काळ, पूर, अवकाळी पाऊस, गारपीट, कीड आणि रोगांमुळे होणाऱ्या पीक नुकसानीपासून संपूर्ण विमा संरक्षण.",
    eligibilityCriteria: {
      maxLandAcres: 50,
      farmerTypes: ["All"],
      crops: ["Cotton", "Soybean", "Wheat", "Rice", "Maize", "Sugarcane", "Onion"]
    },
    eligibilityCriteriaText: "All farmers growing notified crops including sharecroppers and tenant farmers.",
    eligibilityCriteriaTextMr: "अधिसूचित पिके घेणारे सर्व शेतकरी, कुळ व भाडेतत्त्वावरील शेतकऱ्यांसह.",
    requiredDocuments: [
      "Crop Sowing Certificate (Pik Perani Patrak)",
      "7/12 Land Record Extract",
      "Aadhaar Card",
      "Bank Passbook Copy"
    ],
    requiredDocumentsMr: [
      "पीक पाहणी / पिक पेरणी पत्रक",
      "७/१२ जमीन उतारा",
      "आधार कार्ड",
      "बँक पासबुक प्रत"
    ],
    portalUrl: "https://pmfby.gov.in/",
    deadline: "31st July (Kharif) / 31st Dec (Rabi)"
  },
  {
    id: 6,
    title: "Sub-Mission on Agricultural Mechanization (SMAM / MahaDBT)",
    titleMr: "कृषी यांत्रिकीकरण उपअभियान (महाडीबीटी ट्रॅक्टर व अवजारे)",
    category: "MACHINERY",
    level: "CENTRAL",
    isNew: true,
    subsidyAmount: "50% to 80% Subsidy on Farm Machinery",
    subsidyAmountMr: "ट्रॅक्टर व कृषी अवजारांवर ५०% ते ८०% अनुदान",
    description: "Financial assistance for purchasing tractors, rotavators, power tillers, harvesters, seed drills, and battery sprayer pumps.",
    descriptionMr: "ट्रॅक्टर, रोटाव्हेटर, पॉवर टिलर, पेरणी यंत्र, कापणी यंत्र आणि बॅटरी फवारणी पंपांच्या खरेदीसाठी ५०% ते ८०% शासकीय सबसिडी.",
    eligibilityCriteria: {
      maxLandAcres: 25,
      farmerTypes: ["Small", "Marginal", "Women", "SC_ST", "General"],
      crops: ["All"]
    },
    eligibilityCriteriaText: "Priority given to Small/Marginal farmers, Women farmers, and SC/ST category.",
    eligibilityCriteriaTextMr: "महिला शेतकरी, अल्पभूधारक आणि अनुसूचित जाती/जमाती प्रवर्गातील शेतकऱ्यांना प्राधान्य.",
    requiredDocuments: [
      "Aadhaar Card",
      "7/12 & 8A Land Extract",
      "Quotation from Authorized Tractor Dealer",
      "Caste Certificate (if applicable)"
    ],
    requiredDocumentsMr: [
      "आधार कार्ड",
      "७/१२ आणि ८अ उतारा",
      "अधिकृत डीलरचे दरपत्रक (Quotation)",
      "जातीचा दाखला (लागू असल्यास)"
    ],
    portalUrl: "https://mahadbt.maharashtra.gov.in/",
    deadline: "Seasonal Window Open"
  },
  {
    id: 7,
    title: "Per Drop More Crop - Drip & Sprinkler Subsidy (PMKSY)",
    titleMr: "प्रति थेंब अधिक पीक - ठिबक व तुषार सिंचन अनुदान",
    category: "IRRIGATION",
    level: "CENTRAL",
    isNew: false,
    subsidyAmount: "55% to 80% Subsidy for Micro-Irrigation",
    subsidyAmountMr: "सूक्ष्म सिंचनासाठी ५५% ते ८०% अनुदान",
    description: "Financial assistance for installing drip irrigation & sprinkler sets to maximize water efficiency and crop yields.",
    descriptionMr: "पाण्याचा तुटवडा रोखण्यासाठी व उत्पादन वाढवण्यासाठी ठिबक व तुषार सिंचन संच बसवण्यासाठी ५५% ते ८०% अनुदान.",
    eligibilityCriteria: {
      maxLandAcres: 12.5,
      farmerTypes: ["Small", "Marginal", "General", "SC_ST", "Women"],
      crops: ["Cotton", "Sugarcane", "Wheat", "Soybean", "Maize", "Vegetables", "Horticulture"]
    },
    eligibilityCriteriaText: "Landholding farmers with permanent water source. 80% for Small/Marginal & 55% for others.",
    eligibilityCriteriaTextMr: "कायमस्वरूपी पाणी उपलब्ध असणारे शेतकरी. अल्पभूधारकांसाठी ८०% व इतरांसाठी ५५%.",
    requiredDocuments: [
      "7/12 Extract with Water Source Entry",
      "Aadhaar Card",
      "Drip/Sprinkler Purchase Bill & GST Invoice",
      "Bank Passbook Copy"
    ],
    requiredDocumentsMr: [
      "पाण्याच्या नोंदीसह ७/१२ उतारा",
      "आधार कार्ड",
      "ठिबक खरेदी बिल व जीएसटी इन्व्हॉईस",
      "बँक पासबुक प्रत"
    ],
    portalUrl: "https://pmksy.gov.in/",
    deadline: "31st March 2026"
  },
  {
    id: 8,
    title: "Agriculture Infrastructure Fund (AIF)",
    titleMr: "कृषी पायाभूत सुविधा निधी योजना (AIF)",
    category: "MACHINERY",
    level: "CENTRAL",
    isNew: true,
    subsidyAmount: "3% Interest Subvention + Credit Guarantee for Post-Harvest",
    subsidyAmountMr: "३% व्याज सवलत + गोदाम व कोल्ड स्टोरेजसाठी क्रेडिट गॅरंटी",
    description: "Medium-long term debt financing for post-harvest infrastructure such as warehouses, cold storage, grading units & custom hiring centers.",
    descriptionMr: "पिकांनंतरच्या व्यवस्थापनासाठी उदा. धान्य गोडाऊन, कोल्ड स्टोरेज, प्रतवारी केंद्र आणि अवजार बँकेसाठी ३% व्याज सवलतीसह कर्ज.",
    eligibilityCriteria: {
      maxLandAcres: 100,
      farmerTypes: ["All"],
      crops: ["All"]
    },
    eligibilityCriteriaText: "Individual farmers, Agri-entrepreneurs, FPOs & Primary Agricultural Credit Societies (PACS).",
    eligibilityCriteriaTextMr: "वैयक्तिक शेतकरी, कृषी व्यावसायिक, शेतकरी उत्पादक कंपनी (FPO) व विकास संस्था.",
    requiredDocuments: [
      "Detailed Project Report (DPR)",
      "Land Ownership Document / Lease Deed",
      "KYC (Aadhaar & PAN)",
      "Bank Loan Proposal Form"
    ],
    requiredDocumentsMr: [
      "प्रकल्प अहवाल (DPR)",
      "जमीन मालकी हक्क किंवा भाडेपट्टा करार",
      "केवायसी (आधार व पॅन)",
      "बँक कर्ज प्रस्ताव अर्ज"
    ],
    portalUrl: "https://agriinfra.dac.gov.in/",
    deadline: "Active Scheme"
  },
  {
    id: 9,
    title: "Soil Health Card & Paramparagat Krishi Vikas Yojana (PKVY)",
    titleMr: "मृदा आरोग्य पत्रिका आणि सेंद्रिय शेती प्रोत्साहन योजना",
    category: "SEEDS_FERTILIZER",
    level: "CENTRAL",
    isNew: false,
    subsidyAmount: "Free Soil Testing + ₹50,000 / Hectare Subsidy",
    subsidyAmountMr: "मोफत माती चाचणी + ₹५०,००० / हेक्टर सेंद्रिय मदत",
    description: "Provides free soil testing cards every 2 years with tailored nutrient recommendations plus ₹50,000/ha for organic seeds & bio-fertilizers.",
    descriptionMr: "दर २ वर्षांनी मोफत माती चाचणी कार्ड आणि सेंद्रिय शेतीसाठी बियाणे व जैविक खतांवर ₹५०,००० प्रति हेक्टर अनुदान.",
    eligibilityCriteria: {
      maxLandAcres: 25,
      farmerTypes: ["All"],
      crops: ["All"]
    },
    eligibilityCriteriaText: "Open to all practicing agricultural farmers and organic cluster farmer groups.",
    eligibilityCriteriaTextMr: "शेती करणारे सर्व शेतकरी आणि सेंद्रिय शेती गट.",
    requiredDocuments: [
      "Soil Sample Identification Slip",
      "7/12 Extract Copy",
      "Aadhaar Card"
    ],
    requiredDocumentsMr: [
      "माती नमुना स्लिप",
      "७/१२ उतारा कॉप",
      "आधार कार्ड"
    ],
    portalUrl: "https://soilhealth.dac.gov.in/",
    deadline: "Open All Year"
  },
  {
    id: 10,
    title: "Nanaji Deshmukh Krushi Sanjivani Prakalp (PoCRA)",
    titleMr: "नानाजी देशमुख कृषी संजीवनी प्रकल्प (पोक्रा / PoCRA)",
    category: "IRRIGATION",
    level: "STATE",
    isNew: false,
    subsidyAmount: "100% Direct Bank Transfer for Farm Ponds & Wells",
    subsidyAmountMr: "शेततळे, विहीर व शेडनेटसाठी १००% डीबीटी सबसिडी",
    description: "Climate-resilient agriculture project offering subsidies for farm ponds, shade net houses, polyhouses, micro-irrigation & seed production.",
    descriptionMr: "हवामान अनुकूल कृषी प्रकल्प: शेततळे, शेडनेट हाऊस, पॉलीहाऊस, ठिबक आणि बियाणे उत्पादनासाठी भरघोस अनुदान.",
    eligibilityCriteria: {
      maxLandAcres: 5,
      farmerTypes: ["Small", "Marginal", "Women", "SC_ST"],
      crops: ["Cotton", "Soybean", "Pigeon Pea", "Gram"],
      state: "Maharashtra"
    },
    eligibilityCriteriaText: "Farmers residing in notified drought-prone villages of Maharashtra.",
    eligibilityCriteriaTextMr: "महाराष्ट्रातील अधिसूचित दुष्काळप्रवण गावातील अल्प व अत्यल्प भूधारक शेतकरी.",
    requiredDocuments: [
      "7/12 & 8A Land Records",
      "Aadhaar Card linked to Bank Account",
      "Gram Panchayat Approval Certificate"
    ],
    requiredDocumentsMr: [
      "७/१२ आणि ८अ जमीन नोंद",
      "बँक खात्याशी लिंक आधार कार्ड",
      "ग्रामपंचायत शिफारस पत्र"
    ],
    portalUrl: "https://pocra.mahabhumi.gov.in/",
    deadline: "Project Phase Active"
  }
]

import { getApiBaseUrl } from './api'

const TRACKED_KEY = 'farmer_tracked_schemes'

export async function fetchSchemes() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/schemes`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    }
  } catch (err) {
    // Fallback to INITIAL_SCHEMES dataset
  }
  return INITIAL_SCHEMES
}

export function evaluateEligibility(params = {}, schemeList = INITIAL_SCHEMES) {
  const acres = parseFloat(params.landAcres) || 0
  const familyIncome = parseFloat(params.income) || 200000
  const listToEval = (Array.isArray(schemeList) && schemeList.length > 0) ? schemeList : INITIAL_SCHEMES

  return listToEval.map(scheme => {
    let score = 100
    const reasons = []

    const criteria = scheme.eligibilityCriteria || {}

    // 1. State check
    if (criteria.state && params.state && criteria.state.toLowerCase() !== params.state.toLowerCase() && params.state !== 'All') {
      score -= 60
      reasons.push(`Exclusively for farmers in ${criteria.state}`)
    }

    // 2. Land acres check
    if (criteria.maxLandAcres && acres > criteria.maxLandAcres) {
      score -= 40
      reasons.push(`Land size (${acres} acres) exceeds upper threshold limit of ${criteria.maxLandAcres} acres`)
    }

    // 3. Farmer category match
    if (criteria.farmerTypes && !criteria.farmerTypes.includes("All") && params.farmerType) {
      if (!criteria.farmerTypes.includes(params.farmerType)) {
        score -= 25
        reasons.push(`Targeted for ${criteria.farmerTypes.join(', ')} farmers`)
      }
    }

    // 4. Crop match
    if (criteria.crops && !criteria.crops.includes("All") && params.crop) {
      if (!criteria.crops.includes(params.crop)) {
        score -= 20
        reasons.push(`Applicable for ${criteria.crops.join(', ')} crops`)
      }
    }

    // 5. Income check
    if (criteria.maxIncome && familyIncome > criteria.maxIncome) {
      score -= 20
      reasons.push(`Income exceeds maximum allowed limit`)
    }

    const finalScore = Math.max(0, Math.min(100, score))

    return {
      scheme,
      eligible: finalScore >= 60,
      score: finalScore,
      reasons
    }
  }).sort((a, b) => b.score - a.score)
}

export function getTrackedSchemes() {
  try {
    const raw = localStorage.getItem(TRACKED_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (ex) {
    return {}
  }
}

export async function saveTrackedStatus(schemeId, status, applicationNumber = '', notes = '') {
  const current = getTrackedSchemes()
  const updated = {
    ...current,
    [schemeId]: {
      status,
      applicationNumber,
      notes,
      updatedAt: new Date().toISOString()
    }
  }
  localStorage.setItem(TRACKED_KEY, JSON.stringify(updated))

  try {
    await fetch(`${getApiBaseUrl()}/schemes/${schemeId}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, applicationNumber, notes })
    })
  } catch (e) {
    // Silently handle offline backend
  }

  return updated
}
