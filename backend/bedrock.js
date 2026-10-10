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
 * Clean rule-based fallback when offline or in case of network interruption.
 * Relies strictly on parsing explicit temporal markers and user's learned memory,
 * with ZERO hardcoded keyword dictionaries or assumed specific terms.
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

    // Check against learned user memory first
    const match = learnedCorrections.find(
      (c) => c.originalText && part.toLowerCase().includes(c.originalText.toLowerCase())
    );
    if (match) {
      if (match.correctedTitle) title = match.correctedTitle;
      if (match.correctedCategory && categories.includes(match.correctedCategory)) {
        category = match.correctedCategory;
      }
    }

    const isTomorrow = lower.includes("tomorrow");
    const targetDate = isTomorrow ? tomorrowStr : todayStr;
    title = title.replace(/\btomorrow\b/gi, "").trim();

    let dueTime = null;
    let isAnytime = true;

    // Check for relative interval: "in X minute(s)"
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

    // Check for explicit time: "at X:XX" or "at Xpm/am"
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
    }

    // Convert title to Title Case
    title = title
      .split(" ")
      .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
      .join(" ");

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
GENERAL REASONING & EXTRACTION PRINCIPLES:
1. Strict Subject Preservation & Speech Denoising:
   - Extract the user's intended subject, action, or event. NEVER swap the subject or replace it with an unrelated activity.
   - Voice Dictation & Phonetic Correction: Voice input frequently mis-transcribes words phonetically or acoustically (e.g., "priya" for "prayer", "even had" for "event at", "sink" for "sync", "standard" for "standup").
   - Retain all proper nouns, modifiers, and specific names! When fixing a misheard word, NEVER drop the surrounding identifying words (e.g., "Esha priya" -> "Esha Prayer", "Sarah dinner" -> "Dinner With Sarah").
   - Preserve the user's preferred naming / transliteration in the title (e.g., if user says "Zohar prayer", title as "Zohar Prayer"; if user says "Zuhr prayer", title as "Zuhr Prayer").
   - Format titles cleanly in Title Case (e.g. "Zohar Prayer", "Dinner With Sarah", "Team Standup").
   - Strip conversational noise: "remind me for", "remind me to", "please remind", "don't forget to", "i need to". NEVER include "Reminder for..." in the title.

2. Commonsense & Natural Diurnal Time Resolution:
   - When an explicit time or relative interval is provided ("at 3:00 pm", "in 20 mins", "at 8 pm"), calculate that exact local timestamp ("YYYY-MM-DDTHH:mm:ss").
   - Multi-Cultural & Regional Diurnal Fluency:
     Users globally speak with diverse dialects and transliterations (e.g. South Asian/Urdu "Zohar"/"Fajar"/"Esha" alongside Arabic "Zuhr"/"Dhuhr"/"Fajr"/"Isha", Jewish Tefillah, or secular diurnal routines).
     When a day indicator is provided ("today", "tomorrow") WITHOUT an explicit hour, resolve to the appropriate natural diurnal window:
       * Dawn / sunrise routines or prayers (Fajr / Fajar): ~05:30
       * Morning / breakfast / standup: ~08:30 - 09:00
       * Midday / solar noon routines or prayers (Zuhr / Zohar / Dhuhr, lunch): ~12:30 - 13:00
       * Afternoon routines or prayers (Asr): ~16:30 - 17:00
       * Sunset / dusk / evening prayers (Maghrib): ~18:30 - 19:00
       * Night / nightfall prayers (Isha / Esha, bedtime): ~20:00 - 20:30
     - If the task is flexible without an inherent diurnal window (e.g. "buy groceries tomorrow"), set "dueTime" to null and "isAnytime" to true.
   - Format "dueTime" as "YYYY-MM-DDTHH:mm:ss" in user's local timeline (use "${tomorrowDate}" for tomorrow, "${today}" for today). Do NOT append "Z" or timezone offset.

3. Semantic Taxonomy Categorization:
   - Assign each task to the single most relevant category strictly from the Available Categories list based on the core nature of the activity (e.g. spiritual routines & habits -> "Routines & Habits", work/study -> "Work & Study", health/wellness -> "Health & Fitness", errands -> "Personal & Errands", bills/money -> "Finance").

Return ONLY a valid JSON object matching this structure:
{
  "reasoning": "Brief analysis of the user's intended subject, acoustic correction, and time resolution",
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
