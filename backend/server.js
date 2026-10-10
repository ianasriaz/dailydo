import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { parseTasksWithBedrock } from "./bedrock.js";
import { initDynamoTable, getAllTasks, saveTask, updateTaskStatus, deleteTask } from "./dynamo.js";
import { transcribeAudioBuffer } from "./transcribe.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Serve static compiled mobile app
const distPath = path.join(__dirname, "../mobile/dist");
app.use(express.static(distPath));

// Initialize AWS DynamoDB table on boot
initDynamoTable().catch(err => {
  console.warn("DynamoDB initialization warning:", err.message);
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "DailyDo", awsRegion: "us-east-1" });
});

// AWS Transcribe endpoint: transcribes recorded audio from phone
app.post("/api/speech/transcribe", async (req, res) => {
  try {
    const { audioBase64, format } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: "audioBase64 is required" });
    }

    const buffer = Buffer.from(audioBase64, "base64");
    const mediaFormat = format || "mp4";
    const text = await transcribeAudioBuffer(buffer, mediaFormat);

    res.json({ success: true, text });
  } catch (err) {
    console.error("Transcribe endpoint error:", err);
    res.status(500).json({ error: err.message });
  }
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

// Catch-all route to serve mobile SPA
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`DailyDo AWS backend listening on http://localhost:${PORT}`);
});
