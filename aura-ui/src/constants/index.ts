import { Message, TabRoute, UserProfile } from "../types";

export const tabRoutes: TabRoute[] = ["dashboard", "aiCoach", "tasks", "goals", "profile"];

export const initialProfile: UserProfile = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@university.edu",
  university: "University of Technology",
  degreeProgram: "Computer Science",
  studyYear: "3rd Year",
  goal: "Software Engineer",
  joinedDate: "January 2026",
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
