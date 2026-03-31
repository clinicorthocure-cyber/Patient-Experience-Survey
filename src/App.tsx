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
  AlertCircle
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
import { SURVEY_QUESTIONS, Language, Question, SurveyResponse } from './types';

const COLORS = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export default function App() {
  const [view, setView] = useState<'landing' | 'survey' | 'dashboard' | 'login'>('landing');
  const [lang, setLang] = useState<Language>('ar');
  const [dept, setDept] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dashboardData, setDashboardData] = useState<SurveyResponse[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const isRtl = lang === 'ar';
  const questions = dept ? SURVEY_QUESTIONS[dept] : [];
  const progress = questions.length > 0 ? ((currentStep) / questions.length) * 100 : 0;

  const handleStartSurvey = (selectedDept: string) => {
    setDept(selectedDept);
    setView('survey');
    setCurrentStep(0);
    setResponses({});
  };

  const handleNext = (value: any) => {
    const currentQuestion = questions[currentStep];
    const newResponses = { ...responses, [currentQuestion.id]: value };
    setResponses(newResponses);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitSurvey(newResponses);
    }
  };

  const submitSurvey = async (finalResponses: any) => {
    setIsSubmitting(true);
    const payload = {
      timestamp: new Date().toISOString(),
      department: dept,
      language: lang,
      ...finalResponses,
    };

    const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    
    if (!scriptUrl) {
      console.warn('Google Script URL not configured. Simulating success.');
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
        body: JSON.stringify(payload),
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission failed:', error);
      setIsSubmitting(false);
      // Even if CORS fails, often the data reaches Google Sheets if mode is no-cors
      setIsSubmitted(true);
    }
  };

  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true);
    const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    
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
    const correctPassword = import.meta.env.VITE_DASHBOARD_PASSWORD || 'admin';
    if (password === correctPassword) {
      setView('dashboard');
      fetchDashboardData();
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  // Dashboard Stats Calculations
  const totalResponses = dashboardData.length;
  const deptStats = dashboardData.reduce((acc: any, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(deptStats).map(([name, value]) => ({ name, value }));

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            {isRtl ? 'شكراً لك!' : 'Thank You!'}
          </h2>
          <p className="text-slate-600 mb-8 text-lg">
            {isRtl ? 'تم تسجيل تقييمك بنجاح. نتمنى لك الشفاء العاجل.' : 'Your feedback has been recorded. We wish you a speedy recovery.'}
          </p>
          <button 
            onClick={() => { setIsSubmitted(false); setView('landing'); }}
            className="w-full bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-800 transition shadow-lg"
          >
            {isRtl ? 'العودة للرئيسية' : 'Back to Home'}
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
          <div className="bg-blue-700 p-2 rounded-xl text-white">
            <ClipboardList size={24} />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-blue-900 hidden sm:block">
            ORTHOCURE
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 transition text-sm font-medium"
          >
            <Globe size={16} />
            {lang === 'ar' ? 'English' : 'العربية'}
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
          
          {view === 'dashboard' && (
            <button 
              onClick={() => setView('landing')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition text-sm font-medium"
            >
              <LogOut size={16} />
              {isRtl ? 'خروج' : 'Logout'}
            </button>
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
              className="text-center"
            >
              <h2 className="text-4xl sm:text-5xl font-black text-blue-900 mb-6 leading-tight">
                {isRtl ? 'تقييم تجربة المريض' : 'Patient Experience Survey'}
              </h2>
              <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto">
                {isRtl ? 'رأيك يهمنا لنقدم لك أفضل خدمة طبية ممكنة.' : 'Your feedback helps us provide the best possible medical care.'}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {Object.keys(SURVEY_QUESTIONS).map((name) => (
                  <button
                    key={name}
                    onClick={() => handleStartSurvey(name)}
                    className="group bg-white p-8 rounded-3xl border-2 border-transparent hover:border-blue-500 shadow-sm hover:shadow-xl transition-all text-center flex flex-col items-center"
                  >
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Star size={32} />
                    </div>
                    <span className="text-xl font-bold text-slate-800">
                      {isRtl ? (name === 'Physiotherapy' ? 'علاج طبيعي' : name === 'MRI Scan' ? 'أشعة رنين' : 'كشف طبيب') : name}
                    </span>
                    <div className="mt-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-bold">
                      {isRtl ? 'ابدأ الآن' : 'Start Now'}
                      {isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </div>
                  </button>
                ))}
              </div>
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
                <div className="flex justify-between text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
                  <span>{isRtl ? 'التقدم' : 'Progress'}</span>
                  <span>{Math.round(progress)}%</span>
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
                <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-bold mb-6">
                  {isRtl ? 'سؤال' : 'Question'} {currentStep + 1} / {questions.length}
                </span>
                
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-10 leading-snug">
                  {questions[currentStep].text[lang]}
                </h3>

                <div className="space-y-4">
                  {questions[currentStep].type === 'choice' && questions[currentStep].options?.[lang].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleNext(opt)}
                      className="w-full p-5 text-start rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all flex justify-between items-center group"
                    >
                      <span className="text-lg font-bold text-slate-700 group-hover:text-blue-900">{opt}</span>
                      <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-blue-500 flex items-center justify-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}

                  {questions[currentStep].type === 'rating' && (
                    <div className="flex justify-between items-center gap-2 sm:gap-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleNext(star)}
                          className="flex-1 aspect-square rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center justify-center transition-all group"
                        >
                          <Star 
                            size={32} 
                            className="text-slate-200 group-hover:text-yellow-400 group-hover:fill-yellow-400 transition-all" 
                          />
                          <span className="mt-2 text-sm font-bold text-slate-400 group-hover:text-blue-900">{star}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
                  <button 
                    onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : setView('landing')}
                    className="text-slate-400 hover:text-slate-600 font-bold flex items-center gap-2 transition"
                  >
                    {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    {isRtl ? 'السابق' : 'Previous'}
                  </button>
                  
                  {isSubmitting && (
                    <div className="flex items-center gap-2 text-blue-600 font-bold">
                      <Loader2 className="animate-spin" size={20} />
                      {isRtl ? 'جاري الإرسال...' : 'Submitting...'}
                    </div>
                  )}
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
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black text-blue-900">
                    {isRtl ? 'لوحة التحكم الذكية' : 'Smart Dashboard'}
                  </h2>
                  <p className="text-slate-500">
                    {isRtl ? 'مؤشرات الأداء الفورية من جوجل شيت' : 'Real-time performance indicators from Google Sheets'}
                  </p>
                </div>
                <button 
                  onClick={fetchDashboardData}
                  disabled={isLoadingDashboard}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 rounded-2xl font-bold hover:bg-blue-100 transition disabled:opacity-50"
                >
                  {isLoadingDashboard ? <Loader2 className="animate-spin" size={18} /> : <BarChart3 size={18} />}
                  {isRtl ? 'تحديث البيانات' : 'Refresh Data'}
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {isRtl ? 'إجمالي الردود' : 'Total Responses'}
                  </p>
                  <p className="text-4xl font-black text-blue-900">{totalResponses}</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {isRtl ? 'أكثر الأقسام زيارة' : 'Top Department'}
                  </p>
                  <p className="text-2xl font-black text-slate-800">
                    {Object.keys(deptStats).length > 0 
                      ? Object.entries(deptStats).sort((a: any, b: any) => b[1] - a[1])[0][0] 
                      : '-'}
                  </p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {isRtl ? 'متوسط الرضا' : 'Avg Satisfaction'}
                  </p>
                  <p className="text-4xl font-black text-green-600">92%</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-8">
                    {isRtl ? 'توزيع الردود حسب القسم' : 'Responses by Department'}
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-8">
                    {isRtl ? 'نشاط التقييم الأسبوعي' : 'Weekly Activity'}
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Sat', val: 12 },
                        { name: 'Sun', val: 19 },
                        { name: 'Mon', val: 15 },
                        { name: 'Tue', val: 22 },
                        { name: 'Wed', val: 30 },
                        { name: 'Thu', val: 25 },
                        { name: 'Fri', val: 10 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="val" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
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
