/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Suggestion {
  id: string;
  citizenName: string;
  village: string;
  district: string;
  language: string;
  originalText: string;
  translatedText: string;
  category: 'Road' | 'Water' | 'Education' | 'Healthcare' | 'Electricity' | 'Agriculture' | 'Employment';
  audioUrl?: string;
  photoUrl?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  priorityScore: number; // 1-100
  urgency: number; // 1-10
  impact: number; // number of beneficiaries
  budgetEstimate: number; // in ₹ Lakhs (e.g., 45 Lakhs = 45, 2.4 Cr = 240)
  timestamp: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Investigating';
  aiSummary: string;
}

export interface AiRecommendation {
  id: string;
  title: string;
  priority: number; // 1-100
  confidence: number; // 1-100
  villagesCount: number;
  villagesList: string[];
  estimatedBudget: number; // in Lakhs
  citizenRequestsCount: number;
  potentialBeneficiaries: number;
  aiRecommendation: string;
  category: 'Road' | 'Water' | 'Education' | 'Healthcare' | 'Electricity' | 'Agriculture' | 'Employment';
  status: 'Pending' | 'Approved' | 'Rejected' | 'MoreData';
}

export interface DevPlanComparison {
  id: string;
  title: string;
  category: 'Road' | 'Water' | 'Education' | 'Healthcare' | 'Electricity' | 'Agriculture' | 'Employment';
  district: string;
  citizenDemand: string;
  governmentPlan: string;
  aiRecommendation: string;
  matchStatus: 'Match' | 'Conflict';
  priorityScore: number;
  budgetLakhs: number;
}

export interface DashboardStats {
  totalSuggestions: number;
  todaysSuggestions: number;
  villagesCovered: number;
  averagePriorityScore: number;
  budgetUtilization: number; // in %
  totalBudgetAllocated: number; // in Lakhs
  totalBudgetPlanned: number; // in Lakhs
  categoryCounts: Record<string, number>;
  districtCounts: Record<string, number>;
  monthlyTrends: { month: string; count: number }[];
}
