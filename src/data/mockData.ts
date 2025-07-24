import { 
  User, 
  Automation, 
  Redemption, 
  Reward, 
  Activity, 
  Badge, 
  Challenge, 
  CreditTransaction,
  LeaderboardEntry,
  Notification
} from '@/types';

// Mock Badges
export const mockBadges: Badge[] = [
  {
    id: 'badge-1',
    name: 'Automation Pioneer',
    description: 'Submitted your first automation',
    icon: '🚀',
    earnedDate: new Date('2024-01-15'),
    rarity: 'common'
  },
  {
    id: 'badge-2',
    name: 'Time Saver',
    description: 'Saved 100+ hours through automation',
    icon: '⏰',
    earnedDate: new Date('2024-03-10'),
    rarity: 'rare'
  },
  {
    id: 'badge-3',
    name: 'Efficiency Master',
    description: 'Saved 500+ hours through automation',
    icon: '⚡',
    earnedDate: new Date('2024-05-20'),
    rarity: 'epic'
  },
  {
    id: 'badge-4',
    name: 'Innovation Leader',
    description: 'Created 10+ automations',
    icon: '💡',
    earnedDate: new Date('2024-06-15'),
    rarity: 'legendary'
  }
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Thomas T',
    email: 'thomas.t@company.com',
    role: 'employee',
    department: 'Java',
    managerId: 'user-9',
    creditBalance: 450,
    level: 3,
    badges: [mockBadges[0], mockBadges[1]],
    joinDate: new Date('2024-01-01'),
    avatar: '/avatars/thomas.jpg'
  },
  {
    id: 'user-2',
    name: 'Manu S',
    email: 'manu.s@company.com',
    role: 'employee',
    department: 'Mainframe',
    managerId: 'user-9',
    creditBalance: 320,
    level: 2,
    badges: [mockBadges[0]],
    joinDate: new Date('2024-02-01'),
    avatar: '/avatars/manu.jpg'
  },
  {
    id: 'user-3',
    name: 'Aravind',
    email: 'aravind@company.com',
    role: 'employee',
    department: 'Data',
    managerId: 'user-9',
    creditBalance: 680,
    level: 4,
    badges: [mockBadges[0], mockBadges[1], mockBadges[2]],
    joinDate: new Date('2023-11-15'),
    avatar: '/avatars/aravind.jpg'
  },
  {
    id: 'user-4',
    name: 'Sachin S',
    email: 'sachin.s@company.com',
    role: 'employee',
    department: 'DevOps',
    managerId: 'user-9',
    creditBalance: 220,
    level: 2,
    badges: [mockBadges[0]],
    joinDate: new Date('2024-03-01'),
    avatar: '/avatars/sachin.jpg'
  },
  {
    id: 'user-5',
    name: 'Mathew J',
    email: 'mathew.j@company.com',
    role: 'employee',
    department: 'PO',
    managerId: 'user-9',
    creditBalance: 850,
    level: 5,
    badges: [mockBadges[0], mockBadges[1], mockBadges[2], mockBadges[3]],
    joinDate: new Date('2023-06-01'),
    avatar: '/avatars/mathew.jpg'
  },
  {
    id: 'user-6',
    name: 'Kiran',
    email: 'kiran@company.com',
    role: 'employee',
    department: 'BA',
    managerId: 'user-9',
    creditBalance: 560,
    level: 3,
    badges: [mockBadges[0], mockBadges[1]],
    joinDate: new Date('2023-08-01'),
    avatar: '/avatars/kiran.jpg'
  },
  {
    id: 'user-7',
    name: 'Arya',
    email: 'arya@company.com',
    role: 'employee',
    department: 'Java',
    managerId: 'user-9',
    creditBalance: 720,
    level: 4,
    badges: [mockBadges[0], mockBadges[1], mockBadges[2]],
    joinDate: new Date('2023-05-01'),
    avatar: '/avatars/arya.jpg'
  },
  {
    id: 'user-9',
    name: 'Alex V',
    email: 'alex.v@company.com',
    role: 'admin',
    department: 'Management',
    creditBalance: 1200,
    level: 6,
    badges: mockBadges,
    joinDate: new Date('2022-01-01'),
    avatar: '/avatars/alex.jpg'
  }
];

