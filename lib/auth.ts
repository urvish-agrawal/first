import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { executeQuery } from "./db"

export async function verifyAuth(request: NextRequest | Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, message: "No token provided" }
    }

    const token = authHeader.split(" ")[1]

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    // Get user from database
    const users = await executeQuery<any[]>({
      query: "SELECT * FROM users WHERE id = ?",
      values: [decoded.id],
    })

    if (users.length === 0) {
      return { success: false, message: "User not found" }
    }

    const user = users[0]

    // Remove password from user object
    const { password, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword,
    }
  } catch (error) {
    console.error("Auth verification error:", error)
    return { success: false, message: "Invalid token" }
  }
}

