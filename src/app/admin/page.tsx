'use client';

import { useAppStore } from '@/store/useAppStore';
import { 
  Users, 
  Zap, 
  Clock, 
  TrendingUp,
  BarChart3,
  PieChart,
  Award,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { 
  formatDuration, 
  formatRelativeTime,
  getStatusColor,
  getDepartmentColor,
  calculateROI
} from '@/lib/utils';
import { useMemo, useState } from 'react';

export default function AdminDashboard() {
  const { 
    currentUser, 
    users, 
    automations, 
    redemptions, 
    rewards,
    transactions,
    leaderboard 
  } = useAppStore();

  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');

  // Check admin access
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to view this page.</p>
        </div>
      </div>
    );
  }

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.creditBalance > 0).length;
    const totalAutomations = automations.length;
    const approvedAutomations = automations.filter(a => a.status === 'approved').length;
    const pendingAutomations = automations.filter(a => a.status === 'pending').length;
    
    const totalTimeSaved = automations
      .filter(a => a.status === 'approved')
      .reduce((total, automation) => total + (automation.timeSavedPerExecution * automation.totalExecutions), 0);
    
    const totalCreditsEarned = transactions
      .filter(t => t.type === 'earned')
      .reduce((total, t) => total + t.amount, 0);
    
    const totalCreditsSpent = transactions
      .filter(t => t.type === 'spent')
      .reduce((total, t) => total + t.amount, 0);

    const totalRedemptions = redemptions.length;
    const pendingRedemptions = redemptions.filter(r => r.status === 'pending').length;
    
    // Department breakdown
    const departmentStats = users.reduce((acc, user) => {
      if (!acc[user.department]) {
        acc[user.department] = {
          users: 0,
          automations: 0,
          creditsEarned: 0,
          timeSaved: 0
        };
      }
      acc[user.department].users++;
      
      const userAutomations = automations.filter(a => a.userId === user.id && a.status === 'approved');
      acc[user.department].automations += userAutomations.length;
      acc[user.department].creditsEarned += userAutomations.reduce((sum, a) => sum + a.creditsEarned, 0);
      acc[user.department].timeSaved += userAutomations.reduce((sum, a) => sum + (a.timeSavedPerExecution * a.totalExecutions), 0);
      
      return acc;
    }, {} as Record<string, any>);

    // Category breakdown
    const categoryStats = automations
      .filter(a => a.status === 'approved')
      .reduce((acc, automation) => {
        if (!acc[automation.category]) {
          acc[automation.category] = {
            count: 0,
            timeSaved: 0,
            creditsEarned: 0
          };
        }
        acc[automation.category].count++;
        acc[automation.category].timeSaved += automation.timeSavedPerExecution * automation.totalExecutions;
        acc[automation.category].creditsEarned += automation.creditsEarned;
        return acc;
      }, {} as Record<string, any>);

    // Reward category usage
    const rewardUsage = redemptions.reduce((acc, redemption) => {
      const reward = rewards.find(r => r.id === redemption.rewardId);
      if (reward) {
        if (!acc[reward.category]) {
          acc[reward.category] = {
            count: 0,
            creditsSpent: 0
          };
        }
        acc[reward.category].count++;
        acc[reward.category].creditsSpent += redemption.creditsCost;
      }
      return acc;
    }, {} as Record<string, any>);

    return {
      totalUsers,
      activeUsers,
      totalAutomations,
      approvedAutomations,
      pendingAutomations,
      totalTimeSaved,
      totalCreditsEarned,
      totalCreditsSpent,
      totalRedemptions,
      pendingRedemptions,
      departmentStats,
      categoryStats,
      rewardUsage,
      roi: calculateROI(totalTimeSaved / 60, 75) // Assuming $75/hour average
    };
  }, [users, automations, transactions, redemptions, rewards]);

  const departments = Object.keys(analytics.departmentStats);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">System-wide automation and credit analytics</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
              <p className="text-xs text-green-600 mt-1">
                {analytics.activeUsers} active users
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Automations</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalAutomations}</p>
              <p className="text-xs text-orange-600 mt-1">
                {analytics.pendingAutomations} pending approval
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Time Saved</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(analytics.totalTimeSaved)}</p>
              <p className="text-xs text-green-600 mt-1">
                ROI: ${analytics.roi.toLocaleString()}
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
              <p className="text-sm font-medium text-gray-600">Credit Activity</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalCreditsEarned}</p>
              <p className="text-xs text-blue-600 mt-1">
                {analytics.totalCreditsSpent} spent
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Department Performance
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(analytics.departmentStats).map(([dept, stats]: [string, any]) => (
                <div key={dept} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDepartmentColor(dept)}`}>
                        {dept}
                      </span>
                      <span className="text-sm text-gray-600">{stats.users} users</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{stats.automations} automations</p>
                      <p className="text-xs text-gray-600">{formatDuration(stats.timeSaved)} saved</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(stats.automations / analytics.totalAutomations) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Automation Categories */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Automation Categories
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {Object.entries(analytics.categoryStats)
                .sort((a: any, b: any) => b[1].count - a[1].count)
                .slice(0, 6)
                .map(([category, stats]: [string, any]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{category}</span>
                      <span className="text-sm text-gray-600">{stats.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${(stats.count / analytics.approvedAutomations) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDuration(stats.timeSaved)} • {stats.creditsEarned} credits
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Credit Usage and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit Usage by Category */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Credit Usage by Reward Category</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(analytics.rewardUsage)
                .sort((a: any, b: any) => b[1].creditsSpent - a[1].creditsSpent)
                .map(([category, usage]: [string, any]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 capitalize">{category.replace('-', ' ')}</span>
                      <span className="text-sm text-gray-600">{usage.creditsSpent} credits</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${(usage.creditsSpent / analytics.totalCreditsSpent) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{usage.count} redemptions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {analytics.pendingAutomations + analytics.pendingRedemptions} total
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Pending Automations</span>
                  <span className="text-sm text-yellow-600">{analytics.pendingAutomations}</span>
                </div>
                <div className="space-y-2">
                  {automations
                    .filter(a => a.status === 'pending')
                    .slice(0, 3)
                    .map(automation => {
                      const user = users.find(u => u.id === automation.userId);
                      return (
                        <div key={automation.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{automation.title}</p>
                            <p className="text-xs text-gray-600">by {user?.name}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(automation.submissionDate)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Pending Redemptions</span>
                  <span className="text-sm text-blue-600">{analytics.pendingRedemptions}</span>
                </div>
                <div className="space-y-2">
                  {redemptions
                    .filter(r => r.status === 'pending')
                    .slice(0, 3)
                    .map(redemption => {
                      const user = users.find(u => u.id === redemption.userId);
                      const reward = rewards.find(r => r.id === redemption.rewardId);
                      return (
                        <div key={redemption.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{reward?.title}</p>
                            <p className="text-xs text-gray-600">by {user?.name}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {redemption.creditsCost} credits
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
