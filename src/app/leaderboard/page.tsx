'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { LeaderboardEntry } from '@/types';
import { 
  Trophy, 
  Medal, 
  Award,
  TrendingUp,
  Users,
  Zap,
  Clock
} from 'lucide-react';
import { 
  formatDuration, 
  getDepartmentColor,
  getAvatarFallback
} from '@/lib/utils';

export default function LeaderboardPage() {
  const { currentUser, leaderboard, users } = useAppStore();
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');
  const [category, setCategory] = useState<'credits' | 'automations' | 'time_saved'>('credits');

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Get current user's rank
  const currentUserEntry = leaderboard.find(entry => entry.userId === currentUser.id);
  const currentUserRank = currentUserEntry?.rank || 'N/A';

  // Get top performers by department
  const departmentLeaders = users
    .filter(user => user.role === 'employee' || user.role === 'manager')
    .reduce((acc, user) => {
      const userEntry = leaderboard.find(entry => entry.userId === user.id);
      if (!userEntry) return acc;
      
      if (!acc[user.department] || userEntry.creditsEarned > acc[user.department].creditsEarned) {
        acc[user.department] = { ...userEntry, department: user.department };
      }
      return acc;
    }, {} as Record<string, LeaderboardEntry & { department: string }>);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <div className="h-6 w-6 flex items-center justify-center text-gray-500 font-bold">#{rank}</div>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (rank === 3) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600 mt-1">See how you stack up against your colleagues</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Your Rank</div>
          <div className="text-2xl font-bold text-blue-600">#{currentUserRank}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Timeframe:</span>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as 'month' | 'quarter' | 'year')}
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={category}
              onChange={(e) => setCategory(e.target.value as 'credits' | 'automations' | 'time_saved')}
            >
              <option value="credits">Credits Earned</option>
              <option value="automations">Automations Count</option>
              <option value="time_saved">Time Saved</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 3 Podium */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Performers</h2>
            
            {/* Podium */}
            <div className="flex items-end justify-center space-x-4 mb-8">
              {leaderboard.slice(0, 3).map((entry, index) => {
                const user = users.find(u => u.id === entry.userId);
                if (!user) return null;
                
                const heights = ['h-24', 'h-32', 'h-20']; // 2nd, 1st, 3rd
                const orders = [1, 0, 2]; // Reorder for podium effect
                const actualIndex = orders.indexOf(index);
                
                return (
                  <div key={entry.userId} className="flex flex-col items-center">
                    <div className="mb-3">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {getAvatarFallback(user.name)}
                        </div>
                        <div className="absolute -top-2 -right-2">
                          {getRankIcon(entry.rank)}
                        </div>
                      </div>
                    </div>
                    <div className={`${heights[actualIndex]} w-20 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg flex items-end justify-center pb-2`}>
                      <span className="text-white font-bold text-lg">#{entry.rank}</span>
                    </div>
                    <div className="mt-3 text-center">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{entry.creditsEarned} credits</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full Leaderboard */}
            <div className="space-y-3">
              {leaderboard.map((entry) => {
                const user = users.find(u => u.id === entry.userId);
                if (!user) return null;
                
                const isCurrentUser = entry.userId === currentUser.id;
                
                return (
                  <div 
                    key={entry.userId}
                    className={`flex items-center space-x-4 p-4 rounded-lg border transition-colors ${
                      isCurrentUser 
                        ? 'border-blue-200 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`px-3 py-1 rounded-full border font-medium ${getRankBadge(entry.rank)}`}>
                      #{entry.rank}
                    </div>
                    
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {getAvatarFallback(user.name)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{user.name}</span>
                        {isCurrentUser && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">You</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${getDepartmentColor(user.department)}`}>
                          {user.department}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{entry.creditsEarned} credits</div>
                      <div className="text-sm text-gray-500">
                        {entry.automationsCount} automations • {formatDuration(entry.timeSaved * 60)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side Stats */}
        <div className="space-y-6">
          {/* Department Leaders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Leaders</h3>
            <div className="space-y-3">
              {Object.values(departmentLeaders).map((leader: LeaderboardEntry & { department: string }) => {
                const user = users.find(u => u.id === leader.userId);
                if (!user) return null;
                
                return (
                  <div key={leader.userId} className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                      {getAvatarFallback(user.name)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${getDepartmentColor(user.department)}`}>
                        {user.department}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-blue-600">
                      {leader.creditsEarned}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Credits Earned</div>
                  <div className="font-bold text-gray-900">
                    {leaderboard.reduce((sum, entry) => sum + entry.creditsEarned, 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Automations</div>
                  <div className="font-bold text-gray-900">
                    {leaderboard.reduce((sum, entry) => sum + entry.automationsCount, 0)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Time Saved</div>
                  <div className="font-bold text-gray-900">
                    {formatDuration(leaderboard.reduce((sum, entry) => sum + entry.timeSaved, 0) * 60)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Active Participants</div>
                  <div className="font-bold text-gray-900">{leaderboard.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Spotlight */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🏆 Achievement Spotlight</h3>
            <p className="text-sm text-gray-600 mb-2">
              This month&apos;s top performer saved over{' '}
              <span className="font-bold text-gray-900">
                {leaderboard[0] ? formatDuration(leaderboard[0].timeSaved * 60) : '0'}
              </span>{' '}
              through automation!
            </p>
            <p className="text-xs text-gray-500">
              Keep submitting automations to climb the leaderboard!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
