'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { 
  Plus, 
  Search, 
  Filter, 
  Zap, 
  Clock, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { 
  formatDuration, 
  formatRelativeTime,
  getStatusColor,
  calculateCredits
} from '@/lib/utils';
import Link from 'next/link';
import { AUTOMATION_CATEGORIES } from '@/types';

export default function AutomationsPage() {
  const { currentUser, getUserAutomations } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const userAutomations = getUserAutomations(currentUser.id);
  
  // Filter automations
  const filteredAutomations = userAutomations.filter(automation => {
    const matchesSearch = automation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         automation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         automation.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || automation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Automations</h1>
          <p className="text-gray-600 mt-1">Track your automation submissions and their impact</p>
        </div>
        <Link
          href="/automations/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Submit New</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Submitted</p>
              <p className="text-xl font-bold text-gray-900">{userAutomations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-xl font-bold text-gray-900">
                {userAutomations.filter(a => a.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">
                {userAutomations.filter(a => a.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Time Saved</p>
              <p className="text-xl font-bold text-gray-900">
                {formatDuration(
                  userAutomations
                    .filter(a => a.status === 'approved')
                    .reduce((total, a) => total + (a.timeSavedPerExecution * a.totalExecutions), 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search automations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Automations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredAutomations.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredAutomations.map((automation) => (
              <div key={automation.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{automation.title}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(automation.status)}`}>
                        {getStatusIcon(automation.status)}
                        <span className="ml-1 capitalize">{automation.status}</span>
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{automation.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Category: {automation.category}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Saves {formatDuration(automation.timeSavedPerExecution)} per use</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="h-4 w-4" />
                        <span>Used {automation.totalExecutions} times</span>
                      </div>
                      <div>
                        <span>Submitted {formatRelativeTime(automation.submissionDate)}</span>
                      </div>
                    </div>

                    {automation.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {automation.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ml-6 text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {automation.creditsEarned} credits
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDuration(automation.timeSavedPerExecution * automation.totalExecutions)} total saved
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No automations found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? "Try adjusting your search or filter criteria."
                : "Get started by submitting your first automation!"
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link
                href="/automations/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Submit Automation</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
