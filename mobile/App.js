import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Platform, StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { theme } from "./src/theme.js";
import { Header } from "./src/components/Header.js";
import { Timeline } from "./src/components/Timeline.js";
import { BottomNavBar } from "./src/components/BottomNavBar.js";
import { AgentSearchPopup } from "./src/components/AgentSearchPopup.js";
import { CategoriesScreen } from "./src/components/CategoriesScreen.js";
import { CategoryPickerModal } from "./src/components/CategoryPickerModal.js";
import { NotificationBanner } from "./src/components/NotificationBanner.js";
import { api } from "./src/services/api.js";
import { playChime } from "./src/utils/sound.js";

const DEFAULT_CATEGORIES = [
  "Work & Study",
  "Routines & Habits",
  "Personal & Errands",
  "Health & Fitness",
  "Finance"
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [activeTab, setActiveTab] = useState("tasks"); // 'tasks' | 'categories'
  const [categoryFilter, setCategoryFilter] = useState(null);

  const [agentPopupVisible, setAgentPopupVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);
  const [taskForCategoryChange, setTaskForCategoryChange] = useState(null);

  const alertedTaskIds = useRef(new Set());

  // Load initial tasks on boot
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      if (Array.isArray(data) && data.length > 0) {
        setTasks(data);
      }
    } catch (err) {
      console.warn("Could not load tasks from API:", err);
    }
  };

  // Timer: Check for due reminders every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();

      for (const t of tasks) {
        if (t.status === "Done" || t.isAnytime || !t.dueTime) continue;

        const dueTimestamp = new Date(t.dueTime).getTime();

        // If due within 10 seconds or past due, and hasn't alerted yet
        if (dueTimestamp <= now && !alertedTaskIds.current.has(t.taskId)) {
          alertedTaskIds.current.add(t.taskId);
          setActiveNotification(t);
          playChime();

          // Update status in backend DynamoDB
          api.updateTaskStatus(t.taskId, "Reminded").then(() => {
            setTasks((prev) =>
              prev.map((item) =>
                item.taskId === t.taskId ? { ...item, status: "Reminded" } : item
              )
            );
          });
          break;
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [tasks]);

  const handleOpenAgentPrompt = () => {
    setAgentPopupVisible(true);
  };

  const handleCloseAgentPrompt = () => {
    setAgentPopupVisible(false);
  };

  const handleSubmitThought = async (rawText) => {
    setIsProcessing(true);
    try {
      const result = await api.parseThoughts(rawText, categories);
      const newTasks = result.tasks || [];

      setTasks((prev) => [...newTasks, ...prev]);
      setAgentPopupVisible(false);
      setActiveTab("tasks");
    } catch (err) {
      console.error("Thought parsing error:", err);
      let cleanTitle = rawText
        .replace(/^remind(?:\s+me)?(?:\s+for|\s+to|\s+about)?\s+/i, "")
        .replace(/\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?/i, "")
        .trim();
      if (/e?sha\s+priya/i.test(cleanTitle)) cleanTitle = "Esha Prayer";
      cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

      const fallbackCat = /prayer|namaz|habit|meditat/i.test(cleanTitle) && categories.includes("Routines & Habits")
        ? "Routines & Habits"
        : (categories[0] || "Personal & Errands");

      const fallbackTask = {
        taskId: "local-" + Date.now(),
        title: cleanTitle || rawText,
        category: fallbackCat,
        dueTime: null,
        isAnytime: true,
        status: "Pending",
        createdAt: new Date().toISOString()
      };
      setTasks((prev) => [fallbackTask, ...prev]);
      setAgentPopupVisible(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleDone = async (task) => {
    const nextStatus = task.status === "Done" ? "Pending" : "Done";
    setTasks((prev) =>
      prev.map((t) => (t.taskId === task.taskId ? { ...t, status: nextStatus } : t))
    );
    if (activeNotification?.taskId === task.taskId && nextStatus === "Done") {
      setActiveNotification(null);
    }
    await api.updateTaskStatus(task.taskId, nextStatus);
  };

  const handleDelete = async (taskId) => {
    setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
    if (activeNotification?.taskId === taskId) {
      setActiveNotification(null);
    }
    await api.deleteTask(taskId);
  };

  // Re-categorization Flow
  const handleOpenCategoryChange = (task) => {
    setTaskForCategoryChange(task);
  };

  const handleSelectNewCategory = async (taskId, newCategory) => {
    setTasks((prev) =>
      prev.map((t) => (t.taskId === taskId ? { ...t, category: newCategory } : t))
    );
    setTaskForCategoryChange(null);
    await api.updateTask(taskId, { category: newCategory });
  };

  // Custom Category Addition
  const handleAddCategory = (name, color) => {
    if (!categories.includes(name)) {
      setCategories((prev) => [...prev, name]);
      theme.categories[name] = {
        color: color || theme.colors.primary,
        bg: color ? `${color}18` : "#E8F0EC",
        border: color ? `${color}40` : "#D5E3DB"
      };
    }
  };

  const handleFilterByCategory = (categoryName) => {
    setCategoryFilter(categoryName);
    setActiveTab("tasks");
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

        <View style={styles.appContainer}>
          {activeNotification && (
            <NotificationBanner
              notification={activeNotification}
              onMarkDone={async (t) => {
                await handleToggleDone(t);
                setActiveNotification(null);
              }}
              onDismiss={() => setActiveNotification(null)}
            />
          )}

          {/* Top Header */}
          <Header activeTab={activeTab} />

          {/* Main Content Area */}
          <View style={styles.contentArea}>
            {activeTab === "tasks" && (
              <Timeline
                tasks={tasks}
                onToggleDone={handleToggleDone}
                onDelete={handleDelete}
                onChangeCategory={handleOpenCategoryChange}
                categoryFilter={categoryFilter}
                onClearCategoryFilter={() => setCategoryFilter(null)}
              />
            )}

            {activeTab === "categories" && (
              <CategoriesScreen
                categories={categories}
                tasks={tasks}
                onAddCategory={handleAddCategory}
                onSelectCategoryFilter={handleFilterByCategory}
              />
            )}
          </View>

          {/* Balanced 3-Item Bottom Navigation Dock */}
          <BottomNavBar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              if (tab === "categories") setCategoryFilter(null);
            }}
            onOpenAgentPrompt={handleOpenAgentPrompt}
          />

          {/* Smart Reminder Modal */}
          <AgentSearchPopup
            visible={agentPopupVisible}
            onClose={handleCloseAgentPrompt}
            onSubmit={handleSubmitThought}
            isProcessing={isProcessing}
          />

          {/* Category Switcher Modal */}
          <CategoryPickerModal
            visible={Boolean(taskForCategoryChange)}
            task={taskForCategoryChange}
            categories={categories}
            onSelectCategory={handleSelectNewCategory}
            onClose={() => setTaskForCategoryChange(null)}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface
  },
  appContainer: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    maxWidth: Platform.OS === "web" ? 480 : "100%",
    width: "100%",
    alignSelf: "center",
    borderLeftWidth: Platform.OS === "web" ? 1 : 0,
    borderRightWidth: Platform.OS === "web" ? 1 : 0,
    borderColor: "#E5ECE8"
  },
  contentArea: {
    flex: 1
  }
});
