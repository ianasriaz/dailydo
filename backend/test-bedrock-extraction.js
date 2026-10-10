import { parseTasksWithBedrock } from "./bedrock.js";

async function verify() {
  console.log("Testing Bedrock Nova Micro task extraction...");
  const prompt = "Meeting with Alex in 1 minute, fix faucet this weekend, and pray Zuhr at 1:30";
  const result = await parseTasksWithBedrock(prompt, new Date().toISOString());

  console.log("Source:", result.source);
  console.log("Extracted tasks count:", result.tasks.length);
  console.log("Tasks:", JSON.stringify(result.tasks, null, 2));

  if (!Array.isArray(result.tasks) || result.tasks.length < 2) {
    console.error("Verification FAILED: Did not extract multiple tasks.");
    process.exit(1);
  }

  const hasWorkCategory = result.tasks.some(t => t.category === "Work & Study");
  const hasRoutineCategory = result.tasks.some(t => t.category === "Routines & Habits");

  console.log("Has Work & Study:", hasWorkCategory);
  console.log("Has Routines & Habits:", hasRoutineCategory);

  if (!hasWorkCategory && !hasRoutineCategory) {
    console.error("Verification FAILED: Categories not recognized.");
    process.exit(1);
  }

  console.log("VERIFICATION SUCCESSFUL!");
}

verify().catch(err => {
  console.error("Verification ERROR:", err);
  process.exit(1);
});
