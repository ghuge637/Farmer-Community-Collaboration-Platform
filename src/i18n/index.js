import { createContext, useContext, useMemo, useState, createElement } from 'react'
import en from './locales/en.json'
import mr from './locales/mr.json'

const LOCALE_KEY = 'app_locale'
const locales = { en, mr }

// Define meaningful navigation names for both languages
const navTranslations = {
  en: {
    menu: 'Menu',
    sidebar: 'Sidebar',
    closeSidebar: 'Close Sidebar',
    farmerHome: 'Home',
    myProfile: 'My Profile',
    expertAdvice: 'Expert Q&A',
    experts: 'Find Experts',
    rotationalFarming: 'Crop Rotation',
    cropRecommendation: 'Crop Advisor',
    settings: 'Settings',
    logout: 'Log Out',
    adminDashboard: 'Admin Dashboard',
    expertPanel: 'Expert Panel',
    login: 'Login',
    register: 'Register',
    brand: 'Maze Shet',
    search: 'Search',
    searchPlaceholder: 'Search users...'
  },
  mr: {
    menu: 'मेनू',
    sidebar: 'साइडबार',
    closeSidebar: 'बंद करा',
    farmerHome: 'मुख्य पृष्ठ',
    myProfile: 'माझी प्रोफाइल',
    expertAdvice: 'तज्ञांचा सल्ला',
    experts: 'तज्ञ शोधा',
    rotationalFarming: 'पीक फेरपालट',
    cropRecommendation: 'पीक सल्ला',
    settings: 'सेटिंग्ज',
    logout: 'बाहेर पडा',
    adminDashboard: 'प्रशासन',
    expertPanel: 'तज्ञ पॅनेल',
    login: 'लॉगिन',
    register: 'नोंदणी',
    brand: 'माझे शेत',
    search: 'शोधा',
    searchPlaceholder: 'वापरकर्ते शोधा...'
  }
}

