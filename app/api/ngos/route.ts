import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const status = searchParams.get("status")

    // Build the query
    let query = `
      SELECT * FROM ngos
      WHERE 1=1
    `
    const queryParams: any[] = []

    if (category) {
      query += " AND category = ?"
      queryParams.push(category)
    }

    if (status) {
      query += " AND status = ?"
      queryParams.push(status)
    }

    query += " ORDER BY created_at DESC"

    // Execute the query
    const ngos = await executeQuery<any[]>({
      query,
      values: queryParams,
    })

    return NextResponse.json(ngos)
  } catch (error) {
    console.error("Error fetching NGOs:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch NGOs" },
      { status: 500 }
    )
  }
}