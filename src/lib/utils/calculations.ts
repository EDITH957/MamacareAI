import { RiskLevel, BloodPressureEntry, BloodSugarEntry, WeightEntry } from '@/types';

export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function calculateHealthScore(metrics: {
  bpSystolic: number;
  bpDiastolic: number;
  bloodSugar: number;
  weight: number;
  age: number;
}): number {
  let score = 100;

  if (metrics.bpSystolic > 140 || metrics.bpDiastolic > 90) score -= 15;
  else if (metrics.bpSystolic > 130 || metrics.bpDiastolic > 85) score -= 8;

  if (metrics.bloodSugar > 140) score -= 15;
  else if (metrics.bloodSugar > 120) score -= 8;

  if (metrics.age > 40) score -= 10;
  else if (metrics.age > 35) score -= 5;

  return Math.max(0, Math.min(100, score));
}

export function calculateGrowthPercentile(
  weight: number,
  gestationalWeek: number,
  pregnancyType: 'single' | 'twin' | 'triplet'
): number {
  const baseWeights: Record<string, number> = {
    single: 3000,
    twin: 2500,
    triplet: 2000,
  };
  const baseWeight = baseWeights[pregnancyType];
  const expectedWeight = baseWeight * (gestationalWeek / 40);
  if (expectedWeight <= 0) return 50;
  const ratio = weight / expectedWeight;
  return Math.max(1, Math.min(99, Math.round(ratio * 50)));
}

export function assessRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'low';
  if (score >= 50) return 'moderate';
  return 'high';
}

export function calculateGrowthDisparity(fetusWeights: number[]): number {
  if (fetusWeights.length < 2) return 0;
  const max = Math.max(...fetusWeights);
  const min = Math.min(...fetusWeights);
  return Math.round(((max - min) / max) * 100);
}

export function getBloodPressureCategory(systolic: number, diastolic: number): string {
  if (systolic < 120 && diastolic < 80) return 'Normal';
  if (systolic < 130 && diastolic < 80) return 'Elevated';
  if (systolic < 140 || diastolic < 90) return 'Stage 1 Hypertension';
  if (systolic >= 140 || diastolic >= 90) return 'Stage 2 Hypertension';
  if (systolic >= 180 || diastolic >= 120) return 'Crisis';
  return 'Normal';
}

export function getBloodSugarCategory(value: number, type: 'fasting' | 'postprandial' | 'random'): string {
  if (type === 'fasting') {
    if (value < 95) return 'Normal';
    if (value < 126) return 'Impaired';
    return 'High';
  }
  if (type === 'postprandial') {
    if (value < 120) return 'Normal';
    if (value < 140) return 'Impaired';
    return 'High';
  }
  if (value < 140) return 'Normal';
  if (value < 200) return 'Impaired';
  return 'High';
}

export function getExpectedWeightByWeek(week: number): { min: number; max: number; avg: number } {
  const avg = 0.5 + week * 0.45;
  return {
    min: Math.round((avg - 0.3) * 10) / 10,
    max: Math.round((avg + 0.3) * 10) / 10,
    avg: Math.round(avg * 10) / 10,
  };
}

export function getFetalWeightByWeek(week: number): number {
  const weights: Record<number, number> = {
    12: 14, 13: 23, 14: 43, 15: 70, 16: 100,
    17: 140, 18: 190, 19: 240, 20: 300, 21: 360,
    22: 430, 23: 500, 24: 600, 25: 660, 26: 760,
    27: 875, 28: 1005, 29: 1153, 30: 1319, 31: 1502,
    32: 1702, 33: 1918, 34: 2146, 35: 2383, 36: 2622,
    37: 2859, 38: 3083, 39: 3288, 40: 3462,
  };
  return weights[week] || 0;
}
