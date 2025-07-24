// User types and interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  department: string;
  managerId?: string;
  creditBalance: number;
  level: number;
  badges: Badge[];
  joinDate: Date;
  avatar?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Automation types
export interface Automation {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  timeSavedPerExecution: number; // in minutes
  frequency: 'daily' | 'weekly' | 'monthly';
  totalExecutions: number;
  creditsEarned: number;
  status: 'pending' | 'approved' | 'rejected';
  submissionDate: Date;
  approvalDate?: Date;
  evidence?: string[];
  tags: string[];
}

// Redemption types
export interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  creditsCost: number;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  requestDate: Date;
  approvalDate?: Date;
  managerComment?: string;
  managerId?: string;
}

// Reward types
export interface Reward {
  id: string;
  title: string;
  description: string;
  category: 'time-off' | 'learning' | 'wellness' | 'innovation' | 'personal' | 'team' | 'community' | 'networking' | 'recognition';
  creditsCost: number;
  available: boolean;
  image?: string;
  terms?: string;
  popularity: number;
}

// Activity types
export interface Activity {
  id: string;
  userId: string;
  type: 'automation_submitted' | 'automation_approved' | 'credits_earned' | 'redemption_requested' | 'redemption_approved' | 'badge_earned' | 'level_up';
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Analytics types
export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  timestamp: Date;
  automationId?: string;
  redemptionId?: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  department: string;
  creditsEarned: number;
  automationsCount: number;
  timeSaved: number; // in hours
  rank: number;
}

// Challenge types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'department';
  target: number;
  metric: 'credits' | 'automations' | 'time_saved';
  reward: number; // bonus credits
  startDate: Date;
  endDate: Date;
  participants: string[]; // user IDs
  status: 'upcoming' | 'active' | 'completed';
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'achievement';
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Store types for state management
export interface AppState {
  currentUser: User | null;
  users: User[];
  automations: Automation[];
  redemptions: Redemption[];
  rewards: Reward[];
  activities: Activity[];
  transactions: CreditTransaction[];
  challenges: Challenge[];
  notifications: Notification[];
  leaderboard: LeaderboardEntry[];
}

// Form types
export interface AutomationFormData {
  title: string;
  description: string;
  category: string;
  timeSavedPerExecution: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  tags: string[];
  evidence?: File[];
}

export interface RedemptionRequest {
  rewardId: string;
  justification?: string;
}

// Constants
export const AUTOMATION_CATEGORIES = [
  'Data Processing',
  'Report Generation',
  'Email Management',
  'File Organization',
  'Testing',
  'Deployment',
  'Monitoring',
  'Documentation',
  'Communication',
  'Other'
] as const;

export const CREDIT_CONVERSION_RATE = 10; // 1 hour = 10 credits

export const USER_LEVELS = [
  { level: 1, name: 'Beginner', minCredits: 0, color: '#9CA3AF' },
  { level: 2, name: 'Apprentice', minCredits: 100, color: '#059669' },
  { level: 3, name: 'Specialist', minCredits: 300, color: '#DC2626' },
  { level: 4, name: 'Expert', minCredits: 600, color: '#7C3AED' },
  { level: 5, name: 'Master', minCredits: 1000, color: '#F59E0B' },
  { level: 6, name: 'Legend', minCredits: 1500, color: '#EF4444' }
] as const;

export type AutomationCategory = typeof AUTOMATION_CATEGORIES[number];
