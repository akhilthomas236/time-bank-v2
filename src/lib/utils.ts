import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { USER_LEVELS, CREDIT_CONVERSION_RATE } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate user level based on credits
export function calculateUserLevel(credits: number) {
  for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
    if (credits >= USER_LEVELS[i].minCredits) {
      return USER_LEVELS[i];
    }
  }
  return USER_LEVELS[0];
}

// Get progress to next level
export function getLevelProgress(credits: number) {
  const currentLevel = calculateUserLevel(credits);
  const currentLevelIndex = USER_LEVELS.findIndex(l => l.level === currentLevel.level);
  
  if (currentLevelIndex === USER_LEVELS.length - 1) {
    return { progress: 100, nextLevel: null, creditsToNext: 0 };
  }
  
  const nextLevel = USER_LEVELS[currentLevelIndex + 1];
  const creditsInCurrentLevel = credits - currentLevel.minCredits;
  const creditsNeededForNext = nextLevel.minCredits - currentLevel.minCredits;
  const progress = (creditsInCurrentLevel / creditsNeededForNext) * 100;
  
  return {
    progress: Math.min(progress, 100),
    nextLevel,
    creditsToNext: nextLevel.minCredits - credits
  };
}

// Format time duration
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

// Calculate time saved based on frequency
export function calculateTotalTimeSaved(
  timeSavedPerExecution: number, 
  frequency: 'daily' | 'weekly' | 'monthly',
  totalExecutions: number
): number {
  return timeSavedPerExecution * totalExecutions;
}

// Calculate credits from time saved
export function calculateCredits(timeSavedInMinutes: number): number {
  const hours = timeSavedInMinutes / 60;
  return Math.floor(hours * CREDIT_CONVERSION_RATE);
}

// Format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }
  
  return date.toLocaleDateString();
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Get badge rarity color
export function getBadgeRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'bg-gray-100 text-gray-800';
    case 'rare':
      return 'bg-blue-100 text-blue-800';
    case 'epic':
      return 'bg-purple-100 text-purple-800';
    case 'legendary':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Get status color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'fulfilled':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Validate automation form
interface AutomationFormData {
  title?: string;
  description?: string;
  category?: string;
  timeSavedPerExecution?: number;
  executionFrequency?: number;
  frequency?: string;
}

export function validateAutomationForm(data: AutomationFormData): string[] {
  const errors: string[] = [];
  
  if (!data.title?.trim()) {
    errors.push('Title is required');
  }
  
  if (!data.description?.trim()) {
    errors.push('Description is required');
  }
  
  if (!data.category) {
    errors.push('Category is required');
  }
  
  if (!data.timeSavedPerExecution || data.timeSavedPerExecution <= 0) {
    errors.push('Time saved per execution must be greater than 0');
  }
  
  if (!data.frequency) {
    errors.push('Frequency is required');
  }
  
  return errors;
}

// Generate avatar placeholder
export function getAvatarFallback(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Calculate ROI
export function calculateROI(timeSavedInHours: number, hourlyRate: number = 50): number {
  return timeSavedInHours * hourlyRate;
}

// Get department color
export function getDepartmentColor(department: string): string {
  const colors: Record<string, string> = {
    'Engineering': 'bg-blue-100 text-blue-800',
    'Marketing': 'bg-green-100 text-green-800',
    'Sales': 'bg-orange-100 text-orange-800',
    'HR': 'bg-purple-100 text-purple-800',
    'Finance': 'bg-indigo-100 text-indigo-800',
    'Operations': 'bg-pink-100 text-pink-800'
  };
  
  return colors[department] || 'bg-gray-100 text-gray-800';
}

// Sort array by multiple criteria
export function sortBy<T>(array: T[], ...criteria: Array<(item: T) => string | number>): T[] {
  return [...array].sort((a, b) => {
    for (const criterion of criteria) {
      const valueA = criterion(a);
      const valueB = criterion(b);
      
      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;
    }
    return 0;
  });
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
