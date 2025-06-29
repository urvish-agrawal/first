import { NextResponse } from "next/server"

// This would be replaced with your actual database connection in production
import { executeQuery } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // In a real app, this would query your database
    const query = "SELECT * FROM users WHERE id = ?"
    const user = await executeQuery({ query, values: [id] })

    if (!user || (Array.isArray(user) && user.length === 0)) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()

    // Validate the data
    if (!data || (data.status !== "approved" && data.status !== "active" && data.status !== "inactive")) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    // In a real app, this would update your database
    const query = "UPDATE users SET status = ? WHERE id = ?"
    await executeQuery({ query, values: [data.status, id] })

    // Get the updated user
    const getUserQuery = "SELECT * FROM users WHERE id = ?"
    const updatedUser = await executeQuery({ query: getUserQuery, values: [id] })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

