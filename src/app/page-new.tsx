'use client';

import { useAppStore } from '@/store/useAppStore';
import { 
  TrendingUp, 
  Zap, 
  Clock, 
  Gift,
  Trophy,
  Plus,
  ChevronRight,
  Star
} from 'lucide-react';
import { 
  calculateUserLevel, 
  getLevelProgress, 
  formatDuration, 
  formatRelativeTime,
  getBadgeRarityColor
} from '@/lib/utils';
import Link from 'next/link';

export default function Dashboard() {
  const { 
    currentUser, 
    getUserAutomations, 
    getUserRedemptions, 
    getUserActivities,
    getUserTransactions,
    leaderboard,
    challenges 
  } = useAppStore();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const userAutomations = getUserAutomations(currentUser.id);
  const userRedemptions = getUserRedemptions(currentUser.id);
  const userActivities = getUserActivities(currentUser.id).slice(0, 5);
  const userTransactions = getUserTransactions(currentUser.id);
  
  const userLevel = calculateUserLevel(currentUser.creditBalance);
  const levelProgress = getLevelProgress(currentUser.creditBalance);
  
  // Calculate stats
  const totalAutomations = userAutomations.length;
  const approvedAutomations = userAutomations.filter(a => a.status === 'approved').length;
  const totalTimeSaved = userAutomations
    .filter(a => a.status === 'approved')
    .reduce((total, automation) => total + (automation.timeSavedPerExecution * automation.totalExecutions), 0);
  const totalCreditsEarned = userTransactions
    .filter(t => t.type === 'earned')
    .reduce((total, t) => total + t.amount, 0);
  
  const userRank = leaderboard.findIndex(entry => entry.userId === currentUser.id) + 1;
  const activeChallenge = challenges.find(c => c.status === 'active' && c.participants.includes(currentUser.id));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {currentUser.name.split(' ')[0]}!</h1>
            <p className="text-blue-100 mt-1">
              You&apos;re currently at Level {userLevel.level} ({userLevel.name}) with {currentUser.creditBalance} credits
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-white/90 text-sm mb-2">
                <Trophy className="h-4 w-4" />
                <span>Leaderboard Rank</span>
              </div>
              <div className="text-2xl font-bold">#{userRank || 'N/A'}</div>
            </div>
          </div>
        </div>
        
        {levelProgress.nextLevel && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-blue-100 mb-2">
              <span>Progress to {levelProgress.nextLevel.name}</span>
              <span>{levelProgress.creditsToNext} credits needed</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${levelProgress.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Automations</p>
              <p className="text-2xl font-bold text-gray-900">{totalAutomations}</p>
              <p className="text-xs text-green-600 mt-1">
                {approvedAutomations} approved
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Time Saved</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(totalTimeSaved)}</p>
              <p className="text-xs text-blue-600 mt-1">
                {Math.round(totalTimeSaved / 60)} hours total
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Credits Earned</p>
              <p className="text-2xl font-bold text-gray-900">{totalCreditsEarned}</p>
              <p className="text-xs text-purple-600 mt-1">
                {currentUser.creditBalance} available
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Redemptions</p>
              <p className="text-2xl font-bold text-gray-900">{userRedemptions.length}</p>
              <p className="text-xs text-orange-600 mt-1">
                {userRedemptions.filter(r => r.status === 'pending').length} pending
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Gift className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Link 
                href="/profile?tab=activity"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {userActivities.length > 0 ? (
              <div className="space-y-4">
                {userActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        {activity.type === 'automation_submitted' && <Zap className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'automation_approved' && <TrendingUp className="h-4 w-4 text-green-600" />}
                        {activity.type === 'badge_earned' && <Star className="h-4 w-4 text-yellow-600" />}
                        {activity.type === 'redemption_approved' && <Gift className="h-4 w-4 text-purple-600" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{formatRelativeTime(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400">Submit an automation to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Badges */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/automations/new"
                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">Submit Automation</span>
              </Link>
              
              <Link
                href="/rewards"
                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Gift className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">Browse Rewards</span>
              </Link>
              
              <Link
                href="/leaderboard"
                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">View Leaderboard</span>
              </Link>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Badges</h3>
              <Link 
                href="/profile?tab=badges"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>
            
            {currentUser.badges.length > 0 ? (
              <div className="space-y-3">
                {currentUser.badges.slice(0, 3).map((badge) => (
                  <div key={badge.id} className="flex items-center space-x-3">
                    <div className="text-2xl">{badge.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{badge.name}</p>
                      <p className="text-xs text-gray-500">{badge.description}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeRarityColor(badge.rarity)}`}>
                      {badge.rarity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No badges yet</p>
                <p className="text-xs text-gray-400">Complete automations to earn badges!</p>
              </div>
            )}
          </div>

          {/* Active Challenge */}
          {activeChallenge && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">Active Challenge</h3>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{activeChallenge.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{activeChallenge.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Reward: {activeChallenge.reward} credits</span>
                <span className="font-medium text-yellow-700">Ends {formatRelativeTime(activeChallenge.endDate)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
