/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Home as HomeIcon, 
  LayoutDashboard, 
  MessageSquarePlus, 
  BarChart3, 
  MapPin, 
  Lightbulb, 
  FileSpreadsheet, 
  Mic, 
  MicOff, 
  Upload, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Download, 
  Search, 
  Filter, 
  Languages, 
  Moon, 
  Sun, 
  ChevronRight, 
  Users, 
  TrendingUp, 
  PieChart as PieIcon, 
  Coins, 
  HelpCircle,
  Clock,
  Play,
  RotateCcw,
  Check,
  Building,
  Map as MapIcon
} from 'lucide-react';
import { Suggestion, AiRecommendation, DevPlanComparison, DashboardStats } from './types';

export default function App() {
  // Navigation: 'home' | 'dashboard' | 'submit' | 'analytics' | 'plans' | 'insights' | 'reports'
  const [activeTab, setActiveTab] = useState<string>('home');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [devPlans, setDevPlans] = useState<DevPlanComparison[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [processingState, setProcessingState] = useState<'idle' | 'uploading' | 'speech' | 'translating' | 'category' | 'duplicates' | 'priority' | 'generating' | 'completed'>('idle');
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);

  // Suggestion Form states
  const [citizenName, setCitizenName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('Pune');
  const [language, setLanguage] = useState('English');
  const [suggestionText, setSuggestionText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Filters for Dashboard & Heatmap
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

  // Audio recording timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [sugRes, statsRes, recRes, plansRes] = await Promise.all([
        fetch('/api/suggestions'),
        fetch('/api/dashboard-stats'),
        fetch('/api/ai-recommendations'),
        fetch('/api/development-plans')
      ]);

      if (sugRes.ok) setSuggestions(await sugRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (recRes.ok) setRecommendations(await recRes.json());
      if (plansRes.ok) setDevPlans(await plansRes.json());
    } catch (err) {
      console.error('Error loading data from full-stack server:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle Recording Simulator
  const startRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setAudioBlobUrl('blob:simulated-audio-wave');
    // Pre-populate with typical Indian regional feedback based on language
    if (!suggestionText) {
      const presets: Record<string, string> = {
        'Hindi': 'हमारे यहाँ पीने के पानी की भारी समस्या है। कुएं सूख गए हैं और पाइपलाइन कई जगह से टूटी हुई है।',
        'Marathi': 'शाळेच्या मुख्य इमारतीची भिंत पडली आहे. पावसाळ्यात कधीही मोठा अपघात होऊ शकतो. दुरुस्ती तातडीने व्हावी.',
        'Tamil': 'நெல் கொள்முதல் நிலையங்கள் பற்றாக்குறையாக உள்ளது. விவசாயிகள் தங்களின் பயிர்களை சாலையில் கொட்டி விற்க வேண்டியுள்ளது.',
        'Telugu': 'ఆసుపత్రిలో కనీస వైద్య సౌకర్యాలు లేవు. ఒక్క డాక్టర్ మాత్రమే వస్తున్నారు, మందులు కూడా దొరకట్లేదు.',
        'English': 'The street lights in our village are not working for three months. It gets pitch dark after evening and has caused two accidents.'
      };
      setSuggestionText(presets[language] || presets['English']);
    }
  };

  // Form drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  // Submit suggestion flow simulating AI Pipeline
  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!village || !suggestionText) return;

    // Start loading state
    setActiveTab('processing');
    const steps = [
      'uploading',
      'speech',
      'translating',
      'category',
      'duplicates',
      'priority',
      'generating',
      'completed'
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingState(steps[i] as any);
      // Beautiful incremental simulated steps description
      const messagesMap: Record<string, string> = {
        'uploading': 'Uploading encrypted audio waveform to high-speed cloud buffers...',
        'speech': 'Converting localized regional phonetics to structured raw textual files...',
        'translating': 'AI translation engines standardizing content into English text...',
        'category': 'Executing NLP categorization models (Road, Water, Healthcare)...',
        'duplicates': 'Comparing semantic coordinates with other nearby submissions to prevent duplicates...',
        'priority': 'Determining Priority urgency algorithms against district census matrices...',
        'generating': 'Writing granular context suggestions and actionable summary outlines for the MP...',
        'completed': 'Integration completed! Dashboard pipeline synchronization initialized.'
      };
      setProcessingSteps(prev => [...prev, messagesMap[steps[i]]]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenName: citizenName || 'Anonymous',
          village,
          district,
          language,
          originalText: suggestionText
        })
      });

      if (response.ok) {
        await fetchData(); // refresh list and stats
        // Clear form
        setCitizenName('');
        setVillage('');
        setSuggestionText('');
        setAudioBlobUrl(null);
        setUploadedFile(null);
        // Navigate to insights or dashboard to view the result
        setActiveTab('insights');
      }
    } catch (err) {
      console.error('Error submitting suggestion:', err);
      setActiveTab('dashboard');
    } finally {
      setProcessingState('idle');
      setProcessingSteps([]);
    }
  };

  // Action: Approve / Reject Suggestion Status
  const handleUpdateSuggestionStatus = async (id: string, newStatus: 'Approved' | 'Rejected' | 'Investigating') => {
    try {
      const res = await fetch('/api/suggestions/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
        // Refresh stats
        const statsRes = await fetch('/api/dashboard-stats');
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Approve / Reject / Request More Data on AI Recommendations
  const handleRecommendationAction = async (id: string, action: 'Approved' | 'Rejected' | 'MoreData') => {
    try {
      const res = await fetch('/api/ai-recommendations/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
      if (res.ok) {
        setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Align/Approve Government Plan Conflict
  const handleApprovePlan = async (id: string) => {
    try {
      const res = await fetch('/api/development-plans/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setDevPlans(prev => prev.map(p => p.id === id ? { ...p, matchStatus: 'Match' } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Suggestions list
  const filteredSuggestions = suggestions.filter(s => {
    const matchesDistrict = selectedDistrictFilter === 'All' || s.district === selectedDistrictFilter;
    const matchesCategory = selectedCategoryFilter === 'All' || s.category === selectedCategoryFilter;
    const matchesSearch = s.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.translatedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.aiSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDistrict && matchesCategory && matchesSearch;
  });

  // Extract districts list dynamically
  const districtsList = ['All', ...new Set(suggestions.map(s => s.district))];
  const categoriesList = ['All', 'Road', 'Water', 'Education', 'Healthcare', 'Electricity', 'Agriculture', 'Employment'];

  return (
    <div className="min-h-screen relative font-sans text-slate-800 dark:text-slate-100 transition-colors duration-500 overflow-x-hidden bg-white dark:bg-[#0A0D14]">
      
      {/* Liquid Mesh Animated Backgrounds */}
      <div className="animated-mesh">
        <div className="mesh-blob mesh-blob-1"></div>
        <div className="mesh-blob mesh-blob-2"></div>
        <div className="mesh-blob mesh-blob-3"></div>
        <div className="mesh-blob mesh-blob-4"></div>
      </div>

      {/* Floating Apple-Style Navigation Bar */}
      <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4">
        <nav className="glass-nav rounded-[24px] px-6 py-4 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-tr from-[#007AFF] to-[#AF52DE] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 dark:from-white dark:via-slate-200 dark:to-indigo-200 bg-clip-text text-transparent">
                JanVoice AI
              </span>
              <p className="text-[10px] text-[#007AFF] font-medium tracking-widest uppercase">iOS 26 Core</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-1">
            <button 
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-[14px] text-sm font-medium transition-all duration-300 ${activeTab === 'home' ? 'bg-[#007AFF] text-white shadow-md shadow-blue-500/10' : 'text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/5'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-[14px] text-sm font-medium transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-[#007AFF] text-white shadow-md shadow-blue-500/10' : 'text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/5'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('submit')}
              className={`px-4 py-2 rounded-[14px] text-sm font-medium transition-all duration-300 ${activeTab === 'submit' ? 'bg-[#007AFF] text-white shadow-md shadow-blue-500/10' : 'text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/5'}`}
            >
              Submit Suggestion
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-[14px] text-sm font-medium transition-all duration-300 ${activeTab === 'analytics' ? 'bg-[#007AFF] text-white shadow-md shadow-blue-500/10' : 'text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/5'}`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-[14px] text-sm font-medium transition-all duration-300 ${activeTab === 'plans' ? 'bg-[#007AFF] text-white shadow-md shadow-blue-500/10' : 'text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/5'}`}
            >
              Development Plans
            </button>
            <button 
              onClick={() => setActiveTab('insights')}
              className={`px-4 py-2 rounded-[14px] text-sm font-medium transition-all duration-300 ${activeTab === 'insights' ? 'bg-[#007AFF] text-white shadow-md shadow-blue-500/10' : 'text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/5'}`}
            >
              AI Insights
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-[14px] text-sm font-medium transition-all duration-300 ${activeTab === 'reports' ? 'bg-[#007AFF] text-white shadow-md shadow-blue-500/10' : 'text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/5'}`}
            >
              Reports
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button 
              id="darkModeToggle"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-[14px] bg-white/50 dark:bg-black/30 border border-white/20 hover:scale-105 active:scale-95 transition-all text-slate-700 dark:text-yellow-400"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Quick Demo Button / CTA */}
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-[16px] bg-gradient-to-r from-[#007AFF] to-[#0051FF] hover:opacity-95 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all duration-300"
            >
              <span>Explore Demo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Sticky Tab bar */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50 glass-nav rounded-[24px] py-3 px-4 flex justify-around items-center">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-1.5 ${activeTab === 'home' ? 'text-[#007AFF]' : 'text-slate-400 dark:text-slate-500'}`}>
          <HomeIcon className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Home</span>
        </button>
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-1.5 ${activeTab === 'dashboard' ? 'text-[#007AFF]' : 'text-slate-400 dark:text-slate-500'}`}>
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Dashboard</span>
        </button>
        <button onClick={() => setActiveTab('submit')} className={`flex flex-col items-center p-1.5 ${activeTab === 'submit' ? 'text-[#007AFF]' : 'text-slate-400 dark:text-slate-500'}`}>
          <MessageSquarePlus className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Submit</span>
        </button>
        <button onClick={() => setActiveTab('analytics')} className={`flex flex-col items-center p-1.5 ${activeTab === 'analytics' ? 'text-[#007AFF]' : 'text-slate-400 dark:text-slate-500'}`}>
          <BarChart3 className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Analytics</span>
        </button>
        <button onClick={() => setActiveTab('plans')} className={`flex flex-col items-center p-1.5 ${activeTab === 'plans' ? 'text-[#007AFF]' : 'text-slate-400 dark:text-slate-500'}`}>
          <Building className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Plans</span>
        </button>
        <button onClick={() => setActiveTab('insights')} className={`flex flex-col items-center p-1.5 ${activeTab === 'insights' ? 'text-[#007AFF]' : 'text-slate-400 dark:text-slate-500'}`}>
          <Lightbulb className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Insights</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 pt-8 pb-32 relative z-10">
        
        {/* TAB 1: HOME / LANDING PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-24 animate-fade-in">
            {/* HERO SECTION */}
            <div className="grid lg:grid-cols-12 gap-12 items-center pt-8">
              <div className="lg:col-span-7 space-y-8 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[99px] bg-white/45 dark:bg-white/5 border border-white/40 dark:border-white/10 shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-[#34C759]"></span>
                  <span className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 uppercase">iOS 26 Vision Realized</span>
                </div>
                
                <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-slate-900 dark:text-white">
                  AI That Helps MPs <br />
                  <span className="bg-gradient-to-r from-[#007AFF] via-[#30B0FF] to-[#AF52DE] bg-clip-text text-transparent">
                    Listen to Every Citizen.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  Collect suggestions from every village, analyze recurring problems using AI, and prioritize development projects with data-driven intelligence. Turning every citizen voice into action.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="px-8 py-4 rounded-[20px] bg-[#007AFF] text-white font-bold shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all text-center"
                  >
                    Try Dashboard
                  </button>
                  <button 
                    onClick={() => setActiveTab('submit')}
                    className="px-8 py-4 rounded-[20px] bg-white/60 dark:bg-white/10 text-slate-800 dark:text-white font-bold border border-white/50 dark:border-white/10 shadow-sm hover:bg-white/80 dark:hover:bg-white/20 hover:scale-105 active:scale-95 transition-all text-center"
                  >
                    Submit Voice Suggestion
                  </button>
                </div>

                {/* Micro metrics display */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">10k+</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Voices Processed</p>
                  </div>
                  <div>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">98%</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI Match Accuracy</p>
                  </div>
                  <div>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">4.8 Cr</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Budget Optimized</p>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: Large floating 3D dashboard preview inside glass card */}
              <div className="lg:col-span-5 relative">
                <div className="glass-panel rounded-[32px] p-6 shadow-2xl relative border-white/50 dark:border-white/10 bg-white/50 dark:bg-slate-900/40">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#FF3B30]"></span>
                      <span className="w-3 h-3 rounded-full bg-[#FF9F0A]"></span>
                      <span className="w-3 h-3 rounded-full bg-[#34C759]"></span>
                    </div>
                    <span className="text-xs font-semibold text-[#007AFF] bg-blue-500/10 px-2.5 py-1 rounded-[12px]">MP Live Portal</span>
                  </div>

                  {/* Simulated Mini Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/40 dark:bg-white/5 p-3.5 rounded-[20px] border border-white/30 dark:border-white/5">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Total Voices</span>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">8,432</p>
                    </div>
                    <div className="bg-white/40 dark:bg-white/5 p-3.5 rounded-[20px] border border-white/30 dark:border-white/5">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Priority Avg</span>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">91.4%</p>
                    </div>
                  </div>

                  {/* Hotspot Visualizer inside preview */}
                  <div className="bg-white/30 dark:bg-white/5 p-4 rounded-[24px] border border-white/20 dark:border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Active Hotspots</span>
                      <span className="text-xs text-[#007AFF] font-bold">Pune District</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1 text-slate-500 dark:text-slate-400">
                          <span>Drinking Water Scarcity (Khed)</span>
                          <span className="font-bold text-[#FF3B30]">94% Priority</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full" style={{ width: '94%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1 text-slate-500 dark:text-slate-400">
                          <span>Girls High School Sanitation (Barasat)</span>
                          <span className="font-bold text-[#FF9F0A]">88% Priority</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full" style={{ width: '88%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated floating cards surrounding mock 3D card */}
                {/* Float Card 1: Voice Submission */}
                <div className="absolute -top-6 -left-6 bg-white/75 dark:bg-slate-800/80 p-3.5 rounded-[22px] border border-white/40 dark:border-white/10 shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '6s' }}>
                  <div className="w-9 h-9 rounded-[12px] bg-[#007AFF] flex items-center justify-center text-white shadow-lg shadow-blue-500/10">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Voice Submission</p>
                    <span className="text-[10px] text-[#34C759]">AI Whisper: 99.4% Accurate</span>
                  </div>
                </div>

                {/* Float Card 2: AI Analysis */}
                <div className="absolute top-1/2 -right-8 bg-white/75 dark:bg-slate-800/80 p-3.5 rounded-[22px] border border-white/40 dark:border-white/10 shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '8s', animationDelay: '1.5s' }}>
                  <div className="w-9 h-9 rounded-[12px] bg-[#AF52DE] flex items-center justify-center text-white shadow-lg shadow-purple-500/10">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">AI Analysis</p>
                    <span className="text-[10px] text-[#007AFF]">NLP Categorization Live</span>
                  </div>
                </div>

                {/* Float Card 3: Priority Score */}
                <div className="absolute -bottom-6 left-6 bg-white/75 dark:bg-slate-800/80 p-3.5 rounded-[22px] border border-white/40 dark:border-white/10 shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '7s', animationDelay: '3s' }}>
                  <div className="w-9 h-9 rounded-[12px] bg-[#FF9F0A] flex items-center justify-center text-white shadow-lg shadow-orange-500/10">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Priority Engine</p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Calculated on Impact</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FEATURE SECTION */}
            <div className="space-y-12">
              <div className="text-center space-y-4 max-w-xl mx-auto">
                <span className="text-[#007AFF] text-xs font-bold tracking-widest uppercase">Granular Features</span>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
                  State-of-the-Art Core Engines
                </h2>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
                  Every feedback suggestion goes through a multi-tiered pipeline engineered for speed, absolute privacy, and structured prioritization.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1 */}
                <div className="glass-panel rounded-[28px] p-6 border-white/40 dark:border-white/5 bg-white/45 dark:bg-slate-900/30 hover:scale-[1.03] transition-all duration-300">
                  <div className="w-12 h-12 rounded-[16px] bg-blue-500/10 text-[#007AFF] flex items-center justify-center mb-5">
                    <Mic className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">Voice Submission</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Citizens easily submit feedback using audio records, WhatsApp, SMS, local files, or voice prompts. Completely friction-free.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="glass-panel rounded-[28px] p-6 border-white/40 dark:border-white/5 bg-white/45 dark:bg-slate-900/30 hover:scale-[1.03] transition-all duration-300">
                  <div className="w-12 h-12 rounded-[16px] bg-purple-500/10 text-[#AF52DE] flex items-center justify-center mb-5">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">AI Translation & NLP</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Processes Indian local languages (Hindi, Marathi, Tamil, Telugu, Punjabi) and maps sentiments to categories instantly.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="glass-panel rounded-[28px] p-6 border-white/40 dark:border-white/5 bg-white/45 dark:bg-slate-900/30 hover:scale-[1.03] transition-all duration-300">
                  <div className="w-12 h-12 rounded-[16px] bg-green-500/10 text-[#34C759] flex items-center justify-center mb-5">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">Heatmap Clustures</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Clusters rural complaints by GIS boundaries. Easily pin hotspots, evaluate district density, and isolate systemic errors.
                  </p>
                </div>

                {/* Card 4 */}
                <div className="glass-panel rounded-[28px] p-6 border-white/40 dark:border-white/5 bg-white/45 dark:bg-slate-900/30 hover:scale-[1.03] transition-all duration-300">
                  <div className="w-12 h-12 rounded-[16px] bg-orange-500/10 text-[#FF9F0A] flex items-center justify-center mb-5">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">Priority Ranking</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Intelligent algorithm prioritizes submissions based on census-based population impact, project budgets, and seasonality.
                  </p>
                </div>
              </div>
            </div>

            {/* HOW IT WORKS */}
            <div className="space-y-16">
              <div className="text-center space-y-4 max-w-xl mx-auto">
                <span className="text-[#AF52DE] text-xs font-bold tracking-widest uppercase">The Pipeline Flow</span>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
                  How Every Voice Reaches the MP
                </h2>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
                  See how an unstructured rural audio clip propagates through modern localized LLMs straight onto a structured legislative portal.
                </p>
              </div>

              {/* Timeline layout */}
              <div className="relative max-w-4xl mx-auto">
                {/* Horizontal / Vertical Line depending on screen size */}
                <div className="absolute left-[20px] md:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#007AFF] via-[#AF52DE] to-[#34C759] opacity-30 transform md:-translate-x-1/2"></div>
                
                <div className="space-y-12">
                  {[
                    { step: 'Step 1', title: 'Citizen Records Local Voice', desc: 'A citizen logs directly onto the Web/WhatsApp and records an audio complaint describing water issues in Tamil/Hindi.', icon: <Mic className="w-4 h-4" />, side: 'left' },
                    { step: 'Step 2', title: 'High Accuracy Whisper transcription', desc: 'Cloud hosted speech models parse dialect variations and convert unstructured phonetics into neat local text.', icon: <Sparkles className="w-4 h-4" />, side: 'right' },
                    { step: 'Step 3', title: 'LLM Multilingual Translation', desc: 'The text is translated to standard administrative English, preserving exact village name coordinates and distress context.', icon: <Languages className="w-4 h-4" />, side: 'left' },
                    { step: 'Step 4', title: 'Sentiment & Category Classification', desc: 'Advanced categorizers tag the suggestion (e.g., Water, Road, Health) and compute immediate urgency ratings.', icon: <Filter className="w-4 h-4" />, side: 'right' },
                    { step: 'Step 5', title: 'Census & Govt Dataset Merger', desc: 'We align complaints with block population lists, current scheme budgets, and municipal files.', icon: <FileSpreadsheet className="w-4 h-4" />, side: 'left' },
                    { step: 'Step 6', title: 'Need-Score Ranking Optimization', desc: 'Algorithm measures the potential impact vs costs and awards an absolute priority score from 1-100.', icon: <TrendingUp className="w-4 h-4" />, side: 'right' },
                    { step: 'Step 7', title: 'Live MP Interactive Updates', desc: 'The MP accesses the unified dashboard. Approves project, matches government budgets, or orders site inspection.', icon: <CheckCircle2 className="w-4 h-4" />, side: 'left' }
                  ].map((item, idx) => (
                    <div key={idx} className={`relative flex flex-col md:flex-row items-start md:items-center ${item.side === 'right' ? 'md:flex-row-reverse' : ''}`}>
                      {/* Timeline dot */}
                      <div className="absolute left-[10px] md:left-1/2 w-6 h-6 rounded-full bg-white dark:bg-slate-950 border-4 border-[#007AFF] shadow-md transform -translate-y-1/2 md:-translate-x-1/2 z-10 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF]"></span>
                      </div>

                      {/* Content block */}
                      <div className="w-full md:w-1/2 pl-10 md:pl-0 md:px-8">
                        <div className="glass-panel p-5 rounded-[22px] border-white/40 dark:border-white/5 bg-white/50 dark:bg-slate-900/40 hover:shadow-lg transition-all">
                          <span className="text-[10px] font-bold text-[#007AFF] uppercase tracking-widest">{item.step}</span>
                          <h4 className="font-display font-bold text-base mt-1 text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="p-1 rounded-md bg-[#007AFF]/10 text-[#007AFF]">{item.icon}</span>
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                      
                      {/* Placeholder space for medium size screens */}
                      <div className="hidden md:block w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="glass-panel rounded-[32px] p-8 md:p-12 border-white/55 dark:border-white/10 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-transparent text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#007AFF] opacity-10 filter blur-[80px] rounded-full"></div>
              <h3 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white max-w-xl mx-auto">
                Ready to Experience Next-Gen Citizen Engagement?
              </h3>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                Interact with the actual platform dashboard. Submit suggestions as a citizen, or analyze prioritized projects as a Member of Parliament.
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setActiveTab('dashboard')} 
                  className="px-6 py-3.5 rounded-[16px] bg-[#007AFF] text-white text-sm font-semibold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Launch MP Portal
                </button>
                <button 
                  onClick={() => setActiveTab('submit')} 
                  className="px-6 py-3.5 rounded-[16px] bg-white/40 dark:bg-white/5 border border-white/40 text-sm font-semibold hover:bg-white/60 dark:hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
                >
                  Simulate Suggestion
                </button>
              </div>
            </div>
          </div>
        )}


        {/* TAB 2: PORTAL DASHBOARD (The standard Apple dashboard interface) */}
        {activeTab === 'dashboard' && (
          <div className="grid lg:grid-cols-12 gap-8 animate-fade-in text-left">
            
            {/* Sidebar Controls */}
            <div className="lg:col-span-3 space-y-6">
              <div className="glass-panel rounded-[28px] p-6 border-white/40 dark:border-white/5 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Portal Controls</h3>
                  <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-100">Live Pune/Varanasi Feeds</p>
                </div>

                {/* Filter District */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Filter District</label>
                  <select 
                    value={selectedDistrictFilter}
                    onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-[16px] bg-white/80 dark:bg-black/40 border border-slate-300/60 dark:border-white/10 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#007AFF] font-medium"
                  >
                    {districtsList.map((d, i) => (
                      <option key={i} value={d} className="text-slate-900 bg-white dark:text-slate-100 dark:bg-slate-900">{d}</option>
                    ))}
                  </select>
                </div>

                {/* Filter Category */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Filter Category</label>
                  <select 
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-[16px] bg-white/80 dark:bg-black/40 border border-slate-300/60 dark:border-white/10 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#007AFF] font-medium"
                  >
                    {categoriesList.map((cat, i) => (
                      <option key={i} value={cat} className="text-slate-900 bg-white dark:text-slate-100 dark:bg-slate-900">{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Search Text */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Search Submissions</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search keywords..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-[16px] bg-white/80 dark:bg-black/40 border border-slate-300/60 dark:border-white/10 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF] font-medium"
                    />
                    <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <button 
                    onClick={() => {
                      setSelectedDistrictFilter('All');
                      setSelectedCategoryFilter('All');
                      setSearchQuery('');
                    }}
                    className="w-full px-4 py-2.5 rounded-[14px] bg-slate-200 dark:bg-white/10 hover:opacity-90 transition-all text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All Filters
                  </button>

                  <button 
                    onClick={() => setActiveTab('submit')}
                    className="w-full px-4 py-2.5 rounded-[14px] bg-[#007AFF] hover:opacity-90 transition-all text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/15"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    Add Live Feedback
                  </button>
                </div>
              </div>

              {/* Status breakdown Widget */}
              <div className="glass-panel rounded-[28px] p-5 border-white/40 dark:border-white/5 bg-[#007AFF]/5 dark:bg-[#007AFF]/10">
                <span className="text-[10px] font-bold text-[#007AFF] uppercase tracking-widest block">AI Priority Threshold</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Feedback above <span className="font-bold text-[#FF3B30]">85% score</span> are automatically routed to municipal action planners for urgent sanction.
                </p>
                <div className="flex gap-2 mt-3 text-[11px] font-bold">
                  <span className="px-2 py-1 bg-red-500/10 text-[#FF3B30] rounded-md">Urgent Critical: {suggestions.filter(s => s.priorityScore >= 90).length}</span>
                  <span className="px-2 py-1 bg-orange-500/10 text-[#FF9F0A] rounded-md">Medium Priority: {suggestions.filter(s => s.priorityScore < 90 && s.priorityScore >= 80).length}</span>
                </div>
              </div>
            </div>

            {/* Main Portal Dashboard Content */}
            <div className="lg:col-span-9 space-y-8">
              
              {/* Top Quick Stats Carousel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-panel rounded-[24px] p-4 border-white/45 dark:border-white/5">
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span className="text-xs font-semibold">Total Feedback</span>
                    <Sparkles className="w-4 h-4 text-[#AF52DE]" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {stats ? stats.totalSuggestions : suggestions.length}
                  </p>
                  <p className="text-[10px] text-green-600 dark:text-green-400 font-bold mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +14.8% vs last week
                  </p>
                </div>

                <div className="glass-panel rounded-[24px] p-4 border-white/45 dark:border-white/5">
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span className="text-xs font-semibold">Villages Covered</span>
                    <MapPin className="w-4 h-4 text-[#007AFF]" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {stats ? stats.villagesCovered : '18'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                    Active cluster grids
                  </p>
                </div>

                <div className="glass-panel rounded-[24px] p-4 border-white/45 dark:border-white/5">
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span className="text-xs font-semibold">Avg Priority Need</span>
                    <TrendingUp className="w-4 h-4 text-[#FF9F0A]" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {stats ? stats.averagePriorityScore : '89'}%
                  </p>
                  <p className="text-[10px] text-red-600 dark:text-red-400 font-bold mt-1">
                    High demand indicators
                  </p>
                </div>

                <div className="glass-panel rounded-[24px] p-4 border-white/45 dark:border-white/5">
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span className="text-xs font-semibold">Budget Utilized</span>
                    <Coins className="w-4 h-4 text-[#34C759]" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {stats ? stats.budgetUtilization : '38'}%
                  </p>
                  <p className="text-[10px] text-green-600 dark:text-green-400 font-bold mt-1">
                    ₹{stats ? stats.totalBudgetPlanned : '345'}L Planned
                  </p>
                </div>
              </div>

              {/* Suggestions feed list */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-[#007AFF]" />
                    Citizen Voices & Feedback ({filteredSuggestions.length})
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center gap-3">
                    <span>Sorted by: Priority Score</span>
                  </div>
                </div>

                {filteredSuggestions.length === 0 ? (
                  <div className="glass-panel rounded-[28px] p-12 border-white/40 text-center space-y-4">
                    <AlertTriangle className="w-12 h-12 text-[#FF9F0A] mx-auto" />
                    <h4 className="font-display font-bold text-lg text-slate-800 dark:text-slate-200">No suggestions match filters</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">Try resetting the district or category search filter parameters above to view existing citizen requests.</p>
                    <button 
                      onClick={() => {
                        setSelectedDistrictFilter('All');
                        setSelectedCategoryFilter('All');
                        setSearchQuery('');
                      }} 
                      className="px-4 py-2 rounded-[14px] bg-[#007AFF] text-white text-xs font-bold"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredSuggestions.map((item) => (
                      <div 
                        key={item.id} 
                        className={`glass-panel rounded-[24px] p-5 border-white/45 dark:border-white/5 bg-white/45 dark:bg-slate-900/30 transition-all hover:translate-x-1 duration-300 relative ${selectedSuggestion?.id === item.id ? 'ring-2 ring-[#007AFF]' : ''}`}
                      >
                        {/* Urgent tag indicator */}
                        {item.priorityScore >= 90 && (
                          <span className="absolute -top-2.5 -left-2 px-2 py-0.5 rounded-full bg-red-500 text-white font-extrabold text-[8px] uppercase tracking-widest shadow-md">
                            Critical Alert
                          </span>
                        )}

                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            {/* Profile head */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm bg-slate-200 dark:bg-white/10 px-3 py-1 rounded-[12px] text-slate-800 dark:text-white">
                                {item.citizenName}
                              </span>
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {item.village}, {item.district}
                              </span>
                              <span className="text-[10px] text-[#007AFF] bg-blue-500/10 px-2 py-0.5 rounded-full font-semibold">
                                {item.language} Submission
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                item.category === 'Water' ? 'bg-blue-500/10 text-blue-500' :
                                item.category === 'Road' ? 'bg-amber-500/10 text-amber-500' :
                                item.category === 'Education' ? 'bg-purple-500/10 text-purple-500' :
                                item.category === 'Healthcare' ? 'bg-red-500/10 text-red-500' :
                                'bg-green-500/10 text-green-500'
                              }`}>
                                {item.category}
                              </span>
                            </div>

                            {/* Original Speech */}
                            <div className="p-3.5 rounded-[18px] bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-white/5 space-y-1">
                              <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase">Original Submission:</span>
                              <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{item.originalText}"</p>
                            </div>

                            {/* AI Translation */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-[#007AFF] block tracking-widest uppercase">AI Standard Translation:</span>
                              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">"{item.translatedText}"</p>
                            </div>

                            {/* AI Granular Actionable recommendation */}
                            <div className="p-3 rounded-[18px] bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 flex items-start gap-2.5">
                              <Sparkles className="w-4 h-4 text-[#007AFF] shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-bold text-[#007AFF] uppercase tracking-wider block">AI Actionable Recommendation Draft:</span>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">{item.aiSummary}</p>
                              </div>
                            </div>
                          </div>

                          {/* Priority Score Column */}
                          <div className="md:w-56 shrink-0 flex flex-col justify-between items-end gap-3 self-stretch border-t md:border-t-0 pt-4 md:pt-0 md:pl-4 md:border-l border-slate-200/60 dark:border-white/5">
                            <div className="text-right w-full">
                              <span className="text-[10px] text-slate-400 block font-medium">Need Score Rank</span>
                              <div className="flex items-baseline justify-end gap-1">
                                <span className={`text-3xl font-extrabold ${item.priorityScore >= 90 ? 'text-[#FF3B30]' : 'text-[#FF9F0A]'}`}>
                                  {item.priorityScore}
                                </span>
                                <span className="text-xs text-slate-400">/100</span>
                              </div>
                              
                              {/* Visual scale */}
                              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${item.priorityScore >= 90 ? 'bg-[#FF3B30]' : 'bg-[#FF9F0A]'}`} 
                                  style={{ width: `${item.priorityScore}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-right w-full text-[11px] text-slate-500">
                              <div>
                                <span className="text-[9px] text-slate-400 block">Beneficiaries</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{item.impact.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 block">Budget (Est)</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">₹{item.budgetEstimate}L</span>
                              </div>
                            </div>

                            {/* Status controls */}
                            <div className="w-full space-y-2 pt-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">Status:</span>
                                <span className={`font-bold uppercase ${
                                  item.status === 'Approved' ? 'text-[#34C759]' :
                                  item.status === 'Rejected' ? 'text-[#FF3B30]' :
                                  item.status === 'Investigating' ? 'text-[#FF9F0A]' : 'text-slate-500'
                                }`}>
                                  {item.status}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => handleUpdateSuggestionStatus(item.id, 'Approved')}
                                  className="flex-1 py-1.5 rounded-[10px] bg-green-500/15 text-[#34C759] hover:bg-green-500/25 text-[10px] font-bold transition-all text-center"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleUpdateSuggestionStatus(item.id, 'Investigating')}
                                  className="flex-1 py-1.5 rounded-[10px] bg-orange-500/15 text-[#FF9F0A] hover:bg-orange-500/25 text-[10px] font-bold transition-all text-center"
                                >
                                  Investigate
                                </button>
                                <button 
                                  onClick={() => handleUpdateSuggestionStatus(item.id, 'Rejected')}
                                  className="p-1.5 rounded-[10px] bg-red-500/15 text-[#FF3B30] hover:bg-red-500/25 text-[10px] font-bold transition-all text-center"
                                >
                                  <XCircle className="w-3.5 h-3.5 mx-auto" />
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {/* TAB 3: SUBMIT SUGGESTION PAGE (Glass form with drag and drop, voice waveform recorder) */}
        {activeTab === 'submit' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in text-left">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-[16px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mx-auto mb-3">
                <MessageSquarePlus className="w-6 h-6" />
              </div>
              <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">Submit Citizen Voice</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Submit raw audio complaints, text forms, or WhatsApp messages. AI translation and prioritzation run instantly.
              </p>
            </div>

            <form onSubmit={handleSubmitSuggestion} className="glass-panel rounded-[32px] p-6 md:p-8 border-white/50 dark:border-white/5 bg-white/50 space-y-6">
              
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 block">Citizen Name (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Enter name (e.g. Shanti Devi)" 
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-[16px] bg-white/60 dark:bg-black/30 border border-white/45 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  />
                </div>

                {/* Village */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 block">Village Name *</label>
                  <input 
                    type="text" 
                    placeholder="Enter Village (e.g. Khed)" 
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-[16px] bg-white/60 dark:bg-black/30 border border-white/45 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* District Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 block">District *</label>
                  <select 
                    value={district} 
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-[16px] bg-white/60 dark:bg-black/30 border border-white/45 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  >
                    <option value="Pune">Pune (Maharashtra)</option>
                    <option value="Varanasi">Varanasi (Uttar Pradesh)</option>
                    <option value="Coimbatore">Coimbatore (Tamil Nadu)</option>
                    <option value="Nizamabad">Nizamabad (Telangana)</option>
                    <option value="Malappuram">Malappuram (Kerala)</option>
                    <option value="Anand">Anand (Gujarat)</option>
                    <option value="Jalandhar">Jalandhar (Punjab)</option>
                    <option value="North 24 Parganas">North 24 Parganas (West Bengal)</option>
                    <option value="Uttara Kannada">Uttara Kannada (Karnataka)</option>
                  </select>
                </div>

                {/* Native Language */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 block">Submission Language *</label>
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-[16px] bg-white/60 dark:bg-black/30 border border-white/45 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Malayalam">Malayalam (മലയാളം)</option>
                    <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                    <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                    <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                  </select>
                </div>
              </div>

              {/* MOCK VOICE RECORDER AREA */}
              <div className="p-5 rounded-[24px] bg-[#007AFF]/5 border border-dashed border-[#007AFF]/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#007AFF] block uppercase tracking-wider">Voice Submission Engine</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Simulate or record direct citizen dialect speech.</p>
                  </div>
                  {isRecording ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500 text-white font-bold text-[10px] animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      Recording: {recordingSeconds}s
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#34C759] font-bold">Ready</span>
                  )}
                </div>

                {/* Animated Voice Waveform Visualizer */}
                <div className="h-16 flex items-center justify-center gap-1 bg-white/45 dark:bg-black/30 rounded-[20px] p-4 overflow-hidden border border-white/30 dark:border-white/5">
                  {isRecording ? (
                    Array.from({ length: 32 }).map((_, i) => (
                      <span 
                        key={i} 
                        className="w-1 bg-[#007AFF] rounded-full bar-pulse" 
                        style={{ 
                          height: `${Math.floor(Math.random() * 24) + 6}px`,
                          animationDelay: `${i * 0.04}s`
                        }}
                      ></span>
                    ))
                  ) : audioBlobUrl ? (
                    <div className="flex items-center gap-2 text-[#34C759]">
                      <Check className="w-4 h-4" />
                      <span className="text-xs font-bold">Audio Recording Captured ({recordingSeconds || 12} seconds)</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Tap microphone below to simulate voice recording</p>
                  )}
                </div>

                {/* Micro Action Trigger buttons */}
                <div className="flex justify-center gap-3">
                  {!isRecording ? (
                    <button 
                      type="button"
                      onClick={startRecording}
                      className="px-5 py-2 rounded-[14px] bg-[#007AFF] hover:bg-[#0062E0] text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-blue-500/10"
                    >
                      <Mic className="w-4 h-4" />
                      Start Voice Recording
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={stopRecording}
                      className="px-5 py-2 rounded-[14px] bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95 animate-pulse"
                    >
                      <MicOff className="w-4 h-4" />
                      Stop & Convert Speech
                    </button>
                  )}
                </div>
              </div>

              {/* Text Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 block">Feedback Details / Translated transcription *</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Enter the suggestion or type standard translation text. E.g. Under Khed district, there is extreme shortage of drinking wells..."
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  className="w-full px-4 py-3 rounded-[20px] bg-white/60 dark:bg-black/30 border border-white/45 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                ></textarea>
              </div>

              {/* DRAG AND DROP FILE UPLOAD CONTAINER */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 block">Upload Media (Optional - GPS Photos/Videos)</label>
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('media-file')?.click()}
                  className={`border-2 border-dashed rounded-[24px] p-6 text-center cursor-pointer transition-all duration-300 ${
                    dragActive 
                      ? 'border-[#007AFF] bg-[#007AFF]/5' 
                      : 'border-slate-300/60 dark:border-white/10 hover:border-[#007AFF] hover:bg-slate-50/50 dark:hover:bg-white/5'
                  }`}
                >
                  <input 
                    type="file" 
                    id="media-file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                  />
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  {uploadedFile ? (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#34C759]">{uploadedFile.name}</p>
                      <p className="text-[10px] text-slate-400">File size: {(uploadedFile.size / 1024).toFixed(1)} KB - Ready</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Drag & drop photo or click to upload</p>
                      <p className="text-[10px] text-slate-400">Supports JPEG, PNG, MP4 with metadata coordinates</p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                disabled={!village || !suggestionText}
                className="w-full py-4 rounded-[20px] bg-gradient-to-r from-[#007AFF] to-[#0051FF] disabled:opacity-50 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-blue-500/15 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Submit and Trigger AI Prioritization Pipeline
              </button>
            </form>
          </div>
        )}


        {/* TAB 4: CHATGPT-LIKE AI PROCESSING SCREEN */}
        {activeTab === 'processing' && (
          <div className="max-w-xl mx-auto py-12 animate-fade-in text-center space-y-8">
            <div className="relative">
              {/* Spinning/pulsing dynamic loader ring */}
              <div className="w-24 h-24 rounded-full border-4 border-[#007AFF]/10 border-t-[#007AFF] animate-spin mx-auto"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Sparkles className="w-8 h-8 text-[#007AFF] animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">JanVoice AI Engine Thinking</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Executing advanced translation, duplicate matching & Need-Score ranking</p>
            </div>

            {/* AI Steps container */}
            <div className="glass-panel rounded-[28px] p-5 border-white/45 dark:border-white/5 text-left space-y-3.5 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pipeline Task Output</span>
                <span className="text-[10px] text-[#007AFF] font-bold animate-pulse">Running live checks...</span>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'uploading', label: 'Audio Upload & Buffer allocation' },
                  { key: 'speech', label: 'Whisper raw dialect speech-to-text' },
                  { key: 'translating', label: 'Translation to Unified English text' },
                  { key: 'category', label: 'Executing NLP categorization models' },
                  { key: 'duplicates', label: 'Granular duplication check' },
                  { key: 'priority', label: 'Urgency need index mapping' },
                  { key: 'generating', label: 'Generating actionable summarizations' }
                ].map((item, idx) => {
                  const isDone = processingSteps.some(step => step.toLowerCase().includes(item.key));
                  const isCurrent = processingState === item.key;
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs transition-all">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          isDone ? 'bg-[#34C759]' : isCurrent ? 'bg-[#007AFF] animate-ping' : 'bg-slate-200 dark:bg-slate-800'
                        }`}></span>
                        <span className={`font-medium ${isCurrent ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                          {item.label}
                        </span>
                      </div>
                      {isDone ? (
                        <span className="text-[#34C759] font-bold text-[10px]">SUCCESS</span>
                      ) : isCurrent ? (
                        <span className="text-[#007AFF] font-bold text-[10px] animate-pulse">PROCESSING</span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700 font-bold text-[10px]">WAITING</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic">"Turning local voice into direct legislative actions."</p>
          </div>
        )}


        {/* TAB 5: AI ANALYTICS (Interactive visualizer charts) */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-7 h-7 text-[#007AFF]" />
                  Interactive Demand Analytics
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Granular complaints clustering, trend tracking, and geographic hotspot statistics</p>
              </div>

              {/* District quick switcher */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-medium">District context:</label>
                <select 
                  value={selectedDistrictFilter}
                  onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-[12px] bg-white/50 dark:bg-black/30 border border-white/45 text-xs font-semibold focus:outline-none"
                >
                  {districtsList.map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Interactive SVG charts row */}
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Category Breakdown bar charts */}
              <div className="glass-panel rounded-[28px] p-6 border-white/40 dark:border-white/5 bg-white/40">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-display font-bold text-base flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-[#AF52DE]" />
                    Feedback Breakdown by Category
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase"> Pune & Varanasi dataset</span>
                </div>

                <div className="space-y-4">
                  {[
                    { cat: 'Water', count: 48, pct: 28, color: 'bg-blue-500', desc: 'Drinking water lines, borewell repairs' },
                    { cat: 'Road', count: 35, pct: 21, color: 'bg-amber-500', desc: 'School paving link corridors' },
                    { cat: 'Healthcare', count: 28, pct: 16, color: 'bg-red-500', desc: 'PHC centers, doctor visits' },
                    { cat: 'Education', count: 24, pct: 14, color: 'bg-purple-500', desc: 'Sanitation toilets, roof repairs' },
                    { cat: 'Electricity', count: 18, pct: 11, color: 'bg-orange-500', desc: 'Farming solar grid feeders' },
                    { cat: 'Agriculture', count: 12, pct: 7, color: 'bg-green-500', desc: 'Cold storage, grain transport' },
                    { cat: 'Employment', count: 8, pct: 5, color: 'bg-teal-500', desc: 'Digital hubs, typing sub-centers' }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5 group cursor-pointer">
                      <div className="flex justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{item.cat}</span>
                          <span className="text-[10px] text-slate-400 block sm:inline">({item.desc})</span>
                        </div>
                        <span className="font-bold">{item.count} voices ({item.pct}%)</span>
                      </div>
                      <div className="h-3 w-full bg-slate-200/60 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all duration-1000 group-hover:opacity-90`}
                          style={{ width: `${item.pct}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulated India Grid Map Pin Heatmap */}
              <div className="glass-panel rounded-[28px] p-6 border-white/40 dark:border-white/5 bg-white/40 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-display font-bold text-base flex items-center gap-2">
                      <MapIcon className="w-4 h-4 text-[#007AFF]" />
                      Geographic Cluster Pins
                    </h3>
                    <span className="text-[10px] text-[#34C759] font-bold uppercase animate-pulse">● LIVE GRID</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                    Pins represent clusters of multiple citizen complaints about the same localized issue in India districts.
                  </p>
                </div>

                {/* SVG Visual map box */}
                <div className="h-64 bg-slate-100/50 dark:bg-slate-950/40 rounded-[24px] border border-slate-200/50 dark:border-white/5 p-4 flex items-center justify-center relative overflow-hidden">
                  
                  {/* Glowing background matrix effect */}
                  <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-5 pointer-events-none">
                    {Array.from({ length: 72 }).map((_, i) => (
                      <div key={i} className="border border-slate-900 dark:border-white"></div>
                    ))}
                  </div>

                  {/* Mock Indian Subcontinent Outline Representation */}
                  <svg className="w-full h-full max-w-sm text-slate-300 dark:text-slate-800" viewBox="0 0 200 200" fill="currentColor">
                    <path d="M100 20 L110 35 L125 40 L130 50 L125 65 L115 75 L120 90 L130 100 L110 115 L105 130 L100 150 L95 160 L98 175 L95 185 L90 190 L85 180 L80 165 L70 150 L75 135 L60 120 L55 105 L65 95 L60 80 L70 70 L75 55 L85 45 L90 35 Z" opacity="0.3" />
                  </svg>

                  {/* Glowing cluster point 1 (Pune) */}
                  <div 
                    onClick={() => {
                      setSearchQuery('Khed');
                      setActiveTab('dashboard');
                    }}
                    className="absolute top-[65%] left-[42%] cursor-pointer group"
                  >
                    <span className="absolute -top-1 left-4 bg-white/90 dark:bg-slate-900 border text-[9px] font-extrabold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      Pune (14 Voices)
                    </span>
                    <span className="flex h-4 w-4 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border border-white"></span>
                    </span>
                  </div>

                  {/* Glowing cluster point 2 (Varanasi) */}
                  <div 
                    onClick={() => {
                      setSearchQuery('Varanasi');
                      setActiveTab('dashboard');
                    }}
                    className="absolute top-[48%] left-[55%] cursor-pointer group"
                  >
                    <span className="absolute -top-1 left-4 bg-white/90 dark:bg-slate-900 border text-[9px] font-extrabold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      Varanasi (9 Voices)
                    </span>
                    <span className="flex h-4 w-4 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border border-white"></span>
                    </span>
                  </div>

                  {/* Glowing cluster point 3 (Coimbatore) */}
                  <div 
                    onClick={() => {
                      setSearchQuery('Thondamuthur');
                      setActiveTab('dashboard');
                    }}
                    className="absolute top-[82%] left-[45%] cursor-pointer group"
                  >
                    <span className="absolute -top-1 left-4 bg-white/90 dark:bg-slate-900 border text-[9px] font-extrabold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      Coimbatore (5 Voices)
                    </span>
                    <span className="flex h-4 w-4 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 border border-white"></span>
                    </span>
                  </div>

                  {/* Glowing cluster point 4 (Jalandhar) */}
                  <div 
                    onClick={() => {
                      setSearchQuery('Jalandhar');
                      setActiveTab('dashboard');
                    }}
                    className="absolute top-[32%] left-[40%] cursor-pointer group"
                  >
                    <span className="absolute -top-1 left-4 bg-white/90 dark:bg-slate-900 border text-[9px] font-extrabold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      Jalandhar (6 Voices)
                    </span>
                    <span className="flex h-4 w-4 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border border-white"></span>
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                  <span>Interactive Map: Hover or tap circles to isolate district suggestions feed</span>
                  <span className="text-[#007AFF] font-bold">Total Clusters: 4 Regions</span>
                </div>
              </div>
            </div>

            {/* Monthly Trend tracker */}
            <div className="glass-panel rounded-[28px] p-6 border-white/40 dark:border-white/5 bg-white/40">
              <h3 className="font-display font-bold text-base mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#007AFF]" />
                Voice Volumes Trend (Monthly Tracker)
              </h3>
              
              {/* Visual chart bars */}
              <div className="h-44 flex items-end justify-between gap-3 pt-6 px-4 border-b border-slate-200 dark:border-slate-800">
                {[
                  { month: 'Jan', count: 12, height: '15%' },
                  { month: 'Feb', count: 18, height: '22%' },
                  { month: 'Mar', count: 25, height: '32%' },
                  { month: 'Apr', count: 32, height: '42%' },
                  { month: 'May', count: 45, height: '60%' },
                  { month: 'Jun', count: 68, height: '85%' },
                  { month: 'Jul', count: 84, height: '100%', highlight: true }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <span className="text-[10px] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-1.5 py-0.5 rounded-md">
                      {item.count}
                    </span>
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        item.highlight 
                          ? 'bg-gradient-to-t from-[#007AFF] to-[#30B0FF] shadow-lg shadow-blue-500/20' 
                          : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-[#007AFF]/50'
                      }`}
                      style={{ height: item.height }}
                    ></div>
                    <span className="text-[11px] text-slate-400 font-bold mb-1">{item.month}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-3 text-center">Spike in May-July corresponds to pre-monsoon water and village connectivity demands.</p>
            </div>
          </div>
        )}


        {/* TAB 6: AI RECOMMENDATION / INSIGHTS PAGE (Floating cards with approve/reject actions) */}
        {activeTab === 'insights' && (
          <div className="space-y-8 animate-fade-in text-left">
            <div className="space-y-2">
              <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-7 h-7 text-[#007AFF]" />
                AI Generated Development Insights
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Advanced AI engines consolidate duplicate individual complaints into single, high-impact regional recommendations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {recommendations.map((item) => (
                <div 
                  key={item.id} 
                  className="glass-panel rounded-[28px] p-6 border-white/45 dark:border-white/5 bg-white/45 dark:bg-slate-900/30 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 relative"
                >
                  {/* Header metadata */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className={`text-[10px] px-2.5 py-1 rounded-[12px] font-bold ${
                          item.category === 'Water' ? 'bg-blue-500/10 text-blue-500' :
                          item.category === 'Road' ? 'bg-amber-500/10 text-amber-500' :
                          item.category === 'Education' ? 'bg-purple-500/10 text-purple-500' :
                          'bg-green-500/10 text-green-500'
                        }`}>
                          {item.category} Category
                        </span>
                        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mt-1.5 leading-tight">
                          {item.title}
                        </h3>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-bold">Confidence Index</span>
                        <span className="text-xs font-bold text-[#34C759]">{item.confidence}% AI score</span>
                      </div>
                    </div>

                    {/* Numeric stats row */}
                    <div className="grid grid-cols-3 gap-3 p-4 rounded-[20px] bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-white/5">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Villages Covered</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.villagesCount} blocks</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Estimated Budget</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">₹{item.estimatedBudget >= 100 ? `${(item.estimatedBudget / 100).toFixed(1)} Cr` : `${item.estimatedBudget} Lakhs`}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Beneficiaries</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{(item.potentialBeneficiaries).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* AI Recommendation dialogue text */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#007AFF] uppercase tracking-wider block">AI Structured Proposal Context</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic font-semibold leading-relaxed">
                        "{item.aiRecommendation}"
                      </p>
                    </div>

                    {/* Target list */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block font-bold">Consolidated Village Complaints List</span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.villagesList.map((village, idx) => (
                          <span key={idx} className="text-[10px] bg-white/70 dark:bg-white/5 px-2 py-0.5 rounded-[8px] text-slate-500">
                            {village}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400">Action:</span>
                      <span className={`font-bold uppercase ${
                        item.status === 'Approved' ? 'text-[#34C759]' :
                        item.status === 'Rejected' ? 'text-[#FF3B30]' :
                        item.status === 'MoreData' ? 'text-[#FF9F0A]' : 'text-slate-500'
                      }`}>
                        {item.status === 'Pending' ? 'Pending Approval' : item.status}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRecommendationAction(item.id, 'Approved')}
                        className="px-4 py-2 rounded-[12px] bg-green-500/15 hover:bg-green-500/25 text-[#34C759] text-xs font-bold transition-all"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleRecommendationAction(item.id, 'MoreData')}
                        className="px-4 py-2 rounded-[12px] bg-orange-500/15 hover:bg-orange-500/25 text-[#FF9F0A] text-xs font-bold transition-all"
                      >
                        Request More
                      </button>
                      <button 
                        onClick={() => handleRecommendationAction(item.id, 'Rejected')}
                        className="p-2 rounded-[12px] bg-red-500/15 hover:bg-red-500/25 text-[#FF3B30] transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* TAB 7: DEVELOPMENT PLANS COMPARISON (Split Screen Matching) */}
        {activeTab === 'plans' && (
          <div className="space-y-8 animate-fade-in text-left">
            <div className="space-y-2">
              <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-7 h-7 text-[#007AFF]" />
                Development Plans Audit Alignment
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Auditing current government budgets against direct citizen requests. AI highlights match alignments or alerts budget allocation conflict risks.
              </p>
            </div>

            <div className="grid gap-6">
              {devPlans.map((item) => (
                <div 
                  key={item.id} 
                  className={`glass-panel rounded-[32px] p-6 border-white/45 dark:border-white/5 bg-white/45 dark:bg-slate-900/30 space-y-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
                >
                  {/* Status Banner */}
                  <div className={`absolute top-0 right-0 px-6 py-1 text-[10px] font-extrabold uppercase tracking-widest ${
                    item.matchStatus === 'Match' 
                      ? 'bg-[#34C759]/20 text-[#34C759]' 
                      : 'bg-[#FF9F0A]/20 text-[#FF9F0A]'
                  }`}>
                    {item.matchStatus === 'Match' ? '✓ High Matching Harmony' : '⚠ Conflict Flagged'}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-extrabold text-[#007AFF] bg-blue-500/10 px-3 py-1 rounded-[12px]">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      District: {item.district}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Est. Budget: ₹{item.budgetLakhs} Lakhs
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">{item.title}</h3>

                  {/* Split Screen Columns */}
                  <div className="grid md:grid-cols-2 gap-6 border-t border-b border-slate-200/60 dark:border-white/5 py-6">
                    {/* Citizen demand */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-500">
                        <Users className="w-4 h-4" />
                        Citizen Feedback Demands
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-100/50 dark:bg-slate-950/40 p-4 rounded-[20px] border">
                        "{item.citizenDemand}"
                      </p>
                    </div>

                    {/* Government Plan */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Building className="w-4 h-4" />
                        Sanctioned Government Plan
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-100/50 dark:bg-slate-950/40 p-4 rounded-[20px] border">
                        "{item.governmentPlan}"
                      </p>
                    </div>
                  </div>

                  {/* Bottom: AI Audit recommendation */}
                  <div className={`p-4 rounded-[24px] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    item.matchStatus === 'Match' 
                      ? 'bg-green-500/5 dark:bg-green-500/10 border-green-500/20' 
                      : 'bg-orange-500/5 dark:bg-orange-500/10 border-orange-500/20'
                  }`}>
                    <div className="flex items-start gap-3">
                      <Sparkles className={`w-5 h-5 shrink-0 mt-0.5 ${item.matchStatus === 'Match' ? 'text-[#34C759]' : 'text-[#FF9F0A]'}`} />
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide block">AI Strategic Audit Recommendation:</span>
                        <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold leading-relaxed">
                          "{item.aiRecommendation}"
                        </p>
                      </div>
                    </div>

                    {item.matchStatus === 'Conflict' && (
                      <button 
                        onClick={() => handleApprovePlan(item.id)}
                        className="px-5 py-2.5 rounded-[14px] bg-[#007AFF] text-white text-xs font-bold transition-all shrink-0 hover:opacity-90 self-end sm:self-center shadow-md shadow-blue-500/10"
                      >
                        Override & Align With Citizens
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* TAB 8: EXPORT REPORTS PAGE */}
        {activeTab === 'reports' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in text-left">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-[16px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mx-auto mb-3">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">Export & Download MP Briefings</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Generate high-resolution executive PDF briefing files or Excel sheets formatted ready for ministerial reviews.
              </p>
            </div>

            {/* Premium Document Preview Card */}
            <div className="glass-panel rounded-[32px] p-6 md:p-8 border-white/50 dark:border-white/5 bg-white/40 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">JanVoice AI Executive Brief</h3>
                  <span className="text-[10px] text-slate-400 block font-medium">Session: July 2026 District Priority Index</span>
                </div>
                <span className="text-xs font-bold text-[#007AFF] bg-blue-500/10 px-3 py-1 rounded-full">Draft Compiled</span>
              </div>

              {/* Mock AI Bullet Summaries */}
              <div className="space-y-4">
                <div className="flex items-start gap-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  <Sparkles className="w-4 h-4 text-[#AF52DE] shrink-0 mt-0.5" />
                  <p>
                    <strong>Consolidated Drinking Water lines</strong> listed as the highest need score (94.6% urgency) across 14 rural block segments in Pune. High-risk threat identified pre-monsoon.
                  </p>
                </div>
                <div className="flex items-start gap-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  <Sparkles className="w-4 h-4 text-[#AF52DE] shrink-0 mt-0.5" />
                  <p>
                    <strong>High School Female Toilet Sanitation gap</strong> flagged at Barasat (West Bengal) with immediate need score of 96%. Recommended budget deployment: ₹12 Lakhs.
                  </p>
                </div>
                <div className="flex items-start gap-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  <Sparkles className="w-4 h-4 text-[#AF52DE] shrink-0 mt-0.5" />
                  <p>
                    <strong>Overlapping Plan Audits</strong> detected total government-plan mismatch rate of 42%, primarily due to heavy tanker supply preference instead of permanent pipeline infrastructure works.
                  </p>
                </div>
              </div>

              {/* Status statistics indicator preview */}
              <div className="grid grid-cols-3 gap-4 py-4 px-5 rounded-[22px] bg-slate-100/50 dark:bg-slate-950/40 border">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block">Complaints</span>
                  <span className="text-lg font-extrabold text-[#007AFF]">8,432</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block">Approved Projects</span>
                  <span className="text-lg font-extrabold text-[#34C759]">124</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block">Funds Optimised</span>
                  <span className="text-lg font-extrabold text-[#FF9F0A]">₹4.2 Cr</span>
                </div>
              </div>

              {/* Download Buttons Group */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-500 block">Select Format to Download:</span>
                
                <div className="grid sm:grid-cols-3 gap-3">
                  <button 
                    onClick={() => alert('Compiling high-resolution PDF with layout maps... Your download will begin in 2 seconds.')}
                    className="p-4 rounded-[20px] bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/25 border border-white/45 dark:border-white/10 text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-5 h-5 text-red-500" />
                    <span>Download PDF Report</span>
                  </button>

                  <button 
                    onClick={() => alert('Formating comprehensive XLS tables... Your download will begin in 2 seconds.')}
                    className="p-4 rounded-[20px] bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/25 border border-white/45 dark:border-white/10 text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-5 h-5 text-green-500" />
                    <span>Download Excel Sheet</span>
                  </button>

                  <button 
                    onClick={() => alert('Assembling presentation PPT slides... Your download will begin in 2 seconds.')}
                    className="p-4 rounded-[20px] bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/25 border border-white/45 dark:border-white/10 text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-5 h-5 text-amber-500" />
                    <span>Download PowerPoint Slides</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer Branding Area */}
      <footer className="w-full text-center py-12 border-t border-slate-200/60 dark:border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-display font-semibold text-sm text-slate-700 dark:text-slate-300">JanVoice AI</p>
          <p className="text-xs text-slate-400">"Turning Every Citizen Voice Into Action."</p>
          <p className="text-[10px] text-slate-400 mt-4">Designed to meet the absolute highest standards of Apple iOS 26 Human Interface guidelines.</p>
        </div>
      </footer>

    </div>
  );
}
