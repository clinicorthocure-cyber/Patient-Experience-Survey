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
    { id: 'scheduling', type: 'rating', text: { ar: 'سهولة وسرعة إجراءات حجز الموعد؟', en: 'Ease and speed of appointment booking?' } },
    { id: 'reception', type: 'rating', text: { ar: 'احترافية وتعاون موظفي الاستقبال عند وصولك؟', en: 'Reception staff professionalism and helpfulness?' } },
    { id: 'waiting', type: 'rating', text: { ar: 'مدى رضاك عن وقت الانتظار قبل الدخول للموعد؟', en: 'Satisfaction with waiting time before your appointment?' } },
    { id: 'cleanliness', type: 'rating', text: { ar: 'تقييمك لمستوى النظافة والتعقيم والراحة في العيادة؟', en: 'Clinic cleanliness, hygiene, and comfort levels?' } },
    { id: 'doctor_prof', type: 'rating', text: { ar: 'احترافية وكفاءة أخصائي العلاج الطبيعي؟', en: 'Physiotherapist professionalism and expertise?' } },
    { id: 'diagnosis_clarity', type: 'rating', text: { ar: 'وضوح شرح الخطة العلاجية والتمارين المنزلية؟', en: 'Clarity of treatment plan and home exercises?' } }
  ],
  'Doctor Consultation': [
    { id: 'scheduling', type: 'rating', text: { ar: 'سهولة وسرعة إجراءات حجز الموعد؟', en: 'Ease and speed of appointment booking?' } },
    { id: 'reception', type: 'rating', text: { ar: 'احترافية وتعاون موظفي الاستقبال عند وصولك؟', en: 'Reception staff professionalism and helpfulness?' } },
    { id: 'waiting', type: 'rating', text: { ar: 'مدى رضاك عن وقت الانتظار قبل الدخول للموعد؟', en: 'Satisfaction with waiting time before your appointment?' } },
    { id: 'cleanliness', type: 'rating', text: { ar: 'تقييمك لمستوى النظافة والتعقيم والراحة في العيادة؟', en: 'Clinic cleanliness, hygiene, and comfort levels?' } },
    { id: 'doctor_prof', type: 'rating', text: { ar: 'احترافية الطبيب واهتمامه أثناء الكشف؟', en: 'Doctor professionalism and attentiveness?' } },
    { id: 'diagnosis_clarity', type: 'rating', text: { ar: 'وضوح شرح التشخيص والخطة العلاجية المقترحة؟', en: 'Clarity of diagnosis and proposed treatment plan?' } }
  ],
  'MRI Scan': [
    { id: 'scheduling', type: 'rating', text: { ar: 'سهولة وسرعة إجراءات حجز موعد الأشعة؟', en: 'Ease and speed of MRI appointment booking?' } },
    { id: 'reception', type: 'rating', text: { ar: 'احترافية وتعاون موظفي الاستقبال عند وصولك؟', en: 'Reception staff professionalism and helpfulness?' } },
    { id: 'waiting', type: 'rating', text: { ar: 'مدى رضاك عن وقت الانتظار قبل إجراء الأشعة؟', en: 'Satisfaction with waiting time before the scan?' } },
    { id: 'cleanliness', type: 'rating', text: { ar: 'نظافة وتعقيم غرفة الأشعة والمرافق؟', en: 'Cleanliness and hygiene of the MRI facility?' } },
    { id: 'doctor_prof', type: 'rating', text: { ar: 'احترافية فني الأشعة ومدى اهتمامه براحتك؟', en: 'Technologist professionalism and care for your comfort?' } },
    { id: 'diagnosis_clarity', type: 'rating', text: { ar: 'وضوح التعليمات المعطاة لك قبل وأثناء الفحص؟', en: 'Clarity of instructions given before and during the scan?' } }
  ]
};