// Additional translations for Post, Home, Expert, and Profile content
const contentTranslations = {
  en: {
    post: {
      expertAdvice: 'Expert Advice',
      verifiedExpert: 'Verified Expert',
      menu: 'Post Menu',
      edit: 'Edit',
      delete: 'Delete',
      saveChanges: 'Save Changes',
      cancelEdit: 'Cancel Edit',
      like: 'Like',
      comment: 'Comment',
      share: 'Share',
      linkCopied: 'Link copied!',
      shared: 'Shared!',
      save: 'Save',
      cancel: 'Cancel'
    },
    common: {
      you: 'You',
      deleteConfirm: 'Are you sure?',
      logoutConfirm: 'Are you sure you want to log out?',
      cancel: 'Cancel',
      serverError: 'Server Error',
      loading: 'Loading...',
      submitting: 'Submitting...',
      call: 'Call',
      whatsapp: 'WhatsApp',
      email: 'Email',
      na: 'N/A',
      registrationSuccess: 'Registration successful!',
    },
    home: {
      postCreated: 'Post created successfully',
      postCreateError: 'Failed to create post',
      postRemoved: 'Post was removed',
      likeConflict: 'Conflict saving like',
      commentAddError: 'Failed to add comment',
      commentDeleteError: 'Failed to delete comment',
      postUpdateError: 'Failed to update post',
      postDeleteError: 'Failed to delete post',
      allCrops: 'All Crops',
      allSeasons: 'All Seasons',
      allIssues: 'All Issues',
      loading: 'Loading...'
    },
    soils: {
      black: 'Black',
      clayey: 'Clayey',
      loamy: 'Loamy',
      red: 'Red',
      sandy: 'Sandy'
    },
    crops: {
      cotton: 'Cotton',
      soybean: 'Soybean',
      wheat: 'Wheat',
      rice: 'Rice',
      maize: 'Maize',
      sugarcane: 'Sugarcane',
      other: 'Other',
      barley: 'Barley',
      groundnuts: 'Ground Nuts',
      millets: 'Millets',
      oilseeds: 'Oil seeds',
      paddy: 'Paddy',
      pulses: 'Pulses',
      tobacco: 'Tobacco',
      chickpea: 'Chickpea',
      kidneybeans: 'Kidney Beans',
      pigeonpeas: 'Pigeon Peas',
      mothbeans: 'Moth Beans',
      mungbean: 'Mung Bean',
      blackgram: 'Black Gram',
      lentil: 'Lentil',
      pomegranate: 'Pomegranate',
      banana: 'Banana',
      mango: 'Mango',
      grapes: 'Grapes',
      watermelon: 'Watermelon',
      muskmelon: 'Muskmelon',
      apple: 'Apple',
      orange: 'Orange',
      papaya: 'Papaya',
      coconut: 'Coconut',
      jute: 'Jute',
      coffee: 'Coffee'
    },
    fertilizers: {
      urea: 'Urea',
      dap: 'DAP',
      mop: 'MOP',
      gypsum: 'Gypsum',
      potash: 'Potash',
      superphosphate: 'Superphosphate',
      singlesuperphosphate: 'Single Super Phosphate',
      ammoniumsulphate: 'Ammonium Sulphate',
      nosuggestion: 'No Suggestion'
    },
    seasons: {
      kharif: 'Kharif',
      rabi: 'Rabi',
      summer: 'Summer'
    },
    issues: {
      pest: 'Pest',
      disease: 'Disease',
      fertilizer: 'Fertilizer',
      irrigation: 'Irrigation'
    },
    expert: {
      loading: 'Loading experts...',
      verifiedExperts: 'Verified Experts',
      noExpertsFound: 'No verified experts found.',
      expertBadge: 'Expert',
      specialization: 'Specialization',
      cropExpertise: 'Crop Expertise',
      experience: 'Experience',
      years: 'years',
      region: 'Region',
      bio: 'Bio',
      viewProfile: 'View Profile',
      applyBtn: 'Apply for Expert',
      applyTitle: 'Apply to Become an Expert',
      yearsOfExperience: 'Years of Experience',
      applicationSubmitted: 'Application submitted and pending review.',
      applicationFailed: 'Failed to submit application.',
      applicationPending: 'Application Pending'
    },
    cropRecommendation: {
      title: 'Crop Advisory',
      subtitle: 'Enter your soil and weather values to get top crop recommendations.',
      formTitle: 'Input Parameters',
      resultsTitle: 'Top Recommendations',
      fertilizerFormTitle: 'Fertilizer Suggestions',
      fertilizerSubtitle: 'Use the same inputs to get fertilizer suggestions.',
      fertilizerResultsTitle: 'Top Fertilizers',
      fertilizerForCrop: 'For crop: {crop}',
      fertilizerEmptyTitle: 'No fertilizer results yet',
      fertilizerEmptyText: 'Fill the form and click Get Fertilizer to see suggestions.',
      fertilizerButton: 'Get Fertilizer',
      fertilizerRequired: 'Soil and crop are required.',
      soilType: 'Soil Type',
      cropName: 'Crop',
      nitrogen: 'Nitrogen (N)',
      phosphorous: 'Phosphorous (P)',
      potassium: 'Potassium (K)',
      temperature: 'Temperature (C)',
      humidity: 'Humidity (%)',
      ph: 'Soil pH',
      rainfall: 'Rainfall (mm)',
      placeholderNitrogen: 'e.g. 80',
      placeholderPhosphorous: 'e.g. 40',
      placeholderPotassium: 'e.g. 40',
      placeholderTemperature: '25.0',
      placeholderHumidity: '60.0',
      placeholderPh: '6.5',
      placeholderRainfall: '200',
      placeholderFertNitrogen: 'e.g. 50',
      placeholderFertPhosphorous: 'e.g. 50',
      placeholderFertPotassium: 'e.g. 50',
      getAdvisory: 'Get Advisory',
      reset: 'Reset',
      helper: 'All fields are required.',
      placeholderTitle: 'No results yet',
      placeholderText: 'Fill the form and click Get Advisory to see top crops.',
      loading: 'Generating recommendations...',
      error: 'Could not get recommendations. Please try again.',
      apiMissing: 'Crop API URL is not configured.',
      apiBadResponse: 'Bad response from crop API.',
      noResults: 'No recommendations found. Please try different values.',
      validation: 'Please enter valid numbers for all fields.',
      demoNote: 'Demo results shown. Set VITE_CROP_API_URL for live predictions.',
      rank: 'Rank {rank}',
      unitsNote: 'Tip: Use local soil test values for best accuracy.'
    },

    profile: {
      loginToFollow: 'Please log in to follow users',
      follow: 'Follow',
      unfollow: 'Unfollow',
      editProfile: 'Edit Profile',
      followers: 'followers',
      postsBy: 'Posts by {name}',
      noPosts: 'No posts yet.',
      editName: 'Name',
      editBio: 'Bio',
      addNewCourse: 'Add New Course',
      createNewCourse: 'Create New Course',
      courseTitle: 'Title',
      courseDescription: 'Description',
      courseMode: 'Mode',
      modeOnline: 'Online',
      modeOffline: 'Offline',
      modeField: 'Field',
      courseDuration: 'Duration',
      coursePrice: 'Price',
      contactPhone: 'Contact Phone',
      contactWhatsApp: 'Contact WhatsApp',
      contactEmail: 'Contact Email',
      enabled: 'Enabled',
      createCourseBtn: 'Create Course',
      coursesServices: 'Courses & Services',
      mode: 'Mode',
      duration: 'Duration',
      price: 'Price',
      fillAllFields: 'Please fill all required fields.',
      courseCreated: 'Course created successfully!',
      courseCreateFailed: 'Failed to create course.'
    }
  },
  mr: {
    post: {
      expertAdvice: 'तज्ञांचा सल्ला',
      verifiedExpert: 'प्रमाणित तज्ञ',
      menu: 'पोस्ट मेनू',
      edit: 'संपादित करा',
      delete: 'हटवा',
      saveChanges: 'बदल जतन करा',
      cancelEdit: 'रद्द करा',
      like: 'लाइक',
      comment: 'टिप्पणी',
      share: 'शेअर',
      linkCopied: 'लिंक कॉपी केली!',
      shared: 'शेअर केले!',
      save: 'जतन करा',
      cancel: 'रद्द करा'
    },
    common: {
      you: 'तुम्ही',
      deleteConfirm: 'तुम्हाला खात्री आहे का?',
      logoutConfirm: 'तुम्हाला खात्री आहे की तुम्ही लॉग आउट करू इच्छिता?',
      cancel: 'रद्द करा',
      serverError: 'सर्व्हर त्रुटी',
      loading: 'लोड होत आहे...',
      submitting: 'सबमिट करत आहे...',
      call: 'कॉल',
      whatsapp: 'व्हॉट्सॲप',
      email: 'ईमेल',
      na: 'लागू नाही',
      registrationSuccess: 'नोंदणी यशस्वी झाली!',
    },
    home: {
      postCreated: 'पोस्ट यशस्वीरित्या तयार केली',
      postCreateError: 'पोस्ट तयार करण्यात अयशस्वी',
      postRemoved: 'पोस्ट काढली गेली',
      likeConflict: 'लाइक जतन करताना त्रुटी',
      commentAddError: 'टिप्पणी जोडण्यात अयशस्वी',
      commentDeleteError: 'टिप्पणी हटवण्यात अयशस्वी',
      postUpdateError: 'पोस्ट अपडेट करण्यात अयशस्वी',
      postDeleteError: 'पोस्ट हटवण्यात अयशस्वी',
      allCrops: 'सर्व पिके',
      allSeasons: 'सर्व हंगाम',
      allIssues: 'सर्व समस्या',
      loading: 'लोड होत आहे...'
    },
    soils: {
      black: 'काळी',
      clayey: 'चिकणमाती',
      loamy: 'गाळाची',
      red: 'लाल',
      sandy: 'वालुकामय'
    },
    crops: {
      cotton: 'कापूस',
      soybean: 'सोयाबीन',
      wheat: 'गहू',
      rice: 'तांदूळ',
      maize: 'मका',
      sugarcane: 'ऊस',
      other: 'इतर',
      barley: 'बार्ली',
      groundnuts: 'भुईमूग',
      millets: 'बाजरी/नाचणी',
      oilseeds: 'तेलबिया',
      paddy: 'भात',
      pulses: 'डाळी',
      tobacco: 'तंबाखू',
      chickpea: 'हरभरा',
      kidneybeans: 'घेवडा/राजमा',
      pigeonpeas: 'तूर',
      mothbeans: 'मटकी',
      mungbean: 'मूग',
      blackgram: 'उडीद',
      lentil: 'मसूर',
      pomegranate: 'डाळिंब',
      banana: 'केळी',
      mango: 'आंबा',
      grapes: 'द्राक्षे',
      watermelon: 'कलिंगड',
      muskmelon: 'खरबूज',
      apple: 'सफरचंद',
      orange: 'संत्री',
      papaya: 'पपई',
      coconut: 'नारळ',
      jute: 'ताग',
      coffee: 'कॉफी'
    },
    fertilizers: {
      urea: '\u092f\u0941\u0930\u093f\u092f\u093e',
      dap: '\u0921\u0940\u090f\u092a\u0940',
      mop: '\u090f\u092e\u0913\u092a\u0940',
      gypsum: '\u091c\u093f\u092a\u094d\u0938\u092e',
      potash: '\u092a\u094b\u091f\u0945\u0936',
      superphosphate: '\u0938\u0941\u092a\u0930 \u092b\u0949\u0938\u094d\u092b\u0947\u091f',
      singlesuperphosphate: '\u0938\u093f\u0902\u0917\u0932 \u0938\u0941\u092a\u0930 \u092b\u0949\u0938\u094d\u092b\u0947\u091f',
      ammoniumsulphate: '\u0905\u092e\u094b\u0928\u093f\u092f\u092e \u0938\u0932\u094d\u092b\u0947\u091f',
      nosuggestion: '\u0936\u093f\u092b\u093e\u0930\u0938 \u0928\u093e\u0939\u0940'
    },

    seasons: {
      kharif: 'खरीप',
      rabi: 'रब्बी',
      summer: 'उन्हाळी'
    },
    issues: {
      pest: 'कीड',
      disease: 'रोग',
      fertilizer: 'खत',
      irrigation: 'सिंचन'
    },
    expert: {
      loading: 'तज्ञ लोड होत आहेत...',
      verifiedExperts: 'प्रमाणित तज्ञ',
      noExpertsFound: 'कोणतेही प्रमाणित तज्ञ आढळले नाहीत.',
      expertBadge: 'तज्ञ',
      specialization: 'विशेषज्ञता',
      cropExpertise: 'पीक कौशल्य',
      experience: 'अनुभव',
      years: 'वर्षे',
      region: 'विभाग',
      bio: 'परिचय',
      viewProfile: 'प्रोफाइल पहा',
      applyBtn: 'तज्ञ होण्यासाठी अर्ज करा',
      applyTitle: 'तज्ञ होण्यासाठी अर्ज',
      yearsOfExperience: 'अनुभव (वर्षे)',
      applicationSubmitted: 'अर्ज जमा केला आणि पुनरावलोकनासाठी प्रलंबित आहे.',
      applicationFailed: 'अर्ज जमा करण्यात अयशस्वी.',
      applicationPending: 'अर्ज प्रलंबित'
    },
    cropRecommendation: {
      title: 'पीक सल्ला',
      subtitle: 'आपल्या माती व हवामानाची मूल्ये भरून शीर्ष पीक शिफारसी मिळवा.',
      formTitle: 'इनपुट मापदंड',
      resultsTitle: 'शीर्ष शिफारसी',
      fertilizerFormTitle: 'खत शिफारसी',
      fertilizerSubtitle: 'त्याच इनपुटचा वापर करून खताच्या शिफारसी मिळवा.',
      fertilizerResultsTitle: 'शीर्ष खते',
      fertilizerForCrop: 'पीकासाठी: {crop}',
      fertilizerEmptyTitle: 'अजून खतांचे परिणाम नाहीत',
      fertilizerEmptyText: 'फॉर्म भरा आणि खत मिळवा वर क्लिक करा.',
      fertilizerButton: 'खत मिळवा',
      fertilizerRequired: 'मातीचा प्रकार आणि पीक आवश्यक आहेत.',
      soilType: 'मातीचा प्रकार',
      cropName: 'पीक',
      nitrogen: 'नायट्रोजन (N)',
      phosphorous: 'फॉस्फरस (P)',
      potassium: 'पोटॅशियम (K)',
      temperature: 'तापमान (C)',
      humidity: 'आर्द्रता (%)',
      ph: 'मातीचा pH',
      rainfall: 'पर्जन्य (मिमी)',
      placeholderNitrogen: 'उदा. 80',
      placeholderPhosphorous: 'उदा. 40',
      placeholderPotassium: 'उदा. 40',
      placeholderTemperature: '25.0',
      placeholderHumidity: '60.0',
      placeholderPh: '6.5',
      placeholderRainfall: '200',
      placeholderFertNitrogen: 'उदा. 50',
      placeholderFertPhosphorous: 'उदा. 50',
      placeholderFertPotassium: 'उदा. 50',
      getAdvisory: 'सल्ला मिळवा',
      reset: 'रीसेट',
      helper: 'सर्व फील्ड आवश्यक आहेत.',
      placeholderTitle: 'अजून परिणाम नाहीत',
      placeholderText: 'फॉर्म भरा आणि सल्ला मिळवा वर क्लिक करा.',
      loading: 'शिफारसी तयार होत आहेत...',
      error: 'शिफारसी मिळाल्या नाहीत. कृपया पुन्हा प्रयत्न करा.',
      apiMissing: 'पीक API URL सेट केलेला नाही.',
      apiBadResponse: 'पीक API कडून चुकीचा प्रतिसाद आला.',
      noResults: 'शिफारसी सापडल्या नाहीत. कृपया वेगवेगळ्या मूल्यांसह पुन्हा प्रयत्न करा.',
      validation: 'कृपया सर्व फील्डसाठी वैध अंक प्रविष्ट करा.',
      demoNote: 'डेमो परिणाम दाखवले आहेत. थेट अंदाजासाठी VITE_CROP_API_URL सेट करा.',
      rank: 'क्रमांक {rank}',
      unitsNote: 'टीप: उत्तम अचूकतेसाठी स्थानिक माती चाचणी मूल्ये वापरा.'
    },
    profile: {
      loginToFollow: 'वापरकर्त्यांना फॉलो करण्यासाठी कृपया लॉगिन करा',
      follow: 'फॉलो करा',
      unfollow: 'अनफॉलो करा',
      editProfile: 'प्रोफाइल संपादित करा',
      followers: 'फॉलोअर्स',
      postsBy: '{name} च्या पोस्ट',
      noPosts: 'अद्याप कोणतीही पोस्ट नाही.',
      editName: 'नाव',
      editBio: 'परिचय',
      addNewCourse: 'नवीन कोर्स जोडा',
      createNewCourse: 'नवीन कोर्स तयार करा',
      courseTitle: 'शीर्षक',
      courseDescription: 'वर्णन',
      courseMode: 'मोड',
      modeOnline: 'ऑनलाइन',
      modeOffline: 'ऑफलाइन',
      modeField: 'क्षेत्र',
      courseDuration: 'कालावधी',
      coursePrice: 'किंमत',
      contactPhone: 'संपर्क फोन',
      contactWhatsApp: 'संपर्क व्हॉट्सॲप',
      contactEmail: 'संपर्क ईमेल',
      enabled: 'सक्षम',
      createCourseBtn: 'कोर्स तयार करा',
      coursesServices: 'कोर्स आणि सेवा',
      mode: 'मोड',
      duration: 'कालावधी',
      price: 'किंमत',
      fillAllFields: 'कृपया सर्व आवश्यक फील्ड भरा.',
      courseCreated: 'कोर्स यशस्वीरित्या तयार केला!',
      courseCreateFailed: 'कोर्स तयार करण्यात अयशस्वी.'
    }
  }
}

