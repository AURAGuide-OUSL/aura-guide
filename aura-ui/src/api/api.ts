import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://localhost:8080"; // local IP if testing on a device

async function authHeaders(contentType = true) {
  const token = await AsyncStorage.getItem("auth_token");
  if (!token) throw new Error("No auth token found");
  return {
    ...(contentType ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  };
}

export const api = {
  /**
   * Register a new user with comprehensive profile data.
   * Expects: email, password, first_name, last_name, university, degree_program, study_year, goal_id
   */
  async signup(data: any) {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  /**
   * Authenticate user credentials and preserve the session token.
   * On success, the JWT token is stored in AsyncStorage for future authorized requests.
   */
  async login(data: any) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    const result = await response.json();
    
    // persist the JWT token locally so the user stays logged in
    if (result.token) {
      await AsyncStorage.setItem("auth_token", result.token);
    }
    return result;
  },

  /**
   * retrieve the authenticated user's profile information.
   * this request includes the 'Authorization' Bearer token from AsyncStorage.
   */
  async getUserProfile() {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: "GET",
      headers: await authHeaders(false),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  async updateUserProfile(data: any) {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  async getCareerPath() {
    const response = await fetch(`${API_BASE_URL}/user/careerPath`, {
      method: "GET",
      headers: await authHeaders(false),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  async getSkillScore() {
    const response = await fetch(`${API_BASE_URL}/user/skilScore`, {
      method: "GET",
      headers: await authHeaders(false),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  async getTasks() {
    const response = await fetch(`${API_BASE_URL}/task-plan/taskPlan`, {
      method: "GET",
      headers: await authHeaders(false),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  async generateTaskPlan() {
    const response = await fetch(`${API_BASE_URL}/task-plan/generatePlan`, {
      method: "GET",
      headers: await authHeaders(false),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  async addTask(data: any) {
    const response = await fetch(`${API_BASE_URL}/task-plan/tasks`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  async updateTask(taskId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/task-plan/tasks/${taskId}`, {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  async completeTask(taskId: number) {
    const response = await fetch(`${API_BASE_URL}/task-plan/tasks/${taskId}/complete`, {
      method: "PUT",
      headers: await authHeaders(false),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  async uploadCV(fileName: string, content: string) {
    const response = await fetch(`${API_BASE_URL}/aura-life-coach/cv/upload`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ file_name: fileName, content }),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  async analyzeCV() {
    const response = await fetch(`${API_BASE_URL}/aura-life-coach/cv/analyze`, {
      method: "POST",
      headers: await authHeaders(false),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  async getCVFeedback() {
    const response = await fetch(`${API_BASE_URL}/aura-life-coach/cv/feedback`, {
      method: "GET",
      headers: await authHeaders(false),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  /**
   * wipe the local authentication token to terminate the session.
   */
  async logout() {
    await AsyncStorage.removeItem("auth_token");
  }
};
