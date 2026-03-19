export type Route =
  | "splash"
  | "signin"
  | "signup"
  | "resetPassword"
  | "onboarding"
  | "terms"
  | "dashboard"
  | "aiCoach"
  | "tasks"
  | "goals"
  | "profile"
  | "settings"
  | "notifications"
  | "calendar"
  | "careerTrack";

export type TabRoute = "dashboard" | "aiCoach" | "tasks" | "goals" | "profile";

export type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  degreeProgram: string;
  studyYear: string;
  joinedDate: string;
  goal: string;
};

export type Message = {
  id: number;
  type: "user" | "aura";
  content: string;
  timestamp: string;
  category?: string;
};
