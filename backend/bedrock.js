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
function localRuleFallback(
  rawText,
  userLocalDate,
  userLocalTime,
  categories = DEFAULT_CATEGORIES
) {
  const parts = rawText
    .split(/[,;\n]|(?:\band\b)/i)
    .map((p) => p.trim())
    .filter((p) => p.length > 2);

  return parts.map((part) => {
    let category = categories.includes("Personal & Errands")
      ? "Personal & Errands"
      : categories[0];
    const lower = part.toLowerCase();

    // Check for routines / prayers (including voice typos like esha priya, zoor, etc.)
    if (
      lower.includes("pray") ||
      lower.includes("namaz") ||
      lower.includes("namas") ||
      lower.includes("zuhr") ||
      lower.includes("zoor") ||
      lower.includes("zohar") ||
      lower.includes("asr") ||
      lower.includes("asor") ||
      lower.includes("maghrib") ||
      lower.includes("magrib") ||
      lower.includes("isha") ||
      lower.includes("esha") ||
      lower.includes("fajr") ||
      lower.includes("fajar") ||
      lower.includes("meditat") ||
      lower.includes("habit")
    ) {
      if (categories.includes("Routines & Habits")) category = "Routines & Habits";
    } else if (
      lower.includes("meeting") ||
      lower.includes("sync") ||
      lower.includes("call") ||
      lower.includes("class") ||
      lower.includes("assignment") ||
      lower.includes("project") ||
      lower.includes("exam") ||
      lower.includes("work") ||
      lower.includes("study")
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
    } else if (
      lower.includes("pay") ||
      lower.includes("bill") ||
      lower.includes("invoice") ||
      lower.includes("tax") ||
      lower.includes("bank") ||
      lower.includes("rent")
    ) {
      if (categories.includes("Finance")) category = "Finance";
    }

    let dueTime = null;
    let isAnytime = true;

    // Check for "in X minute(s)"
    const minMatch = lower.match(/in\s+(\d+)\s+min(?:ute)?s?/i);
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
    const timeMatch = lower.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
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

    // Clean title and fix phonetic errors
    let title = part
      .replace(/^remind(?:\s+me)?(?:\s+for|\s+to|\s+about)?\s+/i, "")
      .replace(/^need to\s+/i, "")
      .replace(/^i have an?\s+/i, "")
      .replace(/^don't forget to\s+/i, "")
      .replace(/\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?/i, "")
      .replace(/\s+in\s+\d+\s+min(?:ute)?s?/i, "")
      .trim();

    // Specific voice typo recovery
    if (/e?sha\s+priya/i.test(title)) title = "Esha Prayer";
    if (/zuhr|zoor|zohar/i.test(title)) title = "Zuhr Prayer";
    if (/fajr|fajar/i.test(title)) title = "Fajr Prayer";
    if (/asr|asor/i.test(title)) title = "Asr Prayer";
    if (/maghrib|magrib/i.test(title)) title = "Maghrib Prayer";

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
 * correcting voice speech-to-text typos, cleaning conversational filler,
 * and computing target deadlines in the user's local timezone.
 */
export async function parseTasksWithBedrock(
  rawText,
  userLocalDate,
  userLocalTime,
  categories = DEFAULT_CATEGORIES
) {
  const today = userLocalDate || new Date().toISOString().slice(0, 10);
  const currentTime = userLocalTime || new Date().toTimeString().slice(0, 5);

  const categoryList = Array.isArray(categories) && categories.length > 0
    ? categories
    : DEFAULT_CATEGORIES;

  const categoryOptionsFormatted = categoryList.map((c) => `  - "${c}"`).join("\n");

  const systemPrompt = `You are an intelligent task parsing engine for DailyDo.
User's Current Local Date: ${today}
User's Current Local Time: ${currentTime}

Available Categories:
${categoryOptionsFormatted}

INTELLIGENCE & REASONING RULES:
1. Speech-to-Text Phonetic & Typo Correction:
   Raw user text frequently contains voice dictation phonetic mishearings and typos. You MUST intelligently infer the user's true intended action:
   - "esha priya" -> "Esha Prayer" (Islamic prayer / evening routine)
   - "zohar / zoor" -> "Zuhr Prayer"
   - "fazer / fajar" -> "Fajr Prayer"
   - "asor" -> "Asr Prayer"
   - "namas" -> "Namaz"
   - "sink with team / sync with tame" -> "Team Sync"
   - "by grosseries / buy groceries" -> "Buy Groceries"
   - "doc appointment" -> "Doctor Appointment"
   Always reconstruct true human intent instead of verbatim speech-to-text errors.

2. Clean Action-Oriented Titles:
   - Strip out conversational filler: "remind me to", "remind for", "i need to", "don't forget to", "please set a reminder to", "schedule".
   - Output concise, crisp action titles: "Esha Prayer", "Team Sync", "Buy Groceries", "Pay Electric Bill".
   - NEVER output titles starting with "Reminder for...".

3. Accurate Local Time Calculation:
   - "dueTime": Output the target deadline in the user's LOCAL time formatted as "YYYY-MM-DDTHH:mm:ss" without any 'Z' or timezone offset suffix.
   - Example: If the user says "at 8 pm" and current local date is "${today}", output "${today}T20:00:00".
   - Example: If user says "in 15 mins", add 15 minutes to current local time (${currentTime}) and output the resulting local timestamp.
   - If no specific time or interval is specified, set "dueTime" to null and "isAnytime" to true.

4. Semantic Categorization:
   - Assign the single best category strictly from the Available Categories list:
     - "Routines & Habits": Daily recurring rituals, Islamic prayers (Fajr, Zuhr, Asr, Maghrib, Isha/Esha), meditation, morning/night habits, hydration.
     - "Work & Study": Professional team syncs, meetings, classes, exams, code reviews, presentations.
     - "Health & Fitness": Gym, workouts, medication, sports, doctor visits.
     - "Finance": Invoices, bill payments, bank, rent.
     - "Personal & Errands": Household chores, groceries, repairs, shopping.
     - Any custom categories: Match semantic intent accurately based on the category name.

Return ONLY a valid JSON array of objects:
[{"title": "...", "category": "...", "dueTime": "YYYY-MM-DDTHH:mm:ss", "isAnytime": false}]`;

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
    const fallbackTasks = localRuleFallback(rawText, today, currentTime, categoryList);
    return { tasks: fallbackTasks, source: "local-fallback" };
  }
}
