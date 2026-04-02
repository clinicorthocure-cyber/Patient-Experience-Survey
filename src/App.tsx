import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  BarChart3, 
  LayoutDashboard, 
  ClipboardList, 
  Globe, 
  LogOut,
  Star,
  Loader2,
  AlertCircle,
  Settings,
  Save,
  Key,
  ChartPie
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { cn } from './lib/utils';
import { SURVEY_QUESTIONS, Language, Question, SurveyResponse, Branch } from './types';

const COLORS = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];
const LOGO_URL = "https://imgur.com/TOW5WAS.jpeg";

const BRANCHES: Branch[] = ['Orthocure Jumeirah Branch', 'Orthocure Mirdif Branch'];

const RATING_LABELS: Record<Language, string[]> = {
  ar: [
    'غير راضٍ تماماً',
    'غير راضٍ',
    'محايد',
    'راضٍ',
    'راضٍ تماماً'
  ],
  en: [
    'Very Dissatisfied',
    'Dissatisfied',
    'Neutral',
    'Satisfied',
    'Very Satisfied'
  ]
};

export default function App() {
  const [view, setView] = useState<'landing' | 'survey' | 'final' | 'dashboard' | 'login' | 'settings'>('landing');
  const [lang, setLang] = useState<Language>('en');
  const [branch, setBranch] = useState<Branch | ''>('');
  const [dept, setDept] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dashboardData, setDashboardData] = useState<SurveyResponse[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [password, setPassword] = useState('');
  const [remotePassword, setRemotePassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Dashboard Filters
  const [filterBranch, setFilterBranch] = useState<string>('All');
  const [filterDept, setFilterDept] = useState<string>('All');

  const isRtl = lang === 'ar';

  const DualText = ({ ar, en, className, centered = false }: { ar: string, en: string, className?: string, centered?: boolean }) => {
    const activeLang = lang;
    return (
      <div className={cn("flex flex-col gap-1", centered ? "items-center text-center" : (isRtl ? "items-start text-right" : "items-start text-left"), className)}>
        <span className={cn(
          "transition-all duration-300 leading-tight",
          activeLang === 'ar' ? "text-slate-900 font-bold text-lg sm:text-xl opacity-100" : "text-slate-400 font-medium text-sm sm:text-base opacity-70 order-2"
        )}>
          {ar}
        </span>
        <span className={cn(
          "transition-all duration-300 leading-tight",
          activeLang === 'en' ? "text-slate-900 font-bold text-lg sm:text-xl opacity-100" : "text-slate-400 font-medium text-sm sm:text-base opacity-70 order-2"
        )}>
          {en}
        </span>
      </div>
    );
  };

  const DualHeading = ({ ar, en, className }: { ar: string, en: string, className?: string }) => {
    const activeLang = lang;
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <h2 className={cn(
          "transition-all duration-500 leading-tight tracking-tight",
          activeLang === 'ar' ? "text-blue-900 font-black text-4xl sm:text-5xl opacity-100 scale-100" : "text-slate-300 font-bold text-2xl sm:text-3xl opacity-50 scale-95 order-2"
        )}>
          {ar}
        </h2>
        <h2 className={cn(
          "transition-all duration-500 leading-tight tracking-tight",
          activeLang === 'en' ? "text-blue-900 font-black text-4xl sm:text-5xl opacity-100 scale-100" : "text-slate-300 font-bold text-2xl sm:text-3xl opacity-50 scale-95 order-2"
        )}>
          {en}
        </h2>
      </div>
    );
  };

  const questions = dept ? SURVEY_QUESTIONS[dept] : [];
  const totalSteps = questions.length + 1; // +1 for the final form
  const progress = ((currentStep) / totalSteps) * 100;

  const scriptUrl = (import.meta as any).env.VITE_GOOGLE_SCRIPT_URL;

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    if (!scriptUrl) return;
    try {
      const response = await fetch(`${scriptUrl}?type=config`);
      const config = await response.json();
      if (config.password) {
        setRemotePassword(config.password);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    }
  };

  const handleStartSurvey = (selectedDept: string) => {
    setDept(selectedDept);
    setView('survey');
    setCurrentStep(0);
    setResponses({});
    setComment('');
    setUserName('');
    setUserPhone('');
  };

  const handleReset = () => {
    setView('landing');
    setBranch('');
    setDept('');
    setCurrentStep(0);
    setResponses({});
    setComment('');
    setUserName('');
    setUserPhone('');
    setIsSubmitted(false);
  };

  const handleNext = (value: any) => {
    const currentQuestion = questions[currentStep];
    const newResponses = { ...responses, [currentQuestion.id]: value };
    setResponses(newResponses);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setView('final');
      setCurrentStep(questions.length);
    }
  };

  const submitSurvey = async () => {
    setIsSubmitting(true);
    
    // Explicitly ordered payload to match Sheet columns
    const payload = {
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'UTC' }),
      branch: branch,
      department: dept,
      language: lang,
      scheduling: responses.scheduling || 0,
      reception: responses.reception || 0,
      waiting: responses.waiting || 0,
      cleanliness: responses.cleanliness || 0,
      doctor_prof: responses.doctor_prof || 0,
      diagnosis_clarity: responses.diagnosis_clarity || 0,
      overall_exp: responses.overall_exp || 0,
      recommend: responses.recommend || 0,
      comment: comment || '',
      userName: userName || '',
      userPhone: userPhone || ''
    };
    
    if (!scriptUrl) {
      console.warn('Google Script URL not configured.');
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
      }, 1500);
      return;
    }

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission failed:', error);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true);
    if (!scriptUrl) {
      setDashboardData([]);
      setIsLoadingDashboard(false);
      return;
    }

    try {
      const response = await fetch(scriptUrl);
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = remotePassword || (import.meta as any).env.VITE_DASHBOARD_PASSWORD || 'admin';
    if (password === correctPassword) {
      setView('dashboard');
      fetchDashboardData();
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setIsUpdatingPassword(true);
    
    try {
      // Using query parameters for better compatibility with GAS no-cors POST
      await fetch(`${scriptUrl}?type=updatePassword&newPassword=${encodeURIComponent(newPassword)}`, {
        method: 'POST',
        mode: 'no-cors'
      });
      
      setRemotePassword(newPassword);
      setNewPassword('');
      alert(isRtl ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully');
      setView('dashboard');
    } catch (error) {
      console.error('Failed to update password:', error);
      alert(isRtl ? 'فشل تحديث كلمة المرور' : 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Dashboard Stats Calculations
  const filteredData = dashboardData.filter(item => {
    const branchMatch = filterBranch === 'All' || item.branch === filterBranch;
    const deptMatch = filterDept === 'All' || item.department === filterDept;
    return branchMatch && deptMatch;
  });

  const totalResponses = filteredData.length;
  
  const deptStats = filteredData.reduce((acc: any, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + 1;
    return acc;
  }, {});
  
  const pieData = Object.entries(deptStats).map(([name, value]) => ({ name, value }));

  const langStats = filteredData.reduce((acc: any, curr) => {
    acc[curr.language] = (acc[curr.language] || 0) + 1;
    return acc;
  }, {});
  const langPieData = Object.entries(langStats).map(([name, value]) => ({ 
    name: name === 'ar' ? (isRtl ? 'عربي' : 'Arabic') : (isRtl ? 'إنجليزي' : 'English'), 
    value 
  }));

  const calculateAvg = (key: string) => {
    if (totalResponses === 0) return "0.0";
    const sum = filteredData.reduce((acc, curr: any) => {
      const val = parseInt(curr[key]);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    return (sum / totalResponses).toFixed(1);
  };

  const avgCleanliness = calculateAvg('cleanliness');
  const avgReception = calculateAvg('reception');
  const avgDoctorProf = calculateAvg('doctor_prof');

  // Calculate satisfaction percentage (based on rating questions - now out of 5)
  const satisfactionRate = totalResponses > 0 
    ? Math.round((parseFloat(avgCleanliness) + parseFloat(avgReception) + parseFloat(avgDoctorProf)) / 15 * 100)
    : 0;

  const deptPerformance = Object.keys(SURVEY_QUESTIONS).map(d => {
    const deptData = filteredData.filter(item => item.department === d);
    if (deptData.length === 0) return { name: d, score: 0 };
    const sum = deptData.reduce((acc, curr: any) => {
      const c = parseInt(curr.cleanliness) || 0;
      const r = parseInt(curr.reception) || 0;
      const p = parseInt(curr.doctor_prof) || 0;
      return acc + (c + r + p) / 3;
    }, 0);
    return { 
      name: isRtl ? (
        d === 'Physiotherapy' ? 'علاج طبيعي' : 
        d === 'MRI Scan' ? 'أشعة رنين' : 
        d === 'Kinesiology & Rehabilitation' ? 'تأهيل حركي' :
        'كشف طبيب'
      ) : d, 
      score: parseFloat((sum / deptData.length).toFixed(1)) 
    };
  });

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-slate-100"
        >
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
            <CheckCircle2 size={56} />
          </div>
          
          <div className="mb-10">
            <DualText 
              ar="شكراً لك!" 
              en="Thank You!" 
              centered
              className="text-3xl"
            />
          </div>

          <div className="mb-12">
            <DualText 
              ar="تم تسجيل تقييمك بنجاح. نتمنى لك الشفاء العاجل." 
              en="Your feedback has been recorded. We wish you a speedy recovery." 
              centered
              className="text-slate-500"
            />
          </div>

          <button 
            onClick={() => { setIsSubmitted(false); setView('landing'); }}
            className="w-full bg-blue-700 text-white py-5 rounded-3xl font-black text-lg hover:bg-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0"
          >
            {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-slate-50 font-sans text-slate-900", isRtl ? "font-tajawal" : "font-inter")} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img 
            src={LOGO_URL} 
            alt="Orthocure Logo" 
            className="h-10 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-xl font-extrabold tracking-tight text-blue-900 hidden sm:block">
            ORTHOCURE
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 group"
          >
            <Globe size={18} className="text-blue-600 group-hover:rotate-12 transition-transform" />
            <div className="flex flex-col items-start leading-none">
              <span className={cn("text-xs font-bold", lang === 'ar' ? "text-blue-700" : "text-slate-400")}>العربية</span>
              <span className={cn("text-xs font-bold", lang === 'en' ? "text-blue-700" : "text-slate-400")}>English</span>
            </div>
          </button>
          
          {view === 'landing' && (
            <button 
              onClick={() => setView('login')}
              className="p-2 text-slate-500 hover:text-blue-700 transition"
              title="Dashboard"
            >
              <LayoutDashboard size={24} />
            </button>
          )}
          
          {(view === 'dashboard' || view === 'settings') && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setView(view === 'settings' ? 'dashboard' : 'settings')}
                className="p-2 text-slate-500 hover:text-blue-700 transition"
              >
                <Settings size={24} />
              </button>
              <button 
                onClick={() => setView('landing')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition text-sm font-medium"
              >
                <LogOut size={16} />
                {isRtl ? 'خروج' : 'Logout'}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 pt-12">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center flex flex-col items-center"
            >
              {!branch ? (
                <>
                  <DualHeading 
                    ar="استبيان رضا المرضى" 
                    en="Patient Satisfaction Survey" 
                    className="mb-8"
                  />
                  <div className="mb-14 max-w-2xl">
                    <DualText 
                      ar="نشكرك على اختيار مركز أورثوكيور الطبي. ملاحظاتك تمكننا من التحسين المستمر وتقديم أعلى معايير الرعاية الطبية." 
                      en="Thank you for choosing Orthocure Medical Center. Your feedback enables us to continuously enhance and deliver the highest standard of medical care." 
                      centered
                      className="text-slate-500"
                    />
                  </div>
                  <div className="mb-8">
                    <DualText 
                      ar="اختر الفرع" 
                      en="Select Branch" 
                      centered
                      className="text-blue-600 font-black uppercase tracking-widest text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl">
                    {BRANCHES.map((b) => (
                      <button
                        key={b}
                        onClick={() => setBranch(b)}
                        className="group bg-white p-10 rounded-[2.5rem] border-2 border-transparent hover:border-blue-500 shadow-sm hover:shadow-2xl transition-all duration-500 text-center flex flex-col items-center relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-700" />
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner relative z-10">
                          <ClipboardList size={40} />
                        </div>
                        <DualText 
                          ar={b === 'Orthocure Jumeirah Branch' ? 'فرع جميرا' : 'فرع مردف'} 
                          en={b} 
                          centered
                        />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    <button 
                      onClick={() => setBranch('')}
                      className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <DualHeading 
                      ar="استبيان رضا المرضى" 
                      en="Patient Satisfaction Survey" 
                    />
                  </div>
                  
                  <div className="mb-10">
                    <div className="inline-block px-6 py-2 bg-blue-50 rounded-full border border-blue-100 mb-6">
                      <DualText 
                        ar={branch === 'Orthocure Jumeirah Branch' ? 'فرع جميرا' : 'فرع مردف'} 
                        en={branch} 
                        centered
                        className="text-blue-700"
                      />
                    </div>
                    <DualText 
                      ar="نشكرك على اختيار مركز أورثوكيور الطبي. ملاحظاتك تمكننا من التحسين المستمر وتقديم أعلى معايير الرعاية الطبية." 
                      en="Thank you for choosing Orthocure Medical Center. Your feedback enables us to continuously enhance and deliver the highest standard of medical care." 
                      centered
                      className="text-slate-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {Object.keys(SURVEY_QUESTIONS)
                      .filter(name => {
                        if (branch === 'Orthocure Jumeirah Branch' && name === 'MRI Scan') return false;
                        if (branch === 'Orthocure Mirdif Branch' && name === 'Kinesiology & Rehabilitation') return false;
                        return true;
                      })
                      .map((name) => (
                        <button
                          key={name}
                          onClick={() => handleStartSurvey(name)}
                          className="group bg-white p-8 rounded-[2.5rem] border-2 border-transparent hover:border-blue-500 shadow-sm hover:shadow-2xl transition-all duration-500 text-center flex flex-col items-center relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-700" />
                          
                          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner relative z-10">
                            <Star size={40} />
                          </div>
                          
                          <div className="relative z-10 mb-6">
                            <DualText 
                              ar={
                                name === 'Physiotherapy' ? 'علاج طبيعي' : 
                                name === 'MRI Scan' ? 'أشعة رنين' : 
                                name === 'Kinesiology & Rehabilitation' ? 'تأهيل حركي' :
                                'كشف طبيب'
                              } 
                              en={name} 
                              centered
                            />
                          </div>

                          <div className="mt-auto text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center gap-0.5 relative z-10">
                            <div className="flex items-center gap-1 font-black text-[10px] uppercase tracking-widest">
                              <span>{lang === 'ar' ? 'ابدأ الآن' : 'Start Now'}</span>
                              {lang === 'ar' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                            </div>
                          </div>
                        </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {view === 'survey' && (
            <motion.div 
              key="survey"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              {/* Progress Bar */}
              <div className="mb-12">
                <div className="flex justify-between mb-3">
                  <div className="flex flex-col">
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", lang === 'ar' ? "text-slate-600" : "text-slate-300")}>التقدم</span>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", lang === 'en' ? "text-slate-600" : "text-slate-300")}>Progress</span>
                  </div>
                  <span className="text-sm font-black text-blue-600">{Math.round(progress)}%</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
                <div className="inline-flex flex-col bg-blue-50 px-5 py-2 rounded-2xl mb-8">
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", lang === 'ar' ? "text-blue-700" : "text-blue-300")}>
                    سؤال {currentStep + 1} / {questions.length}
                  </span>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", lang === 'en' ? "text-blue-700" : "text-blue-300")}>
                    Question {currentStep + 1} / {questions.length}
                  </span>
                </div>
                
                <h3 className="mb-10">
                  <DualText 
                    ar={questions[currentStep].text.ar} 
                    en={questions[currentStep].text.en} 
                  />
                </h3>

                <div className="space-y-4">
                  {questions[currentStep].type === 'choice' && questions[currentStep].options?.ar.map((optAr, idx) => {
                    const optEn = questions[currentStep].options?.en[idx] || '';
                    return (
                      <button
                        key={idx}
                        onClick={() => handleNext(lang === 'ar' ? optAr : optEn)}
                        className="w-full p-6 text-start rounded-3xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 flex justify-between items-center group shadow-sm hover:shadow-md"
                      >
                        <DualText ar={optAr} en={optEn} />
                        <div className="w-8 h-8 rounded-full border-2 border-slate-200 group-hover:border-blue-500 flex items-center justify-center transition-colors">
                          <div className="w-4 h-4 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100" />
                        </div>
                      </button>
                    );
                  })}

                  {questions[currentStep].type === 'rating' && (
                    <div className="space-y-10">
                      <div className="grid grid-cols-5 gap-2 sm:gap-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleNext(star)}
                            className="flex-1 aspect-square rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center justify-center transition-all duration-300 group relative shadow-sm hover:shadow-md"
                          >
                            <Star 
                              size={32} 
                              className="text-slate-200 group-hover:text-yellow-400 group-hover:fill-yellow-400 transition-all duration-300" 
                            />
                            <span className="mt-2 text-xs font-black text-slate-400 group-hover:text-blue-900">{star}</span>
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {RATING_LABELS.ar.map((labelAr, idx) => {
                          const labelEn = RATING_LABELS.en[idx];
                          return (
                            <div key={idx} className="flex flex-col items-center text-center gap-1">
                              <span className={cn(
                                "text-[9px] sm:text-[11px] font-bold leading-tight transition-all duration-300",
                                lang === 'ar' ? "text-slate-600 opacity-100" : "text-slate-300 opacity-60 order-2"
                              )}>
                                {labelAr}
                              </span>
                              <span className={cn(
                                "text-[9px] sm:text-[11px] font-bold leading-tight transition-all duration-300",
                                lang === 'en' ? "text-slate-600 opacity-100" : "text-slate-300 opacity-60 order-2"
                              )}>
                                {labelEn}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
                  <button 
                    onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : setView('landing')}
                    className="text-slate-400 hover:text-blue-600 font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all duration-300"
                  >
                    {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    <div className="flex flex-col items-start leading-none">
                      <span className={cn(lang === 'ar' ? "text-blue-600" : "text-slate-300")}>السابق</span>
                      <span className={cn(lang === 'en' ? "text-blue-600" : "text-slate-300")}>Previous</span>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'final' && (
            <motion.div 
              key="final"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
                <div className="mb-10">
                  <DualText 
                    ar="هل تود إضافة أي ملاحظات أخرى؟" 
                    en="Would you like to add any other feedback?" 
                  />
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="mb-3">
                      <DualText 
                        ar="التعليق أو الرأي" 
                        en="Comment or Opinion" 
                        className="uppercase tracking-widest text-[10px] sm:text-xs font-black text-slate-400"
                      />
                    </div>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={lang === 'ar' ? 'اكتب تعليقك هنا...' : 'Write your comment here...'}
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 h-32 resize-none shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-3">
                        <DualText 
                          ar="الاسم (اختياري)" 
                          en="Name (Optional)" 
                          className="uppercase tracking-widest text-[10px] sm:text-xs font-black text-slate-400"
                        />
                      </div>
                      <input 
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-inner"
                      />
                    </div>
                    <div>
                      <div className="mb-3">
                        <DualText 
                          ar="رقم الهاتف (اختياري)" 
                          en="Phone (Optional)" 
                          className="uppercase tracking-widest text-[10px] sm:text-xs font-black text-slate-400"
                        />
                      </div>
                      <input 
                        type="tel"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        placeholder={lang === 'ar' ? 'رقم الجوال' : 'Phone Number'}
                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <button 
                    onClick={() => { setView('survey'); setCurrentStep(questions.length - 1); }}
                    className="text-slate-400 hover:text-blue-600 font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all duration-300 order-2 sm:order-1"
                  >
                    {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    <span>{lang === 'ar' ? 'السابق' : 'Previous'}</span>
                  </button>

                  <button 
                    onClick={submitSurvey}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-blue-700 text-white px-12 py-5 rounded-3xl font-black text-lg hover:bg-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 order-1 sm:order-2 transform hover:-translate-y-1 active:translate-y-0"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                    <span>{lang === 'ar' ? 'إرسال التقييم' : 'Submit Survey'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'login' && (
            <motion.div 
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-xl border border-slate-100"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LayoutDashboard size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {isRtl ? 'لوحة التحكم' : 'Dashboard Login'}
                </h2>
                <p className="text-slate-500 mt-2">
                  {isRtl ? 'أدخل كلمة المرور للوصول للإحصائيات' : 'Enter password to access analytics'}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRtl ? 'كلمة المرور' : 'Password'}
                    className={cn(
                      "w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition",
                      loginError ? "border-red-500" : "border-slate-200"
                    )}
                  />
                  {loginError && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {isRtl ? 'كلمة المرور غير صحيحة' : 'Incorrect password'}
                    </p>
                  )}
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-800 transition shadow-lg"
                >
                  {isRtl ? 'دخول' : 'Login'}
                </button>
                <button 
                  type="button"
                  onClick={() => setView('landing')}
                  className="w-full text-slate-500 font-bold hover:text-slate-700 transition"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
              </form>
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8 pb-20"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-blue-900">
                    {isRtl ? 'لوحة التحكم الذكية' : 'Smart Dashboard'}
                  </h2>
                  <p className="text-slate-500 text-lg">
                    {isRtl ? 'مؤشرات الأداء الفورية والتحليلات المتقدمة' : 'Real-time performance indicators & advanced analytics'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  <select 
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                    className="px-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">{isRtl ? 'جميع الفروع' : 'All Branches'}</option>
                    {BRANCHES.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <select 
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="px-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">{isRtl ? 'جميع الأقسام' : 'All Departments'}</option>
                    {Object.keys(SURVEY_QUESTIONS).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <button 
                    onClick={fetchDashboardData}
                    disabled={isLoadingDashboard}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-200"
                  >
                    {isLoadingDashboard ? <Loader2 className="animate-spin" size={18} /> : <BarChart3 size={18} />}
                    {isRtl ? 'تحديث' : 'Refresh'}
                  </button>
                </div>
              </div>

              {/* Main Stats Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                      <ClipboardList size={20} />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      {isRtl ? 'إجمالي الردود' : 'Total Responses'}
                    </p>
                  </div>
                  <p className="text-4xl font-black text-blue-900 mt-2">{totalResponses}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                      <CheckCircle2 size={20} />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      {isRtl ? 'معدل الرضا' : 'Satisfaction Rate'}
                    </p>
                  </div>
                  <div className="flex items-end gap-2 mt-2">
                    <p className="text-4xl font-black text-emerald-600">{satisfactionRate}%</p>
                    <span className="text-emerald-500 text-sm font-bold mb-1">↑ 4%</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                      <Star size={20} />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      {isRtl ? 'متوسط النظافة' : 'Avg Cleanliness'}
                    </p>
                  </div>
                  <p className="text-4xl font-black text-slate-800 mt-2">{avgCleanliness}<span className="text-lg text-slate-300">/5</span></p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                      <Globe size={20} />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      {isRtl ? 'اللغة المفضلة' : 'Top Language'}
                    </p>
                  </div>
                  <p className="text-2xl font-black text-slate-800 mt-2">
                    {langStats['ar'] >= (langStats['en'] || 0) ? (isRtl ? 'العربية' : 'Arabic') : (isRtl ? 'الإنجليزية' : 'English')}
                  </p>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Department Performance Bar Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                    <BarChart3 size={20} className="text-blue-600" />
                    {isRtl ? 'أداء الأقسام (متوسط التقييم)' : 'Department Performance (Avg Rating)'}
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deptPerformance} layout="vertical" margin={{ left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" domain={[0, 5]} hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }}
                          width={100}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="score" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Responses Distribution Pie Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                    <ChartPie size={20} className="text-blue-600" />
                    {isRtl ? 'توزيع المراجعين حسب القسم' : 'Patient Distribution by Dept'}
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {pieData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-xs font-bold text-slate-500">
                          {isRtl ? (
                            entry.name === 'Physiotherapy' ? 'علاج طبيعي' : 
                            entry.name === 'MRI Scan' ? 'أشعة رنين' : 
                            entry.name === 'Kinesiology & Rehabilitation' ? 'تأهيل حركي' :
                            'كشف طبيب'
                          ) : entry.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Averages */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 lg:col-span-2">
                  <h3 className="text-xl font-bold text-slate-800 mb-8">
                    {isRtl ? 'تحليل معايير الخدمة' : 'Service Standards Analysis'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { label: isRtl ? 'الاستقبال' : 'Reception', val: avgReception, color: 'bg-blue-500' },
                      { label: isRtl ? 'النظافة' : 'Cleanliness', val: avgCleanliness, color: 'bg-emerald-500' },
                      { label: isRtl ? 'الاحترافية' : 'Professionalism', val: avgDoctorProf, color: 'bg-purple-500' },
                    ].map((item) => (
                      <div key={item.label} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="font-bold text-slate-700">{item.label}</span>
                          <span className="text-2xl font-black text-slate-900">{item.val}<span className="text-sm text-slate-300">/5</span></span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(parseFloat(item.val) / 5) * 100}%` }}
                            className={cn("h-full rounded-full", item.color)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-xl border border-slate-100"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Key size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {isRtl ? 'إعدادات النظام' : 'System Settings'}
                </h2>
                <p className="text-slate-500 mt-2">
                  {isRtl ? 'تغيير كلمة مرور لوحة التحكم' : 'Change dashboard password'}
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase">
                    {isRtl ? 'كلمة المرور الجديدة' : 'New Password'}
                  </label>
                  <input 
                    type="text" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={isRtl ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-800 transition shadow-lg flex items-center justify-center gap-2"
                >
                  {isUpdatingPassword ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {isRtl ? 'حفظ التغييرات' : 'Save Changes'}
                </button>
                <button 
                  type="button"
                  onClick={() => setView('dashboard')}
                  className="w-full text-slate-500 font-bold hover:text-slate-700 transition"
                >
                  {isRtl ? 'رجوع' : 'Back'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-sm font-medium">
          © 2026 Orthocure Medical Center. {isRtl ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
        </p>
      </footer>
    </div>
  );
}
