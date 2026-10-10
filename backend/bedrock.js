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

  return parts.map((part) => {
    let title = part
      .replace(/^remind(?:\s+me)?(?:\s+for|\s+to|\s+about)?\s+/i, "")
      .replace(/^need to\s+/i, "")
      .replace(/^i have an?\s+/i, "")
      .replace(/^don't forget to\s+/i, "")
      .replace(/\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?/i, "")
      .replace(/\s+in\s+\d+\s+min(?:ute)?s?/i, "")
      .trim();

    let category = categories[0] || "Personal & Errands";

    // 1. Check against learned memory first
    const match = learnedCorrections.find(
      (c) => c.originalText && part.toLowerCase().includes(c.originalText.toLowerCase())
    );
    if (match) {
      if (match.correctedTitle) title = match.correctedTitle;
      if (match.correctedCategory && categories.includes(match.correctedCategory)) {
        category = match.correctedCategory;
      }
    } else {
      const lower = part.toLowerCase();
      if (lower.includes("meeting") || lower.includes("sync") || lower.includes("study") || lower.includes("class") || lower.includes("work")) {
        if (categories.includes("Work & Study")) category = "Work & Study";
      } else if (lower.includes("gym") || lower.includes("workout") || lower.includes("doctor") || lower.includes("health")) {
        if (categories.includes("Health & Fitness")) category = "Health & Fitness";
      } else if (lower.includes("pay") || lower.includes("bill") || lower.includes("bank") || lower.includes("rent")) {
        if (categories.includes("Finance")) category = "Finance";
      } else if (lower.includes("pray") || lower.includes("habit") || lower.includes("routine") || lower.includes("meditat")) {
        if (categories.includes("Routines & Habits")) category = "Routines & Habits";
      }
    }

    let dueTime = null;
    let isAnytime = true;

    // Check for "in X minute(s)"
    const minMatch = part.match(/in\s+(\d+)\s+min(?:ute)?s?/i);
    if (minMatch && userLocalDate && userLocalTime) {
      const mins = parseInt(minMatch[1], 10);
      const [h, m] = userLocalTime.split(":").map(Number);
      const targetDate = new Date(`${userLocalDate}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
      targetDate.setMinutes(targetDate.getMinutes() + mins);
      const th = String(targetDate.getHours()).padStart(2, "0");
      const tm = String(targetDate.getMinutes()).padStart(2, "0");
      dueTime = `${userLocalDate}T${th}:${tm}:00`;
      isAnytime = false;
    }

    // Check for "at X:XX" or "at Xpm/am"
    const timeMatch = part.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch && !minMatch && userLocalDate) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const meridiem = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

      if (meridiem === "pm" && hours < 12) hours += 12;
      if (meridiem === "am" && hours === 12) hours = 0;

      const th = String(hours).padStart(2, "0");
      const tm = String(minutes).padStart(2, "0");
      dueTime = `${userLocalDate}T${th}:${tm}:00`;
      isAnytime = false;
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
 * Features:
 * 1. Deep zero-shot reasoning: reasons through phonetic voice dictation mishearings before extraction.
 * 2. Adaptive Memory Loop: Dynamically ingests user corrections from DynamoDB.
 * 3. Generalized action titling without brittle hardcoded word lists.
 * 4. Deterministic local timezone calculation.
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
The user has previously corrected or customized the following items. Prioritize and apply these learned patterns to understand their terminology, custom project names, routines, and category preferences:
${memoryLines.join("\n")}\n`;
  }

  const systemPrompt = `You are the intelligent natural-language reasoning engine for DailyDo.
User's Current Local Date: ${today}
User's Current Local Time: ${currentTime}

Available Categories:
${categoryOptionsFormatted}
${learnedContextBlock}
COGNITIVE REASONING & EXTRACTION FRAMEWORK:
1. Internal Reasoning ("reasoning"):
   First analyze the raw speech or text before extracting:
   - What did the user phonetically speak or type?
   - Identify speech-to-text acoustic mishearings, dropped consonants, homophones, or garbled words.
   - Apply broad world knowledge across daily human routines (workplace, healthcare, fitness, daily cultural/religious observances, home errands) to deduce the true human action.
   - Strip conversational noise ("remind me to", "remind for", "i need to", "don't forget to").

2. Clean Action-Oriented Titles ("title"):
   - Concise, title-cased, direct action phrase (e.g. "Esha Prayer", "Team Sync", "Dentist Checkup", "Buy Groceries").
   - NEVER output conversational prefixes like "Reminder for...".

3. Deterministic Local Time ("dueTime"):
   - Output target local time formatted as "YYYY-MM-DDTHH:mm:ss" without any 'Z' or timezone offset.
   - Relative intervals ("in 20 mins") are added to current local time (${currentTime}).
   - Absolute times ("at 8 pm") use local date ${today} ("${today}T20:00:00").
   - If no deadline or interval is stated, set "dueTime" to null and "isAnytime" to true.

4. Semantic Taxonomy Mapping ("category"):
   - Select the single most relevant category strictly from the Available Categories list.

Return ONLY a valid JSON object matching this structure:
{
  "reasoning": "Brief analysis of phonetics and true intent",
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

      // Handle both { tasks: [...] } and direct array [...]
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
