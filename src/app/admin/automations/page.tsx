'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search,
  Filter,
  Download,
  Eye,
  User,
  Calendar,
  Tag,
  TrendingUp
} from 'lucide-react';
import { formatDuration, formatRelativeTime, getStatusColor } from '@/lib/utils';

export default function AdminAutomationsPage() {
  const { currentUser, users, automations, approveAutomation, rejectAutomation } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

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

  // Filter automations
  const filteredAutomations = automations.filter(automation => {
    const matchesSearch = automation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         automation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || automation.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || automation.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const pendingAutomations = filteredAutomations.filter(a => a.status === 'pending');
  const approvedAutomations = filteredAutomations.filter(a => a.status === 'approved');
  const rejectedAutomations = filteredAutomations.filter(a => a.status === 'rejected');

  // Get unique categories
  const categories = [...new Set(automations.map(a => a.category))];

  const handleApprove = (automationId: string) => {
    approveAutomation(automationId);
  };

  const handleReject = (automationId: string) => {
    rejectAutomation(automationId, 'Does not meet automation criteria');
  };

  const AutomationCard = ({ automation }: { automation: any }) => {
    const user = users.find(u => u.id === automation.userId);
    const totalTimeSaved = automation.timeSavedPerExecution * automation.totalExecutions;
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{automation.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {user?.name} • {user?.department}
              </CardDescription>
            </div>
            <Badge 
              variant={automation.status === 'approved' ? 'default' : 
                      automation.status === 'pending' ? 'secondary' : 'destructive'}
              className={getStatusColor(automation.status)}
            >
              {automation.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">{automation.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Category</span>
              <p className="font-semibold">{automation.category}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Time/Execution</span>
              <p className="font-semibold">{formatDuration(automation.timeSavedPerExecution)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Frequency</span>
              <p className="font-semibold capitalize">{automation.frequency}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Total Saved</span>
              <p className="font-semibold text-green-600">{formatDuration(totalTimeSaved)}</p>
            </div>
          </div>

          {automation.status === 'approved' && (
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Executions: </span>
                <span className="font-semibold">{automation.totalExecutions}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Credits Earned: </span>
                <span className="font-semibold text-blue-600">{automation.creditsEarned}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-4 w-4" />
            Submitted {formatRelativeTime(automation.submissionDate)}
            {automation.approvalDate && (
              <span>• Approved {formatRelativeTime(automation.approvalDate)}</span>
            )}
          </div>

          {automation.tags && automation.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-gray-400" />
              {automation.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {automation.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                onClick={() => handleApprove(automation.id)}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleReject(automation.id)}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            {automation.evidence && automation.evidence.length > 0 && (
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Evidence ({automation.evidence.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Automation Management</h1>
          <p className="text-muted-foreground">Review and manage automation submissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
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
                  placeholder="Search automations..."
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
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{pendingAutomations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{approvedAutomations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold">{rejectedAutomations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Time Saved</p>
                <p className="text-2xl font-bold">
                  {formatDuration(
                    approvedAutomations.reduce((total, a) => 
                      total + (a.timeSavedPerExecution * a.totalExecutions), 0
                    )
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingAutomations.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedAutomations.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedAutomations.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({filteredAutomations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingAutomations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Automations</h3>
                  <p className="text-gray-600">All automation submissions have been reviewed.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {pendingAutomations.map(automation => (
                <AutomationCard key={automation.id} automation={automation} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="grid gap-6">
            {approvedAutomations.map(automation => (
              <AutomationCard key={automation.id} automation={automation} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <div className="grid gap-6">
            {rejectedAutomations.map(automation => (
              <AutomationCard key={automation.id} automation={automation} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-6">
            {filteredAutomations.map(automation => (
              <AutomationCard key={automation.id} automation={automation} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
