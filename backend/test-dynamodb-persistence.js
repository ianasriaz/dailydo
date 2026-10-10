import { saveTask, getAllTasks, updateTaskStatus, deleteTask } from "./dynamo.js";

async function verify() {
  console.log("Testing Amazon DynamoDB persistence for DailyDo_Tasks...");

  const testId = "test-" + Date.now();
  const testTask = {
    taskId: testId,
    title: "Verification Task for DynamoDB",
    category: "Work & Study",
    dueTime: new Date(Date.now() + 60000).toISOString(),
    isAnytime: false,
    status: "Pending",
    createdAt: new Date().toISOString()
  };

  console.log("1. Saving task to DynamoDB...");
  await saveTask(testTask);

  console.log("2. Querying tasks from DynamoDB...");
  const tasks = await getAllTasks();
  const found = tasks.find(t => t.taskId === testId);

  if (!found) {
    console.error("Verification FAILED: Task not found in DynamoDB.");
    process.exit(1);
  }
  console.log("Task retrieved from DynamoDB successfully:", found.title);

  console.log("3. Updating status to 'Done' in DynamoDB...");
  await updateTaskStatus(testId, "Done");
  const updatedTasks = await getAllTasks();
  const updatedFound = updatedTasks.find(t => t.taskId === testId);

  if (!updatedFound || updatedFound.status !== "Done") {
    console.error("Verification FAILED: Status update to 'Done' did not persist.");
    process.exit(1);
  }
  console.log("Status updated and verified in DynamoDB:", updatedFound.status);

  console.log("4. Cleaning up test task from DynamoDB...");
  await deleteTask(testId);
  console.log("DYNAMODB VERIFICATION SUCCESSFUL!");
}

verify().catch(err => {
  console.error("Verification ERROR:", err);
  process.exit(1);
});
