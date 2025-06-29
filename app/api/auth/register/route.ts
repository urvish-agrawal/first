import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, type, phone, address } = body

    // Check if user already exists
    const existingUsers = await executeQuery<any[]>({
      query: "SELECT * FROM users WHERE email = ?",
      values: [email],
    })

    if (existingUsers.length > 0) {
      return NextResponse.json({ success: false, message: "User with this email already exists" }, { status: 400 })
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Generate a UUID for the user
    const userId = uuidv4()

    // Insert user into database
    await executeQuery({
      query: `
        INSERT INTO users (id, name, email, password, phone, address, type, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      values: [userId, name, email, hashedPassword, phone, address, type, type === "ngo" ? "pending" : "active"],
    })

    // If user is an NGO, insert additional details
    if (type === "ngo" && body.registrationNumber && body.category && body.description) {
      await executeQuery({
        query: `
          INSERT INTO ngo_details (ngo_id, description, registration_number, category)
          VALUES (?, ?, ?, ?)
        `,
        values: [userId, body.description, body.registrationNumber, body.category],
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: `${type === "ngo" ? "NGO" : "Donor"} registered successfully`,
        userId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "Registration failed" }, { status: 500 })
  }
}

