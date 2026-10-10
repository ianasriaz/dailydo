import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, UpdateCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const TABLE_NAME = "DailyDo_Tasks";
const MEMORY_TABLE_NAME = "DailyDo_LearnedMemory";

const rawClient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(rawClient);

let isDynamoAvailable = true;
let inMemoryFallbackTasks = [];
let inMemoryLearnedCorrections = [];

/**
 * Ensure DailyDo_Tasks and DailyDo_LearnedMemory tables exist in AWS DynamoDB
 */
export async function initDynamoTable() {
  // 1. Initialize Tasks Table
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

  // 2. Initialize Learned Memory Table
  try {
    await rawClient.send(new DescribeTableCommand({ TableName: MEMORY_TABLE_NAME }));
    console.log(`DynamoDB table "${MEMORY_TABLE_NAME}" is active and ready.`);
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log(`Creating DynamoDB memory table "${MEMORY_TABLE_NAME}"...`);
      try {
        await rawClient.send(
          new CreateTableCommand({
            TableName: MEMORY_TABLE_NAME,
            KeySchema: [{ AttributeName: "memoryId", KeyType: "HASH" }],
            AttributeDefinitions: [{ AttributeName: "memoryId", AttributeType: "S" }],
            BillingMode: "PAY_PER_REQUEST"
          })
        );
        console.log(`Successfully requested creation of table "${MEMORY_TABLE_NAME}".`);
      } catch (createErr) {
        console.warn("Could not create memory table; using fallback in-memory store:", createErr.message);
      }
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
 * Get single task by taskId
 */
export async function getTaskById(taskId) {
  if (!isDynamoAvailable) {
    return inMemoryFallbackTasks.find(t => t.taskId === taskId) || null;
  }
  try {
    const res = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { taskId }
      })
    );
    return res.Item || null;
  } catch (err) {
    console.warn("GetItem failed:", err.message);
    return inMemoryFallbackTasks.find(t => t.taskId === taskId) || null;
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

/**
 * Save user correction to learned memory
 */
export async function saveLearnedCorrection({ originalText, correctedTitle, correctedCategory }) {
  const item = {
    memoryId: crypto.randomUUID(),
    originalText: String(originalText).trim(),
    correctedTitle: String(correctedTitle || "").trim(),
    correctedCategory: String(correctedCategory || "").trim(),
    createdAt: new Date().toISOString()
  };

  if (!isDynamoAvailable) {
    inMemoryLearnedCorrections = inMemoryLearnedCorrections.filter(
      c => c.originalText.toLowerCase() !== item.originalText.toLowerCase()
    );
    inMemoryLearnedCorrections.unshift(item);
    return item;
  }

  try {
    await docClient.send(
      new PutCommand({
        TableName: MEMORY_TABLE_NAME,
        Item: item
      })
    );
    return item;
  } catch (err) {
    console.warn("SaveLearnedCorrection failed, using in-memory:", err.message);
    inMemoryLearnedCorrections.unshift(item);
    return item;
  }
}

/**
 * Retrieve recent user learned corrections
 */
export async function getLearnedCorrections(limit = 12) {
  if (!isDynamoAvailable) {
    return inMemoryLearnedCorrections.slice(0, limit);
  }

  try {
    const res = await docClient.send(new ScanCommand({ TableName: MEMORY_TABLE_NAME }));
    const items = res.Items || [];
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return items.slice(0, limit);
  } catch (err) {
    console.warn("GetLearnedCorrections scan failed, using fallback:", err.message);
    return inMemoryLearnedCorrections.slice(0, limit);
  }
}
