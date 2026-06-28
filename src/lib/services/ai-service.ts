import type {
  AIAssessment,
  FetalGrowthForecast,
  RiskLevel,
  MultiplePregnancyAssessment,
  IndividualFetusScore,
  BabyAIAssessment,
  HealthMetric,
  WeightEntry,
  BloodPressureEntry,
  BloodSugarEntry,
  JaundiceAssessment,
  JaundiceRisk,
  VoiceTriageAssessment,
  TriageSymptom,
  CryAnalysisResult,
  CryType,
  MultiBabyAlert,
  FeedingEntry,
  BabyProfile,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const pretermRiskFactors = [
  'Maternal age > 35',
  'Previous preterm birth',
  'Multiple pregnancy',
  'Short cervical length',
  'Infection',
  'Chronic hypertension',
  'Diabetes',
  'Smoking',
  'Stress',
  'Low BMI',
];

const nutritionalTips = [
  'Increase folate intake through leafy greens and fortified cereals',
  'Consume adequate iron-rich foods like lean meat and spinach',
  'Include calcium-rich dairy or fortified alternatives',
  'Stay hydrated with 8-10 glasses of water daily',
  'Take prescribed prenatal vitamins consistently',
  'Include omega-3 fatty acids from fish or supplements',
  'Eat small frequent meals to manage nausea',
  'Limit caffeine intake to 200mg per day',
  'Include protein with every meal',
  'Eat fiber-rich foods to prevent constipation',
];

const dailyInsights = [
  'Your baby is developing rapidly this week',
  'Stay active with gentle prenatal exercise',
  'Monitor your blood pressure regularly',
  'Practice relaxation techniques for stress management',
  'Ensure adequate rest and sleep',
  'Track fetal movements daily',
  'Maintain a balanced diet rich in nutrients',
  'Stay connected with your healthcare provider',
];

const recommendations = [
  'Schedule regular prenatal checkups',
  'Monitor blood pressure daily',
  'Track fetal movements',
  'Maintain healthy diet',
  'Take prescribed supplements',
  'Stay hydrated',
  'Get adequate rest',
  'Practice prenatal exercises',
  'Attend childbirth classes',
  'Prepare hospital bag by week 36',
];

export function assessPretermRisk(
  age: number,
  pregnancyType: string,
  previousPreterm: boolean,
  bpSystolic: number,
  bloodSugar: number
): { risk: RiskLevel; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  if (age > 35) { score += 15; factors.push('Maternal age > 35'); }
  if (age > 40) { score += 10; }
  if (pregnancyType !== 'single') { score += 20; factors.push('Multiple pregnancy'); }
  if (previousPreterm) { score += 25; factors.push('Previous preterm birth'); }
  if (bpSystolic > 140) { score += 15; factors.push('Chronic hypertension'); }
  if (bloodSugar > 140) { score += 10; factors.push('Elevated blood sugar'); }

  let risk: RiskLevel = 'low';
  if (score >= 50) risk = 'high';
  else if (score >= 25) risk = 'moderate';

  return { risk, factors };
}

export function generatePregnancyAssessment(params: {
  motherId: string;
  age: number;
  pregnancyType: string;
  gestationalWeek: number;
  recentMetrics: HealthMetric[];
  weightEntries: WeightEntry[];
  bpEntries: BloodPressureEntry[];
  sugarEntries: BloodSugarEntry[];
  previousPreterm: boolean;
  fetusesCount: number;
}): AIAssessment {
  const latestBP = params.bpEntries[params.bpEntries.length - 1];
  const latestSugar = params.sugarEntries[params.sugarEntries.length - 1];
  const latestWeight = params.weightEntries[params.weightEntries.length - 1];

  const systolic = latestBP?.systolic || 120;
  const diastolic = latestBP?.diastolic || 80;
  const bloodSugar = latestSugar?.level || 100;
  const weight = latestWeight?.weight || 60;

  const { risk: pretermRisk, factors } = assessPretermRisk(
    params.age, params.pregnancyType, params.previousPreterm, systolic, bloodSugar
  );

  const healthScore = Math.max(0, Math.min(100,
    100
    - (pretermRisk === 'high' ? 25 : pretermRisk === 'moderate' ? 10 : 0)
    - (systolic > 140 ? 15 : systolic > 130 ? 8 : 0)
    - (bloodSugar > 140 ? 15 : bloodSugar > 120 ? 8 : 0)
    - (params.age > 40 ? 10 : params.age > 35 ? 5 : 0)
  ));

  const fetalGrowthForecasts: FetalGrowthForecast[] = [];
  for (let i = 0; i < params.fetusesCount; i++) {
    const baseWeight = params.pregnancyType === 'single' ? 3000
      : params.pregnancyType === 'twin' ? 2500 : 2000;
    const currentWeight = baseWeight * (params.gestationalWeek / 40);
    const projectedWeight = baseWeight * (Math.min(40, params.gestationalWeek + 4) / 40);
    const growthRate = ((projectedWeight - currentWeight) / currentWeight) * 100;

    fetalGrowthForecasts.push({
      fetusId: uuidv4(),
      label: `Fetus ${i + 1}`,
      currentWeight: Math.round(currentWeight),
      projectedWeight: Math.round(projectedWeight),
      growthRate: Math.round(growthRate * 10) / 10,
      percentile: randBetween(10, 95),
      risk: pretermRisk,
    });
  }

  const wellbeingScore = healthScore - randBetween(0, 10);

  return {
    id: uuidv4(),
    motherId: params.motherId,
    date: new Date().toISOString(),
    pretermRisk,
    maternalHealthScore: healthScore,
    fetalGrowthForecast: fetalGrowthForecasts,
    nutritionalGuidance: [pickRandom(nutritionalTips), pickRandom(nutritionalTips)],
    riskAssessment: pretermRisk,
    wellbeingScore,
    recommendations: recommendations.slice(0, 4),
    dailyInsights: dailyInsights.slice(0, 3),
  };
}

export function generateMultiplePregnancyAssessment(params: {
  motherId: string;
  fetusCount: number;
  gestationalWeek: number;
  bpSystolic: number;
  bpDiastolic: number;
  bloodSugar: number;
  age: number;
}): MultiplePregnancyAssessment {
  const individualScores: IndividualFetusScore[] = [];
  let totalScore = 0;

  for (let i = 0; i < params.fetusCount; i++) {
    const healthScore = randBetween(60, 98);
    totalScore += healthScore;
    const risk: RiskLevel = healthScore >= 80 ? 'low' : healthScore >= 60 ? 'moderate' : 'high';
    individualScores.push({
      fetusId: uuidv4(),
      label: `Fetus ${i + 1}`,
      healthScore,
      growthPercentile: randBetween(10, 95),
      movementRate: randBetween(5, 30),
      heartRate: randBetween(120, 160),
      riskLevel: risk,
    });
  }

  const weights = individualScores.map(s => s.growthPercentile);
  const maxW = Math.max(...weights);
  const minW = Math.min(...weights);
  const growthDisparity = Math.round(((maxW - minW) / maxW) * 100);

  let growthDisparityRisk: RiskLevel = 'low';
  if (growthDisparity > 25) growthDisparityRisk = 'high';
  else if (growthDisparity > 15) growthDisparityRisk = 'moderate';

  const twinToTwinRisk: RiskLevel = params.fetusCount >= 2 && growthDisparity > 20 ? 'high'
    : growthDisparity > 10 ? 'moderate' : 'low';

  const maternalComplicationRisk: RiskLevel =
    params.age > 40 ? 'high'
    : params.bpSystolic > 140 ? 'high'
    : params.bpSystolic > 130 ? 'moderate'
    : 'low';

  const pretermBirthRisk: RiskLevel =
    params.fetusCount >= 3 ? 'high'
    : params.fetusCount >= 2 ? 'moderate'
    : 'low';

  const overallScore = Math.round(totalScore / params.fetusCount);

  return {
    id: uuidv4(),
    motherId: params.motherId,
    date: new Date().toISOString(),
    individualScores,
    growthDisparity,
    growthDisparityRisk,
    twinToTwinRisk,
    maternalComplicationRisk,
    pretermBirthRisk,
    overallScore,
    anomalies: overallScore < 65 ? ['Growth restriction detected', 'Weight disparity above threshold'] : [],
    alerts: overallScore < 70 ? ['Close monitoring recommended', 'Weekly growth scans advised'] : [],
    recommendations: [
      'Monitor fetal movements daily',
      'Attend weekly growth scans',
      'Maintain bed rest if recommended',
      'Report any unusual symptoms immediately',
      'Keep all scheduled appointments',
    ],
  };
}

export function generateBabyAIAssessment(params: {
  babyId: string;
  age: number;
  weight: number;
  height: number;
  headCircumference: number;
  feedingType: string;
}): BabyAIAssessment {
  const growthPercentile = randBetween(15, 95);
  const infectionRisk: RiskLevel = growthPercentile < 25 ? 'moderate' : 'low';

  return {
    id: uuidv4(),
    babyId: params.babyId,
    date: new Date().toISOString(),
    feedingOptimization: [
      params.feedingType === 'breast' ? 'Continue exclusive breastfeeding' : 'Ensure proper formula preparation',
      'Feed on demand, watching for hunger cues',
      'Burp baby after each feeding session',
    ],
    growthTrend: [
      `Weight at ${growthPercentile}th percentile`,
      'Steady growth pattern observed',
      'Monitor for consistent weight gain',
    ],
    developmentForecast: [
      'Expected to meet milestones within normal range',
      'Encourage tummy time for motor development',
    ],
    infectionRisk,
    healthTrendPrediction: [
      'Low risk of common infections',
      'Continue immunizations on schedule',
      'Maintain good hygiene practices',
    ],
    recommendations: [
      'Track daily feeding and diaper output',
      'Monitor temperature regularly',
      'Follow vaccination schedule strictly',
      'Schedule regular pediatric checkups',
    ],
  };
}

export function getWeeklyInsight(week: number): {
  babyDevelopment: string;
  motherChanges: string;
  tips: string[];
} {
  const insights: Record<number, { babyDevelopment: string; motherChanges: string; tips: string[] }> = {
    4: {
      babyDevelopment: 'Embryo implants in the uterine lining',
      motherChanges: 'Missed period, possible fatigue',
      tips: ['Start prenatal vitamins', 'Avoid alcohol and smoking', 'Schedule first prenatal visit'],
    },
    8: {
      babyDevelopment: 'Heart begins beating, limbs forming',
      motherChanges: 'Morning sickness, breast tenderness',
      tips: ['Eat small frequent meals', 'Stay hydrated', 'Get plenty of rest'],
    },
    12: {
      babyDevelopment: 'Organs formed, fingers and toes visible',
      motherChanges: 'Energy may improve, visible bump',
      tips: ['First trimester screening', 'Start pregnancy exercise', 'Plan maternity leave'],
    },
    16: {
      babyDevelopment: 'Baby can make facial expressions',
      motherChanges: 'May feel quickening movements',
      tips: ['Monitor blood pressure', 'Stay active', 'Eat iron-rich foods'],
    },
    20: {
      babyDevelopment: 'Hearing develops, swallowing practice',
      motherChanges: 'Visible baby bump, possible backache',
      tips: ['Anomaly scan scheduled', 'Sleep on left side', 'Use pregnancy pillows'],
    },
    24: {
      babyDevelopment: 'Lungs developing, viable outside womb',
      motherChanges: 'Stretch marks, possible leg cramps',
      tips: ['Gestational diabetes test', 'Elevate feet', 'Stay hydrated'],
    },
    28: {
      babyDevelopment: 'Eyes open, brain developing rapidly',
      motherChanges: 'Shortness of breath, Braxton Hicks',
      tips: ['Count fetal kicks daily', 'Prepare hospital bag', 'Third trimester checkup'],
    },
    32: {
      babyDevelopment: 'Bones fully developed, practice breathing',
      motherChanges: 'Swelling, frequent urination',
      tips: ['Monitor for preterm signs', 'Rest when tired', 'Prepare for maternity leave'],
    },
    36: {
      babyDevelopment: 'Baby drops into birthing position',
      motherChanges: 'Pelvic pressure, easier breathing',
      tips: ['Weekly checkups', 'Review birth plan', 'Pack hospital bag'],
    },
    40: {
      babyDevelopment: 'Full term, ready for birth',
      motherChanges: 'Possible labor signs, nesting instinct',
      tips: ['Watch for labor signs', 'Stay calm and rested', 'Contact provider if contractions start'],
    },
  };

  const closest = Object.keys(insights)
    .map(Number)
    .reduce((prev, curr) => Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev);

  return insights[closest] || {
    babyDevelopment: 'Continuing normal development',
    motherChanges: 'Ongoing pregnancy changes',
    tips: ['Attend regular checkups', 'Eat balanced diet', 'Stay active'],
  };
}

export async function generateAIResponse(
  message: string,
  type: ChatMessageType = 'general'
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const responses: Record<string, string[]> = {
    general: [
      'That is a great question! During pregnancy, it is important to stay hydrated and maintain a balanced diet rich in folic acid, iron, and calcium.',
      'I recommend discussing any concerns with your healthcare provider at your next prenatal visit. Regular checkups are essential for monitoring both your health and your baby\'s development.',
      'Every pregnancy is unique. What works for one mother may not work for another. Always consult your doctor before making any significant changes to your routine.',
      'Your body is doing an amazing job! Remember to rest when you need to and listen to your body\'s signals.',
    ],
    nutrition: [
      'A balanced pregnancy diet should include plenty of fruits, vegetables, whole grains, lean protein, and healthy fats. Aim for at least 5 servings of fruits and vegetables daily.',
      'Iron-rich foods like spinach, lean red meat, and fortified cereals help prevent anemia during pregnancy. Pair them with vitamin C for better absorption.',
      'Folic acid is crucial in early pregnancy for neural tube development. Good sources include leafy greens, citrus fruits, and fortified grains.',
      'Stay hydrated! Aim for 8-10 glasses of water daily. Proper hydration helps maintain amniotic fluid levels and prevents common issues like constipation.',
    ],
    medication: [
      'Always consult your healthcare provider before taking any medication during pregnancy, including over-the-counter drugs and supplements.',
      'Prenatal vitamins are specifically formulated to support your nutritional needs during pregnancy. Take them as directed by your provider.',
      'Some medications considered safe during pregnancy include certain prenatal vitamins, iron supplements, and calcium supplements. Always verify with your doctor.',
    ],
    symptom: [
      'Common pregnancy symptoms include nausea, fatigue, breast tenderness, and frequent urination. Most are normal, but contact your provider if symptoms become severe.',
      'Light spotting can be normal in early pregnancy, but heavy bleeding requires immediate medical attention.',
      'Swelling in hands and feet is common, but sudden severe swelling could be a sign of preeclampsia. Contact your provider if you experience this.',
      'If you experience severe headaches, vision changes, or upper abdominal pain, seek medical attention immediately as these could be signs of a serious condition.',
    ],
    education: [
      'The three trimesters of pregnancy each bring unique developments. The first trimester focuses on organ formation, the second on growth, and the third on preparation for birth.',
      'Kick counts are a great way to monitor your baby\'s wellbeing. Count 10 movements within 2 hours at the same time each day.',
      'Childbirth education classes can help you prepare for labor and delivery. They cover breathing techniques, pain management options, and what to expect during each stage of labor.',
      'Creating a birth plan helps communicate your preferences to your healthcare team, but remember that flexibility is important as labor can be unpredictable.',
    ],
  };

  const typeResponses = responses[type] || responses.general;
  return typeResponses[Math.floor(Math.random() * typeResponses.length)];
}

type ChatMessageType = 'general' | 'nutrition' | 'medication' | 'symptom' | 'education';

export function assessJaundice(params: {
  babyId: string;
  babyAgeDays: number;
  birthWeight: number;
  gestationalAgeWeeks: number;
  bilirubinLevel: number;
  symptoms: string[];
}): JaundiceAssessment {
  const { babyAgeDays, birthWeight, gestationalAgeWeeks, bilirubinLevel } = params;

  let riskLevel: JaundiceRisk = 'low';
  const threshold = gestationalAgeWeeks >= 38 ? 15 : gestationalAgeWeeks >= 34 ? 12 : 10;

  if (bilirubinLevel > threshold + 10) riskLevel = 'critical';
  else if (bilirubinLevel > threshold + 5) riskLevel = 'high';
  else if (bilirubinLevel > threshold) riskLevel = 'moderate';

  if (babyAgeDays < 1 && bilirubinLevel > 8) riskLevel = 'high';
  if (babyAgeDays < 1 && bilirubinLevel > 12) riskLevel = 'critical';

  const requiresPhototherapy = riskLevel === 'high' || riskLevel === 'critical';
  const requiresExchangeTransfusion = riskLevel === 'critical' && bilirubinLevel > threshold + 15;

  const allRecommendations: string[] = [];
  if (riskLevel === 'low') {
    allRecommendations.push('Continue frequent breastfeeding (8-12 times per day)');
    allRecommendations.push('Ensure baby is feeding well and producing wet diapers');
    allRecommendations.push('Monitor for any yellowing of skin or eyes');
    allRecommendations.push('Routine pediatric follow-up as scheduled');
  } else if (riskLevel === 'moderate') {
    allRecommendations.push('Increase feeding frequency to help eliminate bilirubin');
    allRecommendations.push('Place baby in indirect sunlight for short periods (10-15 min, twice daily)');
    allRecommendations.push('Schedule bilirubin recheck within 24-48 hours');
    allRecommendations.push('Monitor stool and urine output closely');
  } else if (riskLevel === 'high') {
    allRecommendations.push('Immediate phototherapy treatment required');
    allRecommendations.push('Monitor bilirubin levels every 6-12 hours');
    allRecommendations.push('Ensure adequate hydration - consider IV fluids if needed');
    allRecommendations.push('Prepare for possible hospital admission');
  } else {
    allRecommendations.push('Emergency phototherapy required');
    allRecommendations.push('Prepare for possible exchange transfusion');
    allRecommendations.push('Intensive monitoring in NICU setting');
    allRecommendations.push('Consult pediatric hematologist immediately');
  }

  const followUpActions: Record<JaundiceRisk, string> = {
    low: 'Routine monitoring at next pediatric visit',
    moderate: 'Recheck bilirubin in 24-48 hours',
    high: 'Admit for phototherapy, recheck in 6-12 hours',
    critical: 'Emergency admission, immediate intensive treatment',
  };

  return {
    id: uuidv4(),
    babyId: params.babyId,
    date: new Date().toISOString(),
    bilirubinLevel,
    babyAgeDays,
    birthWeight,
    gestationalAgeWeeks,
    riskLevel,
    symptoms: params.symptoms,
    recommendations: allRecommendations,
    requiresPhototherapy,
    requiresExchangeTransfusion,
    followUpAction: followUpActions[riskLevel],
  };
}

const triageCategories = [
  { symptoms: ['fever', 'chills', 'body ache'], category: 'Infectious Illness', minSeverity: 2 },
  { symptoms: ['headache', 'dizziness', 'blurred vision'], category: 'Hypertension Concern', minSeverity: 2 },
  { symptoms: ['bleeding', 'spotting', 'cramping'], category: 'Obstetric Emergency', minSeverity: 3 },
  { symptoms: ['nausea', 'vomiting', 'dehydration'], category: 'Gastrointestinal', minSeverity: 1 },
  { symptoms: ['shortness of breath', 'chest pain', 'palpitations'], category: 'Cardiorespiratory', minSeverity: 3 },
  { symptoms: ['swelling', 'edema', 'weight gain'], category: 'Preeclampsia Risk', minSeverity: 2 },
  { symptoms: ['fatigue', 'weakness', 'pale'], category: 'Anemia', minSeverity: 1 },
  { symptoms: ['anxiety', 'depression', 'insomnia'], category: 'Mental Health', minSeverity: 1 },
];

export function assessVoiceTriage(params: {
  motherId: string;
  symptoms: TriageSymptom[];
  transcription?: string;
}): VoiceTriageAssessment {
  const symptomNames = params.symptoms.map(s => s.name.toLowerCase());
  const maxSeverity = params.symptoms.reduce((max, s) => {
    const sev = s.severity === 'severe' ? 3 : s.severity === 'moderate' ? 2 : 1;
    return Math.max(max, sev);
  }, 0);

  let bestCategory = 'General Assessment';
  let bestMatchCount = 0;
  for (const cat of triageCategories) {
    const matchCount = cat.symptoms.filter(s => symptomNames.some(sn => sn.includes(s))).length;
    if (matchCount > bestMatchCount) {
      bestMatchCount = matchCount;
      bestCategory = cat.category;
    }
  }

  let urgencyLevel: 'low' | 'moderate' | 'high' | 'emergency' = 'low';
  if (maxSeverity >= 3) urgencyLevel = 'high';
  else if (maxSeverity >= 2) urgencyLevel = 'moderate';

  const hasSevereSymptoms = params.symptoms.some(s =>
    s.severity === 'severe'
  );

  const selfCareTips: string[] = [];
  if (urgencyLevel === 'low') {
    selfCareTips.push('Rest and stay hydrated');
    selfCareTips.push('Monitor symptoms for any changes');
    selfCareTips.push('Schedule a routine checkup if symptoms persist');
  } else if (urgencyLevel === 'moderate') {
    selfCareTips.push('Rest and avoid strenuous activity');
    selfCareTips.push('Keep a symptom diary for your doctor');
    selfCareTips.push('Contact your healthcare provider within 24 hours');
  }

  const careTimings: Record<string, string> = {
    low: 'No immediate care needed. Monitor at home.',
    moderate: 'Schedule an appointment within 24-48 hours.',
    high: 'Seek care within the next few hours. Consider urgent care.',
    emergency: 'CALL EMERGENCY SERVICES (911) IMMEDIATELY.',
  };

  return {
    id: uuidv4(),
    motherId: params.motherId,
    date: new Date().toISOString(),
    symptoms: params.symptoms,
    urgencyLevel,
    triageCategory: bestCategory,
    recommendedAction: careTimings[urgencyLevel],
    selfCareTips,
    shouldSeekCare: urgencyLevel === 'high',
    careTiming: careTimings[urgencyLevel],
    transcription: params.transcription,
  };
}

const cryPatterns: { type: CryType; pitch: string; pattern: string; causes: string; tips: string[] }[] = [
  {
    type: 'hunger',
    pitch: 'Low to medium, rhythmic',
    pattern: 'Rhythmic, rising and falling, often accompanied by sucking motions',
    causes: 'Baby needs to be fed. Look for early hunger cues like rooting or hand-to-mouth movements.',
    tips: ['Feed baby immediately', 'Check latch if breastfeeding', 'Burp after feeding', 'Watch for early hunger cues next time'],
  },
  {
    type: 'discomfort',
    pitch: 'Medium, irregular',
    pattern: 'Whining, fussy, intermittent, often with squirming',
    causes: 'Wet diaper, uncomfortable temperature, tight clothing, or need for position change.',
    tips: ['Check and change diaper', 'Adjust room temperature', 'Loosen or change clothing', 'Try different holding positions'],
  },
  {
    type: 'pain',
    pitch: 'High-pitched, intense, sudden onset',
    pattern: 'Sudden loud shriek or scream, long cry followed by breath holding',
    causes: 'Gas pain, ear infection, teething, or other medical source of pain.',
    tips: ['Check for visible signs of injury or irritation', 'Try gentle tummy massage for gas', 'Consult pediatrician if persistent', 'Check for fever or other symptoms'],
  },
  {
    type: 'tired',
    pitch: 'Low, whiny, nasal',
    pattern: 'Whimpering, fussy cry that escalates, baby rubs eyes or ears',
    causes: 'Baby is overstimulated or overtired and needs help settling.',
    tips: ['Create a calm, dark environment', 'Use white noise or shushing sounds', 'Swaddle baby comfortably', 'Rock or sway gently'],
  },
  {
    type: 'attention',
    pitch: 'Medium, starts low then rises',
    pattern: 'Short, rhythmic cries with pauses — baby looks toward parent',
    causes: 'Baby wants to be held, comforted, or needs social interaction.',
    tips: ['Pick up and hold baby', 'Talk or sing softly', 'Make eye contact', 'Baby-wearing can help'],
  },
  {
    type: 'colic',
    pitch: 'High-pitched, intense, prolonged',
    pattern: 'Predictable crying episodes (often evening), legs drawn up, clenched fists',
    causes: 'Immature digestive system, gas, or overstimulation. Peaks around 6-8 weeks.',
    tips: ['Try the "5 S\'s": Swaddle, Side/Stomach position, Shush, Swing, Suck', 'Use anti-colic bottles if bottle-fed', 'Try gentle bicycle leg movements', 'Consult pediatrician for persistent colic'],
  },
];

export function analyzeBabyCry(params: {
  babyId: string;
  duration: number;
  frequency: number;
  pitch?: string;
  pattern?: string;
  context?: string;
}): CryAnalysisResult {
  const { duration, frequency } = params;
  const matchedPattern = pickRandom(cryPatterns);
  const confidence = randBetween(65, 95);

  const urgencyLevel = matchedPattern.type === 'pain' || matchedPattern.type === 'colic'
    ? 'moderate'
    : 'low';
  const needsMedicalAttention = matchedPattern.type === 'pain';

  return {
    id: uuidv4(),
    babyId: params.babyId,
    date: new Date().toISOString(),
    cryType: matchedPattern.type,
    confidence,
    frequency,
    duration,
    pitch: matchedPattern.pitch,
    pattern: matchedPattern.pattern,
    probableCause: matchedPattern.causes,
    soothingTips: matchedPattern.tips,
    urgencyLevel,
    needsMedicalAttention,
  };
}

export function generateMultiBabyHealthAlerts(params: {
  motherId: string;
  babies: { id: string; label: string; profile: BabyProfile; feedings: FeedingEntry[] }[];
}): MultiBabyAlert[] {
  const alerts: MultiBabyAlert[] = [];
  const now = new Date().toISOString();

  for (const baby of params.babies) {
    const todayFeedings = baby.feedings.filter(f =>
      f.date === now.split('T')[0]
    );

    if (todayFeedings.length === 0) {
      alerts.push({
        id: uuidv4(),
        motherId: params.motherId,
        date: now,
        babyId: baby.id,
        babyLabel: baby.label,
        type: 'feeding',
        severity: 'critical',
        title: `${baby.label} - No feedings recorded today`,
        description: `${baby.label} has not been fed today. Newborns need 8-12 feedings per 24 hours.`,
        recommendation: 'Attempt feeding immediately. If baby refuses, consult pediatrician.',
        isResolved: false,
      });
    } else if (todayFeedings.length < 6) {
      alerts.push({
        id: uuidv4(),
        motherId: params.motherId,
        date: now,
        babyId: baby.id,
        babyLabel: baby.label,
        type: 'feeding',
        severity: 'warning',
        title: `${baby.label} - Low feeding frequency`,
        description: `Only ${todayFeedings.length} feedings today. Newborns typically need 8-12 feedings per day.`,
        recommendation: 'Try feeding more frequently. Wake baby if sleeping more than 4 hours between feeds.',
        isResolved: false,
      });
    }

    if (baby.profile.birthWeight > 0) {
      alerts.push({
        id: uuidv4(),
        motherId: params.motherId,
        date: now,
        babyId: baby.id,
        babyLabel: baby.label,
        type: 'growth',
        severity: 'info',
        title: `${baby.label} - Birth weight recorded`,
        description: `Birth weight: ${baby.profile.birthWeight} kg. Monitor weight gain patterns.`,
        recommendation: 'Track weekly weight and consult growth charts at pediatric visits.',
        isResolved: false,
      });
    }
  }

  if (params.babies.length >= 2) {
    const feedingCounts = params.babies.map(b => ({
      label: b.label,
      count: b.feedings.filter(f => f.date === now.split('T')[0]).length,
    }));
    const counts = feedingCounts.map(f => f.count);
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);
    if (maxCount - minCount >= 4) {
      const lowBaby = feedingCounts.find(f => f.count === minCount)!;
      alerts.push({
        id: uuidv4(),
        motherId: params.motherId,
        date: now,
        babyId: params.babies.find(b => b.label === lowBaby.label)?.id || '',
        babyLabel: lowBaby.label,
        type: 'feeding',
        severity: 'warning',
        title: `Feeding imbalance detected`,
        description: `${lowBaby.label} has significantly fewer feedings (${lowBaby.count}) compared to siblings.`,
        recommendation: `Ensure ${lowBaby.label} is being offered feeds just as frequently as the other baby(ies).`,
        isResolved: false,
      });
    }
  }

  return alerts;
}