// Mock Rewards
export const mockRewards: Reward[] = [
  {
    id: 'reward-1',
    title: 'Personal Learning Time',
    description: '4 hours of dedicated learning time during work hours',
    category: 'learning',
    creditsCost: 150,
    available: true,
    image: '/rewards/learning.jpg',
    terms: 'Can be used for online courses, reading, or skill development. Schedule with your manager.',
    popularity: 92
  },
  {
    id: 'reward-2',
    title: 'Family Time Block',
    description: '2 hours early release for family activities',
    category: 'time-off',
    creditsCost: 120,
    available: true,
    image: '/rewards/family.jpg',
    terms: 'Must be scheduled 24 hours in advance. Subject to workload availability.',
    popularity: 88
  },
  {
    id: 'reward-3',
    title: 'Deep Work Session',
    description: '3 hours of uninterrupted focus time with no meetings',
    category: 'time-off',
    creditsCost: 100,
    available: true,
    image: '/rewards/focus.jpg',
    terms: 'Calendar will be blocked automatically. Emergency contacts only.',
    popularity: 85
  },
  {
    id: 'reward-4',
    title: 'Conference Attendance',
    description: 'Attend a professional conference or workshop',
    category: 'learning',
    creditsCost: 300,
    available: true,
    image: '/rewards/conference.jpg',
    terms: 'Must be relevant to your role. Travel time included as work hours.',
    popularity: 78
  },
  {
    id: 'reward-5',
    title: 'Wellness Hour',
    description: '1 hour wellness break for gym, walk, or meditation',
    category: 'wellness',
    creditsCost: 80,
    available: true,
    image: '/rewards/wellness.jpg',
    terms: 'Can be used daily. Schedule around meetings and deadlines.',
    popularity: 73
  },
  {
    id: 'reward-6',
    title: 'Mentorship Session',
    description: '2 hours with a senior leader for career guidance',
    category: 'learning',
    creditsCost: 200,
    available: true,
    image: '/rewards/mentorship.jpg',
    terms: 'Session will be arranged with available senior staff.',
    popularity: 69
  },
  {
    id: 'reward-7',
    title: 'Flexible Work Day',
    description: 'Work from your preferred location for one day',
    category: 'time-off',
    creditsCost: 90,
    available: true,
    image: '/rewards/remote.jpg',
    terms: 'Subject to team coordination and project requirements.',
    popularity: 81
  },
  {
    id: 'reward-8',
    title: 'Innovation Time',
    description: '4 hours to work on passion projects or new ideas',
    category: 'learning',
    creditsCost: 180,
    available: true,
    image: '/rewards/innovation.jpg',
    terms: 'Present findings to team. Could lead to new initiatives.',
    popularity: 67
  },
  {
    id: 'reward-9',
    title: 'Extended Lunch Break',
    description: '2-hour lunch break for personal errands or relaxation',
    category: 'time-off',
    creditsCost: 70,
    available: true,
    image: '/rewards/lunch.jpg',
    terms: 'Schedule around team meetings. Make up time as needed.',
    popularity: 75
  },
  {
    id: 'reward-10',
    title: 'Skill Certification',
    description: 'Company-sponsored professional certification exam',
    category: 'learning',
    creditsCost: 400,
    available: true,
    image: '/rewards/certification.jpg',
    terms: 'Must be relevant to current or future role. Study time included.',
    popularity: 84
  },
  {
    id: 'reward-11',
    title: 'Team Building Activity',
    description: 'Organize a team building event for your department',
    category: 'team',
    creditsCost: 350,
    available: true,
    image: '/rewards/team-building.jpg',
    terms: 'Must coordinate with HR and team members. Company will cover expenses.',
    popularity: 76
  },
  {
    id: 'reward-12',
    title: 'Volunteer Time (Full Day)',
    description: 'Full paid day to volunteer for a cause you care about',
    category: 'community',
    creditsCost: 320,
    available: true,
    image: '/rewards/volunteer.jpg',
    terms: 'Must be with a registered non-profit organization.',
    popularity: 68
  },
  {
    id: 'reward-13',
    title: 'Executive Lunch',
    description: 'One-on-one lunch meeting with C-level executive',
    category: 'networking',
    creditsCost: 500,
    available: true,
    image: '/rewards/executive-lunch.jpg',
    terms: 'Subject to executive availability. Career focused discussion.',
    popularity: 91
  },
  {
    id: 'reward-14',
    title: 'Work Anniversary Celebration',
    description: 'Company-sponsored celebration for work anniversary',
    category: 'recognition',
    creditsCost: 200,
    available: true,
    image: '/rewards/anniversary.jpg',
    terms: 'For significant work anniversaries (3+ years).',
    popularity: 82
  },
  {
    id: 'reward-15',
    title: 'Innovation Showcase',
    description: 'Present your project to the entire company',
    category: 'recognition',
    creditsCost: 150,
    available: true,
    image: '/rewards/showcase.jpg',
    terms: 'Project must be approved by innovation committee.',
    popularity: 73
  }
];

