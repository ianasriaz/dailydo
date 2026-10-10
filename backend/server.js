import express from "express";
import cors from "cors";
import crypto from "crypto";
import { parseTasksWithBedrock } from "./bedrock.js";
import { initDynamoTable, getAllTasks, saveTask, updateTaskStatus, deleteTask } from "./dynamo.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Initialize AWS DynamoDB table on boot
initDynamoTable().catch(err => {
  console.warn("DynamoDB initialization warning:", err.message);
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "DailyDo", awsRegion: "us-east-1" });
});

// Parse natural language thoughts via Amazon Bedrock (Nova Micro)
app.post("/api/tasks/parse", async (req, res) => {
  try {
    const { rawText, clientReferenceTime } = req.body;
    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ error: "rawText is required" });
    }

    console.log(`[Bedrock Parse] Input: "${rawText}"`);
    const { tasks: extractedList, source } = await parseTasksWithBedrock(rawText, clientReferenceTime);

    const createdTasks = [];
    for (const item of extractedList) {
      const taskRecord = {
        taskId: crypto.randomUUID(),
        title: item.title || "Untitled Task",
        category: item.category || "Personal & Errands",
        dueTime: item.dueTime || null,
        isAnytime: item.isAnytime !== false && !item.dueTime,
        status: "Pending",
        createdAt: new Date().toISOString()
      };

      await saveTask(taskRecord);
      createdTasks.push(taskRecord);
    }

    res.json({
      success: true,
      source,
      tasks: createdTasks
    });
  } catch (err) {
    console.error("Parse endpoint error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all tasks from DynamoDB
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await getAllTasks();
    // Sort: timed tasks first by dueTime, then anytime tasks
    tasks.sort((a, b) => {
      if (a.dueTime && b.dueTime) {
        return new Date(a.dueTime) - new Date(b.dueTime);
      }
      if (a.dueTime && !b.dueTime) return -1;
      if (!a.dueTime && b.dueTime) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    res.json({ tasks });
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create task manually
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, category, dueTime, isAnytime } = req.body;
    const taskRecord = {
      taskId: crypto.randomUUID(),
      title: title || "New Task",
      category: category || "Personal & Errands",
      dueTime: dueTime || null,
      isAnytime: Boolean(isAnytime),
      status: "Pending",
      createdAt: new Date().toISOString()
    };
    await saveTask(taskRecord);
    res.json({ success: true, task: taskRecord });
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update task status (Pending, Reminded, Done)
app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await updateTaskStatus(id, status);
    res.json({ success: true, task: updated });
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteTask(id);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`DailyDo AWS backend listening on http://localhost:${PORT}`);
});
