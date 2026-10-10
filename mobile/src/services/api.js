import { Platform } from "react-native";

// On web / simulator, localhost works; on Android emulator 10.0.2.2 is standard.
// On physical devices using Expo Go, change this or it automatically attempts local host.
const BASE_URL = Platform.select({
  android: "http://10.0.2.2:4000",
  default: "http://localhost:4000"
});

export const api = {
  async getTasks() {
    try {
      const res = await fetch(`${BASE_URL}/api/tasks`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      return data.tasks || [];
    } catch (err) {
      console.warn("API getTasks error, returning fallback:", err.message);
      return [];
    }
  },

  async parseThoughts(rawText) {
    const res = await fetch(`${BASE_URL}/api/tasks/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rawText,
        clientReferenceTime: new Date().toISOString()
      })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to parse tasks");
    }
    return await res.json();
  },

  async updateTaskStatus(taskId, status) {
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      return await res.json();
    } catch (err) {
      console.warn("API updateTaskStatus error:", err.message);
      return { success: false };
    }
  },

  async deleteTask(taskId) {
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
        method: "DELETE"
      });
      return await res.json();
    } catch (err) {
      console.warn("API deleteTask error:", err.message);
      return { success: false };
    }
  }
};
