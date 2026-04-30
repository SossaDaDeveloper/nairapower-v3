/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Zap, 
  Trash2, 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  LayoutDashboard, 
  Lightbulb, 
  TrendingDown, 
  AlertCircle,
  CheckCircle2,
  Trophy,
  History,
  Sun,
  Moon,
  Wind,
  Refrigerator,
  Microwave,
  Tv,
  Smartphone,
  Briefcase,
  WashingMachine,
  Fan,
  ShieldCheck,
  MapPin,
  Database,
  FileJson,
  FileText,
  Cloud,
  Globe,
  MessageSquare,
  Bot,
  Send,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { useTranslation } from 'react-i18next';

// --- Constants & Data ---

const POWER_SOURCES = [
  { id: 'band-a', nameKey: 'source_band_a_name', rate: 209.50, descKey: 'source_band_a_desc' },
  { id: 'band-b', nameKey: 'source_band_b_name', rate: 63.00, descKey: 'source_band_b_desc' },
  { id: 'band-c', nameKey: 'source_band_c_name', rate: 50.00, descKey: 'source_band_c_desc' },
  { id: 'band-d', nameKey: 'source_band_d_name', rate: 42.00, descKey: 'source_band_d_desc' },
  { id: 'band-e', nameKey: 'source_band_e_name', rate: 35.00, descKey: 'source_band_e_desc' },
  { id: 'petrol', nameKey: 'source_petrol_name', rate: 580.00, descKey: 'source_petrol_desc' },
  { id: 'diesel', nameKey: 'source_diesel_name', rate: 720.00, descKey: 'source_diesel_desc' },
  { id: 'solar', nameKey: 'source_solar_name', rate: 0.00, descKey: 'source_solar_desc' },
];

const APPLIANCE_DATABASE = [
  // Cooling & Comfort
  { id: 'ac-1.5hp-split', nameKey: 'app_ac_1_5hp_split', watts: 1500, categoryKey: 'cat_cooling', icon: Wind },
  { id: 'ac-1.5hp-inverter', nameKey: 'app_ac_1_5hp_inverter', watts: 700, categoryKey: 'cat_cooling', icon: Wind },
  { id: 'ac-2hp-split', nameKey: 'app_ac_2hp_split', watts: 2000, categoryKey: 'cat_cooling', icon: Wind },
  { id: 'ac-window', nameKey: 'app_ac_window', watts: 1800, categoryKey: 'cat_cooling', icon: Wind },
  { id: 'fan-standing', nameKey: 'app_fan_standing', watts: 80, categoryKey: 'cat_cooling', icon: Fan },
  { id: 'fan-ceiling', nameKey: 'app_fan_ceiling', watts: 100, categoryKey: 'cat_cooling', icon: Fan },
  { id: 'fan-rechargeable', nameKey: 'app_fan_rechargeable', watts: 30, categoryKey: 'cat_cooling', icon: Fan },
  { id: 'air-cooler', nameKey: 'app_air_cooler', watts: 150, categoryKey: 'cat_cooling', icon: Wind },

  // Kitchen & Refrigeration
  { id: 'freezer-chest', nameKey: 'app_freezer_chest', watts: 350, categoryKey: 'cat_kitchen', icon: Refrigerator },
  { id: 'fridge-double', nameKey: 'app_fridge_double', watts: 500, categoryKey: 'cat_kitchen', icon: Refrigerator },
  { id: 'fridge-bedside', nameKey: 'app_fridge_bedside', watts: 90, categoryKey: 'cat_kitchen', icon: Refrigerator },
  { id: 'fridge-inverter', nameKey: 'app_fridge_inverter', watts: 150, categoryKey: 'cat_kitchen', icon: Refrigerator },
  { id: 'kettle', nameKey: 'app_kettle', watts: 2000, categoryKey: 'cat_kitchen', icon: Microwave },
  { id: 'microwave', nameKey: 'app_microwave', watts: 1200, categoryKey: 'cat_kitchen', icon: Microwave },
  { id: 'air-fryer', nameKey: 'app_air_fryer', watts: 1500, categoryKey: 'cat_kitchen', icon: Microwave },
  { id: 'blender', nameKey: 'app_blender', watts: 400, categoryKey: 'cat_kitchen', icon: Microwave },
  { id: 'hotplate-single', nameKey: 'app_hotplate_single', watts: 1500, categoryKey: 'cat_kitchen', icon: Microwave },
  { id: 'hotplate-double', nameKey: 'app_hotplate_double', watts: 2500, categoryKey: 'cat_kitchen', icon: Microwave },
  { id: 'toaster', nameKey: 'app_toaster', watts: 800, categoryKey: 'cat_kitchen', icon: Microwave },

  // Business & SME Tools
  { id: 'barber-clippers', nameKey: 'app_barber_clippers', watts: 20, categoryKey: 'cat_business', icon: Briefcase },
  { id: 'sterilizer', nameKey: 'app_sterilizer', watts: 60, categoryKey: 'cat_business', icon: Briefcase },
  { id: 'hair-dryer', nameKey: 'app_hair_dryer', watts: 1800, categoryKey: 'cat_business', icon: Briefcase },
  { id: 'hood-dryer', nameKey: 'app_hood_dryer', watts: 1200, categoryKey: 'cat_business', icon: Briefcase },
  { id: 'iron-electric', nameKey: 'app_iron_electric', watts: 1200, categoryKey: 'cat_business', icon: Briefcase },
  { id: 'pump-0.5hp', nameKey: 'app_pump_0_5hp', watts: 375, categoryKey: 'cat_business', icon: Briefcase },
  { id: 'pump-1hp', nameKey: 'app_pump_1hp', watts: 750, categoryKey: 'cat_business', icon: Briefcase },
  { id: 'photocopy', nameKey: 'app_photocopy', watts: 600, categoryKey: 'cat_business', icon: Briefcase },
  { id: 'printer-laser', nameKey: 'app_printer_laser', watts: 500, categoryKey: 'cat_business', icon: Briefcase },
  { id: 'desktop-pc', nameKey: 'app_desktop_pc', watts: 300, categoryKey: 'cat_business', icon: Briefcase },

  // Laundry
  { id: 'wash-semi', nameKey: 'app_wash_semi', watts: 400, categoryKey: 'cat_laundry', icon: WashingMachine },
  { id: 'wash-full', nameKey: 'app_wash_full', watts: 2000, categoryKey: 'cat_laundry', icon: WashingMachine },
  { id: 'dryer-clothes', nameKey: 'app_dryer_clothes', watts: 3000, categoryKey: 'cat_laundry', icon: WashingMachine },
  { id: 'vacuum', nameKey: 'app_vacuum', watts: 1200, categoryKey: 'cat_laundry', icon: WashingMachine },

  // Entertainment
  { id: 'tv-32', nameKey: 'app_tv_32', watts: 50, categoryKey: 'cat_entertainment', icon: Tv },
  { id: 'tv-55', nameKey: 'app_tv_55', watts: 120, categoryKey: 'cat_entertainment', icon: Tv },
  { id: 'sound-system', nameKey: 'app_sound_system', watts: 200, categoryKey: 'cat_entertainment', icon: Tv },
  { id: 'decoder', nameKey: 'app_decoder', watts: 20, categoryKey: 'cat_entertainment', icon: Tv },
  { id: 'laptop-charger', nameKey: 'app_laptop_charger', watts: 65, categoryKey: 'cat_entertainment', icon: Smartphone },
  { id: 'phone-charger', nameKey: 'app_phone_charger', watts: 25, categoryKey: 'cat_entertainment', icon: Smartphone },
  { id: 'gaming-console', nameKey: 'app_gaming_console', watts: 200, categoryKey: 'cat_entertainment', icon: Tv },

  // Lighting
  { id: 'light-yellow', nameKey: 'app_light_yellow', watts: 100, categoryKey: 'cat_lighting', icon: Lightbulb },
  { id: 'light-cfl', nameKey: 'app_light_cfl', watts: 25, categoryKey: 'cat_lighting', icon: Lightbulb },
  { id: 'light-led', nameKey: 'app_light_led', watts: 10, categoryKey: 'cat_lighting', icon: Lightbulb },
  { id: 'flood-halogen', nameKey: 'app_flood_halogen', watts: 500, categoryKey: 'cat_lighting', icon: Lightbulb },
  { id: 'flood-led', nameKey: 'app_flood_led', watts: 50, categoryKey: 'cat_lighting', icon: Lightbulb },
];

