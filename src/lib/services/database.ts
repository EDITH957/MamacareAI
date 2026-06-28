import Dexie, { type Table } from 'dexie';
import type {
  MotherProfile,
  PregnancyProfile,
  HealthMetric,
  WeightEntry,
  BloodPressureEntry,
  BloodSugarEntry,
  AIAssessment,
  MultiplePregnancyAssessment,
  GrowthComparison,
  Reminder,
  ChatMessage,
  BabyProfile,
  BabyHealthMetric,
  FeedingEntry,
  Vaccination,
  DevelopmentMilestone,
  BabyAIAssessment,
  EmergencySOS,
  DailyReport,
  WeeklyReport,
  TimelineEvent,
  MedicalRecord,
  JaundiceAssessment,
  VoiceTriageAssessment,
  CryAnalysisResult,
  MultiBabyAlert,
  TwinFeedingSession,
  TwinCrySession,
} from '@/types';

class MamaCareDB extends Dexie {
  motherProfiles!: Table<MotherProfile, string>;
  pregnancyProfiles!: Table<PregnancyProfile, string>;
  healthMetrics!: Table<HealthMetric, string>;
  weightEntries!: Table<WeightEntry, string>;
  bloodPressureEntries!: Table<BloodPressureEntry, string>;
  bloodSugarEntries!: Table<BloodSugarEntry, string>;
  aiAssessments!: Table<AIAssessment, string>;
  multiplePregnancyAssessments!: Table<MultiplePregnancyAssessment, string>;
  growthComparisons!: Table<GrowthComparison, string>;
  reminders!: Table<Reminder, string>;
  chatMessages!: Table<ChatMessage, string>;
  babyProfiles!: Table<BabyProfile, string>;
  babyHealthMetrics!: Table<BabyHealthMetric, string>;
  feedingEntries!: Table<FeedingEntry, string>;
  vaccinations!: Table<Vaccination, string>;
  developmentMilestones!: Table<DevelopmentMilestone, string>;
  babyAIAssessments!: Table<BabyAIAssessment, string>;
  emergencySOS!: Table<EmergencySOS, string>;
  jaundiceAssessments!: Table<JaundiceAssessment, string>;
  voiceTriageAssessments!: Table<VoiceTriageAssessment, string>;
  cryAnalysisResults!: Table<CryAnalysisResult, string>;
  multiBabyAlerts!: Table<MultiBabyAlert, string>;
  twinFeedingSessions!: Table<TwinFeedingSession, string>;
  twinCrySessions!: Table<TwinCrySession, string>;
  dailyReports!: Table<DailyReport, string>;
  weeklyReports!: Table<WeeklyReport, string>;
  timelineEvents!: Table<TimelineEvent, string>;
  medicalRecords!: Table<MedicalRecord, string>;

  constructor() {
    super('MamaCareDB');

    this.version(1).stores({
      motherProfiles: 'id, userId, pregnancyType, createdAt',
      pregnancyProfiles: 'id, motherId, dueDate, trimester',
      healthMetrics: 'id, motherId, date, weight, bloodPressureSystolic',
      weightEntries: 'id, motherId, date, week',
      bloodPressureEntries: 'id, motherId, date, week',
      bloodSugarEntries: 'id, motherId, date, type, week',
      aiAssessments: 'id, motherId, date, riskAssessment',
      multiplePregnancyAssessments: 'id, motherId, date, overallScore',
      growthComparisons: 'id, motherId',
      reminders: 'id, motherId, type, isCompleted, scheduledTime',
      chatMessages: 'id, role, timestamp, type',
      babyProfiles: 'id, motherId, dateOfBirth',
      babyHealthMetrics: 'id, babyId, date',
      feedingEntries: 'id, babyId, date, type',
      vaccinations: 'id, babyId, name, isCompleted, scheduledDate',
      developmentMilestones: 'id, babyId, category, isAchieved',
      babyAIAssessments: 'id, babyId, date',
      emergencySOS: 'id, motherId, timestamp, status',
      jaundiceAssessments: 'id, babyId, date, riskLevel',
      voiceTriageAssessments: 'id, motherId, date, urgencyLevel',
      cryAnalysisResults: 'id, babyId, date, cryType',
      multiBabyAlerts: 'id, motherId, date, babyId, type, severity',
      twinFeedingSessions: 'id, motherId, date',
      twinCrySessions: 'id, motherId, date',
      dailyReports: 'id, motherId, date, riskLevel',
      weeklyReports: 'id, motherId, weekStart, weekNumber',
      timelineEvents: 'id, motherId, type, date, completed',
      medicalRecords: 'id, motherId, date, type',
    });
  }
}

export const db = new MamaCareDB();

export async function initializeDatabase(): Promise<void> {
  try {
    await db.open();
    console.log('MamaCare DB initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}
