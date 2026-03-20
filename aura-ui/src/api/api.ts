import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://localhost:8080"; // local IP if testing on a device

export const api = {
  async signup(data: any) {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  async login(data: any) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    const result = await response.json();
    if (result.token) {
      await AsyncStorage.setItem("auth_token", result.token);
    }
    return result;
  },

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

  async logout() {
    await AsyncStorage.removeItem("auth_token");
  }
};
