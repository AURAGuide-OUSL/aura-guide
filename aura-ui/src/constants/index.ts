import { TabRoute, UserProfile } from "../types";

export const tabRoutes: TabRoute[] = ["dashboard", "aiCoach", "tasks", "goals", "profile"];

export const initialProfile: UserProfile = {
  firstName: "",
  lastName: "",
  email: "",
  university: "",
  degreeProgram: "",
  studyYear: "",
  technicalSkillLevel: "",
  softSkillLevel: "",
  availabilityType: "",
  availabilityHours: "",
  goal: "",
  goalId: undefined,
  technicalScore: 0,
  softSkillScore: 0,
  currentScore: 0,
  recommendation: "",
  joinedDate: "",
};