// Mock Automations
export const mockAutomations: Automation[] = [
  {
    id: 'auto-1',
    userId: 'user-1',
    title: 'Automated Java Unit Test Generation',
    description: 'Created a script that automatically generates unit tests for Java classes using reflection and templates',
    category: 'Code Generation',
    timeSavedPerExecution: 120,
    frequency: 'weekly',
    totalExecutions: 12,
    creditsEarned: 240,
    status: 'approved',
    submissionDate: new Date('2024-01-15'),
    approvalDate: new Date('2024-01-17'),
    evidence: ['test-generator-script.java', 'before-after-comparison.pdf'],
    tags: ['java', 'testing', 'automation']
  },
  {
    id: 'auto-2',
    userId: 'user-2',
    title: 'Mainframe Job Monitoring Automation',
    description: 'Automated monitoring and alerting system for mainframe batch jobs with SMS notifications',
    category: 'Monitoring',
    timeSavedPerExecution: 45,
    frequency: 'daily',
    totalExecutions: 60,
    creditsEarned: 450,
    status: 'approved',
    submissionDate: new Date('2024-02-10'),
    approvalDate: new Date('2024-02-12'),
    evidence: ['job-monitor-cobol.cbl'],
    tags: ['mainframe', 'monitoring', 'cobol']
  },
  {
    id: 'auto-3',
    userId: 'user-3',
    title: 'Data Pipeline Validation Automation',
    description: 'Automated data quality checks and validation for ETL pipelines with detailed reporting',
    category: 'Data Processing',
    timeSavedPerExecution: 30,
    frequency: 'daily',
    totalExecutions: 45,
    creditsEarned: 225,
    status: 'approved',
    submissionDate: new Date('2024-03-05'),
    approvalDate: new Date('2024-03-07'),
    evidence: ['data-validation-pipeline.py'],
    tags: ['data', 'etl', 'validation']
  },
  {
    id: 'auto-4',
    userId: 'user-4',
    title: 'Docker Container Health Check Automation',
    description: 'Automated health monitoring and restart mechanism for containerized applications',
    category: 'DevOps',
    timeSavedPerExecution: 15,
    frequency: 'daily',
    totalExecutions: 90,
    creditsEarned: 225,
    status: 'approved',
    submissionDate: new Date('2024-04-01'),
    approvalDate: new Date('2024-04-03'),
    evidence: ['health-check-script.sh'],
    tags: ['devops', 'docker', 'monitoring']
  },
  {
    id: 'auto-5',
    userId: 'user-5',
    title: 'Sprint Planning Task Distribution',
    description: 'Automated task assignment and capacity planning for sprint ceremonies',
    category: 'Project Management',
    timeSavedPerExecution: 60,
    frequency: 'weekly',
    totalExecutions: 8,
    creditsEarned: 80,
    status: 'pending',
    submissionDate: new Date('2024-07-15'),
    evidence: ['sprint-automation-tool.xlsx'],
    tags: ['agile', 'planning', 'scrum']
  },
  {
    id: 'auto-6',
    userId: 'user-6',
    title: 'Requirements Traceability Matrix Generator',
    description: 'Automated generation of traceability matrix from requirements to test cases',
    category: 'Documentation',
    timeSavedPerExecution: 90,
    frequency: 'weekly',
    totalExecutions: 6,
    creditsEarned: 90,
    status: 'approved',
    submissionDate: new Date('2024-06-10'),
    approvalDate: new Date('2024-06-12'),
    evidence: ['rtm-generator.py'],
    tags: ['ba', 'requirements', 'traceability']
  },
  {
    id: 'auto-7',
    userId: 'user-7',
    title: 'Code Review Checklist Automation',
    description: 'Automated code quality checks and review checklist generation for Java projects',
    category: 'Code Quality',
    timeSavedPerExecution: 25,
    frequency: 'daily',
    totalExecutions: 40,
    creditsEarned: 200,
    status: 'approved',
    submissionDate: new Date('2024-05-20'),
    approvalDate: new Date('2024-05-22'),
    evidence: ['code-review-automation.java'],
    tags: ['java', 'code-review', 'quality']
  }
];

