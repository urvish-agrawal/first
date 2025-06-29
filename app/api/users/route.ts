import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")

    // Build the query
    let query = "SELECT * FROM users WHERE 1=1"
    const values: any[] = []

    if (type) {
      query += " AND type = ?"
      values.push(type)
    }

    if (status) {
      query += " AND status = ?"
      values.push(status)
    }

    // Execute the query
    const users = await executeQuery({ query, values })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userData = await request.json()

    // Validate required fields
    if (!userData.name || !userData.email || !userData.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Set default status based on type
    if (!userData.status) {
      userData.status = userData.type === "ngo" ? "pending" : "active"
    }

    // Insert the user
    const query = `
      INSERT INTO users (name, email, type, status, joinDate) 
      VALUES (?, ?, ?, ?, ?)
    `
    const values = [userData.name, userData.email, userData.type, userData.status, new Date().toISOString()]

    const result = await executeQuery({ query, values })

    // Get the inserted user
    const getUserQuery = "SELECT * FROM users WHERE id = ?"
    const newUser = await executeQuery({ query: getUserQuery, values: [result.insertId] })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