const UPGRADES = [
  { 
    nameKey: 'upgrade_led_name', 
    targetKey: 'cat_lighting', 
    cost: 15000, 
    savingsMultiplier: 0.1, 
    descKey: 'upgrade_led_desc' 
  },
  { 
    nameKey: 'upgrade_ac_name', 
    targetKey: 'cat_cooling', 
    cost: 350000, 
    savingsMultiplier: 0.46, 
    descKey: 'upgrade_ac_desc' 
  },
  { 
    nameKey: 'upgrade_solar_name', 
    targetKey: 'cat_business', 
    cost: 2500000, 
    savingsMultiplier: 0.8, 
    descKey: 'upgrade_solar_desc' 
  }
];

// --- Components ---

const Header = ({ selectedSource, isProMode, setIsProMode, auditType, isDarkMode, setIsDarkMode }: { selectedSource: any, isProMode: boolean, setIsProMode: (v: boolean) => void, auditType: string, isDarkMode: boolean, setIsDarkMode: (v: boolean) => void }) => {
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'pcm', name: 'Pidgin' },
    { code: 'yo', name: 'Yoruba' },
    { code: 'ig', name: 'Igbo' },
    { code: 'ha', name: 'Hausa' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-nigerian-green dark:bg-slate-900 text-white border-b-4 border-nigerian-gold px-4 md:px-8 py-4 flex justify-between items-center h-20 transition-colors">
      <div className="flex items-center gap-3">
        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg text-nigerian-green dark:text-nigerian-gold font-bold text-xl flex items-center justify-center w-10 h-10 shadow-sm transition-colors">₦</div>
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-baseline gap-2 leading-none">
            {t('app_name')}
          </h1>
          <span className="text-[10px] text-nigerian-gold font-black uppercase tracking-widest opacity-80">
            {auditType === 'residential' ? t('residential_audit') : t('commercial_audit')}
          </span>
        </div>
      </div>
      
      <div className="flex gap-2 md:gap-8 items-center">
        {/* Theme Toggle */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 p-2 rounded-xl border border-white/20 transition-all text-nigerian-gold"
          title={isDarkMode ? t('light_mode') : t('dark_mode')}
        >
          {isDarkMode ? <Moon className="w-5 h-5 transition-transform hover:-rotate-12" /> : <Sun className="w-5 h-5 transition-transform hover:rotate-45" />}
        </button>

        {/* Language Selection */}
        <div className="relative group">
          <button className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl border border-white/20 transition-all">
            <Globe className="w-4 h-4 text-nigerian-gold" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
              {languages.find(l => l.code === i18n.language)?.name || 'English'}
            </span>
          </button>
          <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50 overflow-hidden">
            {languages.map((lng) => (
              <button 
                key={lng.code}
                onClick={() => changeLanguage(lng.code)}
                className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${i18n.language === lng.code ? 'text-nigerian-green bg-nigerian-green/5' : 'text-slate-600 dark:text-slate-300'}`}
              >
                {lng.name}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl ring-1 ring-white/20">
          <label className="text-[10px] font-black uppercase tracking-widest cursor-pointer select-none">{t('pro_mode')}</label>
          <button 
            onClick={() => setIsProMode(!isProMode)}
            className={`w-10 h-5 rounded-full relative transition-colors ${isProMode ? 'bg-nigerian-gold' : 'bg-white/20'}`}
          >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isProMode ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] opacity-80 uppercase font-black tracking-widest leading-none mb-1">{t('current_source')}</p>
          <p className="font-bold text-nigerian-gold text-sm">{t(selectedSource.nameKey)}</p>
        </div>
      </div>
    </header>
  );
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const App = () => {
  const { t, i18n } = useTranslation();
  const [currentUser, setCurrentUser] = useState<{ phone: string } | null>(() => {
    const saved = localStorage.getItem('np_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authPhone, setAuthPhone] = useState('');

  const [step, setStep] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('np_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('np_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('np_theme', 'light');
    }
  }, [isDarkMode]);

  const [auditType, setAuditType] = useState<'residential' | 'commercial'>('residential');
  const [isProMode, setIsProMode] = useState(false);
  const [auditorInfo, setAuditorInfo] = useState({ name: '', business: '', lga: '' });
  const [selectedSource, setSelectedSource] = useState(POWER_SOURCES[0]);
  const [sourceHours, setSourceHours] = useState<number[]>(Array(7).fill(12));
  const [selectedAppliances, setSelectedAppliances] = useState<{id: string, qty: number, hours: number}[]>([]);
  const [showNudge, setShowNudge] = useState(false);
  const [savedWorkspaces, setSavedWorkspaces] = useState<any[]>(() => {
    const saved = localStorage.getItem('np_workspaces');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [showAuditSetup, setShowAuditSetup] = useState(false);
  const handleAuth = (mode: 'login' | 'signup') => {
    if (!authPhone) return alert("Please enter phone number");
    const user = { phone: authPhone };
    setCurrentUser(user);
    localStorage.setItem('np_user', JSON.stringify(user));
    setAuthPhone('');
  };

  const saveWorkspace = (customName?: string) => {
    const currentWorkspace = savedWorkspaces.find(w => w.id === activeWorkspaceId);
    const defaultName = currentWorkspace?.name || `${t('residential_audit')} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const finalName = customName || defaultName;

    const freshWorkspace = {
      id: activeWorkspaceId || Math.random().toString(36).substr(2, 9),
      name: finalName,
      auditType,
      selectedSource,
      sourceHours,
      selectedAppliances,
      date: new Date().toISOString()
    };
    
    setSavedWorkspaces(prev => {
      const filtered = prev.filter(w => w.id !== freshWorkspace.id);
      const updated = [freshWorkspace, ...filtered];
      localStorage.setItem('np_workspaces', JSON.stringify(updated));
      return updated;
    });
    setActiveWorkspaceId(freshWorkspace.id);
    return true;
  };

  const renameWorkspace = () => {
    const currentWorkspace = savedWorkspaces.find(w => w.id === activeWorkspaceId);
    if (!currentWorkspace) return;
    const newName = window.prompt("Wetin be the new name for this workspace?", currentWorkspace.name);
    if (newName && newName.trim()) {
      const trimmedName = newName.trim();
      setWorkspaceName(trimmedName);
      saveWorkspace(trimmedName);
    }
  };

  const loadWorkspace = (ws: any) => {
    setAuditType(ws.auditType);
    setSelectedSource(ws.selectedSource);
    setSourceHours(Array.isArray(ws.sourceHours) ? ws.sourceHours : Array(7).fill(ws.sourceHours || 12));
    setSelectedAppliances(ws.selectedAppliances);
    setActiveWorkspaceId(ws.id);
    setWorkspaceName(ws.name || '');
    setShowAuditSetup(false);
    setStep(4); // Jump to dashboard
  };

  const startNewAudit = () => {
    setActiveWorkspaceId(null);
    setWorkspaceName('');
    setStep(0);
    setShowAuditSetup(true);
    setSelectedAppliances([]);
    setSourceHours(Array(7).fill(12));
  };
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'ai' | 'user', content: string }[]>([
    { role: 'ai', content: t('sabi_advisor_intro') }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);

  // AI Advisor Initialization
<<<<<<< HEAD
  const ai = useMemo(() => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY }), []);
=======
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }), []);

