export type StatCard = {
  label: string;
  value: string;
  color: string;
  icon: "trophy-outline" | "flag-outline" | "trending-up-outline";
};

export type TaskItem = {
  id: number;
  title: string;
  description?: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  progress: number;
  status: string;
  dueLabel: string;
};

export type PlanItem = {
  time: string;
  task: string;
  completed: boolean;
};

export type SkillMetric = {
  name: string;
  level: number;
};

export type GoalItem = {
  id: number;
  title: string;
  category: string;
  progress: number;
  target: string;
  current: string;
  deadline: string;
  milestones: Array<{ name: string; completed: boolean }>;
};

export type Recommendation = {
  title: string;
  reason: string;
  priority: "High" | "Medium";
  category: string;
};

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  time: string;
  type: "achievement" | "task" | "ai" | "event";
  read: boolean;
};

export type CalendarEvent = {
  id: number;
  day: number;
  title: string;
  time: string;
  category: string;
  location?: string;
};

export type CareerPhase = {
  id: number;
  title: string;
  period: string;
  status: "In Progress" | "Upcoming";
  progress: number;
  milestones: Array<{
    title: string;
    description: string;
    progress: number;
    completed: boolean;
  }>;
};

export const dashboardStats: StatCard[] = [
  {
    label: "Current Score",
    value: "450",
    color: "#D97706",
    icon: "trophy-outline",
  },
  {
    label: "Active Goals",
    value: "3",
    color: "#2563EB",
    icon: "flag-outline",
  },
  {
    label: "Week Streak",
    value: "12",
    color: "#16A34A",
    icon: "trending-up-outline",
  },
];

export const ongoingTasks: TaskItem[] = [
  {
    id: 1,
    title: "Complete React assignment",
    description: "Build a task manager with React hooks",
    category: "Academic",
    priority: "High",
    progress: 75,
    status: "In Progress",
    dueLabel: "Today, 5:00 PM",
  },
  {
    id: 2,
    title: "Practice LeetCode problems",
    description: "Focus on dynamic programming",
    category: "Technical",
    priority: "Medium",
    progress: 40,
    status: "In Progress",
    dueLabel: "Tomorrow",
  },
  {
    id: 3,
    title: "Behavioral interview prep",
    description: "Prepare STAR responses",
    category: "Soft Skills",
    priority: "Medium",
    progress: 20,
    status: "Not Started",
    dueLabel: "March 20",
  },
];

export const completedTasks: TaskItem[] = [
  {
    id: 4,
    title: "Data structures quiz",
    category: "Academic",
    priority: "Low",
    progress: 100,
    status: "Completed",
    dueLabel: "Completed March 17",
  },
  {
    id: 5,
    title: "Code review session",
    category: "Technical",
    priority: "Low",
    progress: 100,
    status: "Completed",
    dueLabel: "Completed March 17",
  },
];

export const todayPlan: PlanItem[] = [
  { time: "9:00 AM", task: "Review data structures", completed: true },
  { time: "11:00 AM", task: "Code review session", completed: true },
  { time: "2:00 PM", task: "React assignment", completed: false },
  { time: "4:00 PM", task: "LeetCode practice", completed: false },
];

export const technicalSkills: SkillMetric[] = [
  { name: "Code Understanding", level: 75 },
  { name: "Debugging Reasoning", level: 65 },
  { name: "Algorithmic Thinking", level: 70 },
  { name: "Git Concept Knowledge", level: 80 },
];

export const softSkills: SkillMetric[] = [
  { name: "Professional Communication", level: 60 },
  { name: "Behavioral Interview Skills", level: 50 },
  { name: "Reflection and Self Assessment", level: 70 },
];

export const goals: GoalItem[] = [
  {
    id: 1,
    title: "Master Data Structures & Algorithms",
    category: "Technical Skills",
    progress: 65,
    target: "Solve 100 problems",
    current: "65 problems solved",
    deadline: "June 2026",
    milestones: [
      { name: "Arrays & Strings", completed: true },
      { name: "Trees & Graphs", completed: true },
      { name: "Dynamic Programming", completed: false },
      { name: "Advanced Topics", completed: false },
    ],
  },
  {
    id: 2,
    title: "Build Professional Portfolio",
    category: "Career Development",
    progress: 45,
    target: "5 projects",
    current: "2 projects completed",
    deadline: "May 2026",
    milestones: [
      { name: "Personal website", completed: true },
      { name: "Full-stack app", completed: true },
      { name: "Mobile app", completed: false },
      { name: "Open source contribution", completed: false },
    ],
  },
  {
    id: 3,
    title: "Interview Preparation",
    category: "Soft Skills",
    progress: 30,
    target: "Be interview ready",
    current: "Behavioral prep in progress",
    deadline: "April 2026",
    milestones: [
      { name: "Resume optimization", completed: true },
      { name: "Behavioral questions", completed: false },
      { name: "Mock interviews", completed: false },
      { name: "Communication skills", completed: false },
    ],
  },
];