// Inject/Update translations
Object.keys(navTranslations).forEach(lang => {
  if (!locales[lang]) return
  if (!locales[lang].nav) locales[lang].nav = {}
  Object.assign(locales[lang].nav, navTranslations[lang])

  // Inject content translations
  if (contentTranslations[lang]) {
    Object.keys(contentTranslations[lang]).forEach(section => {
      if (!locales[lang][section]) locales[lang][section] = {}
      Object.assign(locales[lang][section], contentTranslations[lang][section])
    })
  }
})

function getInitial() {
  const stored = localStorage.getItem(LOCALE_KEY)
  return stored || 'en'
}

export function tFactory(lang) {
  const locale = locales[lang] || locales.en
  function get(key) {
    return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), locale)
  }
  return function t(key, vars, fallback = '') {
    let str = get(key)
    if (str === undefined) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn(`[i18n] Missing translation for key: '${key}'`)
      }
      return fallback || ''
    }
    if (vars) {
      Object.keys(vars).forEach((k) => {
        const re = new RegExp(`\\{${k}\\}`, 'g')
        str = str.replace(re, vars[k])
      })
    }
    return str
  }
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(getInitial())
  const t = useMemo(() => tFactory(lang), [lang])

  function setLanguage(l) {
    setLang(l)
    localStorage.setItem(LOCALE_KEY, l)
  }

  return createElement(I18nContext.Provider, { value: { lang, setLanguage, t } }, children)
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider')
  return ctx
}
