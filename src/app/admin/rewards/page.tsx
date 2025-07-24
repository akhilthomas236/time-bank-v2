'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gift, 
  Users, 
  TrendingUp,
  Search,
  Download,
  Eye,
  Edit,
  Plus,
  AlertCircle,
  Award,
  Clock,
  Star
} from 'lucide-react';

import { Reward } from '@/types';

interface RewardWithAnalytics extends Reward {
  totalRedemptions: number;
  approvedRedemptions: number;
  pendingRedemptions: number;
  totalCreditsSpent: number;
  redemptionRate: number;
}

export default function AdminRewardsPage() {
  const { currentUser, rewards, redemptions } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  // Filter rewards
  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || reward.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(rewards.map(r => r.category))];

  // Calculate reward analytics
  const rewardAnalytics = rewards.map(reward => {
    const rewardRedemptions = redemptions.filter(r => r.rewardId === reward.id);
    const approvedRedemptions = rewardRedemptions.filter(r => r.status === 'approved');
    const pendingRedemptions = rewardRedemptions.filter(r => r.status === 'pending');
    const totalCreditsSpent = approvedRedemptions.reduce((sum, r) => sum + r.creditsCost, 0);
    
    return {
      ...reward,
      totalRedemptions: rewardRedemptions.length,
      approvedRedemptions: approvedRedemptions.length,
      pendingRedemptions: pendingRedemptions.length,
      totalCreditsSpent,
      redemptionRate: rewardRedemptions.length > 0 ? (approvedRedemptions.length / rewardRedemptions.length) * 100 : 0
    };
  });

  // Sort by popularity
  const popularRewards = [...rewardAnalytics].sort((a, b) => b.totalRedemptions - a.totalRedemptions);

  const RewardCard = ({ reward }: { reward: RewardWithAnalytics }) => {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{reward.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {reward.category.replace('-', ' ')}
                </Badge>
                <span>•</span>
                <span>{reward.creditsCost} credits</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-sm font-medium">{reward.popularity}%</span>
              </div>
              <Badge variant={reward.available ? 'default' : 'secondary'}>
                {reward.available ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">{reward.description}</p>
          
          {reward.terms && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Terms:</strong> {reward.terms}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Total Redemptions</span>
              <p className="text-lg font-bold text-blue-600">{reward.totalRedemptions}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Approved</span>
              <p className="text-lg font-bold text-green-600">{reward.approvedRedemptions}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Pending</span>
              <p className="text-lg font-bold text-yellow-600">{reward.pendingRedemptions}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Credits Spent</span>
              <p className="text-lg font-bold text-purple-600">{reward.totalCreditsSpent}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TrendingUp className="h-4 w-4" />
            <span>Approval Rate: {reward.redemptionRate.toFixed(1)}%</span>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit Reward
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Category analytics
  const categoryAnalytics = categories.map(category => {
    const categoryRewards = rewardAnalytics.filter(r => r.category === category);
    const totalRedemptions = categoryRewards.reduce((sum, r) => sum + r.totalRedemptions, 0);
    const totalCreditsSpent = categoryRewards.reduce((sum, r) => sum + r.totalCreditsSpent, 0);
    const avgPopularity = categoryRewards.reduce((sum, r) => sum + r.popularity, 0) / categoryRewards.length;
    
    return {
      category,
      rewardCount: categoryRewards.length,
      totalRedemptions,
      totalCreditsSpent,
      avgPopularity: avgPopularity || 0
    };
  }).sort((a, b) => b.totalRedemptions - a.totalRedemptions);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rewards Management</h1>
          <p className="text-muted-foreground">Manage non-monetary rewards and redemptions</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Reward
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Gift className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Rewards</p>
                <p className="text-2xl font-bold">{rewards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Redemptions</p>
                <p className="text-2xl font-bold">{redemptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Credits Redeemed</p>
                <p className="text-2xl font-bold">
                  {redemptions.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.creditsCost, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold">
                  {redemptions.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search rewards..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category} className="capitalize">
                  {category.replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="rewards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rewards">All Rewards</TabsTrigger>
          <TabsTrigger value="popular">Most Popular</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid gap-6">
            {filteredRewards.map(reward => {
              const analytics = rewardAnalytics.find(r => r.id === reward.id);
              return analytics ? (
                <RewardCard key={reward.id} reward={analytics} />
              ) : null;
            })}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <div className="grid gap-6">
            {popularRewards.slice(0, 10).map(reward => (
              <RewardCard key={reward.id} reward={reward} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-6">
            {categoryAnalytics.map(category => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="capitalize flex items-center justify-between">
                    {category.category.replace('-', ' ')}
                    <Badge variant="outline">
                      {category.rewardCount} rewards
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Total Redemptions</span>
                      <p className="text-xl font-bold text-blue-600">{category.totalRedemptions}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Credits Spent</span>
                      <p className="text-xl font-bold text-purple-600">{category.totalCreditsSpent}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Avg Popularity</span>
                      <p className="text-xl font-bold text-green-600">{category.avgPopularity.toFixed(1)}%</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {rewardAnalytics
                      .filter(r => r.category === category.category)
                      .map(reward => (
                        <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{reward.title}</p>
                            <p className="text-sm text-gray-600">{reward.creditsCost} credits</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{reward.totalRedemptions} redemptions</p>
                            <p className="text-sm text-gray-600">{reward.popularity}% popularity</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
