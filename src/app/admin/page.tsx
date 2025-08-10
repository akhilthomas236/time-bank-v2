'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { 
  Users, 
  Zap, 
  Clock, 
  TrendingUp,
  BarChart3,
  PieChart,
  Award,
  Download,
  DollarSign,
  Target,
  Calculator,
  Briefcase,
  Star,
  Shield,
  Building,
  Activity
} from 'lucide-react';
import { 
  formatDuration, 
  formatRelativeTime,
  getDepartmentColor,
  calculateROI
} from '@/lib/utils';




export default function AdminDashboard() {
  const { 
    currentUser, 
    users, 
    automations, 
    redemptions, 
    rewards,
    transactions
  } = useAppStore();

  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<string>('overview');

  // Business Return Calculation Constants
  const HOURLY_RATES = useMemo(() => ({
    'Java': 85,
    'Mainframe': 95,
    'Data': 80,
    'DevOps': 90,
    'PO': 75,
    'BA': 70,
    'Admin': 100
  }), []);

  const AUTOMATION_DEVELOPMENT_COST_PER_HOUR = 120;
  const AVERAGE_AUTOMATION_DEVELOPMENT_HOURS = 8;
  const QUALITY_MULTIPLIER = 0.85; // 15% reduction due to errors/maintenance
  const INNOVATION_TIME_VALUE = 150; // Value per hour of innovation time freed up

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
    }, {} as Record<string, {
      users: number;
      automations: number;
      creditsEarned: number;
      timeSaved: number;
    }>);

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
      }, {} as Record<string, {
        count: number;
        timeSaved: number;
        creditsEarned: number;
      }>);

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
    }, {} as Record<string, {
      count: number;
      creditsSpent: number;
    }>);

    // Advanced Business Return Calculations
    const businessReturns = (() => {
      // 1. Enhanced ROI with department-specific rates
      const departmentROI = Object.entries(departmentStats).map(([dept, stats]) => {
        const hourlyRate = HOURLY_RATES[dept as keyof typeof HOURLY_RATES] || 75;
        const timeSavedHours = stats.timeSaved / 60;
        const costSavings = timeSavedHours * hourlyRate * QUALITY_MULTIPLIER;
        const developmentCost = stats.automations * AUTOMATION_DEVELOPMENT_COST_PER_HOUR * AVERAGE_AUTOMATION_DEVELOPMENT_HOURS;
        const netROI = costSavings - developmentCost;
        const roiPercentage = developmentCost > 0 ? (netROI / developmentCost) * 100 : 0;
        
        return {
          department: dept,
          costSavings,
          developmentCost,
          netROI,
          roiPercentage,
          paybackMonths: netROI > 0 ? developmentCost / (costSavings / 12) : 0
        };
      });

      // 2. Productivity Metrics
      const totalCostSavings = departmentROI.reduce((sum, dept) => sum + dept.costSavings, 0);
      const totalDevelopmentCost = departmentROI.reduce((sum, dept) => sum + dept.developmentCost, 0);
      const overallROI = totalDevelopmentCost > 0 ? ((totalCostSavings - totalDevelopmentCost) / totalDevelopmentCost) * 100 : 0;
      
      // 3. Efficiency Gains
      const automationAdoptionRate = (approvedAutomations / (totalUsers * 2)) * 100; // Assuming 2 automatable processes per user
      const averageTimeToValue = 2.5; // weeks (mock data)
      const processEfficiencyGain = 45; // percentage improvement (mock data)
      
      // 4. Quality & Risk Metrics
      const errorReductionPercent = 68; // Mock data
      const complianceImprovementScore = 85; // Mock data
      const riskMitigationValue = totalCostSavings * 0.15; // 15% of cost savings attributed to risk reduction
      
      // 5. Innovation & Strategic Value
      const innovationTimeHours = (totalTimeSaved / 60) * 0.3; // 30% of saved time goes to innovation
      const innovationValue = innovationTimeHours * INNOVATION_TIME_VALUE;
      const employeeSatisfactionScore = 78; // Mock data (0-100)
      const retentionImprovementPercent = 12; // Mock data
      
      // 6. Scalability Metrics
      const reusabilityIndex = approvedAutomations > 0 ? (approvedAutomations * 1.8) / approvedAutomations : 0; // Average reuse factor
      const crossDepartmentAutomations = automations.filter(a => 
        a.tags?.some(tag => tag.toLowerCase().includes('cross') || tag.toLowerCase().includes('shared'))
      ).length;
      
      // 7. Credit System Integration & Value Flow
      const creditMetrics = (() => {
        // Credit-to-dollar conversion (assuming 1 credit = $1 value)
        const creditToDollarRate = 1;
        const totalCreditValue = totalCreditsEarned * creditToDollarRate;
        const totalRedemptionValue = totalCreditsSpent * creditToDollarRate;
        
        // Credit efficiency: How much business value per credit spent
        const creditEfficiency = totalCostSavings > 0 ? totalCreditsEarned / totalCostSavings * 100 : 0;
        
        // Team engagement through credits
        const creditParticipationRate = (activeUsers / totalUsers) * 100;
        const averageCreditsPerUser = totalUsers > 0 ? totalCreditsEarned / totalUsers : 0;
        
        // Credit velocity (how quickly credits are earned and spent)
        const creditVelocity = totalCreditsEarned > 0 ? (totalCreditsSpent / totalCreditsEarned) * 100 : 0;
        
        // Department credit distribution
        const departmentCreditDistribution = Object.entries(departmentStats).map(([dept, stats]) => ({
          department: dept,
          creditsEarned: stats.creditsEarned,
          creditsPerAutomation: stats.automations > 0 ? stats.creditsEarned / stats.automations : 0,
          shareOfTotalCredits: totalCreditsEarned > 0 ? (stats.creditsEarned / totalCreditsEarned) * 100 : 0
        }));
        
        // ROI on credit investment (cost of credit system vs business value generated)
        const creditSystemOperationalCost = totalUsers * 50; // Assume $50/user/year operational cost
        const creditROI = creditSystemOperationalCost > 0 ? ((totalCostSavings - creditSystemOperationalCost) / creditSystemOperationalCost) * 100 : 0;
        
        return {
          totalCreditValue,
          totalRedemptionValue,
          creditEfficiency,
          creditParticipationRate,
          averageCreditsPerUser,
          creditVelocity,
          departmentCreditDistribution,
          creditSystemOperationalCost,
          creditROI
        };
      })();

      // 8. Future Projections
      const monthlyGrowthRate = 0.15; // 15% monthly growth in automation
      const projectedAnnualSavings = totalCostSavings * 12 * (1 + monthlyGrowthRate);
      const automationPipelineValue = pendingAutomations * AVERAGE_AUTOMATION_DEVELOPMENT_HOURS * AUTOMATION_DEVELOPMENT_COST_PER_HOUR;
      
      // 9. Credit System Analytics
      const creditSystemMetrics = (() => {
        // Credit Value Calculations
        const averageHourlyRate = Object.values(HOURLY_RATES).reduce((sum, rate) => sum + rate, 0) / Object.values(HOURLY_RATES).length;
        const totalCreditValue = totalCreditsEarned * (averageHourlyRate / 60); // Assuming 1 credit = 1 minute saved
        const totalRedemptionValue = totalCreditsSpent * (averageHourlyRate / 60);
        
        // Credit Efficiency Metrics
        const creditUtilizationRate = totalCreditsSpent > 0 ? (totalCreditsSpent / totalCreditsEarned) * 100 : 0;
        const averageCreditsPerAutomation = approvedAutomations > 0 ? totalCreditsEarned / approvedAutomations : 0;
        const creditToSavingsRatio = totalCostSavings > 0 ? totalCreditValue / totalCostSavings : 0;
        
        // Team Engagement through Credits
        const activeParticipationRate = (activeUsers / totalUsers) * 100;
        const averageCreditBalance = totalUsers > 0 ? users.reduce((sum, u) => sum + u.creditBalance, 0) / totalUsers : 0;
        const creditVelocity = totalCreditsSpent > 0 ? totalCreditsEarned / totalCreditsSpent : 0; // How fast credits are used
        
        // Department Credit Distribution
        const departmentCreditDistribution = Object.entries(departmentStats).map(([dept, stats]) => {
          const deptUsers = users.filter(u => u.department === dept);
          const deptCreditBalance = deptUsers.reduce((sum, u) => sum + u.creditBalance, 0);
          const deptCreditValue = stats.creditsEarned * (averageHourlyRate / 60);
          
          return {
            department: dept,
            totalCreditsEarned: stats.creditsEarned,
            currentCreditBalance: deptCreditBalance,
            creditValue: deptCreditValue,
            averageCreditsPerUser: deptUsers.length > 0 ? stats.creditsEarned / deptUsers.length : 0,
            creditUtilization: stats.creditsEarned > 0 ? ((stats.creditsEarned - deptCreditBalance) / stats.creditsEarned) * 100 : 0
          };
        });
        
        // Reward Category Impact
        const rewardCategoryROI = Object.entries(rewardUsage).map(([category, usage]) => {
          const categoryValue = usage.creditsSpent * (averageHourlyRate / 60);
          // Estimate productivity boost from different reward categories
          const productivityMultipliers = {
            'professional-development': 1.3,
            'wellness': 1.15,
            'team-building': 1.2,
            'recognition': 1.1,
            'time-off': 1.25
          };
          const multiplier = productivityMultipliers[category as keyof typeof productivityMultipliers] || 1.1;
          const estimatedProductivityGain = categoryValue * multiplier;
          
          return {
            category,
            redemptions: usage.count,
            creditsSpent: usage.creditsSpent,
            monetaryValue: categoryValue,
            estimatedProductivityGain,
            roi: ((estimatedProductivityGain - categoryValue) / categoryValue) * 100
          };
        });
        
        // Credit System ROI
        const creditSystemDevelopmentCost = 50000; // Estimated platform development cost
        const creditSystemMaintenanceCost = 5000; // Monthly maintenance
        const creditSystemBenefits = totalCreditValue + (innovationValue * 0.2); // Direct value + 20% of innovation value
        const creditSystemROI = ((creditSystemBenefits - creditSystemDevelopmentCost) / creditSystemDevelopmentCost) * 100;
        
        return {
          totalCreditValue,
          totalRedemptionValue,
          creditUtilizationRate,
          averageCreditsPerAutomation,
          creditToSavingsRatio,
          activeParticipationRate,
          averageCreditBalance,
          creditVelocity,
          departmentCreditDistribution,
          rewardCategoryROI,
          creditSystemROI,
          creditSystemDevelopmentCost,
          creditSystemBenefits
        };
      })();

      // 10. Team Engagement Metrics
      const teamEngagementMetrics = (() => {
        const automationsPerUser = totalUsers > 0 ? totalAutomations / totalUsers : 0;
        const topContributors = users
          .map(user => {
            const userAutomations = automations.filter(a => a.userId === user.id && a.status === 'approved');
            const userCreditsEarned = userAutomations.reduce((sum, a) => sum + a.creditsEarned, 0);
            const userTimeSaved = userAutomations.reduce((sum, a) => sum + (a.timeSavedPerExecution * a.totalExecutions), 0);
            return {
              ...user,
              automationCount: userAutomations.length,
              creditsEarned: userCreditsEarned,
              timeSaved: userTimeSaved,
              engagementScore: (userAutomations.length * 10) + (userCreditsEarned * 0.1) + (userTimeSaved * 0.01)
            };
          })
          .sort((a, b) => b.engagementScore - a.engagementScore)
          .slice(0, 5);
        
        const averageEngagementScore = totalUsers > 0 ? 
          topContributors.reduce((sum, u) => sum + u.engagementScore, 0) / Math.min(totalUsers, 5) : 0;
        
        const creditEarningRate = totalUsers > 0 ? totalCreditsEarned / totalUsers : 0;
        const innovationIncentiveValue = innovationValue / totalUsers; // Value per user from innovation time
        
        return {
          automationsPerUser,
          topContributors,
          averageEngagementScore,
          creditEarningRate,
          innovationIncentiveValue
        };
      })();

      // 11. Credit Score System
      const creditScoreSystem = (() => {
        // Credit Score Calculation for each user
        const userCreditScores = users.map(user => {
          const userAutomations = automations.filter(a => a.userId === user.id);
          const approvedUserAutomations = userAutomations.filter(a => a.status === 'approved');
          const rejectedUserAutomations = userAutomations.filter(a => a.status === 'rejected');
          const userTransactions = transactions.filter(t => t.userId === user.id);
          const userRedemptions = redemptions.filter(r => r.userId === user.id);
          
          // 1. Automation Success Rate (40% weight)
          const automationSuccessRate = userAutomations.length > 0 ? 
            (approvedUserAutomations.length / userAutomations.length) * 100 : 0;
          const automationSuccessScore = Math.min(100, automationSuccessRate);
          
          // 2. Team Collaboration Score (30% weight)
          const crossDepartmentAutomations = approvedUserAutomations.filter(a => 
            a.tags?.some(tag => tag.toLowerCase().includes('cross') || tag.toLowerCase().includes('shared'))
          ).length;
          const collaborationScore = Math.min(100, 
            (crossDepartmentAutomations / Math.max(1, approvedUserAutomations.length)) * 100 +
            (approvedUserAutomations.length * 5) // Bonus for overall contribution
          );
          
          // 3. Innovation Factor (20% weight)
          const innovativeAutomations = approvedUserAutomations.filter(a => 
            a.category === 'Process Innovation' || 
            a.tags?.some(tag => tag.toLowerCase().includes('innovation') || tag.toLowerCase().includes('ai'))
          ).length;
          const complexityScore = approvedUserAutomations.reduce((sum, a) => {
            // Estimate complexity based on time saved and execution count
            const complexity = (a.timeSavedPerExecution * a.totalExecutions) / 60; // Hours saved
            return sum + Math.min(20, complexity); // Max 20 points per automation
          }, 0);
          const innovationScore = Math.min(100, 
            (innovativeAutomations * 25) + (complexityScore / Math.max(1, approvedUserAutomations.length))
          );
          
          // 4. Credit Velocity (10% weight)
          const creditsEarned = userTransactions
            .filter(t => t.type === 'earned')
            .reduce((sum, t) => sum + t.amount, 0);
          const creditsSpent = userTransactions
            .filter(t => t.type === 'spent')
            .reduce((sum, t) => sum + t.amount, 0);
          const creditUtilization = creditsEarned > 0 ? (creditsSpent / creditsEarned) * 100 : 0;
          const creditVelocityScore = Math.min(100, 
            creditUtilization > 80 ? 100 : // Optimal usage
            creditUtilization > 50 ? 80 :  // Good usage
            creditUtilization > 20 ? 60 :  // Fair usage
            40 // Low usage
          );
          
          // Calculate Overall Credit Score (0-850 scale, like FICO)
          const rawScore = 
            (automationSuccessScore * 0.40) +
            (collaborationScore * 0.30) +
            (innovationScore * 0.20) +
            (creditVelocityScore * 0.10);
          
          const creditScore = Math.round(300 + (rawScore / 100) * 550); // Scale to 300-850
          
          // Determine Credit Rating
          let creditRating = '';
          let ratingColor = '';
          if (creditScore >= 800) {
            creditRating = 'Exceptional';
            ratingColor = 'text-green-700 bg-green-100';
          } else if (creditScore >= 740) {
            creditRating = 'Very Good';
            ratingColor = 'text-blue-700 bg-blue-100';
          } else if (creditScore >= 670) {
            creditRating = 'Good';
            ratingColor = 'text-indigo-700 bg-indigo-100';
          } else if (creditScore >= 580) {
            creditRating = 'Fair';
            ratingColor = 'text-yellow-700 bg-yellow-100';
          } else {
            creditRating = 'Poor';
            ratingColor = 'text-red-700 bg-red-100';
          }
          
          // Calculate recent activity trend (last 30 days simulation)
          const recentAutomations = approvedUserAutomations.slice(-3); // Last 3 as proxy for recent
          const trend = recentAutomations.length >= 2 ? 'up' :
                       recentAutomations.length === 1 ? 'stable' : 'down';
          
          return {
            userId: user.id,
            userName: user.name,
            department: user.department,
            creditScore,
            creditRating,
            ratingColor,
            trend,
            breakdown: {
              automationSuccess: automationSuccessScore,
              collaboration: collaborationScore,
              innovation: innovationScore,
              creditVelocity: creditVelocityScore
            },
            metrics: {
              totalAutomations: userAutomations.length,
              approvedAutomations: approvedUserAutomations.length,
              successRate: automationSuccessRate,
              creditsEarned,
              creditsSpent,
              creditUtilization,
              crossDepartmentAutomations,
              innovativeAutomations
            }
          };
        });
        
        // Department Credit Score Averages
        const departmentCreditScores = Object.keys(departmentStats).map(dept => {
          const deptUsers = userCreditScores.filter(u => u.department === dept);
          const avgScore = deptUsers.length > 0 ? 
            deptUsers.reduce((sum, u) => sum + u.creditScore, 0) / deptUsers.length : 0;
          
          const scoreDistribution = {
            exceptional: deptUsers.filter(u => u.creditScore >= 800).length,
            veryGood: deptUsers.filter(u => u.creditScore >= 740 && u.creditScore < 800).length,
            good: deptUsers.filter(u => u.creditScore >= 670 && u.creditScore < 740).length,
            fair: deptUsers.filter(u => u.creditScore >= 580 && u.creditScore < 670).length,
            poor: deptUsers.filter(u => u.creditScore < 580).length
          };
          
          return {
            department: dept,
            averageScore: Math.round(avgScore),
            userCount: deptUsers.length,
            scoreDistribution,
            topPerformer: deptUsers.sort((a, b) => b.creditScore - a.creditScore)[0]
          };
        });
        
        // System-wide Credit Score Analytics
        const systemCreditAnalytics = {
          averageScore: userCreditScores.length > 0 ? 
            Math.round(userCreditScores.reduce((sum, u) => sum + u.creditScore, 0) / userCreditScores.length) : 0,
          medianScore: userCreditScores.length > 0 ? 
            userCreditScores.sort((a, b) => a.creditScore - b.creditScore)[Math.floor(userCreditScores.length / 2)]?.creditScore || 0 : 0,
          scoreDistribution: {
            exceptional: userCreditScores.filter(u => u.creditScore >= 800).length,
            veryGood: userCreditScores.filter(u => u.creditScore >= 740 && u.creditScore < 800).length,
            good: userCreditScores.filter(u => u.creditScore >= 670 && u.creditScore < 740).length,
            fair: userCreditScores.filter(u => u.creditScore >= 580 && u.creditScore < 670).length,
            poor: userCreditScores.filter(u => u.creditScore < 580).length
          },
          trends: {
            improving: userCreditScores.filter(u => u.trend === 'up').length,
            stable: userCreditScores.filter(u => u.trend === 'stable').length,
            declining: userCreditScores.filter(u => u.trend === 'down').length
          }
        };
        
        return {
          userCreditScores: userCreditScores.sort((a, b) => b.creditScore - a.creditScore),
          departmentCreditScores: departmentCreditScores.sort((a, b) => b.averageScore - a.averageScore),
          systemCreditAnalytics
        };
      })();
      
      return {
        departmentROI,
        financial: {
          totalCostSavings,
          totalDevelopmentCost,
          netROI: totalCostSavings - totalDevelopmentCost,
          overallROI,
          projectedAnnualSavings,
          riskMitigationValue
        },
        productivity: {
          automationAdoptionRate,
          averageTimeToValue,
          processEfficiencyGain,
          reusabilityIndex
        },
        quality: {
          errorReductionPercent,
          complianceImprovementScore,
          qualityScore: (errorReductionPercent + complianceImprovementScore) / 2
        },
        strategic: {
          innovationValue,
          innovationTimeHours,
          employeeSatisfactionScore,
          retentionImprovementPercent,
          crossDepartmentAutomations
        },
        future: {
          monthlyGrowthRate,
          projectedAnnualSavings,
          automationPipelineValue,
          competitiveAdvantageScore: Math.min(100, (automationAdoptionRate + processEfficiencyGain) / 2)
        },
        creditSystem: creditSystemMetrics,
        teamEngagement: teamEngagementMetrics,
        creditScores: creditScoreSystem
      };
    })();

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
      businessReturns,
      roi: calculateROI(totalTimeSaved / 60, 75) // Assuming $75/hour average
    };
  }, [users, automations, transactions, redemptions, rewards, HOURLY_RATES]);

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
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="overview">Overview</option>
            <option value="business-returns">Business Returns</option>
            <option value="credit-scores">Credit Scores</option>
            <option value="department-analysis">Department Analysis</option>
          </select>
          
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

      {/* Conditional Dashboard Views */}
      {selectedView === 'overview' && (
        <>
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
                  {Object.entries(analytics.departmentStats).map(([dept, stats]: [string, {
                    users: number;
                    automations: number;
                    creditsEarned: number;
                    timeSaved: number;
                  }]) => (
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
                    .sort((a: [string, { count: number }], b: [string, { count: number }]) => b[1].count - a[1].count)
                    .slice(0, 6)
                    .map(([category, stats]: [string, {
                      count: number;
                      timeSaved: number;
                      creditsEarned: number;
                    }]) => (
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
                    .sort((a: [string, { creditsSpent: number }], b: [string, { creditsSpent: number }]) => b[1].creditsSpent - a[1].creditsSpent)
                    .map(([category, usage]: [string, {
                      count: number;
                      creditsSpent: number;
                    }]) => (
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
        </>
      )}

      {selectedView === 'business-returns' && (
        <>
          {/* Business Returns Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Business Returns Dashboard</h2>
            <p className="text-green-100">Comprehensive analysis of automation ROI and strategic value</p>
          </div>

          {/* Financial Impact Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cost Savings</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${analytics.businessReturns.financial.totalCostSavings.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Net ROI: ${analytics.businessReturns.financial.netROI.toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall ROI</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {analytics.businessReturns.financial.overallROI.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Development Cost: ${analytics.businessReturns.financial.totalDevelopmentCost.toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Innovation Value</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${analytics.businessReturns.strategic.innovationValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {analytics.businessReturns.strategic.innovationTimeHours.toFixed(0)} hours freed
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Projected Annual Savings</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ${analytics.businessReturns.future.projectedAnnualSavings.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {(analytics.businessReturns.future.monthlyGrowthRate * 100).toFixed(1)}% monthly growth
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Department ROI Analysis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Department ROI Analysis
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.businessReturns.departmentROI.map((dept) => (
                  <div key={dept.department} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDepartmentColor(dept.department)}`}>
                          {dept.department}
                        </span>
                        <span className="text-sm text-gray-600">
                          ROI: {dept.roiPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          ${dept.netROI.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Net Return</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="font-semibold text-green-700">${dept.costSavings.toLocaleString()}</p>
                        <p className="text-green-600">Cost Savings</p>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded">
                        <p className="font-semibold text-red-700">${dept.developmentCost.toLocaleString()}</p>
                        <p className="text-red-600">Development Cost</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="font-semibold text-blue-700">{dept.roiPercentage.toFixed(1)}%</p>
                        <p className="text-blue-600">ROI Percentage</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <p className="font-semibold text-purple-700">{dept.paybackMonths.toFixed(1)}</p>
                        <p className="text-purple-600">Payback (Months)</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quality & Strategic Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quality & Risk Metrics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Quality & Risk Impact
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Error Reduction</span>
                    <span className="text-sm font-bold text-green-600">
                      {analytics.businessReturns.quality.errorReductionPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${analytics.businessReturns.quality.errorReductionPercent}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Compliance Score</span>
                    <span className="text-sm font-bold text-blue-600">
                      {analytics.businessReturns.quality.complianceImprovementScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${analytics.businessReturns.quality.complianceImprovementScore}%` }}
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-800">Risk Mitigation Value</p>
                  <p className="text-xl font-bold text-yellow-900">
                    ${analytics.businessReturns.financial.riskMitigationValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Strategic Value */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Strategic Impact
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Automation Adoption</span>
                    <span className="text-sm font-bold text-purple-600">
                      {analytics.businessReturns.productivity.automationAdoptionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${analytics.businessReturns.productivity.automationAdoptionRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Employee Satisfaction</span>
                    <span className="text-sm font-bold text-green-600">
                      {analytics.businessReturns.strategic.employeeSatisfactionScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${analytics.businessReturns.strategic.employeeSatisfactionScore}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-blue-700">
                      {analytics.businessReturns.strategic.crossDepartmentAutomations}
                    </p>
                    <p className="text-xs text-blue-600">Cross-Dept Automations</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-orange-700">
                      {analytics.businessReturns.future.competitiveAdvantageScore.toFixed(0)}
                    </p>
                    <p className="text-xs text-orange-600">Competitive Score</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Credit System & Team Engagement Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Credit System Business Impact
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">
                    ${analytics.businessReturns.creditSystem.totalCreditValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">Total Credit Value</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics.totalCreditsEarned} credits earned
                  </p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">
                    {analytics.businessReturns.creditSystem.creditVelocity.toFixed(1)}%
                  </p>
                  <p className="text-sm text-blue-600">Credit Velocity</p>
                  <p className="text-xs text-gray-500 mt-1">
                    ${analytics.businessReturns.creditSystem.totalRedemptionValue.toLocaleString()} redeemed
                  </p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-700">
                    {analytics.businessReturns.creditSystem.activeParticipationRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-purple-600">Team Participation</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics.activeUsers} active users
                  </p>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-700">
                    {analytics.businessReturns.creditSystem.creditSystemROI.toFixed(1)}%
                  </p>
                  <p className="text-sm text-orange-600">Credit System ROI</p>
                  <p className="text-xs text-gray-500 mt-1">
                    vs ${analytics.businessReturns.creditSystem.creditSystemDevelopmentCost.toLocaleString()} ops cost
                  </p>
                </div>
              </div>

              {/* Department Credit Distribution */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Credit Distribution by Department</h4>
                <div className="space-y-3">
                  {analytics.businessReturns.creditSystem.departmentCreditDistribution
                    .sort((a: any, b: any) => b.totalCreditsEarned - a.totalCreditsEarned)
                    .map((dept: any) => (
                    <div key={dept.department} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDepartmentColor(dept.department)}`}>
                          {dept.department}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {dept.totalCreditsEarned} credits earned
                          </p>
                          <p className="text-xs text-gray-600">
                            {dept.averageCreditsPerUser.toFixed(1)} credits per user • {dept.creditUtilization.toFixed(1)}% utilized
                          </p>
                        </div>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, dept.creditUtilization)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Engagement Metrics */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4">Team Engagement Analysis</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Automation Engagement by Department</h5>
                    <div className="space-y-2">
                      {analytics.businessReturns.teamEngagement.topContributors
                        .sort((a: any, b: any) => b.engagementScore - a.engagementScore)
                        .map((user: any) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{user.name}</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDepartmentColor(user.department)}`}>
                              {user.department}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600">
                              {user.automationCount} automations • {user.creditsEarned} credits
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, user.engagementScore / 10)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 w-8">
                              {user.engagementScore.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Innovation Incentive Impact</h5>
                    <p className="text-lg font-bold text-green-700">
                      ${analytics.businessReturns.teamEngagement.innovationIncentiveValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      Value generated through credit-driven innovation (30% of total credit value)
                    </p>
                    <div className="mt-3">
                      <p className="text-sm text-gray-700">
                        Average credits per user: <span className="font-semibold">
                          {analytics.businessReturns.teamEngagement.creditEarningRate.toFixed(1)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedView === 'credit-scores' && (
        <>
          {/* Credit Scores Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Credit Score Dashboard</h2>
            <p className="text-indigo-100">Comprehensive credit scoring system based on automation success, collaboration, innovation, and credit usage</p>
          </div>

          {/* System-wide Credit Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Credit Score</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {analytics.businessReturns.creditScores.systemCreditAnalytics.averageScore}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Median: {analytics.businessReturns.creditScores.systemCreditAnalytics.medianScore}
                  </p>
                </div>
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Exceptional Scores</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.businessReturns.creditScores.systemCreditAnalytics.scoreDistribution.exceptional}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    800+ Credit Score
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Improving Trends</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {analytics.businessReturns.creditScores.systemCreditAnalytics.trends.improving}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Users with upward trend
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users Scored</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {analytics.businessReturns.creditScores.userCreditScores.length}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Active participants
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Credit Score Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Credit Score Distribution
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { 
                    range: 'Exceptional (800-850)', 
                    count: analytics.businessReturns.creditScores.systemCreditAnalytics.scoreDistribution.exceptional, 
                    color: 'bg-green-600',
                    bgColor: 'bg-green-50',
                    textColor: 'text-green-700'
                  },
                  { 
                    range: 'Very Good (740-799)', 
                    count: analytics.businessReturns.creditScores.systemCreditAnalytics.scoreDistribution.veryGood, 
                    color: 'bg-blue-600',
                    bgColor: 'bg-blue-50',
                    textColor: 'text-blue-700'
                  },
                  { 
                    range: 'Good (670-739)', 
                    count: analytics.businessReturns.creditScores.systemCreditAnalytics.scoreDistribution.good, 
                    color: 'bg-indigo-600',
                    bgColor: 'bg-indigo-50',
                    textColor: 'text-indigo-700'
                  },
                  { 
                    range: 'Fair (580-669)', 
                    count: analytics.businessReturns.creditScores.systemCreditAnalytics.scoreDistribution.fair, 
                    color: 'bg-yellow-600',
                    bgColor: 'bg-yellow-50',
                    textColor: 'text-yellow-700'
                  },
                  { 
                    range: 'Poor (300-579)', 
                    count: analytics.businessReturns.creditScores.systemCreditAnalytics.scoreDistribution.poor, 
                    color: 'bg-red-600',
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-700'
                  }
                ].map((segment) => (
                  <div key={segment.range} className={`p-4 rounded-lg ${segment.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${segment.textColor}`}>{segment.range}</span>
                      <span className={`text-sm font-semibold ${segment.textColor}`}>
                        {segment.count} users ({((segment.count / analytics.businessReturns.creditScores.userCreditScores.length) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`${segment.color} h-3 rounded-full transition-all`}
                        style={{ width: `${(segment.count / analytics.businessReturns.creditScores.userCreditScores.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performers & Department Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Credit Score Performers */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-600" />
                  Top Credit Score Performers
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analytics.businessReturns.creditScores.userCreditScores.slice(0, 10).map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.userName}</p>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDepartmentColor(user.department)}`}>
                              {user.department}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.ratingColor}`}>
                              {user.creditRating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-indigo-600">{user.creditScore}</p>
                        <div className="flex items-center space-x-1">
                          {user.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                          {user.trend === 'stable' && <div className="h-3 w-3 bg-gray-400 rounded-full" />}
                          {user.trend === 'down' && <div className="h-3 w-3 bg-red-400 rounded-full" />}
                          <span className="text-xs text-gray-500">
                            {user.metrics.approvedAutomations} automations
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Department Credit Scores */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-purple-600" />
                  Department Credit Score Averages
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analytics.businessReturns.creditScores.departmentCreditScores.map((dept) => (
                    <div key={dept.department} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDepartmentColor(dept.department)}`}>
                            {dept.department}
                          </span>
                          <span className="text-sm text-gray-600">{dept.userCount} users</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-indigo-600">{dept.averageScore}</p>
                          <p className="text-xs text-gray-500">Avg Score</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-2 text-xs">
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="font-semibold text-green-700">{dept.scoreDistribution.exceptional}</p>
                          <p className="text-green-600">Exceptional</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <p className="font-semibold text-blue-700">{dept.scoreDistribution.veryGood}</p>
                          <p className="text-blue-600">Very Good</p>
                        </div>
                        <div className="text-center p-2 bg-indigo-50 rounded">
                          <p className="font-semibold text-indigo-700">{dept.scoreDistribution.good}</p>
                          <p className="text-indigo-600">Good</p>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded">
                          <p className="font-semibold text-yellow-700">{dept.scoreDistribution.fair}</p>
                          <p className="text-yellow-600">Fair</p>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded">
                          <p className="font-semibold text-red-700">{dept.scoreDistribution.poor}</p>
                          <p className="text-red-600">Poor</p>
                        </div>
                      </div>
                      
                      {dept.topPerformer && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-600">
                            Top Performer: <span className="font-medium text-gray-900">{dept.topPerformer.userName}</span> 
                            <span className="ml-2 text-indigo-600">({dept.topPerformer.creditScore})</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Credit Score Breakdown Analysis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Credit Score Breakdown Analysis
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Understanding the factors that contribute to credit scores
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-700">Automation Success</h4>
                  <p className="text-2xl font-bold text-blue-800">40%</p>
                  <p className="text-xs text-blue-600">Weight in calculation</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Approval rate of submitted automations
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-700">Team Collaboration</h4>
                  <p className="text-2xl font-bold text-green-800">30%</p>
                  <p className="text-xs text-green-600">Weight in calculation</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Cross-department automations & contributions
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-700">Innovation Factor</h4>
                  <p className="text-2xl font-bold text-purple-800">20%</p>
                  <p className="text-xs text-purple-600">Weight in calculation</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Complexity & innovation in automations
                  </p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-700">Credit Velocity</h4>
                  <p className="text-2xl font-bold text-orange-800">10%</p>
                  <p className="text-xs text-orange-600">Weight in calculation</p>
                  <p className="text-xs text-gray-600 mt-2">
                    How effectively credits are used
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Credit Score Scale (Similar to FICO)</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[
                    { range: '800-850', label: 'Exceptional', desc: 'Automation expert with consistent high-quality contributions', color: 'text-green-700' },
                    { range: '740-799', label: 'Very Good', desc: 'Strong automation skills with good collaboration', color: 'text-blue-700' },
                    { range: '670-739', label: 'Good', desc: 'Solid automation contributor with room for growth', color: 'text-indigo-700' },
                    { range: '580-669', label: 'Fair', desc: 'Developing automation skills, needs improvement', color: 'text-yellow-700' },
                    { range: '300-579', label: 'Poor', desc: 'Limited automation activity or low success rate', color: 'text-red-700' }
                  ].map((scale) => (
                    <div key={scale.range} className="text-center">
                      <p className={`font-bold ${scale.color}`}>{scale.range}</p>
                      <p className={`text-sm font-medium ${scale.color}`}>{scale.label}</p>
                      <p className="text-xs text-gray-600 mt-1">{scale.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedView === 'department-analysis' && (
        <>
          {/* Department Analysis Header */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Department Analysis Dashboard</h2>
            <p className="text-purple-100">Deep dive into department-specific automation metrics and performance</p>
          </div>

          {/* Department Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(analytics.departmentStats).map(([dept, stats]) => {
              const deptROI = analytics.businessReturns.departmentROI.find(d => d.department === dept) || {
                department: dept,
                costSavings: 0,
                developmentCost: 0,
                netROI: 0,
                roiPercentage: 0,
                paybackMonths: 0
              };
              return (
                <div key={dept} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{dept}</h3>
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Automations</span>
                      <span className="font-semibold">{stats.automations}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Time Saved</span>
                      <span className="font-semibold">{formatDuration(stats.timeSaved)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ROI</span>
                      <span className="font-semibold text-green-600">{deptROI.roiPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cost Savings</span>
                      <span className="font-semibold text-green-600">
                        ${deptROI.costSavings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${(stats.automations / analytics.totalAutomations) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {((stats.automations / analytics.totalAutomations) * 100).toFixed(1)}% of total automations
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Department Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ROI Comparison */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Department ROI Comparison
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analytics.businessReturns.departmentROI
                    .sort((a, b) => b.roiPercentage - a.roiPercentage)
                    .map((data) => (
                    <div key={data.department} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{data.department}</span>
                        <span className="text-sm font-semibold text-green-600">{data.roiPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full transition-all"
                          style={{ width: `${Math.min(100, data.roiPercentage * 2)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        ${data.costSavings.toLocaleString()} saved • {data.paybackMonths.toFixed(1)} month payback
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Automation Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Automation Activity
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Object.entries(analytics.departmentStats)
                    .sort((a, b) => b[1].automations - a[1].automations)
                    .map(([dept, stats]) => (
                    <div key={dept} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{dept}</span>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-blue-600">{stats.automations}</span>
                          <p className="text-xs text-gray-500">{formatDuration(stats.timeSaved)}</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${(stats.automations / analytics.totalAutomations) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Department Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                Department Performance Matrix
              </h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Department</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Automations</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Time Saved</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Cost Savings</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">ROI</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Payback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(analytics.departmentStats).map(([dept, stats]) => {
                      const deptROI = analytics.businessReturns.departmentROI.find(d => d.department === dept) || {
                        department: dept,
                        costSavings: 0,
                        developmentCost: 0,
                        netROI: 0,
                        roiPercentage: 0,
                        paybackMonths: 0
                      };
                      return (
                        <tr key={dept} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium text-gray-900">{dept}</td>
                          <td className="py-3 px-4 text-right">{stats.automations}</td>
                          <td className="py-3 px-4 text-right">{formatDuration(stats.timeSaved)}</td>
                          <td className="py-3 px-4 text-right text-green-600 font-semibold">
                            ${deptROI.costSavings.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-green-600 font-semibold">
                            {deptROI.roiPercentage.toFixed(1)}%
                          </td>
                          <td className="py-3 px-4 text-right text-blue-600">
                            {deptROI.paybackMonths.toFixed(1)} months
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
