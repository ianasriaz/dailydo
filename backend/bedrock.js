import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

/**
 * Fallback local parser when offline or in case of AWS connectivity issues
 */
function localRuleFallback(rawText, referenceDate = new Date()) {
  const parts = rawText
    .split(/[,;\n]|(?:\band\b)/i)
    .map(p => p.trim())
    .filter(p => p.length > 2);

  return parts.map((part, index) => {
    let category = "Personal & Errands";
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
      lower.includes("study")
    ) {
      category = "Work & Study";
    } else if (
      lower.includes("pray") ||
      lower.includes("namaz") ||
      lower.includes("zuhr") ||
      lower.includes("asr") ||
      lower.includes("maghrib") ||
      lower.includes("isha") ||
      lower.includes("fajr") ||
      lower.includes("gym") ||
      lower.includes("workout") ||
      lower.includes("meditat") ||
      lower.includes("water") ||
      lower.includes("habit")
    ) {
      category = "Routines & Habits";
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
 * Parse raw multi-intent thoughts with Amazon Bedrock (Nova Micro)
 */
export async function parseTasksWithBedrock(rawText, clientReferenceTime) {
  const refDate = clientReferenceTime ? new Date(clientReferenceTime) : new Date();
  const refIso = refDate.toISOString();

  const systemPrompt = `You are the AI extraction engine for DailyDo, a smart daily planner.
The user provides a natural thought or voice note containing one or more tasks.
Current reference time: ${refIso}

Your job:
1. Split into individual distinct tasks.
2. For each task, extract:
   - "title": Clean, concise task summary (e.g. "Meeting with Alex", "Fix faucet").
   - "category": Must be strictly one of:
       "Work & Study"
       "Routines & Habits"
       "Personal & Errands"
   - "dueTime": ISO 8601 string calculated relative to the reference time (${refIso}). If no specific time or relative interval (like "in 1 minute", "at 4pm", "by Tuesday") is mentioned, return null.
   - "isAnytime": boolean (true if no specific time, false if dueTime is set).

Return ONLY a valid JSON array of objects. No markdown formatting, no explanations, no wrappers.
Format:
[{"title": "...", "category": "Work & Study", "dueTime": "...", "isAnytime": false}]`;

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
        maxTokens: 500,
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
    const fallbackTasks = localRuleFallback(rawText, refDate);
    return { tasks: fallbackTasks, source: "local-fallback" };
  }
}
