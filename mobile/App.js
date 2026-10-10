import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, SafeAreaView, Platform, StatusBar } from "react-native";
import { theme } from "./src/theme.js";
import { Header } from "./src/components/Header.js";
import { Timeline } from "./src/components/Timeline.js";
import { FloatingCaptureBar } from "./src/components/FloatingCaptureBar.js";
import { CaptureOverlay } from "./src/components/CaptureOverlay.js";
import { NotificationBanner } from "./src/components/NotificationBanner.js";
import { api } from "./src/services/api.js";
import { playChime } from "./src/utils/sound.js";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [captureVisible, setCaptureVisible] = useState(false);
  const [initialVoiceMode, setInitialVoiceMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);

  // Set of task IDs that have already alerted during this session
  const alertedTaskIds = useRef(new Set());

  // Load initial tasks
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

          // Update status in backend
          api.updateTaskStatus(t.taskId, "Reminded").then(() => {
            setTasks(prev =>
              prev.map(item => (item.taskId === t.taskId ? { ...item, status: "Reminded" } : item))
            );
          });
          break;
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [tasks]);

  const handleOpenCapture = (isVoice = false) => {
    setInitialVoiceMode(isVoice);
    setCaptureVisible(true);
  };

  const handleCloseCapture = () => {
    setCaptureVisible(false);
  };

  const handleSubmitThought = async (rawText) => {
    setIsProcessing(true);
    try {
      const result = await api.parseThoughts(rawText);
      const newTasks = result.tasks || [];

      // Append new tasks to local state
      setTasks(prev => [...newTasks, ...prev]);
      setCaptureVisible(false);
    } catch (err) {
      console.error("Thought parsing error:", err);
      // Fallback local insertion if server call fails
      const fallbackTask = {
        taskId: "local-" + Date.now(),
        title: rawText,
        category: "Personal & Errands",
        dueTime: null,
        isAnytime: true,
        status: "Pending",
        createdAt: new Date().toISOString()
      };
      setTasks(prev => [fallbackTask, ...prev]);
      setCaptureVisible(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleDone = async (task) => {
    const nextStatus = task.status === "Done" ? "Pending" : "Done";
    setTasks(prev =>
      prev.map(t => (t.taskId === task.taskId ? { ...t, status: nextStatus } : t))
    );
    if (activeNotification?.taskId === task.taskId && nextStatus === "Done") {
      setActiveNotification(null);
    }
    await api.updateTaskStatus(task.taskId, nextStatus);
  };

  const handleDelete = async (taskId) => {
    setTasks(prev => prev.filter(t => t.taskId !== taskId));
    if (activeNotification?.taskId === taskId) {
      setActiveNotification(null);
    }
    await api.deleteTask(taskId);
  };

  const handleDismissNotification = () => {
    setActiveNotification(null);
  };

  const handleMarkNotificationDone = async (task) => {
    await handleToggleDone(task);
    setActiveNotification(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />

      <View style={styles.appContainer}>
        {activeNotification && (
          <NotificationBanner
            notification={activeNotification}
            onMarkDone={handleMarkNotificationDone}
            onDismiss={handleDismissNotification}
          />
        )}

        <Header tasks={tasks} />

        <Timeline
          tasks={tasks}
          onToggleDone={handleToggleDone}
          onDelete={handleDelete}
          onUseExample={(prompt) => {
            handleSubmitThought(prompt);
          }}
        />

        <FloatingCaptureBar
          onOpenCapture={handleOpenCapture}
          isProcessing={isProcessing}
        />

        <CaptureOverlay
          visible={captureVisible}
          initialVoiceMode={initialVoiceMode}
          onClose={handleCloseCapture}
          onSubmit={handleSubmitThought}
          isProcessing={isProcessing}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg
  },
  appContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: theme.colors.bg,
    // On web, center to modern mobile aspect ratio if wide screen
    maxWidth: Platform.OS === "web" ? 480 : "100%",
    width: "100%",
    alignSelf: "center",
    borderLeftWidth: Platform.OS === "web" ? 1 : 0,
    borderRightWidth: Platform.OS === "web" ? 1 : 0,
    borderColor: theme.colors.border
  }
});
