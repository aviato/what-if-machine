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

// TODO validate query
export async function createUser(dbPoolClient: PoolClient) {
  try {
    const dbQueryText = "INSERT INTO Users RETURNING session_id";
    const dbQueryResult = await dbPoolClient.query(dbQueryText);
    const sessionId = dbQueryResult.rows[0].session_id;
    return sessionId;
  } catch (e) {
    console.error("Could not create new user.");
    console.error(e);
  }
}

// TODO validate query
export async function readUserWarningsCount(
  dbPoolClient: PoolClient,
  sessionId: string
) {
  try {
    // Add the warning to the users's db entry
    const dbQueryText =
      "GET User WHERE User.session_id IS $(1) RETURNING warnings_count";
    const dbQueryResult = await dbPoolClient.query(dbQueryText, [sessionId]);
    const warningsCount = dbQueryResult.rows[0].warnings_count;
    return warningsCount;
  } catch (e) {
    console.error("Could not read user warnings count.");
    console.error(e);
  }
}

// TODO validate query
export async function updateUserWarningsCount(
  dbPoolClient: PoolClient,
  sessionId: string
) {
  try {
    // Add the warning to the users's db entry
    const dbQueryText =
      "UPDATE User WHERE User.session_id IS $(1) RETURNING warnings_count";
    return await dbPoolClient.query(dbQueryText, [sessionId]);
  } catch (e) {
    console.error(`Could not save warning to user ${sessionId}`);
    console.error(e);
  }
}
