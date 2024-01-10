import pg, { type PoolClient } from "pg";
import { DB_HOST, DB_PORT, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER } from '$env/static/private';

// TODO: Should probably add the ability to pass down config options but I don't wanna
// deal with this right now
export async function connectToDb() {
  const pool = new pg.Pool({
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    host: DB_HOST,
    port: Number(DB_PORT),
  });

  // There might be a better way to do this
  pool.on("error", (err) => {
    console.error("An error occurred while connecting to the db.", err.stack);
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
    const dbQueryText = "SELECT warning_count FROM users WHERE session_id = $1";
    const dbQueryResult = await dbPoolClient.query({
      text: dbQueryText,
      values: [sessionId],
    });

    const warningCount = dbQueryResult.rows[0].warning_count;
    return warningCount;
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

export async function readAllAnswers(dbPoolClient: PoolClient) {
  try {
    const dbQueryText = "SELECT * FROM answers";
    return await dbPoolClient.query(dbQueryText);
  } catch (e) {
    console.error("Error while retrieving Answers from db.");
    console.error(e);
  }
}
