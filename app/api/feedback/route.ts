import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const donorId = searchParams.get("donorId")
    const ngoId = searchParams.get("ngoId")
    const donationId = searchParams.get("donationId")

    // Build the query
    let query = `
      SELECT f.*, 
      from_user.name as from_name, from_user.type as from_type,
      to_user.name as to_name, to_user.type as to_type,
      d.name as donation_name
      FROM feedback f
      JOIN users from_user ON f.from_id = from_user.id
      JOIN users to_user ON f.to_id = to_user.id
      JOIN donations d ON f.donation_id = d.id
      WHERE 1=1
    `

    const queryParams: any[] = []

    if (donorId) {
      query += " AND (f.from_id = ? OR f.to_id = ?)"
      queryParams.push(donorId, donorId)
    }

    if (ngoId) {
      query += " AND (f.from_id = ? OR f.to_id = ?)"
      queryParams.push(ngoId, ngoId)
    }

    if (donationId) {
      query += " AND f.donation_id = ?"
      queryParams.push(donationId)
    }

    query += " ORDER BY f.created_at DESC"

    // Execute the query
    const feedback = await executeQuery<any[]>({
      query,
      values: queryParams,
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch feedback" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { user } = authResult
    const body = await request.json()
    const { donationId, toId, rating, comment } = body

    // Validate input
    if (!donationId || !toId || !rating) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Check if feedback already exists
    const existingFeedback = await executeQuery<any[]>({
      query: "SELECT * FROM feedback WHERE donation_id = ? AND from_id = ? AND to_id = ?",
      values: [donationId, user.id, toId],
    })

    if (existingFeedback.length > 0) {
      return NextResponse.json({ success: false, message: "Feedback already submitted" }, { status: 400 })
    }

    // Insert feedback
    const result = await executeQuery<any>({
      query: `
        INSERT INTO feedback 
        (donation_id, from_id, to_id, rating, comment)
        VALUES (?, ?, ?, ?, ?)
      `,
      values: [donationId, user.id, toId, rating, comment],
    })

    // Get the created feedback
    const feedback = await executeQuery<any[]>({
      query: `
        SELECT f.*, 
        from_user.name as from_name, from_user.type as from_type,
        to_user.name as to_name, to_user.type as to_type,
        d.name as donation_name
        FROM feedback f
        JOIN users from_user ON f.from_id = from_user.id
        JOIN users to_user ON f.to_id = to_user.id
        JOIN donations d ON f.donation_id = d.id
        WHERE f.id = ?
      `,
      values: [result.insertId],
    })

    return NextResponse.json(
      {
        success: true,
        message: "Feedback submitted successfully",
        feedback: feedback[0],
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Feedback submission error:", error)
    return NextResponse.json({ success: false, message: "Failed to submit feedback" }, { status: 500 })
  }
}

