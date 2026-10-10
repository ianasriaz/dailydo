import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = "DailyDo_Tasks";
const rawClient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(rawClient);

let isDynamoAvailable = true;
let inMemoryFallbackTasks = [];

/**
 * Ensure DailyDo_Tasks table exists in AWS DynamoDB
 */
export async function initDynamoTable() {
  try {
    await rawClient.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    console.log(`DynamoDB table "${TABLE_NAME}" is active and ready.`);
    isDynamoAvailable = true;
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log(`DynamoDB table "${TABLE_NAME}" not found. Creating in us-east-1...`);
      try {
        await rawClient.send(
          new CreateTableCommand({
            TableName: TABLE_NAME,
            KeySchema: [{ AttributeName: "taskId", KeyType: "HASH" }],
            AttributeDefinitions: [{ AttributeName: "taskId", AttributeType: "S" }],
            BillingMode: "PAY_PER_REQUEST"
          })
        );
        console.log(`Successfully requested creation of DynamoDB table "${TABLE_NAME}".`);
        isDynamoAvailable = true;
      } catch (createErr) {
        console.warn("Could not create DynamoDB table; using fallback in-memory store:", createErr.message);
        isDynamoAvailable = false;
      }
    } else {
      console.warn("DynamoDB describe failed; using fallback in-memory store:", err.message);
      isDynamoAvailable = false;
    }
  }
}

/**
 * Get all tasks
 */
export async function getAllTasks() {
  if (!isDynamoAvailable) {
    return inMemoryFallbackTasks;
  }
  try {
    const res = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
    return res.Items || [];
  } catch (err) {
    console.warn("Scan failed, returning in-memory:", err.message);
    return inMemoryFallbackTasks;
  }
}

/**
 * Save a single task
 */
export async function saveTask(task) {
  if (!isDynamoAvailable) {
    inMemoryFallbackTasks = inMemoryFallbackTasks.filter(t => t.taskId !== task.taskId);
    inMemoryFallbackTasks.push(task);
    return task;
  }
  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: task
      })
    );
    return task;
  } catch (err) {
    console.warn("PutItem failed, saving to in-memory:", err.message);
    inMemoryFallbackTasks = inMemoryFallbackTasks.filter(t => t.taskId !== task.taskId);
    inMemoryFallbackTasks.push(task);
    return task;
  }
}

export async function updateTask(taskId, updates = {}) {
  if (!isDynamoAvailable) {
    const item = inMemoryFallbackTasks.find(t => t.taskId === taskId);
    if (item) Object.assign(item, updates);
    return item;
  }

  const expressions = [];
  const names = {};
  const values = {};

  Object.entries(updates).forEach(([key, val]) => {
    expressions.push(`#${key} = :${key}`);
    names[`#${key}`] = key;
    values[`:${key}`] = val;
  });

  if (expressions.length === 0) return null;

  try {
    const res = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { taskId },
        UpdateExpression: "SET " + expressions.join(", "),
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: "ALL_NEW"
      })
    );
    return res.Attributes;
  } catch (err) {
    console.warn("UpdateTask failed, updating in-memory:", err.message);
    const item = inMemoryFallbackTasks.find(t => t.taskId === taskId);
    if (item) Object.assign(item, updates);
    return item;
  }
}

/**
 * Update task status (Pending, Reminded, Done)
 */
export async function updateTaskStatus(taskId, status) {
  return await updateTask(taskId, { status });
}

/**
 * Delete a task
 */
export async function deleteTask(taskId) {
  if (!isDynamoAvailable) {
    inMemoryFallbackTasks = inMemoryFallbackTasks.filter(t => t.taskId !== taskId);
    return { success: true };
  }
  try {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { taskId }
      })
    );
    return { success: true };
  } catch (err) {
    console.warn("DeleteItem failed, deleting from in-memory:", err.message);
    inMemoryFallbackTasks = inMemoryFallbackTasks.filter(t => t.taskId !== taskId);
    return { success: true };
  }
}
