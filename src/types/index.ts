export interface JobData {
  title: string;
  posted: string;
  budget: Budget;
  duration: string;
  experience: string;
  proposals: number;
  interviewing: number;
  invites: number;
  hires: number;
  client: ClientData;
  description: string;
  skills: string[];
  bidRange: BidRange | null;
  connects: number;
  lastViewed: string;
}

export interface Budget {
  type: 'hourly' | 'fixed' | 'unknown';
  min?: number;
  max?: number;
  amount?: number;
  raw: string;
}

export interface ClientData {
  location: string;
  totalSpent: number;
  hires: number;
  hireRate: number;
  jobsPosted: number;
  openJobs: number;
  avgHourlyRate: number;
  totalHours: number;
  memberSince: string;
  paymentVerified: boolean;
  rating: number;
  reviews: number;
  memberDuration: number;
}

export interface BidRange {
  high: number;
  avg: number;
  low: number;
}

export interface Risk {
  type: 'critical' | 'high' | 'medium';
  message: string;
  impact: string;
}

export interface Opportunity {
  type: 'high' | 'medium';
  message: string;
  action: string;
}

export interface AnalysisResult {
  score: number;
  metrics: KeyMetrics;
  risks: Risk[];
  opportunities: Opportunity[];
  recommendation: Recommendation;
  insights: Insight[];
}

export interface KeyMetrics {
  clientQuality: number;
  competitionLevel: string;
  responseRate: string;
  budgetCompetitiveness: string;
  timeUrgency: string;
  projectComplexity: string;
  clientActivity: string;
  successProbability: string;
}

export interface Recommendation {
  action: string;
  confidence: 'high' | 'medium' | 'low';
  message: string;
  color: string;
}

export interface Insight {
  type: string;
  message: string;
  icon: string;
}
