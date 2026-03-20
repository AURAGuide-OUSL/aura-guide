import { Message, TabRoute, UserProfile } from "../types";

export const tabRoutes: TabRoute[] = ["dashboard", "aiCoach", "tasks", "goals", "profile"];

export const initialProfile: UserProfile = {
  firstName: "",
  lastName: "",
  email: "",
  university: "",
  degreeProgram: "",
  studyYear: "",
  goal: "",
  joinedDate: "",
};

export const initialMessages: Message[] = [
  {
    id: 1,
    type: "aura",
    timestamp: "Now",
    content:
      "Hello! I'm AURA, your AI life coach. I can help with career guidance, technical skills, interview prep, and academic planning. What would you like to work on today?",
  },
];