// Mock Redemptions
export const mockRedemptions: Redemption[] = [
  {
    id: 'redemption-1',
    userId: 'user-1',
    rewardId: 'reward-1',
    creditsCost: 150,
    status: 'approved',
    requestDate: new Date('2024-06-01'),
    approvalDate: new Date('2024-06-03'),
    managerComment: 'Great choice for skill development!',
    managerId: 'user-5'
  },
  {
    id: 'redemption-2',
    userId: 'user-2',
    rewardId: 'reward-2',
    creditsCost: 120,
    status: 'pending',
    requestDate: new Date('2024-07-10'),
    managerId: 'user-6'
  },
  {
    id: 'redemption-3',
    userId: 'user-3',
    rewardId: 'reward-3',
    creditsCost: 100,
    status: 'approved',
    requestDate: new Date('2024-05-15'),
    approvalDate: new Date('2024-05-17'),
    managerComment: 'Well deserved focus time after all your automation work!',
    managerId: 'user-7'
  },
  {
    id: 'redemption-4',
    userId: 'user-4',
    rewardId: 'reward-5',
    creditsCost: 80,
    status: 'approved',
    requestDate: new Date('2024-07-01'),
    approvalDate: new Date('2024-07-02'),
    managerComment: 'Wellness is important - approved!',
    managerId: 'user-8'
  },
  {
    id: 'redemption-5',
    userId: 'user-1',
    rewardId: 'reward-4',
    creditsCost: 300,
    status: 'pending',
    requestDate: new Date('2024-07-20'),
    managerId: 'user-5'
  }
];

// Mock Activities
export const mockActivities: Activity[] = [
  {
    id: 'activity-1',
    userId: 'user-1',
    type: 'automation_submitted',
    description: 'Submitted automation: Database Backup Verification',
    timestamp: new Date('2024-04-01'),
    metadata: { automationId: 'auto-4' }
  },
  {
    id: 'activity-2',
    userId: 'user-1',
    type: 'automation_approved',
    description: 'Automation approved: Database Backup Verification',
    timestamp: new Date('2024-04-03'),
    metadata: { automationId: 'auto-4', creditsEarned: 225 }
  },
  {
    id: 'activity-3',
    userId: 'user-2',
    type: 'badge_earned',
    description: 'Earned badge: Automation Pioneer',
    timestamp: new Date('2024-02-12'),
    metadata: { badgeId: 'badge-1' }
  },
  {
    id: 'activity-4',
    userId: 'user-3',
    type: 'redemption_approved',
    description: 'Redemption approved: Ergonomic Chair',
    timestamp: new Date('2024-05-17'),
    metadata: { redemptionId: 'redemption-3' }
  }
];

// Mock Credit Transactions
export const mockTransactions: CreditTransaction[] = [
  {
    id: 'tx-1',
    userId: 'user-1',
    type: 'earned',
    amount: 240,
    description: 'Credits earned from Automated Test Report Generation',
    timestamp: new Date('2024-01-17'),
    automationId: 'auto-1'
  },
  {
    id: 'tx-2',
    userId: 'user-1',
    type: 'spent',
    amount: 150,
    description: 'Redeemed Personal Learning Time',
    timestamp: new Date('2024-06-03'),
    redemptionId: 'redemption-1'
  },
  {
    id: 'tx-3',
    userId: 'user-2',
    type: 'earned',
    amount: 450,
    description: 'Credits earned from Social Media Content Scheduler',
    timestamp: new Date('2024-02-12'),
    automationId: 'auto-2'
  },
  {
    id: 'tx-4',
    userId: 'user-3',
    type: 'earned',
    amount: 225,
    description: 'Credits earned from Lead Qualification Automation',
    timestamp: new Date('2024-03-07'),
    automationId: 'auto-3'
  },
  {
    id: 'tx-5',
    userId: 'user-3',
    type: 'spent',
    amount: 100,
    description: 'Redeemed Deep Work Session',
    timestamp: new Date('2024-05-17'),
    redemptionId: 'redemption-3'
  },
  {
    id: 'tx-6',
    userId: 'user-1',
    type: 'earned',
    amount: 225,
    description: 'Credits earned from Database Backup Verification',
    timestamp: new Date('2024-04-03'),
    automationId: 'auto-4'
  },
  {
    id: 'tx-7',
    userId: 'user-4',
    type: 'spent',
    amount: 80,
    description: 'Redeemed Wellness Hour',
    timestamp: new Date('2024-07-02'),
    redemptionId: 'redemption-4'
  }
];

