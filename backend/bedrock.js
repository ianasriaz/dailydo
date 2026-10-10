import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

const PRIMARY_MODEL = "amazon.nova-lite-v1:0";
const FALLBACK_MODEL = "amazon.nova-micro-v1:0";

const DEFAULT_CATEGORIES = [
  "Work & Study",
  "Routines & Habits",
  "Personal & Errands",
  "Health & Fitness",
  "Finance"
];

/**
 * Robust rule-based fallback when offline or in case of network interruption
 */
function localRuleFallback(
  rawText,
  userLocalDate,
  userLocalTime,
  categories = DEFAULT_CATEGORIES,
  learnedCorrections = []
) {
  const parts = rawText
    .split(/[,;\n]|(?:\band\b)/i)
    .map((p) => p.trim())
    .filter((p) => p.length > 2);

  const todayStr = userLocalDate || new Date().toISOString().slice(0, 10);
  const tomorrowObj = new Date(todayStr);
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().slice(0, 10);

  return parts.map((part) => {
    let title = part
      .replace(/^remind(?:\s+me)?(?:\s+for|\s+to|\s+about)?\s+/i, "")
      .replace(/^need to\s+/i, "")
      .replace(/^i have an?\s+/i, "")
      .replace(/^don't forget to\s+/i, "")
      .replace(/\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?/i, "")
      .replace(/\s+in\s+\d+\s+min(?:ute)?s?/i, "")
      .replace(/\bthe\b\s+/i, "")
      .trim();

    let category = categories[0] || "Personal & Errands";
    const lower = part.toLowerCase();

    // Check against learned memory first
    const match = learnedCorrections.find(
      (c) => c.originalText && part.toLowerCase().includes(c.originalText.toLowerCase())
    );
    if (match) {
      if (match.correctedTitle) title = match.correctedTitle;
      if (match.correctedCategory && categories.includes(match.correctedCategory)) {
        category = match.correctedCategory;
      }
    } else {
      if (
        lower.includes("pray") ||
        lower.includes("namaz") ||
        lower.includes("zuhr") ||
        lower.includes("zohar") ||
        lower.includes("dhuhr") ||
        lower.includes("asr") ||
        lower.includes("maghrib") ||
        lower.includes("isha") ||
        lower.includes("esha") ||
        lower.includes("fajr") ||
        lower.includes("habit") ||
        lower.includes("routine") ||
        lower.includes("meditat")
      ) {
        if (categories.includes("Routines & Habits")) category = "Routines & Habits";
      } else if (lower.includes("meeting") || lower.includes("sync") || lower.includes("study") || lower.includes("class") || lower.includes("work") || lower.includes("event") || lower.includes("aws")) {
        if (categories.includes("Work & Study")) category = "Work & Study";
      } else if (lower.includes("gym") || lower.includes("workout") || lower.includes("doctor") || lower.includes("health")) {
        if (categories.includes("Health & Fitness")) category = "Health & Fitness";
      } else if (lower.includes("pay") || lower.includes("bill") || lower.includes("bank") || lower.includes("rent")) {
        if (categories.includes("Finance")) category = "Finance";
      }
    }

    const isTomorrow = lower.includes("tomorrow");
    const targetDate = isTomorrow ? tomorrowStr : todayStr;
    title = title.replace(/\btomorrow\b/gi, "").trim();

    let dueTime = null;
    let isAnytime = true;

    // Check for "in X minute(s)"
    const minMatch = part.match(/in\s+(\d+)\s+min(?:ute)?s?/i);
    if (minMatch && userLocalDate && userLocalTime) {
      const mins = parseInt(minMatch[1], 10);
      const [h, m] = userLocalTime.split(":").map(Number);
      const d = new Date(`${todayStr}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
      d.setMinutes(d.getMinutes() + mins);
      const th = String(d.getHours()).padStart(2, "0");
      const tm = String(d.getMinutes()).padStart(2, "0");
      dueTime = `${todayStr}T${th}:${tm}:00`;
      isAnytime = false;
    }

    // Check for "at X:XX" or "at Xpm/am"
    const timeMatch = part.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch && !minMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const meridiem = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

      if (meridiem === "pm" && hours < 12) hours += 12;
      if (meridiem === "am" && hours === 12) hours = 0;

      const th = String(hours).padStart(2, "0");
      const tm = String(minutes).padStart(2, "0");
      dueTime = `${targetDate}T${th}:${tm}:00`;
      isAnytime = false;
    } else if (!timeMatch && !minMatch) {
      // Default prayer times if user specifies routine without explicit hour
      if (lower.includes("fajr") || lower.includes("fajar")) {
        dueTime = `${targetDate}T05:30:00`;
        isAnytime = false;
        title = "Fajr Prayer";
      } else if (lower.includes("zohar") || lower.includes("zuhr") || lower.includes("dhuhr")) {
        dueTime = `${targetDate}T13:00:00`;
        isAnytime = false;
        title = "Zuhr Prayer";
      } else if (lower.includes("asr") || lower.includes("asor")) {
        dueTime = `${targetDate}T16:45:00`;
        isAnytime = false;
        title = "Asr Prayer";
      } else if (lower.includes("maghrib") || lower.includes("magrib")) {
        dueTime = `${targetDate}T18:30:00`;
        isAnytime = false;
        title = "Maghrib Prayer";
      } else if (lower.includes("isha") || lower.includes("esha")) {
        dueTime = `${targetDate}T20:00:00`;
        isAnytime = false;
        title = "Esha Prayer";
      }
    }

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
 * Intelligent task parsing using Amazon Bedrock (Nova Lite with Chain-of-Thought Scratchpad).
 */
export async function parseTasksWithBedrock(
  rawText,
  userLocalDate,
  userLocalTime,
  categories = DEFAULT_CATEGORIES,
  learnedCorrections = []
) {
  const today = userLocalDate || new Date().toISOString().slice(0, 10);
  const currentTime = userLocalTime || new Date().toTimeString().slice(0, 5);

  const todayObj = new Date(today);
  const tomorrowObj = new Date(todayObj);
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowDate = tomorrowObj.toISOString().slice(0, 10);

  const categoryList = Array.isArray(categories) && categories.length > 0
    ? categories
    : DEFAULT_CATEGORIES;

  const categoryOptionsFormatted = categoryList.map((c) => `  - "${c}"`).join("\n");

  // Format learned user corrections (few-shot personalized memory)
  let learnedContextBlock = "";
  if (Array.isArray(learnedCorrections) && learnedCorrections.length > 0) {
    const memoryLines = learnedCorrections.map((m) => {
      return `  - User input: "${m.originalText}" -> Correct title: "${m.correctedTitle}"${m.correctedCategory ? ` (Category: "${m.correctedCategory}")` : ""}`;
    });
    learnedContextBlock = `\nUSER'S PERSONAL LEARNED VOCABULARY & PAST CORRECTIONS:
The user has previously corrected or customized the following items. Prioritize and apply these learned patterns:
${memoryLines.join("\n")}\n`;
  }

  const systemPrompt = `You are the intelligent natural-language reasoning engine for DailyDo.
User's Current Local Date (Today): ${today}
User's Current Local Time: ${currentTime}
Tomorrow's Date: ${tomorrowDate}

Available Categories:
${categoryOptionsFormatted}
${learnedContextBlock}
COGNITIVE REASONING & EXTRACTION FRAMEWORK:
1. Strict Subject Fidelity:
   - NEVER substitute the user's requested subject with another routine, prayer, or event!
   - If user says "Zohar" or "Zuhr", title MUST be "Zohar Prayer" or "Zuhr Prayer". NEVER replace with another prayer (like Fajr, Asr, Maghrib, or Esha).
   - If user says "Asr", title is "Asr Prayer". If "Fajr", title is "Fajr Prayer". If "Maghrib", title is "Maghrib Prayer".
   - Fix speech recognition acoustic errors: "AWS even had 3:00 p.m." -> "AWS Event" at 3:00 PM.

2. Routine & Prayer Timing Intelligence:
   - If user asks for a known daily routine or prayer with a day indicator ("tomorrow" or "today") without an explicit hour, use the exact standard hour:
     - Dawn prayer ("Fajr"): 05:30 (5:30 AM)
     - Noon / midday prayer ("Zuhr", "Zohar", "Dhuhr"): 13:00 (1:00 PM)
     - Afternoon prayer ("Asr"): 16:45 (4:45 PM)
     - Sunset prayer ("Maghrib"): 18:30 (6:30 PM)
     - Night prayer ("Isha", "Esha"): 20:00 (8:00 PM)
   - If an explicit hour is given ("at 3:00 p.m."), use that exact explicit time.
   - All prayers, namaz, worship, meditation, and daily rituals belong in "Routines & Habits".

3. Clean Action-Oriented Titles:
   - Concise, title-cased, direct action phrase (e.g. "Zuhr Prayer", "AWS Event", "Team Standup", "Buy Groceries").
   - Strip conversational noise: "remind me for the", "remind me to", "remind for", "please set reminder".
   - NEVER output conversational prefixes like "Reminder for...".

4. Deterministic Local Time ("dueTime"):
   - "YYYY-MM-DDTHH:mm:ss" in user's local timeline. No "Z" or offset.
   - For "tomorrow", use date "${tomorrowDate}". For "today", use date "${today}".
   - Relative intervals ("in 20 mins") are added to current local time (${currentTime}).
   - If no deadline or interval is stated, set "dueTime" to null and "isAnytime" to true.

5. Semantic Taxonomy Mapping:
   - Select the single most relevant category strictly from the Available Categories list.

Return ONLY a valid JSON object matching this structure:
{
  "reasoning": "Brief analysis of subject fidelity, speech phonetics, and intent",
  "tasks": [
    {
      "title": "...",
      "category": "...",
      "dueTime": "YYYY-MM-DDTHH:mm:ss",
      "isAnytime": false
    }
  ]
}`;

  // Try Nova Lite first (higher reasoning), then Nova Micro fallback
  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL];

  for (const modelId of modelsToTry) {
    try {
      const command = new ConverseCommand({
        modelId,
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

      const cleaned = contentText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      const tasksArray = Array.isArray(parsed) ? parsed : (parsed.tasks || []);
      if (Array.isArray(tasksArray) && tasksArray.length > 0) {
        return { tasks: tasksArray, source: modelId, reasoning: parsed.reasoning || null };
      }
    } catch (err) {
      console.warn(`Model ${modelId} parsing attempt failed:`, err.message);
    }
  }

  console.warn("Bedrock parsing fallback triggered; using local rules");
  const fallbackTasks = localRuleFallback(rawText, today, currentTime, categoryList, learnedCorrections);
  return { tasks: fallbackTasks, source: "local-fallback" };
}
