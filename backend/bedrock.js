import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

const DEFAULT_CATEGORIES = [
  "Work & Study",
  "Routines & Habits",
  "Personal & Errands",
  "Health & Fitness",
  "Finance"
];

/**
 * Fallback local parser when offline or in case of AWS connectivity issues
 */
function localRuleFallback(rawText, referenceDate = new Date(), categories = DEFAULT_CATEGORIES) {
  const parts = rawText
    .split(/[,;\n]|(?:\band\b)/i)
    .map(p => p.trim())
    .filter(p => p.length > 2);

  return parts.map((part) => {
    let category = categories.includes("Personal & Errands") ? "Personal & Errands" : categories[0];
    const lower = part.toLowerCase();

    if (
      lower.includes("meeting") ||
      lower.includes("call") ||
      lower.includes("class") ||
      lower.includes("assignment") ||
      lower.includes("project") ||
      lower.includes("slide") ||
      lower.includes("exam") ||
      lower.includes("work") ||
      lower.includes("study") ||
      lower.includes("client") ||
      lower.includes("sync")
    ) {
      if (categories.includes("Work & Study")) category = "Work & Study";
    } else if (
      lower.includes("gym") ||
      lower.includes("workout") ||
      lower.includes("run") ||
      lower.includes("doctor") ||
      lower.includes("medicine") ||
      lower.includes("health")
    ) {
      if (categories.includes("Health & Fitness")) category = "Health & Fitness";
      else if (categories.includes("Routines & Habits")) category = "Routines & Habits";
    } else if (
      lower.includes("pay") ||
      lower.includes("bill") ||
      lower.includes("invoice") ||
      lower.includes("tax") ||
      lower.includes("bank") ||
      lower.includes("rent")
    ) {
      if (categories.includes("Finance")) category = "Finance";
      else if (categories.includes("Personal & Errands")) category = "Personal & Errands";
    } else if (
      lower.includes("pray") ||
      lower.includes("namaz") ||
      lower.includes("zuhr") ||
      lower.includes("asr") ||
      lower.includes("maghrib") ||
      lower.includes("isha") ||
      lower.includes("fajr") ||
      lower.includes("meditat") ||
      lower.includes("water") ||
      lower.includes("habit")
    ) {
      if (categories.includes("Routines & Habits")) category = "Routines & Habits";
    }

    let dueTime = null;
    let isAnytime = true;

    // Check for "in X minute(s)"
    const minMatch = lower.match(/in\s+(\d+)\s+min(?:ute)?s?/i);
    if (minMatch) {
      const mins = parseInt(minMatch[1], 10);
      const d = new Date(referenceDate.getTime() + mins * 60 * 1000);
      dueTime = d.toISOString();
      isAnytime = false;
    }

    // Check for "at X:XX" or "at Xpm/am"
    const timeMatch = lower.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch && !minMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const meridiem = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

      if (meridiem === "pm" && hours < 12) hours += 12;
      if (meridiem === "am" && hours === 12) hours = 0;

      const d = new Date(referenceDate);
      d.setHours(hours, minutes, 0, 0);
      dueTime = d.toISOString();
      isAnytime = false;
    }

    // Clean title
    let title = part
      .replace(/^need to\s+/i, "")
      .replace(/^i have an?\s+/i, "")
      .replace(/^ping\s+/i, "Ping ")
      .trim();

    title = title.charAt(0).toUpperCase() + title.slice(1);

    return {
      title,
      category,
      dueTime,
      isAnytime
    };
  });
}

/**
 * Parse raw multi-intent thoughts with Amazon Bedrock (Nova Micro), dynamically
 * classifying tasks into the user's available category taxonomy.
 */
export async function parseTasksWithBedrock(rawText, clientReferenceTime, categories = DEFAULT_CATEGORIES) {
  const refDate = clientReferenceTime ? new Date(clientReferenceTime) : new Date();
  const refIso = refDate.toISOString();

  const categoryList = Array.isArray(categories) && categories.length > 0
    ? categories
    : DEFAULT_CATEGORIES;

  const categoryOptionsFormatted = categoryList.map(c => `       "${c}"`).join("\n");

  const systemPrompt = `You are an intelligent natural-language task parsing engine for DailyDo.
Current reference time: ${refIso}

The user provides a natural thought or voice note containing one or more distinct tasks.
Your job:
1. Split into individual distinct tasks.
2. For each task, extract:
   - "title": Clean, crisp, concise summary (e.g. "Meeting with Alex", "Fix faucet", "Review lecture slides").
   - "category": Select the single most relevant category strictly from this available list:
${categoryOptionsFormatted}

   Semantic Classification Guide:
   - "Work & Study": Professional deliverables, client calls, team syncs, classes, exams, code reviews, presentations.
   - "Routines & Habits": Daily recurring rituals, prayers/namaz, meditation, journaling, sleep, morning routine.
   - "Health & Fitness": Workouts, gym, sports, medication, hydration, doctor visits.
   - "Finance": Invoices, bill payments, banking, budgets, expense tracking.
   - "Personal & Errands": Household chores, groceries, shopping, repairs, social plans.
   - Any custom categories: Match semantic intent accurately based on the category name.

   - "dueTime": ISO 8601 string calculated relative to the reference time (${refIso}). If no specific time or relative interval is mentioned, return null.
   - "isAnytime": boolean (true if no specific time, false if dueTime is set).

Return ONLY a valid JSON array of objects. No markdown formatting, no commentary.
Format:
[{"title": "...", "category": "...", "dueTime": "...", "isAnytime": false}]`;

  try {
    const command = new ConverseCommand({
      modelId: "amazon.nova-micro-v1:0",
      messages: [
        {
          role: "user",
          content: [{ text: rawText }]
        }
      ],
      system: [{ text: systemPrompt }],
      inferenceConfig: {
        maxTokens: 600,
        temperature: 0.1
      }
    });

    const response = await client.send(command);
    const contentText = response.output?.message?.content?.[0]?.text || "";

    // Clean any markdown backticks
    const cleaned = contentText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { tasks: parsed, source: "amazon.nova-micro-v1:0" };
    }
    throw new Error("Invalid array returned from Bedrock");
  } catch (err) {
    console.warn("Bedrock parsing failed or threw error; using robust local fallback:", err.message);
    const fallbackTasks = localRuleFallback(rawText, refDate, categoryList);
    return { tasks: fallbackTasks, source: "local-fallback" };
  }
}
