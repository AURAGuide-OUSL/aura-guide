export type CareerPhase = {
  id: number;
  title: string;
  period: string;
  status: "In Progress" | "Upcoming" | "Complete";
  progress: number;
};

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  time: string;
  type: "achievement" | "task" | "ai" | "event" | "reminder";
  read: boolean;
};

export const careerPhases: CareerPhase[] = [
  {
    id: 1,
    title: "Foundation",
    period: "Year 1–2",
    status: "Complete",
    progress: 100,
  },
  {
    id: 2,
    title: "Skill building",
    period: "Year 2–3",
    status: "In Progress",
    progress: 55,
  },
  {
    id: 3,
    title: "Industry readiness",
    period: "Year 3–4",
    status: "Upcoming",
    progress: 0,
  },
  {
    id: 4,
    title: "Internship & placement",
    period: "Final year",
    status: "Upcoming",
    progress: 0,
  },
];
