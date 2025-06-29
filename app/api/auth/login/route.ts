import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, type } = body

    // Find user in database
    const users = await executeQuery<any[]>({
      query: "SELECT * FROM users WHERE email = ? AND type = ?",
      values: [email, type],
    })

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    // Check if user is active
    if (user.status !== "active") {
      return NextResponse.json(
        { success: false, message: "Account is not active. Please contact admin." },
        { status: 403 },
      )
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Get additional NGO details if user is an NGO
    let ngoDetails = null
    if (type === "ngo") {
      const details = await executeQuery<any[]>({
        query: "SELECT * FROM ngo_details WHERE ngo_id = ?",
        values: [user.id],
      })

      if (details.length > 0) {
        ngoDetails = details[0]
      }
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, type: user.type },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" },
    )

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        ...userWithoutPassword,
        ...(ngoDetails && { ngoDetails }),
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Login failed" }, { status: 500 })
  }
}

