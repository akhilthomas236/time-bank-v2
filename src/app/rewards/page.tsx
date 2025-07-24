'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { 
  Gift, 
  Search, 
  Filter, 
  Star,
  TrendingUp,
  Clock,
  BookOpen,
  Heart,
  Monitor,
  Coffee,
  HandHeart
} from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryIcons = {
  'time-off': Clock,
  'learning': BookOpen,
  'wellness': Heart,
  'equipment': Monitor,
  'experience': Coffee,
  'charity': HandHeart
};

const categoryColors = {
  'time-off': 'bg-blue-100 text-blue-800',
  'learning': 'bg-green-100 text-green-800',
  'wellness': 'bg-pink-100 text-pink-800',
  'equipment': 'bg-purple-100 text-purple-800',
  'experience': 'bg-orange-100 text-orange-800',
  'charity': 'bg-yellow-100 text-yellow-800'
};

export default function RewardsPage() {
  const { currentUser, rewards, addRedemption } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'cost' | 'name'>('popularity');

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Filter and sort rewards
  const filteredAndSortedRewards = rewards
    .filter(reward => {
      const matchesSearch = reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           reward.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || reward.category === selectedCategory;
      return reward.available && matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'cost':
          return a.creditsCost - b.creditsCost;
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const categories = Array.from(new Set(rewards.map(r => r.category)));

  const handleRedemptionRequest = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;

    if (currentUser.creditBalance < reward.creditsCost) {
      alert('Insufficient credits for this reward!');
      return;
    }

    const confirmed = confirm(`Request redemption for "${reward.title}" (${reward.creditsCost} credits)?`);
    if (confirmed) {
      addRedemption({
        userId: currentUser.id,
        rewardId: reward.id,
        creditsCost: reward.creditsCost,
        status: 'pending',
        requestDate: new Date(),
        managerId: currentUser.managerId
      });
      alert('Redemption request submitted! Your manager will review it shortly.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rewards Catalog</h1>
          <p className="text-gray-600 mt-1">
            Redeem your credits for valuable rewards and experiences
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Your Balance</div>
          <div className="text-2xl font-bold text-blue-600">{currentUser.creditBalance} credits</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search rewards..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'popularity' | 'cost' | 'name')}
            >
              <option value="popularity">Most Popular</option>
              <option value="cost">Lowest Cost</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      {filteredAndSortedRewards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedRewards.map((reward) => {
            const CategoryIcon = categoryIcons[reward.category as keyof typeof categoryIcons] || Gift;
            const canAfford = currentUser.creditBalance >= reward.creditsCost;
            
            return (
              <div key={reward.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Image placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                  <CategoryIcon className="h-16 w-16 text-gray-400" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{reward.title}</h3>
                      <span className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        categoryColors[reward.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'
                      )}>
                        {reward.category.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{reward.popularity}%</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{reward.description}</p>
                  
                  {reward.terms && (
                    <p className="text-xs text-gray-500 mb-4 italic">{reward.terms}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-blue-600">
                      {reward.creditsCost} credits
                    </div>
                    <button
                      onClick={() => handleRedemptionRequest(reward.id)}
                      disabled={!canAfford}
                      className={cn(
                        'px-4 py-2 rounded-lg font-medium transition-colors',
                        canAfford
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      )}
                    >
                      {canAfford ? 'Redeem' : 'Not enough credits'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rewards found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategory !== 'all'
              ? "Try adjusting your search or filter criteria."
              : "Check back soon for new rewards!"
            }
          </p>
        </div>
      )}

      {/* Popular Categories */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(category => {
            const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons] || Gift;
            const categoryRewards = rewards.filter(r => r.category === category && r.available);
            const avgCost = Math.round(
              categoryRewards.reduce((sum, r) => sum + r.creditsCost, 0) / categoryRewards.length
            );
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'p-4 rounded-lg border transition-colors text-left',
                  selectedCategory === category
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <CategoryIcon className="h-8 w-8 text-gray-600 mb-2" />
                <div className="text-sm font-medium text-gray-900 capitalize">
                  {category.replace('-', ' ')}
                </div>
                <div className="text-xs text-gray-500">
                  {categoryRewards.length} items • ~{avgCost} credits
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