// Mock Challenges
export const mockChallenges: Challenge[] = [
  {
    id: 'challenge-1',
    title: 'July Automation Sprint',
    description: 'Submit 3 automations this month and earn bonus credits!',
    type: 'individual',
    target: 3,
    metric: 'automations',
    reward: 100,
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-07-31'),
    participants: ['user-1', 'user-2', 'user-3', 'user-4'],
    status: 'active'
  },
  {
    id: 'challenge-2',
    title: 'Engineering Team Time Saver',
    description: 'Save 200 hours collectively as a team',
    type: 'team',
    target: 200,
    metric: 'time_saved',
    reward: 500,
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-08-31'),
    participants: ['user-1', 'user-5'],
    status: 'active'
  }
];

// Mock Leaderboard
export const mockLeaderboard: LeaderboardEntry[] = [
  {
    userId: 'user-9',
    userName: 'Alex V',
    department: 'Management',
    creditsEarned: 1200,
    automationsCount: 12,
    timeSaved: 120,
    rank: 1
  },
  {
    userId: 'user-5',
    userName: 'Mathew J',
    department: 'PO',
    creditsEarned: 850,
    automationsCount: 8,
    timeSaved: 85,
    rank: 2
  },
  {
    userId: 'user-7',
    userName: 'Arya',
    department: 'Java',
    creditsEarned: 720,
    automationsCount: 11,
    timeSaved: 72,
    rank: 3
  },
  {
    userId: 'user-3',
    userName: 'Aravind',
    department: 'Data',
    creditsEarned: 680,
    automationsCount: 9,
    timeSaved: 68,
    rank: 4
  },
  {
    userId: 'user-6',
    userName: 'Kiran',
    department: 'BA',
    creditsEarned: 560,
    automationsCount: 7,
    timeSaved: 56,
    rank: 5
  },
  {
    userId: 'user-1',
    userName: 'Thomas T',
    department: 'Java',
    creditsEarned: 450,
    automationsCount: 6,
    timeSaved: 45,
    rank: 6
  },
  {
    userId: 'user-2',
    userName: 'Manu S',
    department: 'Mainframe',
    creditsEarned: 320,
    automationsCount: 4,
    timeSaved: 32,
    rank: 7
  },
  {
    userId: 'user-4',
    userName: 'Sachin S',
    department: 'DevOps',
    creditsEarned: 220,
    automationsCount: 3,
    timeSaved: 22,
    rank: 8
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    title: 'Automation Approved!',
    message: 'Your Database Backup Verification automation has been approved. You earned 225 credits!',
    type: 'success',
    read: false,
    timestamp: new Date('2024-04-03'),
    actionUrl: '/automations/auto-4'
  },
  {
    id: 'notif-2',
    userId: 'user-2',
    title: 'Redemption Pending',
    message: 'Your Extra PTO Day request is awaiting manager approval.',
    type: 'info',
    read: true,
    timestamp: new Date('2024-07-10'),
    actionUrl: '/redemptions/redemption-2'
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    title: 'New Challenge Available!',
    message: 'Join the July Automation Sprint challenge and earn bonus credits.',
    type: 'achievement',
    read: false,
    timestamp: new Date('2024-07-01'),
    actionUrl: '/challenges/challenge-1'
  }
];

// Current user (for prototype) - Let's use the admin user to test admin features
export const currentUser = mockUsers[7]; // Alex V (admin)
