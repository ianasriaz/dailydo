import { Platform } from "react-native";

// On web, relative path ""; on mobile devices on Wi-Fi, use laptop LAN IP
const BASE_URL = Platform.select({
  web: "",
  default: "http://192.168.100.8:4000"
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

  async transcribeAudio(audioBase64, format = "mp4") {
    const res = await fetch(`${BASE_URL}/api/speech/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioBase64, format })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to transcribe audio");
    }
    return await res.json();
  },

  async parseThoughts(rawText, categories = []) {
    const now = new Date();
    const localYear = now.getFullYear();
    const localMonth = String(now.getMonth() + 1).padStart(2, "0");
    const localDay = String(now.getDate()).padStart(2, "0");
    const userLocalDate = `${localYear}-${localMonth}-${localDay}`;

    const localHours = String(now.getHours()).padStart(2, "0");
    const localMinutes = String(now.getMinutes()).padStart(2, "0");
    const userLocalTime = `${localHours}:${localMinutes}`;

    const res = await fetch(`${BASE_URL}/api/tasks/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rawText,
        userLocalDate,
        userLocalTime,
        categories
      })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to parse tasks");
    }
    return await res.json();
  },

  async updateTask(taskId, updates) {
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (err) {
      console.warn("API updateTask error:", err.message);
      return { success: false };
    }
  },

  async updateTaskStatus(taskId, status) {
    return this.updateTask(taskId, { status });
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
