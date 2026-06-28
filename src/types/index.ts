export type PregnancyType = 'single' | 'twin' | 'triplet';

export type RiskLevel = 'low' | 'moderate' | 'high';

export type Gender = 'male' | 'female' | 'unknown';

export type FeedingType = 'breast' | 'formula' | 'mixed';

export type AppointmentType = 'checkup' | 'scan' | 'test' | 'consultation' | 'emergency';

export type ReminderType = 'medication' | 'appointment' | 'supplement';

export type TimelineEventType =
  | 'pregnancy_start'
  | 'first_scan'
  | 'quickening'
  | 'gestational_diabetes_test'
  | 'anomaly_scan'
  | 'third_trimester'
  | 'birth'
  | 'newborn_check'
  | 'vaccination'
  | 'milestone';

export interface MotherProfile {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  pregnancyType: PregnancyType;
  medicalHistory: MedicalHistory;
  emergencyContacts: EmergencyContact[];
  healthcareProvider: HealthcareProvider;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistory {
  preExistingConditions: string[];
  allergies: string[];
  medications: string[];
  previousPregnancies: number;
  previousC_sections: number;
  bloodType: string;
  rhFactor: 'positive' | 'negative';
  geneticDisorders: string[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  isPrimary: boolean;
}

export interface HealthcareProvider {
  name: string;
  facility: string;
  phone: string;
  address: string;
  email?: string;
  specialty: string;
}

export interface PregnancyProfile {
  id: string;
  motherId: string;
  startDate: string;
  dueDate: string;
  gestationalAge: number;
  trimester: 1 | 2 | 3;
  fetuses: Fetus[];
  createdAt: string;
  updatedAt: string;
}

export interface Fetus {
  id: string;
  label: string;
  estimatedWeight: number;
  estimatedHeight: number;
  heartRate: number;
  movementCount: number;
  healthScore: number;
  percentile: number;
  riskLevel: RiskLevel;
  lastUpdated: string;
}

export interface HealthMetric {
  id: string;
  motherId: string;
  date: string;
  weight?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bloodSugar?: number;
  heartRate?: number;
  temperature?: number;
  notes?: string;
}

export interface WeightEntry {
  id: string;
  motherId: string;
  date: string;
  weight: number;
  week: number;
}

export interface BloodPressureEntry {
  id: string;
  motherId: string;
  date: string;
  systolic: number;
  diastolic: number;
  week: number;
}

export interface BloodSugarEntry {
  id: string;
  motherId: string;
  date: string;
  level: number;
  type: 'fasting' | 'postprandial' | 'random';
  week: number;
}

export interface AIAssessment {
  id: string;
  motherId: string;
  date: string;
  pretermRisk: RiskLevel;
  maternalHealthScore: number;
  fetalGrowthForecast: FetalGrowthForecast[];
  nutritionalGuidance: string[];
  riskAssessment: RiskLevel;
  wellbeingScore: number;
  recommendations: string[];
  dailyInsights: string[];
}

export interface FetalGrowthForecast {
  fetusId: string;
  label: string;
  currentWeight: number;
  projectedWeight: number;
  growthRate: number;
  percentile: number;
  risk: RiskLevel;
}

export interface MultiplePregnancyAssessment {
  id: string;
  motherId: string;
  date: string;
  individualScores: IndividualFetusScore[];
  growthDisparity: number;
  growthDisparityRisk: RiskLevel;
  twinToTwinRisk: RiskLevel;
  maternalComplicationRisk: RiskLevel;
  pretermBirthRisk: RiskLevel;
  overallScore: number;
  anomalies: string[];
  alerts: string[];
  recommendations: string[];
}

export interface IndividualFetusScore {
  fetusId: string;
  label: string;
  healthScore: number;
  growthPercentile: number;
  movementRate: number;
  heartRate: number;
  riskLevel: RiskLevel;
}

export interface GrowthComparison {
  weeks: number[];
  fetuses: {
    id: string;
    label: string;
    weights: number[];
    percentiles: number[];
  }[];
}

export interface Reminder {
  id: string;
  motherId: string;
  type: ReminderType;
  title: string;
  description: string;
  scheduledTime: string;
  isRecurring: boolean;
  recurringDays?: number[];
  isCompleted: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type: 'general' | 'nutrition' | 'medication' | 'symptom' | 'education';
}

export interface BabyProfile {
  id: string;
  motherId: string;
  name: string;
  gender: Gender;
  dateOfBirth: string;
  birthWeight: number;
  birthHeight: number;
  bloodType: string;
  feedingType: FeedingType;
  createdAt: string;
  updatedAt: string;
}

export interface BabyHealthMetric {
  id: string;
  babyId: string;
  date: string;
  weight: number;
  height: number;
  headCircumference: number;
  temperature: number;
  notes?: string;
}

export interface FeedingEntry {
  id: string;
  babyId: string;
  date: string;
  time: string;
  type: FeedingType;
  amount?: number;
  duration?: number;
  side?: 'left' | 'right' | 'both';
  notes?: string;
}

export interface Vaccination {
  id: string;
  babyId: string;
  name: string;
  scheduledDate: string;
  administeredDate?: string;
  isCompleted: boolean;
  provider?: string;
  batchNumber?: string;
  notes?: string;
}

export interface DevelopmentMilestone {
  id: string;
  babyId: string;
  category: 'motor' | 'cognitive' | 'social' | 'language';
  milestone: string;
  expectedAge: number;
  achievedAge?: number;
  isAchieved: boolean;
  achievedDate?: string;
  notes?: string;
}

export interface BabyAIAssessment {
  id: string;
  babyId: string;
  date: string;
  feedingOptimization: string[];
  growthTrend: string[];
  developmentForecast: string[];
  infectionRisk: RiskLevel;
  healthTrendPrediction: string[];
  recommendations: string[];
}

export interface EmergencySOS {
  id: string;
  motherId: string;
  timestamp: string;
  location: { lat: number; lng: number };
  status: 'active' | 'resolved' | 'cancelled';
  ambulanceRequested: boolean;
  ambulanceStatus?: 'pending' | 'dispatched' | 'arrived';
  notifiedContacts: string[];
}

export interface NearbyHospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: number;
  lat: number;
  lng: number;
  emergencyServices: boolean;
  maternityWard: boolean;
  rating: number;
}

export interface DailyReport {
  id: string;
  motherId: string;
  date: string;
  healthScore: number;
  symptoms: string[];
  riskLevel: RiskLevel;
  summary: string;
  recommendations: string[];
  aiGenerated: boolean;
}

export interface WeeklyReport {
  id: string;
  motherId: string;
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
  averageHealthScore: number;
  weightChange: number;
  bloodPressureTrend: string;
  bloodSugarTrend: string;
  riskLevel: RiskLevel;
  highlights: string[];
  concerns: string[];
  recommendations: string[];
  aiGenerated: boolean;
}

export interface TimelineEvent {
  id: string;
  motherId: string;
  type: TimelineEventType;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  icon?: string;
}

export interface MedicalRecord {
  id: string;
  motherId: string;
  date: string;
  type: 'scan' | 'test' | 'prescription' | 'note' | 'discharge';
  title: string;
  description: string;
  provider: string;
  facility: string;
  attachments: string[];
  notes?: string;
}

export type JaundiceRisk = 'low' | 'moderate' | 'high' | 'critical';

export interface JaundiceAssessment {
  id: string;
  babyId: string;
  date: string;
  bilirubinLevel: number;
  babyAgeDays: number;
  birthWeight: number;
  gestationalAgeWeeks: number;
  riskLevel: JaundiceRisk;
  symptoms: string[];
  recommendations: string[];
  requiresPhototherapy: boolean;
  requiresExchangeTransfusion: boolean;
  followUpAction: string;
  notes?: string;
}

export interface TriageSymptom {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
}

export interface VoiceTriageAssessment {
  id: string;
  motherId: string;
  date: string;
  symptoms: TriageSymptom[];
  urgencyLevel: 'low' | 'moderate' | 'high' | 'emergency';
  triageCategory: string;
  recommendedAction: string;
  selfCareTips: string[];
  shouldSeekCare: boolean;
  careTiming: string;
  transcription?: string;
  notes?: string;
}

export type CryType = 'hunger' | 'discomfort' | 'pain' | 'tired' | 'attention' | 'colic' | 'unknown';

export interface CryAnalysisResult {
  id: string;
  babyId: string;
  date: string;
  cryType: CryType;
  confidence: number;
  frequency: number;
  duration: number;
  pitch: string;
  pattern: string;
  probableCause: string;
  soothingTips: string[];
  urgencyLevel: 'low' | 'moderate' | 'high';
  needsMedicalAttention: boolean;
}

export interface MultiBabyAlert {
  id: string;
  motherId: string;
  date: string;
  babyId: string;
  babyLabel: string;
  type: 'feeding' | 'cry' | 'health' | 'jaundice' | 'growth' | 'temperature';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  isResolved: boolean;
  resolvedAt?: string;
}

export interface TwinFeedingSession {
  id: string;
  motherId: string;
  date: string;
  startTime: string;
  endTime?: string;
  entries: {
    babyId: string;
    babyLabel: string;
    type: FeedingType;
    amount?: number;
    duration?: number;
    side?: 'left' | 'right' | 'both';
    latchQuality?: 'poor' | 'fair' | 'good' | 'excellent';
    notes?: string;
  }[];
}

export interface TwinCrySession {
  id: string;
  motherId: string;
  date: string;
  time: string;
  entries: {
    babyId: string;
    babyLabel: string;
    cryType: CryType;
    duration: number;
    intensity: 'low' | 'moderate' | 'high';
    soothingResponse?: 'none' | 'partial' | 'full';
    notes?: string;
  }[];
}
