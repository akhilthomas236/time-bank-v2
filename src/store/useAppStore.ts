import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  Automation, 
  Redemption, 
  Activity, 
  CreditTransaction,
  Notification,
  AppState 
} from '@/types';
import {
  mockUsers,
  mockAutomations,
  mockRedemptions,
  mockRewards,
  mockActivities,
  mockTransactions,
  mockChallenges,
  mockNotifications,
  mockLeaderboard,
  currentUser
} from '@/data/mockData';

interface AppStore extends AppState {
  // Actions
  setCurrentUser: (user: User) => void;
  updateUserCredits: (userId: string, amount: number) => void;
  addAutomation: (automation: Omit<Automation, 'id'>) => void;
  updateAutomationStatus: (automationId: string, status: 'approved' | 'rejected', managerId?: string) => void;
  approveAutomation: (automationId: string) => void;
  rejectAutomation: (automationId: string, reason?: string) => void;
  addRedemption: (redemption: Omit<Redemption, 'id'>) => void;
  updateRedemptionStatus: (redemptionId: string, status: 'approved' | 'rejected', managerComment?: string) => void;
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  addTransaction: (transaction: Omit<CreditTransaction, 'id'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  
  // Getters
  getUserAutomations: (userId: string) => Automation[];
  getUserRedemptions: (userId: string) => Redemption[];
  getUserActivities: (userId: string) => Activity[];
  getUserTransactions: (userId: string) => CreditTransaction[];
  getUserNotifications: (userId: string) => Notification[];
  getUnreadNotificationCount: (userId: string) => number;
  getPendingRedemptions: (managerId: string) => Redemption[];
  getPendingAutomations: (managerId: string) => Automation[];
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: currentUser,
      users: mockUsers,
      automations: mockAutomations,
      redemptions: mockRedemptions,
      rewards: mockRewards,
      activities: mockActivities,
      transactions: mockTransactions,
      challenges: mockChallenges,
      notifications: mockNotifications,
      leaderboard: mockLeaderboard,

      // Actions
      setCurrentUser: (user: User) => set({ currentUser: user }),

      updateUserCredits: (userId: string, amount: number) => {
        set((state) => ({
          users: state.users.map(user => 
            user.id === userId 
              ? { ...user, creditBalance: user.creditBalance + amount }
              : user
          ),
          currentUser: state.currentUser?.id === userId 
            ? { ...state.currentUser, creditBalance: state.currentUser.creditBalance + amount }
            : state.currentUser
        }));
      },

      addAutomation: (automation: Omit<Automation, 'id'>) => {
        const newAutomation: Automation = {
          ...automation,
          id: `auto-${Date.now()}`
        };
        
        set((state) => ({
          automations: [...state.automations, newAutomation]
        }));

        // Add activity
        get().addActivity({
          userId: automation.userId,
          type: 'automation_submitted',
          description: `Submitted automation: ${automation.title}`,
          timestamp: new Date(),
          metadata: { automationId: newAutomation.id }
        });
      },

      updateAutomationStatus: (automationId: string, status: 'approved' | 'rejected') => {
        set((state) => {
          const automation = state.automations.find(a => a.id === automationId);
          if (!automation) return state;

          const updatedAutomations = state.automations.map(a => 
            a.id === automationId 
              ? { ...a, status, approvalDate: new Date() }
              : a
          );

          // If approved, award credits
          if (status === 'approved') {
            get().updateUserCredits(automation.userId, automation.creditsEarned);
            
            // Add transaction
            get().addTransaction({
              userId: automation.userId,
              type: 'earned',
              amount: automation.creditsEarned,
              description: `Credits earned from ${automation.title}`,
              timestamp: new Date(),
              automationId: automationId
            });

            // Add notification
            get().addNotification({
              userId: automation.userId,
              title: 'Automation Approved!',
              message: `Your automation "${automation.title}" has been approved. You earned ${automation.creditsEarned} credits!`,
              type: 'success',
              read: false,
              timestamp: new Date()
            });
          }

          return { automations: updatedAutomations };
        });
      },

      approveAutomation: (automationId: string) => {
        get().updateAutomationStatus(automationId, 'approved');
      },

      rejectAutomation: (automationId: string, reason?: string) => {
        set((state) => {
          const automation = state.automations.find(a => a.id === automationId);
          if (!automation) return state;

          const updatedAutomations = state.automations.map(a => 
            a.id === automationId 
              ? { ...a, status: 'rejected' as const, approvalDate: new Date() }
              : a
          );

          // Add notification to user
          get().addNotification({
            userId: automation.userId,
            title: 'Automation Rejected',
            message: `Your automation "${automation.title}" was rejected. ${reason || 'Please review and resubmit.'}`,
            type: 'warning',
            read: false,
            timestamp: new Date()
          });

          return { automations: updatedAutomations };
        });
      },

      addRedemption: (redemption: Omit<Redemption, 'id'>) => {
        const newRedemption: Redemption = {
          ...redemption,
          id: `redemption-${Date.now()}`
        };
        
        set((state) => ({
          redemptions: [...state.redemptions, newRedemption]
        }));

        // Add notification to manager
        const user = get().users.find(u => u.id === redemption.userId);
        if (user?.managerId) {
          get().addNotification({
            userId: user.managerId,
            title: 'New Redemption Request',
            message: `${user.name} has requested a redemption that requires your approval.`,
            type: 'info',
            read: false,
            timestamp: new Date()
          });
        }
      },

      updateRedemptionStatus: (redemptionId: string, status: 'approved' | 'rejected', managerComment?: string) => {
        set((state) => {
          const redemption = state.redemptions.find(r => r.id === redemptionId);
          if (!redemption) return state;

          const updatedRedemptions = state.redemptions.map(r => 
            r.id === redemptionId 
              ? { ...r, status, approvalDate: new Date(), managerComment }
              : r
          );

          // If approved, deduct credits
          if (status === 'approved') {
            get().updateUserCredits(redemption.userId, -redemption.creditsCost);
            
            // Add transaction
            get().addTransaction({
              userId: redemption.userId,
              type: 'spent',
              amount: redemption.creditsCost,
              description: `Redeemed reward`,
              timestamp: new Date(),
              redemptionId: redemptionId
            });
          }

          // Add notification to user
          const reward = state.rewards.find(r => r.id === redemption.rewardId);
          get().addNotification({
            userId: redemption.userId,
            title: `Redemption ${status === 'approved' ? 'Approved' : 'Rejected'}`,
            message: status === 'approved' 
              ? `Your redemption for "${reward?.title}" has been approved!`
              : `Your redemption for "${reward?.title}" was rejected. ${managerComment || ''}`,
            type: status === 'approved' ? 'success' : 'warning',
            read: false,
            timestamp: new Date()
          });

          return { redemptions: updatedRedemptions };
        });
      },

      addActivity: (activity: Omit<Activity, 'id'>) => {
        const newActivity: Activity = {
          ...activity,
          id: `activity-${Date.now()}`
        };
        
        set((state) => ({
          activities: [...state.activities, newActivity]
        }));
      },

      addTransaction: (transaction: Omit<CreditTransaction, 'id'>) => {
        const newTransaction: CreditTransaction = {
          ...transaction,
          id: `tx-${Date.now()}`
        };
        
        set((state) => ({
          transactions: [...state.transactions, newTransaction]
        }));
      },

      markNotificationAsRead: (notificationId: string) => {
        set((state) => ({
          notifications: state.notifications.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        }));
      },

      addNotification: (notification: Omit<Notification, 'id'>) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}`
        };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }));
      },

      // Getters
      getUserAutomations: (userId: string) => {
        return get().automations.filter(a => a.userId === userId);
      },

      getUserRedemptions: (userId: string) => {
        return get().redemptions.filter(r => r.userId === userId);
      },

      getUserActivities: (userId: string) => {
        return get().activities.filter(a => a.userId === userId);
      },

      getUserTransactions: (userId: string) => {
        return get().transactions.filter(t => t.userId === userId);
      },

      getUserNotifications: (userId: string) => {
        return get().notifications
          .filter(n => n.userId === userId)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      },

      getUnreadNotificationCount: (userId: string) => {
        return get().notifications.filter(n => n.userId === userId && !n.read).length;
      },

      getPendingRedemptions: (managerId: string) => {
        const { redemptions, users } = get();
        const teamMemberIds = users
          .filter(u => u.managerId === managerId)
          .map(u => u.id);
        
        return redemptions.filter(r => 
          teamMemberIds.includes(r.userId) && r.status === 'pending'
        );
      },

      getPendingAutomations: (managerId: string) => {
        const { automations, users } = get();
        const teamMemberIds = users
          .filter(u => u.managerId === managerId)
          .map(u => u.id);
        
        return automations.filter(a => 
          teamMemberIds.includes(a.userId) && a.status === 'pending'
        );
      }
    }),
    {
      name: 'time-bank-storage',
      // Only persist essential data, not computed values
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        automations: state.automations,
        redemptions: state.redemptions,
        rewards: state.rewards,
        activities: state.activities,
        transactions: state.transactions,
        challenges: state.challenges,
        notifications: state.notifications,
        leaderboard: state.leaderboard
      })
    }
  )
);