>>>>>>> a2c9e6158310af0c205f14f0f9076cf9b23bcd09
  // Update AI greeting on language change
  useEffect(() => {
    setChatMessages([
      { role: 'ai', content: t('ai_intro') }
    ]);
  }, [i18n.language, t]);

  // Simulated Nudge
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => setShowNudge(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // AI Advisor Logic
  const generateAIResponse = async (userQuery: string) => {
    try {
      const selectedLanguageName = (() => {
        const languages: {[key: string]: string} = {
          en: 'English',
          pcm: 'Nigerian Pidgin',
          yo: 'Yoruba',
          ig: 'Igbo',
          ha: 'Hausa'
        };
        return languages[i18n.language] || 'English';
      })();

      const topApplianceInfo = (() => {
        if (selectedAppliances.length === 0) return null;
        const sorted = [...selectedAppliances].sort((a, b) => {
          const appA = APPLIANCE_DATABASE.find(x => x.id === a.id);
          const appB = APPLIANCE_DATABASE.find(x => x.id === b.id);
          return ((appB?.watts || 0) * b.qty * b.hours) - ((appA?.watts || 0) * a.qty * a.hours);
        });
        const item = sorted[0];
        const app = APPLIANCE_DATABASE.find(x => x.id === item.id);
        const saving2hr = app ? (app.watts * item.qty * 2 / 1000) * selectedSource.rate * 30 : 0;
        return { nameKey: app?.nameKey, watts: app?.watts, currentHours: item.hours, saving2hr };
      })();

      const currentLanguage = i18n.language;
      const auditSummary = `
        User Audit Context (NairaPower Data):
        - Audit Type: ${auditType}
        - Current Power Source: ${t(selectedSource.nameKey)} (Rate: ₦${selectedSource.rate}/kWh)
        - Typical Supply Hours: ${(sourceHours.reduce((a, b) => a + b, 0) / 7).toFixed(1)} hrs/day average
        - Monthly Spend: ₦${totals.monthlySpend.toLocaleString()}
        - Monthly Waste (Efficiency Bleed): ₦${totals.monthlyWaste.toLocaleString()}
        - Sabi Efficiency Score: ${totals.sabiScore}/100
        - Top Consumption Appliance: ${t(topApplianceInfo?.nameKey || '') || 'Unknown'} (Currently ${topApplianceInfo?.currentHours} hrs/day)
        - Potential Savings (if used 2 hrs less): ₦${topApplianceInfo?.saving2hr.toLocaleString()}/month
        - Source Category: ${selectedSource.id} ( petrol/diesel = Gen, grid = Grid)
        - Top Roadmap Actions: ${roadmapItems.map(i => t(i.nameKey)).join(', ')}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: `${auditSummary}\n\nUser Question: ${userQuery}` }] }
        ],
        config: {
          systemInstruction: `You are 'Sabi AI', a helpful Nigerian Energy Advisor.
          
          THE USER HAS SELECTED LANGUAGE: [${selectedLanguageName}].
          YOU MUST RESPOND ONLY IN [${selectedLanguageName}].
          Use local context, analogies, and energy terms relevant to a Nigerian consumer using ${selectedLanguageName}.
          If the user provides input in ${currentLanguage}, continue the conversation in that language.
          
          CORE RULES:
          1. DATA-FIRST: Always use the provided audit values (₦ spend, waste, top appliance) in your bubbles.
          2. TONALITY: Relatable, helpful, sharp Nigerian professional. Use 'Sabi', 'NairaPower', 'Bleeding Naira' if appropriate for the language.
          3. CONTEXTUAL LOGIC:
             - If asked about 'Savings': Mention the specific 'Action Plan' for the ${t(topApplianceInfo?.nameKey || '') || 'top appliance'}. Say: 'If you cut your usage of ${t(topApplianceInfo?.nameKey || '')} by 2 hours, you save ₦${topApplianceInfo?.saving2hr.toLocaleString()} every month!'
             - If asked about 'CNG/Gas': If they use Petrol/Diesel (currently ${selectedSource.id}), highlight the massive ROI of switching from ₦${selectedSource.id === 'petrol' ? '1,250' : '2,020'}/L fuel to Gas.
             - If asked about 'Grid': Explain that their ₦${totals.monthlyWaste.toLocaleString()} monthly waste isn't just taking money, it's stressing their local transformer (waste amps).
          4. PERSONAL TOUCH: Acknowledge their specific shop/home spend. "Based on your audit, your ${auditType === 'commercial' ? 'business' : 'home'} is currently wasting ₦${totals.monthlyWaste.toLocaleString()}..."
          5. Keep responses concise and ACTIONABLE.`
        }
      });

      return response.text || "My brain don jam small. Please try again.";
    } catch (error) {
      console.error("AI Error:", error);
      return "I lost my connection to the grid. Abeg try again later.";
    }
  };

  const handleSendMessage = async (preloaded?: string) => {
    const input = preloaded || chatInput;
    if (!input.trim() || isStreaming) return;

    // Add user message immediately
    const userMessage = { role: 'user' as const, content: input };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsStreaming(true);

    // Forced "thinking" delay to satisfy user requirement (1.5s indicator)
    const thinkingPromise = new Promise(resolve => setTimeout(resolve, 1500));
    const [aiContent] = await Promise.all([
      generateAIResponse(input),
      thinkingPromise
    ]);

    setChatMessages(prev => [...prev, { role: 'ai', content: aiContent }]);
    setIsStreaming(false);
  };

  // Auto-scroll chat
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isStreaming]);

  const toggleAppliance = (id: string) => {
    setSelectedAppliances(prev => {
      const exists = prev.find(a => a.id === id);
      if (exists) {
        return prev.filter(a => a.id !== id);
      }
      return [...prev, { id, qty: 1, hours: 4 }];
    });
  };

  const updateAppliance = (id: string, field: 'qty' | 'hours', value: number) => {
    setSelectedAppliances(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const totals = useMemo(() => {
    const avgSourceHours = sourceHours.reduce((a, b) => a + b, 0) / 7;

    const dailyKWh = selectedAppliances.reduce((acc, curr) => {
      const app = APPLIANCE_DATABASE.find(a => a.id === curr.id);
      if (!app) return acc;
      // Cap individual appliance hours by avg source duration for localized audit
      const effectiveHours = Math.min(curr.hours, avgSourceHours);
      return acc + ((app.watts * curr.qty * effectiveHours) / 1000);
    }, 0);

    const monthlyKWh = dailyKWh * 30;
    const monthlySpend = monthlyKWh * selectedSource.rate;
    
    // Waste logic: simple multiplier for "vampire" or inefficient sources
    const wasteFactor = selectedSource.id.includes('gen') ? 0.3 : 0.15;
    const monthlyWaste = monthlySpend * wasteFactor;
    const potentialMonthlySavings = monthlySpend - (monthlyKWh * 0); // Comparison to solar

    // Sabi Score: Inverse of waste vs total
    const sabiScore = Math.max(0, Math.min(100, Math.round(100 - (wasteFactor * 100) - (dailyKWh / 10))));

    // Industry Intelligence: Grid Relief (Amps)
    const gridReliefAmps = selectedSource.rate > 0 
      ? (monthlyWaste / selectedSource.rate / 30) / 0.23 
      : 0;

    return { dailyKWh, monthlyKWh, monthlySpend, monthlyWaste, potentialMonthlySavings, sabiScore, gridReliefAmps };
  }, [selectedAppliances, selectedSource]);

  const roadmapItems = useMemo(() => {
    const items: any[] = [];
    const yellowBulbs = selectedAppliances.find(a => a.id === 'light-yellow');
    if (yellowBulbs) {
      const monthlySavings = (90 * yellowBulbs.qty * yellowBulbs.hours * 30 / 1000) * selectedSource.rate;
      const cost = 15000;
      const paybackDays = monthlySavings > 0 ? Math.round(cost / (monthlySavings / 30)) : 0;
      items.push({ id: 'led-upgrade', nameKey: 'upgrade_led_name', descriptionKey: 'upgrade_led_desc', name: 'LED Lighting Overhaul', description: 'Swap your old yellow bulbs for high-efficiency LEDs.', cost, monthlySavings, paybackDays, icon: Lightbulb });
    }
    const inefficientACs = selectedAppliances.filter(a => ['ac-1.5hp-split', 'ac-2hp-split', 'ac-window'].includes(a.id));
    if (inefficientACs.length > 0) {
      const totalMonthlySavings = inefficientACs.reduce((acc, curr) => {
        const app = APPLIANCE_DATABASE.find(a => a.id === curr.id);
        if (!app) return acc;
        return acc + (0.5 * app.watts * curr.qty * curr.hours * 30 / 1000) * selectedSource.rate;
      }, 0);
      const cost = 450000;
      const paybackDays = totalMonthlySavings > 0 ? Math.round(cost / (totalMonthlySavings / 30)) : 0;
      items.push({ id: 'inverter-ac', nameKey: 'upgrade_ac_name', descriptionKey: 'upgrade_ac_desc', name: 'Inverter AC Conversion', description: 'Your current ACs are "Iron ACs". Moving to Inverter technology cuts cooling costs by 50%.', cost, monthlySavings: totalMonthlySavings, paybackDays, icon: Wind });
    }
    const vampireLoads = selectedAppliances.filter(a => ['decoder', 'sound-system'].includes(a.id));
    if (vampireLoads.length > 0) {
      const monthlySavings = vampireLoads.reduce((acc, curr) => acc + (15 * curr.qty * 18 * 30 / 1000) * selectedSource.rate, 0);
      const cost = 10000;
      const paybackDays = monthlySavings > 0 ? Math.round(cost / (monthlySavings / 30)) : 0;
      items.push({ id: 'smart-plug', nameKey: 'upgrade_smart_plug_name', descriptionKey: 'upgrade_smart_plug_desc', name: 'Smart Plug Automation', description: 'Stop your sound system and decoder from "vampiring" power while you sleep.', cost, monthlySavings, paybackDays, icon: Zap });
    }
    if (totals.monthlySpend > 50000) {
      const monthlySavings = totals.monthlySpend;
      const cost = 2500000;
      const paybackDays = Math.round(cost / (monthlySavings / 30));
      items.push({ id: 'solar', nameKey: 'upgrade_solar_name', descriptionKey: 'upgrade_solar_desc', name: 'Solar Freedom (5kVA)', description: 'Complete freedom from GRID Band A bills and expensive generator fuel.', cost, monthlySavings, paybackDays, icon: Zap });
    }
    return items.sort((a, b) => b.monthlySavings - a.monthlySavings).slice(0, 3);
  }, [selectedAppliances, selectedSource, totals.monthlySpend]);

  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const nudgeData = useMemo(() => {
    if (selectedAppliances.length === 0) return null;
    const sortedByWatts = [...selectedAppliances].sort((a, b) => {
      const appA = APPLIANCE_DATABASE.find(x => x.id === a.id);
      const appB = APPLIANCE_DATABASE.find(x => x.id === b.id);
      return (appB?.watts || 0) - (appA?.watts || 0);
    });
    const topApp = APPLIANCE_DATABASE.find(a => a.id === sortedByWatts[0].id);
    const hourlySaving = topApp ? (topApp.watts / 1000) * 1 * selectedSource.rate : 0;
    return { applianceNameKey: topApp?.nameKey || '', applianceName: topApp?.nameKey ? t(topApp.nameKey) : 'Heavy Load', saving: Math.round(hourlySaving), hasFreezer: selectedAppliances.some(a => a.id === 'freezer-chest') };
  }, [selectedAppliances, selectedSource, t]);

  const solarROI = useMemo(() => {
    const dailyKWh = totals.dailyKWh;
    const systemSize = Math.max(1, Math.ceil(dailyKWh / 4.5)); // Average peak sun hours in Nigeria
    const cost = systemSize * 750000; // ₦750k per kVA (hybrid inverter + li-ion)
    const monthlySavings = totals.monthlySpend;
    const paybackMonths = monthlySavings > 0 ? cost / monthlySavings : 0;
    const paybackYears = Number((paybackMonths / 12).toFixed(1));
    return { systemSize, cost, monthlySavings, paybackMonths, paybackYears };
  }, [totals]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-sans transition-colors duration-500">
        {/* Language Selection for Login Page */}
        <div className="mb-6 flex gap-2">
          {['en', 'pcm', 'yo', 'ig', 'ha'].map((lng) => (
            <button 
              key={lng}
              onClick={() => i18n.changeLanguage(lng)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${i18n.language === lng ? 'bg-nigerian-green text-white' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              {lng === 'en' ? 'English' : lng === 'pcm' ? 'Pidgin' : lng === 'yo' ? 'Yoruba' : lng === 'ig' ? 'Igbo' : 'Hausa'}
            </button>
          ))}
        </div>

        <div className="max-w-md w-full card-sleek p-10 bg-white dark:bg-slate-900 border-t-8 border-nigerian-green shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center">
            <div className="bg-nigerian-green w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-nigerian-green/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-nigerian-gold underline-offset-4 decoration-4">{t('app_name')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-black uppercase tracking-widest text-[10px]">{t('login_secure')}</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t('phone_label')}</label>
                <input 
                  type="tel"
                  placeholder={t('phone_placeholder')}
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 px-4 py-4 rounded-2xl text-lg font-black focus:border-nigerian-green dark:focus:border-nigerian-gold outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-white"
                />
              </div>
              <button 
                onClick={() => handleAuth('login')}
                className="w-full bg-nigerian-green text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-nigerian-green/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {t('login_btn')}
              </button>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
              Built for Nigeria • Hackathon MVP 2026
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 pt-28 pb-12 font-sans selection:bg-nigerian-green selection:text-white transition-colors duration-500">
      <Header 
        selectedSource={selectedSource} 
        isProMode={isProMode} 
        setIsProMode={setIsProMode} 
        auditType={auditType}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
      
      <main className="max-w-[1400px] mx-auto px-6">
        {/* Workspace Hub for Existing Users */}
        {step === 0 && !showAuditSetup && savedWorkspaces.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8 mb-12">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('welcome_back')}</h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">{t('select_workspace')}</p>
              </div>
              <button 
                onClick={() => {
                  setCurrentUser(null);
                  localStorage.removeItem('np_user');
                }}
                className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
              >
                {t('logout')}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedWorkspaces.map((ws: any) => (
                <div key={ws.id} className="card-sleek p-6 bg-white dark:bg-slate-800 border-l-4 border-nigerian-gold flex justify-between items-center group transition-all hover:scale-[1.01]">
                  <div>
                    <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">{ws.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{ws.auditType === 'residential' ? t('residential_audit') : t('commercial_audit')} • {ws.selectedSource.name}</p>
                  </div>
                  <button 
                    onClick={() => loadWorkspace(ws)}
                    className="p-3 bg-nigerian-green text-white rounded-xl shadow-lg shadow-nigerian-green/20 hover:scale-110 active:scale-95 transition-all"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button 
                onClick={startNewAudit}
                className="card-sleek p-6 border-2 border-dashed border-slate-300 flex items-center justify-center gap-4 text-slate-400 hover:border-nigerian-green hover:text-nigerian-green transition-all"
              >
                <Plus className="w-6 h-6" />
                <span className="font-black uppercase tracking-tighter">{t('start_new_audit')}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Stepper - only show in wizard steps */}
        {step < 4 && (
          <div className="mb-8 flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
            {Array.from({ length: 4 }).map((_, s) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                    step >= s ? 'bg-nigerian-green text-white ring-4 ring-nigerian-green/10' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500'
                  }`}
                >
                  {s + 1}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-0.5 mx-4 ${step > s ? 'bg-nigerian-green' : 'bg-gray-200 dark:bg-slate-700'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (savedWorkspaces.length === 0 || showAuditSetup) && (
            <motion.div key="step0" {...variants} className="max-w-4xl mx-auto space-y-10">
              {savedWorkspaces.length > 0 && (
                <div className="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-2xl mb-4 transition-colors">
                  <button 
                    onClick={() => setShowAuditSetup(false)}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-nigerian-green transition-all"
                  >
                    ← {t('back_to_hub')}
                  </button>
                </div>
              )}
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t('oya_start')} 🇳🇬</h2>
                <p className="text-slate-500 mt-2 font-black uppercase tracking-widest text-xs">{t('step_setup')}</p>
              </div>

              {/* Space Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-2">{t('what_is_space')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setAuditType('residential')}
                    className={`card-sleek p-6 border-2 flex flex-col items-center gap-3 transition-all ${auditType === 'residential' ? 'border-nigerian-green bg-nigerian-green/5' : 'border-transparent bg-white dark:bg-slate-800'}`}
                  >
                    <div className={`p-3 rounded-2xl ${auditType === 'residential' ? 'bg-nigerian-green text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                      <MapPin className="w-8 h-8" />
                    </div>
                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t('residential_home')}</span>
                  </button>
                  <button 
                    onClick={() => setAuditType('commercial')}
                    className={`card-sleek p-6 border-2 flex flex-col items-center gap-3 transition-all ${auditType === 'commercial' ? 'border-nigerian-green bg-nigerian-green/5' : 'border-transparent bg-white dark:bg-slate-800'}`}
                  >
                    <div className={`p-3 rounded-2xl ${auditType === 'commercial' ? 'bg-nigerian-green text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t('commercial_sme')}</span>
                  </button>
                </div>
              </div>

              {/* Power Source Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-2">{t('where_light')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {POWER_SOURCES.map((source) => (
                    <button
                      key={source.id}
                      onClick={() => { setSelectedSource(source); }}
                      className={`card-sleek p-6 border-2 text-left transition-all hover:scale-[1.01] ${
                        selectedSource.id === source.id 
                          ? 'border-nigerian-green ring-4 ring-nigerian-green/5 bg-white dark:bg-slate-800' 
                          : 'border-transparent bg-white dark:bg-slate-800 hover:border-gray-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl transition-colors ${selectedSource.id === source.id ? 'bg-nigerian-green text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                          {source.id.includes('grid') ? <Zap className="w-6 h-6" /> : source.id === 'solar' ? <Lightbulb className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                        </div>
                        {selectedSource.id === source.id && <CheckCircle2 className="w-6 h-6 text-nigerian-green" />}
                      </div>
                      <h3 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tighter">{t(source.nameKey)}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-bold">{t(source.descKey)}</p>
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">₦{source.rate.toFixed(2)}</span>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">/ kWh</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setStep(1)}
                  className="w-full bg-nigerian-green text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-nigerian-green/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {t('continue_duration')} <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" {...variants} className="max-w-4xl mx-auto space-y-10">
              <div>
                <button 
                  onClick={() => setStep(0)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 hover:text-black"
                >
                  <ArrowLeft className="w-3 h-3" /> {t('back')}
                </button>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('source_availability')} 🕒</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-black uppercase tracking-widest text-xs">{t('step_duration')}</p>
              </div>

              <div className="card-sleek p-10 bg-white dark:bg-slate-800 space-y-8">
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 bg-nigerian-green text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-nigerian-green/20">
                      <Zap className="w-10 h-10" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t(selectedSource.nameKey)}</h3>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{t(selectedSource.descKey)}</p>
                   </div>
                </div>

                <div className="space-y-6 pt-4 border-t border-slate-50 dark:border-slate-700">
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('supply_hours_day')}</label>
                    <button 
                      onClick={() => setSourceHours(Array(7).fill(sourceHours[0]))}
                      className="text-[10px] font-black text-nigerian-green uppercase tracking-widest hover:underline"
                    >
                      {t('apply_mon')}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {DAYS.map((day, idx) => (
                      <div key={day} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-2xl space-y-2 border border-slate-100 dark:border-slate-600">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{day}</span>
                          <span className="text-xs font-black text-nigerian-green">{sourceHours[idx]}h</span>
                        </div>
                        <input 
                          type="range" min="0" max="24" step="1"
                          value={sourceHours[idx]}
                          onChange={(e) => {
                            const newHours = [...sourceHours];
                            newHours[idx] = parseInt(e.target.value);
                            setSourceHours(newHours);
                          }}
                          className="w-full h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full appearance-none cursor-pointer accent-nigerian-green"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('weekly_avg')}</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">{(sourceHours.reduce((a, b) => a + b, 0) / 7).toFixed(1)} <span className="text-[10px] uppercase">{t('hrs_unit')}/{t('days')}</span></span>
                  </div>
                </div>

                <div className="bg-nigerian-gold/5 p-6 rounded-2xl border border-nigerian-gold/10 dark:bg-nigerian-gold/10 dark:border-nigerian-gold/20">
                   <div className="flex gap-4 items-start">
                      <AlertCircle className="w-5 h-5 text-nigerian-gold mt-1" />
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-300 italic">
                        {t('audit_disclaimer', { hours: (sourceHours.reduce((a, b) => a + b, 0) / 7).toFixed(1) })}
                      </p>
                   </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-nigerian-green text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-nigerian-green/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Confirm & Audit Appliances <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" {...variants} className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <button 
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 hover:text-black"
                  >
                    <ArrowLeft className="w-3 h-3" /> {t('back')}
                  </button>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('what_load')}</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{t('select_appliances', { source: t(selectedSource.nameKey) })}</p>
                </div>
                <div className="flex items-center gap-2 bg-nigerian-green text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-nigerian-green/20">
                  <span className="opacity-70 font-medium">{t('selected')}:</span> {selectedAppliances.length}
                </div>
              </div>

              {/* Categorized Appliances */}
              {['cat_cooling', 'cat_kitchen', 'cat_business', 'cat_laundry', 'cat_entertainment', 'cat_lighting'].map((catKey) => (
                <div key={catKey} className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">{t(catKey)}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {APPLIANCE_DATABASE.filter(a => a.categoryKey === catKey).map((app) => {
                      const isSelected = selectedAppliances.some(s => s.id === app.id);
                      const Icon = app.icon;
                      return (
                        <button
                          key={app.id}
                          onClick={() => toggleAppliance(app.id)}
                          className={`card-sleek p-4 border-2 text-left transition-all flex items-center gap-3 ${
                            isSelected 
                              ? 'border-nigerian-green bg-nigerian-green/5 ring-1 ring-nigerian-green' 
                              : 'border-transparent dark:border-slate-800'
                          }`}
                        >
                          <div className={`p-2 rounded-lg flex-shrink-0 ${isSelected ? 'bg-nigerian-green text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{t(app.nameKey)}</h4>
                            <p className="text-[10px] text-slate-400 font-bold tracking-tight">{app.watts}W</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-6">
                <button
                  disabled={selectedAppliances.length === 0}
                  onClick={() => setStep(3)}
                  className="w-full bg-nigerian-green text-white py-5 rounded-xl font-black text-xl shadow-xl shadow-nigerian-green/20 hover:bg-nigerian-accent transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                >
                  {t('continue_usage')} <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" {...variants} className="max-w-4xl mx-auto space-y-6">
              <div>
                <button 
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 hover:text-black"
                >
                  <ArrowLeft className="w-3 h-3" /> {t('back')}
                </button>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('how_long_use')}</h2>
                <p className="text-slate-500 mt-2 font-medium">{t('adjust_usage', { source: selectedSource.id.includes('grid') ? 'Grid' : 'Gen' })}</p>
              </div>

              <div className="space-y-3">
                {selectedAppliances.map((item) => {
                  const app = APPLIANCE_DATABASE.find(a => a.id === item.id);
                  if (!app) return null;
                  return (
                    <div key={item.id} className="card-sleek p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
                            <app.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">{t(app.nameKey)}</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('power')}: {app.watts}W</p>
                          </div>
                        </div>
                        <button onClick={() => toggleAppliance(item.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-2 border-t border-gray-50 dark:border-slate-800">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('quantity')}</label>
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => updateAppliance(item.id, 'qty', Math.max(1, item.qty - 1))}
                              className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-slate-800 dark:text-white flex items-center justify-center font-bold text-lg hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 transition-colors"
                            >-</button>
                            <span className="text-lg font-black w-8 text-center dark:text-white">{item.qty}</span>
                            <button 
                              onClick={() => updateAppliance(item.id, 'qty', item.qty + 1)}
                              className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-slate-800 dark:text-white flex items-center justify-center font-bold text-lg hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 transition-colors"
                            >+</button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('hrs_session')}</label>
                          <div className="flex flex-col gap-1">
                            {(() => {
                              const maxSourceHours = Math.max(...sourceHours);
                              return (
                                <>
                                  <input 
                                    type="range" min="1" max={maxSourceHours} step="0.5"
                                    value={item.hours}
                                    onChange={(e) => updateAppliance(item.id, 'hours', parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-nigerian-green"
                                  />
                                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                                     <span>0.5 {t('hr_unit')}</span>
                                     <span className="text-nigerian-green dark:text-nigerian-gold font-black">{item.hours} {t('hrs_unit')}</span>
                                     <span>{maxSourceHours} {t('hrs_unit')}</span>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 space-y-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm transition-all focus-within:border-nigerian-green">
                   <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2 px-1">{t('name_workspace')} <span className="text-nigerian-green/60 dark:text-nigerian-gold/60">{t('optional')}</span></label>
                   <input 
                     type="text" 
                     placeholder={t('workspace_placeholder')}
                     value={workspaceName}
                     onChange={(e) => setWorkspaceName(e.target.value)}
                     className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white border-2 border-transparent focus:border-transparent rounded-xl px-4 py-3 font-black text-sm outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                   />
                </div>
                <button
                  onClick={() => {
                    saveWorkspace(workspaceName.trim());
                    setStep(4);
                  }}
                  className="w-full bg-nigerian-green text-white py-5 rounded-xl font-black text-xl shadow-xl shadow-nigerian-green/20 hover:bg-nigerian-accent transition-all flex items-center justify-center gap-2"
                >
                   {t('view_analysis')} <Zap className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
          {step === 4 && (
            <motion.div key="step4" {...variants} className="space-y-8 pb-32">
              {/* Reset/New Audit button for dashboard */}
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <button 
                      onClick={startNewAudit}
                      className="text-[10px] font-black p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-nigerian-green transition-all"
                    >
                      ← {t('new_audit')}
                    </button>
                    <button 
                      onClick={renameWorkspace}
                      className="text-[10px] font-black p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:border-nigerian-gold transition-all"
                    >
                      {t('rename')}
                    </button>
                 </div>
                 <div className="flex gap-4">
                    <button 
                      onClick={() => alert(`Workspace ${activeWorkspaceId} synced to cloud registry.`)}
                      className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-700 transition-all"
                    >
                      <Cloud className="w-3 h-3" /> Sync Workspace
                    </button>
                 </div>
              </div>
              <div className="grid grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="col-span-12 lg:col-span-9 space-y-8">
                  
                  {/* Central Bill Display */}
                  <div className="card-sleek p-10 bg-white dark:bg-slate-900 border-t-8 border-nigerian-green text-center relative overflow-hidden">
                    <div className="relative z-10">
                      {workspaceName && (
                        <h2 className="text-xl font-black text-nigerian-green mb-1 uppercase tracking-tight">{workspaceName}</h2>
                      )}
                      <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">{t('estimated_bill')}</p>
                      <div className="flex flex-col items-center justify-center">
                        <h2 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
                          ₦{totals.monthlySpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </h2>
                        <div className="flex items-center gap-2 bg-nigerian-green/10 text-nigerian-green px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest leading-none">
                          <CheckCircle2 className="w-4 h-4" /> {t('optimized_analysis')}
                        </div>
                      </div>
                      
                      {/* Waste Meter */}
                      <div className="mt-12 max-w-md mx-auto space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('waste_meter')}</span>
                          <span className="text-sm font-black text-red-500 uppercase">₦{totals.monthlyWaste.toLocaleString()} {t('bleed')}</span>
                        </div>
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1 flex">
                          <div 
                            className="bg-nigerian-green h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${100 - (totals.monthlyWaste / (totals.monthlySpend || 1) * 100)}%` }}
                          ></div>
                          <div 
                            className="bg-red-500 h-full rounded-full transition-all duration-1000 animate-pulse" 
                            style={{ width: `${(totals.monthlyWaste / (totals.monthlySpend || 1) * 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase italic">
                          {t('bill_burned', { percent: (totals.monthlyWaste / (totals.monthlySpend || 1) * 100).toFixed(0) })}
                        </p>
                      </div>
                    </div>
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                       <Zap className="w-96 h-96 text-nigerian-green" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="card-sleek p-6 bg-white dark:bg-slate-900 border-l-4 border-nigerian-gold">
                      <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{t('sabi_score')}</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{totals.sabiScore}</h3>
                        <span className="text-slate-300 dark:text-slate-600 font-bold">/100</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">{t('energy_habits')}</p>
                    </div>
                    {/* Solar ROI Roadmap Section */}
                    <div className="card-sleek p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden auto">
                       <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform">
                          <Sun className="w-48 h-48 text-nigerian-gold animate-spin-slow" />
                       </div>
                       
                       <div className="relative z-10 space-y-6">
                          <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-nigerian-gold mb-1">{t('solar_roi')}</h3>
                                <h2 className="text-3xl font-black tracking-tighter">{t('path_zero_bills')}</h2>
                             </div>
                             <div className="bg-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20">
                                {t('guarantee_5yr')}
                             </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-white/10">
                             <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('recommended_system')}</p>
                                <p className="text-2xl font-black text-nigerian-gold">{solarROI.systemSize}kVA Premium</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('estimated_cost')}</p>
                                <p className="text-2xl font-black text-white">₦{(solarROI.cost / 1000000).toFixed(1)}M</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('payback_period')}</p>
                                <p className="text-2xl font-black text-white">{solarROI.paybackYears} {t('years')}</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('sabi_recommendation')}</p>
                                <p className="text-2xl font-black text-nigerian-green">{t('buy')}</p>
                             </div>
                          </div>

                          <div className="bg-white/10 p-4 rounded-xl flex items-center gap-4">
                             <div className="p-2 bg-nigerian-gold rounded-lg">
                                <Zap className="w-5 h-5 text-slate-900" />
                             </div>
                             <div>
                                <p className="text-xs font-bold leading-relaxed">
                                   "{t('inflation_disclaimer', { spend: totals.monthlySpend.toLocaleString() })}"
                                </p>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Detailed Audit */}
                  <div className="card-sleek p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50 dark:border-slate-800">
                        <div>
                          <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{t('appliance_breakdown')}</h3>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-widest">{t('cost_category')}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => alert('Feature incoming: 2026 Energy Health Certificate PDF starting download...')}
                            className="text-[10px] font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                          >
                             <FileText className="w-3 h-3" /> {t('get_pdf')}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {selectedAppliances.map((item) => {
                          const app = APPLIANCE_DATABASE.find(a => a.id === item.id);
                          if (!app) return null;
                          const appMonthlyCost = ((app.watts * item.qty * item.hours) / 1000) * 30 * selectedSource.rate;
                          const isHigh = appMonthlyCost > (auditType === 'residential' ? 15000 : 40000);

                          return (
                            <div key={item.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                              isHigh 
                                ? 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30' 
                                : 'bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700'
                            }`}>
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-sm ${
                                  isHigh ? 'bg-red-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700'
                                }`}>
                                  <app.icon className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-black text-gray-800 dark:text-slate-100 text-sm leading-tight truncate">{t(app.nameKey)} ({item.qty}x)</p>
                                  <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    {item.hours}{t('hr_unit').toUpperCase()}/{t('days').toUpperCase()} • {app.watts}W
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-black text-sm ${isHigh ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>
                                  ₦{appMonthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mt-0.5">
                                  {isHigh ? t('money_waster') : t('optimized')}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                  </div>
                </div>

                {/* Sidebar Area */}
                <aside className="col-span-12 lg:col-span-3 space-y-6">
                  <div className="card-sleek border-t-8 border-nigerian-gold p-8 bg-white dark:bg-slate-900 sticky top-28">
                      <h3 className="font-black text-gray-800 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-tighter text-xl">
                        <Trophy className="w-6 h-6 text-nigerian-gold" /> {t('survival_roadmap')}
                      </h3>
                      
                      <div className="space-y-8">
                        {roadmapItems.map((upgrade, idx) => (
                          <div key={idx} className="relative pl-8">
                            <div className="absolute left-0 top-0 text-xl font-black text-slate-100 dark:text-slate-800 italic leading-none">{idx + 1}</div>
                            <p className="text-sm font-black text-nigerian-green dark:text-nigerian-gold uppercase tracking-tight">{t(upgrade.nameKey)}</p>
                            <div className="flex justify-between text-[10px] font-black mt-2 text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                              <span>{t('roi')}: {upgrade.paybackDays} {t('days')}</span>
                              <span className="text-nigerian-gold">{t('save')}: ₦{(upgrade.monthlySavings / 1000).toFixed(1)}k/mo</span>
                            </div>
                            <p className="text-[11px] mt-4 text-slate-500 dark:text-slate-400 font-medium border-l-2 border-slate-100 dark:border-slate-800 pl-4 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-r-xl">
                              {upgrade.description}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-8 border-t border-slate-100 dark:border-slate-800 mt-8 space-y-3">
                         <button 
                            onClick={() => { setStep(0); setSelectedAppliances([]); }}
                            className="w-full py-4 px-4 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                          >
                            <History className="w-4 h-4" /> {t('start_new_audit')}
                          </button>
                      </div>
                  </div>

                  {/* Contextual SMEs Advice */}
                  {auditType === 'commercial' && (
                    <div className="bg-slate-900 text-white p-6 rounded-2xl border border-white/10 shadow-xl overflow-hidden relative">
                       <h4 className="text-[10px] font-black text-nigerian-gold uppercase tracking-[0.2em] mb-4">{t('sme_strategy')}</h4>
                       <p className="text-sm font-black mb-3 leading-tight tracking-tight italic">
                          "{t('sme_advice')}"
                       </p>
                       <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12">
                          <Briefcase className="w-24 h-24" />
                       </div>
                    </div>
                  )}
                </aside>
              </div>

              {/* Industry & Pro Mode Features */}
              {isProMode && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="space-y-12 mt-12"
                >
                  {/* Market Intelligence Hub (For Energy/Petroleum Firms) */}
                  <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3rem] border-4 border-nigerian-gold shadow-2xl relative overflow-hidden ring-8 ring-nigerian-gold/5 transition-colors">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                      <ShieldCheck className="w-96 h-96 text-nigerian-gold" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center shadow-xl transform rotate-3">
                            <TrendingDown className="w-8 h-8 text-nigerian-gold" />
                          </div>
                          <div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{t('market_intelligence')}</h3>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] font-black">{t('pro_insights')}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                           <button 
                             onClick={() => alert('Industry Master Sync Completed: 42 new audit nodes registered in your sector.')}
                             className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                           >
                              <Cloud className="w-4 h-4" /> {t('global_sync')}
                           </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Grid relief stats */}
                        <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
                           <div className="w-12 h-12 bg-nigerian-green/10 text-nigerian-green rounded-2xl flex items-center justify-center mb-6">
                              <Zap className="w-6 h-6" />
                           </div>
                           <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t('grid_relief_potential')}</h4>
                           <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                             {totals.gridReliefAmps.toFixed(1)} <span className="text-lg text-nigerian-green font-black">Amps</span>
                           </h3>
                           <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                               {t('capacity_reclaimable')} <span className="text-slate-900 dark:text-slate-200">{auditorInfo.lga || 'Current Sector'}</span>.
                           </p>
                        </div>

                        {/* Petroleum Sector stats */}
                        <div className="bg-slate-900 dark:bg-slate-950 text-white p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center relative overflow-hidden">
                           <div className="relative z-10 w-full">
                              <div className="w-12 h-12 bg-nigerian-gold text-white rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <TrendingDown className="w-6 h-6" />
                              </div>
                              <h4 className="text-[10px] font-black text-nigerian-gold uppercase tracking-widest mb-2">{t('fuel_displacement')}</h4>
                              
                              {(selectedSource.id === 'petrol' || selectedSource.id === 'diesel') ? (
                                <div className="space-y-4">
                                   <div className="text-4xl font-black text-white tracking-tight">
                                      ₦{(totals.monthlySpend * 0.4).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-sm">/ {t('save')}</span>
                                   </div>
                                   <p className="text-[11px] font-bold text-white/50 leading-relaxed">
                                      Available monthly savings if facility switches to a CNG Gas-to-Power hub.
                                   </p>
                                </div>
                              ) : (
                                <p className="text-[11px] font-bold text-white/40 italic uppercase mt-4">Grid-Focus: Low Fuel Displacement Priority</p>
                              )}
                           </div>
                        </div>

                        {/* Community Map Data */}
                        <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm">
                           <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <Globe className="w-4 h-4" /> {t('community_trends')}
                           </h4>
                           <div className="space-y-4">
                              {[
                                { lga: auditorInfo.lga || 'Your LGA', waste: ((totals.monthlyWaste / (totals.monthlySpend || 1)) * 100).toFixed(0), trend: 'up' },
                                { lga: 'Aba North', waste: '42', trend: 'down' },
                                { lga: 'Ikeja Industrial', waste: '28', trend: 'down' }
                              ].map((trend, i) => (
                                <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-transparent dark:border-slate-700">
                                   <span className="text-[11px] font-black uppercase text-slate-800 dark:text-slate-200">{trend.lga}</span>
                                   <div className="flex items-center gap-3">
                                      <span className="text-xs font-black text-slate-900 dark:text-white">{trend.waste}% Waste</span>
                                      <div className={`w-2 h-2 rounded-full ${trend.trend === 'up' ? 'bg-red-500' : 'bg-nigerian-green'}`}></div>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Auditor Professional Portal (Student / Consultant View) */}
                  <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3rem] border-4 border-slate-900 dark:border-slate-800 shadow-2xl relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                      <Briefcase className="w-96 h-96 text-slate-900 dark:text-slate-100" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-6 mb-10 pb-8 border-b border-slate-100 dark:border-slate-800">
                        <div className="w-16 h-16 bg-nigerian-gold text-white rounded-[2rem] flex items-center justify-center shadow-xl transform -rotate-3">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{t('student_portal')}</h3>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] font-black">{t('verified_portfolio')}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Meta Data Inputs */}
                        <div className="lg:col-span-4 space-y-6">
                           <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 space-y-6">
                              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Database className="w-4 h-4" /> {t('audit_metadata')}
                              </h4>
                              <div className="space-y-4">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2">Auditor Name</label>
                                  <input 
                                    type="text"
                                    placeholder="e.g. Chinelo Obi"
                                    value={auditorInfo.name}
                                    onChange={(e) => setAuditorInfo(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-sm font-bold focus:border-nigerian-gold outline-none transition-all dark:text-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2">Business Name</label>
                                  <input 
                                    type="text"
                                    placeholder="e.g. Mama Put Ventures"
                                    value={auditorInfo.business}
                                    onChange={(e) => setAuditorInfo(prev => ({ ...prev, business: e.target.value }))}
                                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-sm font-bold focus:border-nigerian-gold outline-none transition-all dark:text-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2">LGA / Region</label>
                                  <input 
                                    type="text"
                                    placeholder="e.g. Ikeja, Lagos"
                                    value={auditorInfo.lga}
                                    onChange={(e) => setAuditorInfo(prev => ({ ...prev, lga: e.target.value }))}
                                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-sm font-bold focus:border-nigerian-gold outline-none transition-all dark:text-white"
                                  />
                                </div>
                              </div>
                              <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                 <div>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">{t('sabi_points')}</p>
                                    <p className="text-3xl font-black text-nigerian-gold">{selectedAppliances.length * 10}</p>
                                 </div>
                                 <div className="w-12 h-12 bg-nigerian-gold text-white rounded-2xl flex items-center justify-center shadow-lg">
                                    <ShieldCheck className="w-6 h-6" />
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Summary Info / Action */}
                        <div className="lg:col-span-8 space-y-8">
                           <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 flex items-center gap-8">
                              <div className="flex-1">
                                 <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t('portfolio_readiness')}</h4>
                                 <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                   {t('auditor_greeting', { name: auditorInfo.name || 'Sabi Auditor', qty: selectedAppliances.length, business: auditorInfo.business || 'your client', amps: totals.gridReliefAmps.toFixed(1) })}
                                 </p>
                              </div>
                              <div className="flex flex-col gap-3">
                                 <button 
                                   onClick={() => alert(`Aggregated Data Exported for ${auditorInfo.lga}`)}
                                   className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 text-slate-900 dark:text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                                 >
                                    <FileJson className="w-5 h-5 mx-auto" />
                                    <span className="text-[9px] font-black uppercase">Export CSV</span>
                                 </button>
                                 <button 
                                   onClick={() => alert('Syncing to National Energy Registry...')}
                                   className="bg-slate-900 dark:bg-slate-950 text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-all shadow-xl"
                                 >
                                    <Cloud className="w-5 h-5 mx-auto" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{t('national_registry')}</span>
                                 </button>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-6 rounded-2xl">
                                 <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-4 tracking-widest">{t('market_comparison')}</h5>
                                 <p className="text-xs font-bold text-slate-500 dark:text-slate-400">This business has a waste factor of <span className="text-red-500">{((totals.monthlyWaste / (totals.monthlySpend || 1)) * 100).toFixed(0)}%</span>, which is {(totals.monthlyWaste / (totals.monthlySpend || 1)) > 0.3 ? 'higher' : 'lower'} than the state average.</p>
                              </div>
                              <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-6 rounded-2xl">
                                 <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-4 tracking-widest">{t('next_recommended_step')}</h5>
                                 <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Conduct a structural insulation audit for {auditorInfo.business || 'the client'} to reduce AC load by a further 15%.</p>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tips & System Status */}
              <footer className="pt-8 border-t border-gray-200 dark:border-slate-800 mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">
                <div>{t('footer_price_indices')}</div>
                <div className="flex gap-6 items-center">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-nigerian-green animate-pulse"></span> 
                    {t('footer_system_stable')}
                  </span>
                  <span className="opacity-20">|</span>
                  <span>v2.0.4-prod</span>
                </div>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sabi AI Advisor Floating Chat */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-16 h-16 bg-nigerian-gold text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all ring-4 ring-nigerian-gold/20 relative"
        >
          {isChatOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
          {!isChatOpen && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">Sabi AI</span>
          )}
        </button>

               <AnimatePresence>
           {isChatOpen && (
             <motion.div 
               initial={{ opacity: 0, y: 20, scale: 0.9 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 20, scale: 0.9 }}
               className="absolute bottom-20 left-0 w-[90vw] md:w-[400px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-nigerian-gold overflow-hidden flex flex-col h-[500px]"
             >
               {/* Chat Header */}
               <div className="bg-nigerian-green p-6 text-white flex items-center gap-4">
                 <div className="w-10 h-10 bg-nigerian-gold rounded-xl flex items-center justify-center">
                   <Bot className="w-6 h-6" />
                 </div>
                 <div>
                   <h4 className="font-black text-sm uppercase tracking-widest">{t('sabi_ai_advisor')}</h4>
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-nigerian-gold rounded-full animate-pulse"></div>
                     <span className="text-[10px] font-bold uppercase opacity-70">{t('sabi_advisor_online')}</span>
                   </div>
                 </div>
               </div>

               {/* Chat Content */}
               <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-950">
                 {chatMessages.map((msg, i) => (
                   <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                     <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${
                       msg.role === 'ai' 
                         ? 'bg-nigerian-gold text-slate-900 rounded-tl-none border-l-4 border-slate-900/10' 
                         : 'bg-nigerian-green text-white rounded-tr-none'
                     }`}>
                       {msg.content}
                     </div>
                   </div>
                 ))}
                 {isStreaming && (
                   <div className="flex flex-col items-start gap-2">
                     <div className="bg-nigerian-gold/20 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                       <div className="w-1 h-1 bg-nigerian-gold rounded-full animate-bounce"></div>
                       <div className="w-1 h-1 bg-nigerian-gold rounded-full animate-bounce [animation-delay:0.2s]"></div>
                       <div className="w-1 h-1 bg-nigerian-gold rounded-full animate-bounce [animation-delay:0.4s]"></div>
                       <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 ml-2 uppercase tracking-widest">{t('thinking')}</span>
                     </div>
                   </div>
                 )}
               </div>

               {/* Quick Actions */}
               <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                  <button 
                   onClick={() => handleSendMessage("How can I reduce my home/shop bill by ₦30k?")} 
                   className="text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400 transition-all"
                  >{t('bill_reduction')}</button>
                  <button 
                   onClick={() => handleSendMessage("Is my generator spend enough to justify switching to Solar or CNG?")}
                   className="text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400 transition-all"
                  >{t('solar_roi_q')}</button>
                  <button 
                   onClick={() => handleSendMessage("What is my 'Community Impact Score'?")}
                   className="text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400 transition-all"
                  >{t('impact')}</button>
               </div>

               {/* Chat Input */}
               <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                 <input 
                   type="text" 
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                   placeholder={t('ask_ai')}
                   className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-nigerian-gold transition-all"
                 />
                 <button 
                   onClick={() => handleSendMessage()}
                   disabled={!chatInput.trim() || isStreaming}
                   className="w-10 h-10 bg-nigerian-green text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                 >
                   <Send className="w-5 h-5" />
                 </button>
               </div>
             </motion.div>
           )}
         </AnimatePresence>
      </div>

      {/* Simulated Nudge Pop-up */}
      <AnimatePresence>
        {showNudge && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-8 right-8 z-[100] max-w-sm w-full"
          >
            <div className="bg-slate-900 dark:bg-slate-950 text-white p-8 rounded-2xl shadow-2xl border border-white/10 ring-1 ring-white/20">
               <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-red-500 rounded-xl ring-4 ring-red-500/20">
                     <AlertCircle className="w-7 h-7 text-white" />
                  </div>
                  <button onClick={() => setShowNudge(false)} className="text-white/20 hover:text-white transition-colors">
                     <Plus className="w-6 h-6 rotate-45" />
                  </button>
               </div>
               <h3 className="text-2xl font-black mb-3 tracking-tighter">{t('nudge_peak_alert')} 🇳🇬</h3>
               <p className="text-sm text-white/70 dark:text-white/60 leading-relaxed font-bold tracking-tight">
                  {nudgeData?.hasFreezer 
                    ? t('peak_protection')
                    : t('high_demand')} 
                  {t('nudge_content', { appliance: nudgeData?.applianceName, saving: nudgeData?.saving })}
               </p>
               <button 
                  onClick={() => { setShowNudge(false); }}
                  className="mt-8 w-full py-4 bg-white dark:bg-slate-100 text-slate-900 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white transition-all shadow-lg active:scale-95"
               >
                  {t('nudge_off_btn')}
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
