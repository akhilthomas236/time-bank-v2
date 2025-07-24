'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Award, 
  Download,
  AlertCircle,
  Target,
  Zap,
  Gift
} from 'lucide-react';
import { formatDuration, getDepartmentColor } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const { currentUser, users, automations, redemptions, rewards, transactions } = useAppStore();
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  // Check admin access
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to view this page.</p>
        </div>
      </div>
    );
  }

  // Calculate comprehensive analytics
  const analytics = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.creditBalance > 0).length,
    totalAutomations: automations.length,
    approvedAutomations: automations.filter(a => a.status === 'approved').length,
    totalTimeSaved: automations
      .filter(a => a.status === 'approved')
      .reduce((total, a) => total + (a.timeSavedPerExecution * a.totalExecutions), 0),
    totalCreditsEarned: transactions
      .filter(t => t.type === 'earned')
      .reduce((total, t) => total + t.amount, 0),
    totalCreditsSpent: transactions
      .filter(t => t.type === 'spent')
      .reduce((total, t) => total + t.amount, 0),
    totalRedemptions: redemptions.length,
    approvedRedemptions: redemptions.filter(r => r.status === 'approved').length
  };

  // Department breakdown
  const departmentStats = users.reduce((acc, user) => {
    if (!acc[user.department]) {
      acc[user.department] = {
        users: 0,
        automations: 0,
        creditsEarned: 0,
        creditsSpent: 0,
        timeSaved: 0,
        redemptions: 0
      };
    }
    acc[user.department].users++;
    
    const userAutomations = automations.filter(a => a.userId === user.id && a.status === 'approved');
    acc[user.department].automations += userAutomations.length;
    acc[user.department].creditsEarned += userAutomations.reduce((sum, a) => sum + a.creditsEarned, 0);
    acc[user.department].timeSaved += userAutomations.reduce((sum, a) => sum + (a.timeSavedPerExecution * a.totalExecutions), 0);
    
    const userRedemptions = redemptions.filter(r => r.userId === user.id);
    acc[user.department].redemptions += userRedemptions.length;
    acc[user.department].creditsSpent += userRedemptions.reduce((sum, r) => sum + r.creditsCost, 0);
    
    return acc;
  }, {} as Record<string, {
    users: number;
    automations: number;
    creditsEarned: number;
    creditsSpent: number;
    timeSaved: number;
    redemptions: number;
  }>);

  // Time-based trends (simplified monthly data)
  const monthlyData = [
    { month: 'Jan', automations: 5, timeSaved: 180, credits: 450 },
    { month: 'Feb', automations: 8, timeSaved: 240, credits: 720 },
    { month: 'Mar', automations: 12, timeSaved: 360, credits: 1080 },
    { month: 'Apr', automations: 15, timeSaved: 420, credits: 1260 },
    { month: 'May', automations: 18, timeSaved: 480, credits: 1440 },
    { month: 'Jun', automations: 22, timeSaved: 580, credits: 1740 },
    { month: 'Jul', automations: 25, timeSaved: 650, credits: 1950 }
  ];

  // Category performance
  const categoryStats = automations
    .filter(a => a.status === 'approved')
    .reduce((acc, automation) => {
      if (!acc[automation.category]) {
        acc[automation.category] = {
          count: 0,
          timeSaved: 0,
          creditsEarned: 0,
          avgTimeSaved: 0
        };
      }
      acc[automation.category].count++;
      acc[automation.category].timeSaved += automation.timeSavedPerExecution * automation.totalExecutions;
      acc[automation.category].creditsEarned += automation.creditsEarned;
      acc[automation.category].avgTimeSaved = acc[automation.category].timeSaved / acc[automation.category].count;
      return acc;
    }, {} as Record<string, {
      count: number;
      timeSaved: number;
      creditsEarned: number;
      avgTimeSaved: number;
    }>);

  // Reward category analysis
  const rewardCategoryStats = rewards.reduce((acc, reward) => {
    if (!acc[reward.category]) {
      acc[reward.category] = {
        totalRewards: 0,
        redemptions: 0,
        creditsSpent: 0,
        avgCost: 0,
        popularity: 0
      };
    }
    acc[reward.category].totalRewards++;
    acc[reward.category].popularity += reward.popularity;
    
    const rewardRedemptions = redemptions.filter(r => r.rewardId === reward.id && r.status === 'approved');
    acc[reward.category].redemptions += rewardRedemptions.length;
    acc[reward.category].creditsSpent += rewardRedemptions.reduce((sum, r) => sum + r.creditsCost, 0);
    acc[reward.category].avgCost = acc[reward.category].creditsSpent / (acc[reward.category].redemptions || 1);
    
    return acc;
  }, {} as Record<string, {
    totalRewards: number;
    redemptions: number;
    creditsSpent: number;
    avgCost: number;
    popularity: number;
  }>);

  // Top performers
  const topPerformers = users
    .map(user => {
      const userAutomations = automations.filter(a => a.userId === user.id && a.status === 'approved');
      const totalTimeSaved = userAutomations.reduce((sum, a) => sum + (a.timeSavedPerExecution * a.totalExecutions), 0);
      const creditsEarned = userAutomations.reduce((sum, a) => sum + a.creditsEarned, 0);
      
      return {
        ...user,
        automationCount: userAutomations.length,
        totalTimeSaved,
        creditsEarned
      };
    })
    .sort((a, b) => b.creditsEarned - a.creditsEarned)
    .slice(0, 10);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">Deep insights into automation impact and user engagement</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productivity Gain</p>
                <p className="text-2xl font-bold text-blue-600">{formatDuration(analytics.totalTimeSaved)}</p>
                <p className="text-xs text-green-600 mt-1">
                  ↗ +{formatDuration(580)} this month
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Credit Utilization</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((analytics.totalCreditsSpent / analytics.totalCreditsEarned) * 100)}%
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {analytics.totalCreditsSpent} / {analytics.totalCreditsEarned} credits
                </p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">User Engagement</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round((analytics.activeUsers / analytics.totalUsers) * 100)}%
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {analytics.activeUsers} of {analytics.totalUsers} users
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round((analytics.approvedAutomations / analytics.totalAutomations) * 100)}%
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {analytics.approvedAutomations} of {analytics.totalAutomations} approved
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Analysis</CardTitle>
              <CardDescription>Automation adoption and impact by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(departmentStats)
                  .sort((a: [string, { timeSaved: number }], b: [string, { timeSaved: number }]) => b[1].timeSaved - a[1].timeSaved)
                  .map(([dept, stats]: [string, {
                    users: number;
                    automations: number;
                    creditsEarned: number;
                    creditsSpent: number;
                    timeSaved: number;
                    redemptions: number;
                  }]) => (
                  <div key={dept} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDepartmentColor(dept)}`}>
                          {dept}
                        </span>
                        <span className="text-sm text-gray-600">{stats.users} users</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{formatDuration(stats.timeSaved)}</p>
                        <p className="text-sm text-gray-600">time saved</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Zap className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-blue-900">{stats.automations}</p>
                        <p className="text-xs text-blue-600">Automations</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <Award className="h-6 w-6 text-green-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-green-900">{stats.creditsEarned}</p>
                        <p className="text-xs text-green-600">Credits Earned</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <Gift className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-purple-900">{stats.creditsSpent}</p>
                        <p className="text-xs text-purple-600">Credits Spent</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-orange-900">{stats.redemptions}</p>
                        <p className="text-xs text-orange-600">Redemptions</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Category Performance</CardTitle>
              <CardDescription>Impact analysis by automation type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryStats)
                  .sort((a: [string, { timeSaved: number }], b: [string, { timeSaved: number }]) => b[1].timeSaved - a[1].timeSaved)
                  .map(([category, stats]: [string, {
                    count: number;
                    timeSaved: number;
                    creditsEarned: number;
                    avgTimeSaved: number;
                  }]) => (
                  <div key={category} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{category}</h4>
                      <p className="text-sm text-gray-600">
                        {stats.count} automations • Avg: {formatDuration(stats.avgTimeSaved)} per automation
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-lg font-bold text-green-600">{formatDuration(stats.timeSaved)}</div>
                      <div className="text-sm text-gray-600">{stats.creditsEarned} credits</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reward Category Analysis</CardTitle>
              <CardDescription>Credit spending patterns by reward type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(rewardCategoryStats)
                  .sort((a: [string, { creditsSpent: number }], b: [string, { creditsSpent: number }]) => b[1].creditsSpent - a[1].creditsSpent)
                  .map(([category, stats]: [string, {
                    totalRewards: number;
                    redemptions: number;
                    creditsSpent: number;
                    avgCost: number;
                    popularity: number;
                  }]) => (
                  <div key={category} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-semibold capitalize">{category.replace('-', ' ')}</h4>
                      <p className="text-sm text-gray-600">
                        {stats.totalRewards} rewards • {stats.redemptions} redemptions
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Avg Cost: {Math.round(stats.avgCost)} credits
                        </Badge>
                        <Badge variant="outline">
                          Popularity: {Math.round(stats.popularity / stats.totalRewards)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-lg font-bold text-purple-600">{stats.creditsSpent}</div>
                      <div className="text-sm text-gray-600">credits spent</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Growth Trends</CardTitle>
                <CardDescription>Monthly automation and productivity growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyData.map((month) => (
                    <div key={month.month} className="flex items-center gap-4">
                      <div className="w-12 text-sm font-medium text-gray-600">
                        {month.month}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Automations</span>
                          <span className="text-sm font-medium">{month.automations}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${(month.automations / 25) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Time Saved (hrs)</span>
                          <span className="text-sm font-medium">{Math.round(month.timeSaved / 60)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${(month.timeSaved / 650) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Users with highest automation impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.slice(0, 5).map((user, index) => (
                    <div key={user.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.department}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{user.automationCount} automations</p>
                        <p className="text-sm text-gray-600">{formatDuration(user.totalTimeSaved)} saved</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{user.creditsEarned}</p>
                        <p className="text-xs text-gray-600">credits</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
