import dotenv from "dotenv";
dotenv.config();
import { fail } from "@sveltejs/kit";
import { Pool, type PoolClient } from "pg";

// TODO: Should probably add the ability to pass down config options but I don't wanna
// deal with this right now
export async function connectToDb() {
  const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
  });

  // There might be a better way to do this
  pool.on("error", (err) => {
    console.error("An error occurred while connecting to the db.", err.stack);
    return fail(500);
  });

  return await pool.connect();
}

export async function createAnswer(
  dbPoolClient: PoolClient,
  dbQueryValues: string[]
) {
  try {
    const dbQueryText =
      "INSERT INTO Answers(query, content) VALUES($1, $2) RETURNING id";
    const dbQueryResult = await dbPoolClient.query(dbQueryText, dbQueryValues);
    const answerId = dbQueryResult.rows[0].id;
    return answerId;
  } catch (e) {
    console.error;
  }
}

export async function createUser(dbPoolClient: PoolClient) {
  try {
    const dbQueryText =
      "INSERT INTO Users DEFAULT VALUES RETURNING session_id;";
    const dbQueryResult = await dbPoolClient.query(dbQueryText);
    const sessionId = dbQueryResult.rows[0].session_id;
    return sessionId;
  } catch (e) {
    console.error("Could not create new user.");
    console.error(e);
  }
}

export async function readUserWarningsCount(
  dbPoolClient: PoolClient,
  sessionId: string
) {
  try {
    const dbQueryText = "SELECT warning_count FROM Users WHERE session_id = $1";
    const dbQueryResult = await dbPoolClient.query(dbQueryText, [sessionId]);
    const warningsCount = dbQueryResult.rows[0].warning_count;
    return warningsCount;
  } catch (e) {
    console.error("Could not read user warnings count.");
    console.error(e);
  }
}

export async function updateUserWarningsCount(
  dbPoolClient: PoolClient,
  sessionId: string
) {
  try {
    const dbQueryText =
      "UPDATE Users SET warning_count = warning_count + 1 WHERE session_id = $1 RETURNING warning_count";
    return await dbPoolClient.query(dbQueryText, [sessionId]);
  } catch (e) {
    console.error(`Could not save warning to user ${sessionId}`);
    console.error(e);
  }
}

export async function readAnswerById(
  dbPoolClient: PoolClient,
  answerId: string
) {
  try {
    const dbQueryText = "SELECT * FROM answers WHERE id = $1";
    return await dbPoolClient.query(dbQueryText, [answerId]);
  } catch (e) {
    console.error(`Could read Answer where id = ${answerId}`);
    console.error(e);
  }
}
