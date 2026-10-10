import { saveTask, updateTaskStatus, getAllTasks, deleteTask } from "./dynamo.js";

async function verify() {
  console.log("Testing Timed Reminder & Status Transition flow...");

  const testId = "reminder-test-" + Date.now();
  const dueTime = new Date(Date.now() + 2000).toISOString();

  const task = {
    taskId: testId,
    title: "Review slides in 2 seconds",
    category: "Work & Study",
    dueTime,
    isAnytime: false,
    status: "Pending",
    createdAt: new Date().toISOString()
  };

  console.log("1. Creating task due in 2 seconds...");
  await saveTask(task);

  console.log("2. Waiting 2.5 seconds for reminder time trigger...");
  await new Promise(r => setTimeout(r, 2500));

  const now = Date.now();
  const isDue = new Date(dueTime).getTime() <= now;
  console.log("Is task due now?", isDue);
  if (!isDue) {
    console.error("Verification FAILED: Task not due.");
    process.exit(1);
  }

  console.log("3. Transitioning status to 'Reminded'...");
  await updateTaskStatus(testId, "Reminded");
  let tasks = await getAllTasks();
  let found = tasks.find(t => t.taskId === testId);
  console.log("Status in DynamoDB:", found?.status);
  if (found?.status !== "Reminded") {
    console.error("Verification FAILED: Status is not Reminded.");
    process.exit(1);
  }

  console.log("4. User clicks 'Mark Done' -> Transitioning status to 'Done'...");
  await updateTaskStatus(testId, "Done");
  tasks = await getAllTasks();
  found = tasks.find(t => t.taskId === testId);
  console.log("Final status in DynamoDB:", found?.status);
  if (found?.status !== "Done") {
    console.error("Verification FAILED: Status is not Done.");
    process.exit(1);
  }

  console.log("5. Cleaning up test task...");
  await deleteTask(testId);

  console.log("TIMED REMINDER & STATUS FLOW VERIFIED SUCCESSFULLY!");
}

verify().catch(err => {
  console.error("Verification ERROR:", err);
  process.exit(1);
});