export const recommendations: Recommendation[] = [
  {
    title: "Practice More Dynamic Programming",
    reason: "Your algorithm score will improve by focusing on DP patterns.",
    priority: "High",
    category: "Technical",
  },
  {
    title: "Run More Mock Interviews",
    reason: "STAR-style practice will raise your confidence before interview season.",
    priority: "Medium",
    category: "Soft Skills",
  },
  {
    title: "Contribute to Open Source",
    reason: "This is a good path to strengthen Git workflow and collaboration.",
    priority: "Medium",
    category: "Career",
  },
];

export const notificationSeed: NotificationItem[] = [
  {
    id: 1,
    type: "achievement",
    title: "New Achievement Unlocked",
    message: "You completed 50% of your DSA milestone.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "task",
    title: "Task Due Soon",
    message: "React assignment is due in 3 hours.",
    time: "3 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "ai",
    title: "AURA Recommendation",
    message: "Try a harder algorithmic problem to keep your streak strong.",
    time: "5 hours ago",
    read: true,
  },
  {
    id: 4,
    type: "event",
    title: "Upcoming Event",
    message: "Mock interview session scheduled for tomorrow.",
    time: "Yesterday",
    read: true,
  },
  {
    id: 5,
    type: "achievement",
    title: "Streak Milestone",
    message: "Congratulations on maintaining a 14-day streak.",
    time: "2 days ago",
    read: true,
  },
];

export const quickPrompts = [
  "Help me debug this code",
  "Practice behavioral interview",
  "Explain Git concepts",
  "Career roadmap advice",
];

export const dailyEvents: CalendarEvent[] = [
  {
    id: 1,
    day: 19,
    title: "React Assignment Due",
    time: "5:00 PM",
    category: "Academic",
  },
  {
    id: 2,
    day: 19,
    title: "LeetCode Practice",
    time: "8:00 PM",
    category: "Technical",
  },
  {
    id: 3,
    day: 20,
    title: "Mock Interview Session",
    time: "2:00 PM",
    category: "Soft Skills",
    location: "Online - Zoom",
  },
  {
    id: 4,
    day: 21,
    title: "Career Fair",
    time: "10:00 AM",
    category: "Career",
    location: "University Hall",
  },
  {
    id: 5,
    day: 22,
    title: "Algorithm Study Group",
    time: "6:00 PM",
    category: "Technical",
    location: "Library Room 301",
  },
];

export const careerPhases: CareerPhase[] = [
  {
    id: 1,
    title: "Foundation Building",
    period: "Q1 2026 (Current)",
    status: "In Progress",
    progress: 70,
    milestones: [
      {
        title: "Master DSA",
        description: "Complete 100 LeetCode problems covering core topics.",
        progress: 65,
        completed: false,
      },
      {
        title: "Build Portfolio Projects",
        description: "Create 3 polished projects that show your strengths.",
        progress: 50,
        completed: false,
      },
      {
        title: "Learn System Design Basics",
        description: "Study scalability, APIs, and storage trade-offs.",
        progress: 10,
        completed: false,
      },
    ],
  },
  {
    id: 2,
    title: "Skill Specialization",
    period: "Q2 2026",
    status: "Upcoming",
    progress: 0,
    milestones: [
      {
        title: "Choose a primary stack",
        description: "Commit to a depth area such as frontend or backend.",
        progress: 0,
        completed: false,
      },
      {
        title: "Build an advanced application",
        description: "Ship a project with authentication, APIs, and testing.",
        progress: 0,
        completed: false,
      },
    ],
  },
  {
    id: 3,
    title: "Professional Experience",
    period: "Q3 2026",
    status: "Upcoming",
    progress: 0,
    milestones: [
      {
        title: "Secure an internship",
        description: "Apply widely and refine your interview process.",
        progress: 0,
        completed: false,
      },
      {
        title: "Industry networking",
        description: "Attend events and build genuine professional connections.",
        progress: 0,
        completed: false,
      },
    ],
  },
];

export const termsSections = [
  {
    title: "1. Introduction",
    body:
      "AURA Guide is an AI-powered coaching and planning experience for students. By using the app, you agree to these terms and to using the product responsibly.",
  },
  {
    title: "2. Use of Services",
    body:
      "Provide accurate registration details, keep your account secure, and use the application only for lawful purposes.",
  },
  {
    title: "3. AI-Generated Content",
    body:
      "AURA can make mistakes. Treat recommendations as guidance and independently verify important decisions.",
  },
  {
    title: "4. Privacy & Data Collection",
    body:
      "The app may store profile details, tasks, goals, and interaction history in order to personalize your experience. Do not share sensitive personal data.",
  },
  {
    title: "5. Limitations of Liability",
    body:
      "AURA Guide is intended for educational and motivational use. It does not replace professional legal, medical, or career advice.",
  },
];

export class calendarEvents {
  static map(element: (event: {
    id: React.Key | null | undefined;
    month: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    day: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    time: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined
  }) => React.JSX.Element) {
    return undefined;
  }
}