import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://localhost:8080"; // local IP if testing on a device

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
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_BASE_URL}/user`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
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
