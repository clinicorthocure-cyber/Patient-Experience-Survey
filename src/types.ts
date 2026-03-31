export type Language = 'ar' | 'en';

export interface Question {
  id: string;
  type: 'choice' | 'text' | 'rating';
  text: { ar: string; en: string };
  options?: { ar: string[]; en: string[] };
}

export interface SurveyResponse {
  timestamp: string;
  department: string;
  language: Language;
  [key: string]: string | number;
}

export const SURVEY_QUESTIONS: Record<string, Question[]> = {
  Physiotherapy: [
    {
      id: 'scheduling',
      type: 'choice',
      text: { ar: 'تقييم عملية حجز الموعد؟', en: 'Rate appointment scheduling process?' },
      options: { ar: ['سهل', 'مناسب', 'صعب'], en: ['Easy', 'Convenient', 'Difficult'] }
    },
    {
      id: 'reception',
      type: 'rating',
      text: { ar: 'احترافية موظفي الاستقبال؟', en: 'Reception staff professionalism?' }
    },
    {
      id: 'cleanliness',
      type: 'rating',
      text: { ar: 'نظافة وراحة العيادة؟', en: 'Cleanliness and comfort of clinic?' }
    },
    {
      id: 'waiting',
      type: 'choice',
      text: { ar: 'الرضا عن وقت الانتظار؟', en: 'Satisfaction with waiting time?' },
      options: { ar: ['راضٍ', 'محايد', 'غير راضٍ'], en: ['Satisfied', 'Neutral', 'Not Satisfied'] }
    },
    {
      id: 'professionalism',
      type: 'rating',
      text: { ar: 'احترافية أخصائي العلاج الطبيعي؟', en: 'Physiotherapist professionalism?' }
    },
    {
      id: 'clarity',
      type: 'choice',
      text: { ar: 'وضوح شرح الخطة التمارين؟', en: 'Clarity of treatment plan/exercises?' },
      options: { ar: ['واضح جداً', 'إلى حد ما', 'غير واضح'], en: ['Yes, very clearly', 'Somewhat clearly', 'Not clearly'] }
    }
  ],
  'Doctor Consultation': [
    {
      id: 'scheduling',
      type: 'choice',
      text: { ar: 'تقييم عملية حجز الموعد؟', en: 'Rate appointment scheduling process?' },
      options: { ar: ['سهل', 'مناسب', 'صعب'], en: ['Easy', 'Convenient', 'Difficult'] }
    },
    {
      id: 'reception',
      type: 'rating',
      text: { ar: 'احترافية موظفي الاستقبال؟', en: 'Reception staff professionalism?' }
    },
    {
      id: 'waiting',
      type: 'choice',
      text: { ar: 'الرضا عن وقت الانتظار؟', en: 'Satisfaction with waiting time?' },
      options: { ar: ['راضٍ', 'محايد', 'غير راضٍ'], en: ['Satisfied', 'Neutral', 'Not Satisfied'] }
    },
    {
      id: 'doctor_prof',
      type: 'rating',
      text: { ar: 'احترافية الطبيب؟', en: 'Doctor professionalism?' }
    },
    {
      id: 'diagnosis_clarity',
      type: 'choice',
      text: { ar: 'وضوح شرح التشخيص والخطة؟', en: 'Clarity of diagnosis and plan?' },
      options: { ar: ['واضح جداً', 'إلى حد ما', 'غير واضح'], en: ['Yes, very clearly', 'Somewhat clearly', 'Not clearly'] }
    }
  ],
  'MRI Scan': [
    {
      id: 'scheduling',
      type: 'choice',
      text: { ar: 'تقييم حجز موعد الأشعة؟', en: 'Rate MRI scheduling process?' },
      options: { ar: ['سهل', 'مناسب', 'صعب'], en: ['Easy', 'Convenient', 'Difficult'] }
    },
    {
      id: 'facility',
      type: 'rating',
      text: { ar: 'نظافة مرفق الأشعة؟', en: 'Cleanliness of MRI facility?' }
    },
    {
      id: 'tech_prof',
      type: 'rating',
      text: { ar: 'احترافية فني الأشعة؟', en: 'Technologist professionalism?' }
    },
    {
      id: 'comfort',
      type: 'rating',
      text: { ar: 'مدى الراحة أثناء الفحص؟', en: 'Comfort level during scan?' }
    }
  ]
};
