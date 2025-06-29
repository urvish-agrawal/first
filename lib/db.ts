import mysql from "mysql2/promise"

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "needy_connect",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
})

export async function executeQuery<T>({ query, values }: { query: string; values?: any[] }): Promise<T> {
  try {
    const [rows] = await pool.execute(query, values)
    return rows as T
  } catch (error) {
    console.error("Database query error:", error)
    throw new Error("Database query failed")
  }
}

export async function getConnection() {
  return await pool.getConnection()
}